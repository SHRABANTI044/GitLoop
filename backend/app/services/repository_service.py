from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.repository import Repository


def get_selected_repositories(db: Session, user_id: str) -> list[Repository]:
    return db.query(Repository).filter(Repository.user_id == user_id, Repository.selected.is_(True)).all()
