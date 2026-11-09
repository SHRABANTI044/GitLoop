from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project_summary import ProjectSummary
from app.schemas.project import ProjectSummaryCreate, ProjectSummaryOut
from app.services.project_analysis_service import create_project_summary

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectSummaryOut, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectSummaryCreate, repository_id: str, db: Session = Depends(get_db)) -> ProjectSummary:
    return create_project_summary(db, repository_id, payload.title, payload.summary, payload.architecture)
