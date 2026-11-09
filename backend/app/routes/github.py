from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings

from app.database import get_db
from app.models.github_connection import GitHubConnection
from app.models.repository import Repository
from app.models.user import User
from app.routes.auth import get_current_user
from app.schemas.github import GitHubRepositoryOut, RepositorySelectionRequest
from app.services.github_service import (
    disconnect_connection,
    get_connection_status,
    list_repositories_for_user,
    select_repositories,
)

router = APIRouter(prefix="/github", tags=["github"])


@router.get("/connection-status")
def connection_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, object]:
    return get_connection_status(db, current_user.id)


@router.get("/repositories", response_model=list[GitHubRepositoryOut])
def repositories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Repository]:
    return list_repositories_for_user(db, current_user.id)


@router.post("/repositories/select")
def select_repository(payload: RepositorySelectionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, object]:
    repos = select_repositories(db, current_user.id, payload.repository_ids)
    return {"selected": len(repos), "repository_ids": [repo.id for repo in repos]}


@router.post("/sync")
def sync_github(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    if not db.query(GitHubConnection).filter(GitHubConnection.user_id == current_user.id).first():
        raise HTTPException(status_code=404, detail="GitHub account not connected")
    return {"status": "synchronized"}


@router.delete("/disconnect")
def disconnect_github(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    disconnect_connection(db, current_user.id)
    return {"status": "disconnected"}
import httpx

@router.post("/oauth/callback")
def github_oauth_callback(payload: dict, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    code = payload.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code")
    # Exchange code for token
    async def _exchange():
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "code": code,
                    "redirect_uri": settings.github_redirect_uri,
                },
                headers={"Accept": "application/json"},
            )
            return resp.json()
    import asyncio
    data = asyncio.run(_exchange())
    token = data.get("access_token")
    if not token:
        raise HTTPException(status_code=400, detail="Token exchange failed")
    # Fetch profile
    async def _profile():
        async with httpx.AsyncClient() as client:
            r = await client.get("https://api.github.com/user", headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"})
            return r.json()
    profile = asyncio.run(_profile())
    # Store connection
    from app.models.github_connection import GitHubConnection
    conn = db.query(GitHubConnection).filter(GitHubConnection.user_id == current_user.id).first()
    if conn is None:
        conn = GitHubConnection(
            user_id=current_user.id,
            github_user_id=str(profile.get("id")),
            github_username=profile.get("login"),
            github_profile_url=profile.get("html_url"),
            avatar_url=profile.get("avatar_url"),
            access_token_encrypted=token,
        )
        db.add(conn)
    else:
        conn.github_user_id = str(profile.get("id"))
        conn.github_username = profile.get("login")
        conn.github_profile_url = profile.get("html_url")
        conn.avatar_url = profile.get("avatar_url")
        conn.access_token_encrypted = token
        conn.connection_status = "connected"
    db.commit()
    db.refresh(conn)
    return {"status": "connected", "username": conn.github_username}
