from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.github_connection import GitHubConnection
from app.models.repository import Repository
from app.utils.security import decrypt_value, encrypt_value


def get_connection_status(db: Session, user_id: str) -> dict[str, object]:
    conn = db.query(GitHubConnection).filter(GitHubConnection.user_id == user_id).first()
    return {
        "connected": conn is not None,
        "username": conn.github_username if conn else None,
        "avatar_url": conn.avatar_url if conn else None,
        "installation_id": conn.installation_id if conn else None,
        "github_user_id": conn.github_user_id if conn else None,
    }


def list_repositories_for_user(db: Session, user_id: str) -> list[Repository]:
    return db.query(Repository).filter(Repository.user_id == user_id).order_by(Repository.name.asc()).all()


def upsert_connection_for_user(db: Session, user_id: str, *, github_user_id: str, github_username: str, github_account_type: str, avatar_url: str | None, github_profile_url: str | None, installation_id: str | None, installation_owner_login: str | None, installation_owner_type: str | None, access_token: str, installation_token: str | None = None) -> GitHubConnection:
    normalized_user_id = str(github_user_id)
    existing = db.query(GitHubConnection).filter(GitHubConnection.user_id == user_id, GitHubConnection.github_user_id == normalized_user_id, GitHubConnection.installation_id == (installation_id or "")).first()
    if existing is None:
        existing = db.query(GitHubConnection).filter(GitHubConnection.user_id == user_id, GitHubConnection.installation_id == installation_id).first()
    if existing is None:
        existing = db.query(GitHubConnection).filter(GitHubConnection.github_user_id == normalized_user_id, GitHubConnection.user_id != user_id).first()
        if existing is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This GitHub account is already connected to another GitLoop user.")
        existing = GitHubConnection(
            user_id=user_id,
            github_user_id=normalized_user_id,
            github_username=github_username,
            github_account_type=github_account_type,
            github_profile_url=github_profile_url,
            avatar_url=avatar_url,
            installation_id=installation_id,
            installation_owner_login=installation_owner_login,
            installation_owner_type=installation_owner_type,
            access_token_encrypted=encrypt_value(access_token),
            installation_token_encrypted=encrypt_value(installation_token) if installation_token else None,
            connection_status="connected",
            last_synchronized_at=datetime.utcnow(),
        )
        db.add(existing)
    else:
        existing.github_username = github_username
        existing.github_account_type = github_account_type
        existing.github_profile_url = github_profile_url
        existing.avatar_url = avatar_url
        existing.installation_id = installation_id
        existing.installation_owner_login = installation_owner_login
        existing.installation_owner_type = installation_owner_type
        existing.access_token_encrypted = encrypt_value(access_token)
        existing.installation_token_encrypted = encrypt_value(installation_token) if installation_token else None
        existing.connection_status = "connected"
        existing.last_synchronized_at = datetime.utcnow()
    db.commit()
    db.refresh(existing)
    return existing


def get_decrypted_access_token(db: Session, user_id: str) -> str:
    conn = db.query(GitHubConnection).filter(GitHubConnection.user_id == user_id).first()
    if conn is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="GitHub account not connected")
    return decrypt_value(conn.access_token_encrypted)


def disconnect_connection(db: Session, user_id: str) -> None:
    conn = db.query(GitHubConnection).filter(GitHubConnection.user_id == user_id).first()
    if conn is None:
        return
    db.query(Repository).filter(Repository.user_id == user_id).delete()
    db.delete(conn)
    db.commit()


def upsert_repository(db: Session, user_id: str, payload: dict[str, object]) -> Repository:
    repo = db.query(Repository).filter(Repository.user_id == user_id, Repository.github_repo_id == payload["github_repo_id"]).first()
    if repo is None:
        repo = Repository(user_id=user_id, **payload)
        db.add(repo)
    else:
        for field, value in payload.items():
            setattr(repo, field, value)
    db.commit()
    db.refresh(repo)
    return repo


def synchronize_user_repositories(db: Session, user_id: str, payloads: list[dict[str, object]]) -> list[Repository]:
    existing = {
        repo.github_repo_id: repo
        for repo in db.query(Repository).filter(Repository.user_id == user_id).all()
    }
    synchronized: list[Repository] = []
    for payload in payloads:
        github_repo_id = str(payload["github_repo_id"])
        repo = existing.get(github_repo_id)
        if repo is None:
            repo = Repository(user_id=user_id, **payload)
            db.add(repo)
            existing[github_repo_id] = repo
        else:
            for field, value in payload.items():
                setattr(repo, field, value)
        synchronized.append(repo)
    db.commit()
    for repo in synchronized:
        db.refresh(repo)
    return synchronized


def select_repositories(db: Session, user_id: str, repository_ids: list[str]) -> list[Repository]:
    repos = db.query(Repository).filter(Repository.user_id == user_id).all()
    for repo in repos:
        repo.selected = repo.id in repository_ids
    db.commit()
    return [repo for repo in repos if repo.selected]
