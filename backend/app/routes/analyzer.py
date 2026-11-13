from __future__ import annotations

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.llm_provider import AIProviderConfigurationError, AIProviderError, LLMProvider
from app.database import get_db
from app.github.client import fetch_repository_tree
from app.models.analyzer_report import AnalyzerReport
from app.models.repository import Repository
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.analyzer import (
    AnalysisStartRequest,
    AnalyzerReportOut,
    AnalyzerRepositoryOut,
    FileExplanationOut,
    ExplainFileRequest,
    FileContentOut,
    RepositoryStructureOut,
)
from app.services.analyzer_service import (
    build_file_tree,
    explain_repository_file,
    report_to_dict,
    read_repository_file as load_repository_file,
    run_analysis,
)
from app.services.github_service import get_decrypted_access_token

router = APIRouter(prefix="/analyzer", tags=["repository analyzer"])


def _owned_repository(db: Session, user_id: str, repository_id: str) -> Repository:
    repository = (
        db.query(Repository)
        .filter(Repository.id == repository_id, Repository.user_id == user_id)
        .first()
    )
    if repository is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found.")
    return repository


def _ensure_provider_configured() -> None:
    provider = LLMProvider()
    if not provider.is_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=provider.configuration_error(),
        )


def _schedule_analysis(
    db: Session,
    background_tasks: BackgroundTasks,
    user: User,
    repository: Repository,
) -> AnalyzerReport:
    _ensure_provider_configured()
    try:
        get_decrypted_access_token(db, user.id)
    except HTTPException as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Connect GitHub before analyzing a repository.",
        ) from exc

    active = (
        db.query(AnalyzerReport)
        .filter(
            AnalyzerReport.user_id == user.id,
            AnalyzerReport.repository_id == repository.id,
            AnalyzerReport.status.in_(("queued", "running")),
        )
        .order_by(AnalyzerReport.created_at.desc())
        .first()
    )
    if active is not None:
        return active

    report = AnalyzerReport(
        user_id=user.id,
        repository_id=repository.id,
        repository_full_name=repository.full_name,
        status="queued",
        stage="Queued",
        progress=0,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    background_tasks.add_task(run_analysis, report.id, user.id)
    return report


@router.get("/repositories", response_model=list[AnalyzerRepositoryOut])
def list_analyzer_repositories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Repository]:
    return (
        db.query(Repository)
        .filter(Repository.user_id == current_user.id)
        .order_by(Repository.full_name.asc())
        .all()
    )


@router.post("/analyze", response_model=AnalyzerReportOut, status_code=status.HTTP_202_ACCEPTED)
def analyze_repository(
    payload: AnalysisStartRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    repository = _owned_repository(db, current_user.id, payload.repository_id)
    report = _schedule_analysis(db, background_tasks, current_user, repository)
    return report_to_dict(report)


@router.get("/reports", response_model=list[AnalyzerReportOut])
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    reports = (
        db.query(AnalyzerReport)
        .filter(AnalyzerReport.user_id == current_user.id)
        .order_by(AnalyzerReport.created_at.desc())
        .limit(50)
        .all()
    )
    return [report_to_dict(report) for report in reports]


@router.get("/reports/{report_id}", response_model=AnalyzerReportOut)
def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    report = (
        db.query(AnalyzerReport)
        .filter(AnalyzerReport.id == report_id, AnalyzerReport.user_id == current_user.id)
        .first()
    )
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis report not found.")
    return report_to_dict(report)


@router.post("/reports/{report_id}/reanalyze", response_model=AnalyzerReportOut, status_code=status.HTTP_202_ACCEPTED)
def reanalyze_report(
    report_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    previous_report = (
        db.query(AnalyzerReport)
        .filter(AnalyzerReport.id == report_id, AnalyzerReport.user_id == current_user.id)
        .first()
    )
    if previous_report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis report not found.")
    repository = _owned_repository(db, current_user.id, previous_report.repository_id)
    report = _schedule_analysis(db, background_tasks, current_user, repository)
    return report_to_dict(report)


@router.get("/repositories/{repository_id}/structure", response_model=RepositoryStructureOut)
async def repository_structure(
    repository_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    repository = _owned_repository(db, current_user.id, repository_id)
    try:
        access_token = get_decrypted_access_token(db, current_user.id)
        entries, truncated = await fetch_repository_tree(
            access_token,
            repository.full_name,
            repository.default_branch or "HEAD",
        )
    except HTTPException:
        raise
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GitHub returned HTTP {exc.response.status_code} while loading the repository structure.",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not reach GitHub.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return {
        "repository_id": repository.id,
        "file_tree": [item.model_dump(mode="json") for item in build_file_tree(entries)],
        "truncated": truncated,
    }


@router.get("/repositories/{repository_id}/file", response_model=FileContentOut)
async def read_repository_file(
    repository_id: str,
    path: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    repository = _owned_repository(db, current_user.id, repository_id)
    try:
        access_token = get_decrypted_access_token(db, current_user.id)
        content = await load_repository_file(access_token, repository.full_name, repository.default_branch or "HEAD", path)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GitHub returned HTTP {exc.response.status_code} while loading the selected file.",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not reach GitHub.") from exc
    return {"path": path, "content": content}


@router.post("/explain-file", response_model=FileExplanationOut)
async def explain_file(
    payload: ExplainFileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    repository = _owned_repository(db, current_user.id, payload.repository_id)
    try:
        access_token = get_decrypted_access_token(db, current_user.id)
        explanation = await explain_repository_file(
            access_token,
            repository.full_name,
            repository.default_branch or "HEAD",
            payload.path,
        )
    except AIProviderConfigurationError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except AIProviderError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GitHub returned HTTP {exc.response.status_code} while reading this file.",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not reach GitHub.") from exc
    return {"path": payload.path, "explanation": explanation}
