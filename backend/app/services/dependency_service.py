from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.dependency import Dependency


def list_dependencies(db: Session, user_id: str) -> list[Dependency]:
    return db.query(Dependency).filter(Dependency.user_id == user_id).all()
