from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.repository import Repository


def synchronize_repositories(db: Session, user_id: str, repositories: list[dict[str, object]]) -> list[Repository]:
    rows = []
    for payload in repositories:
        row = Repository(user_id=user_id, **payload)
        db.add(row)
        rows.append(row)
    db.commit()
    for row in rows:
        db.refresh(row)
    return rows
