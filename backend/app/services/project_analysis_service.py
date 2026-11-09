from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.project_summary import ProjectSummary


def create_project_summary(db: Session, repository_id: str, title: str, summary: str, architecture: str | None = None) -> ProjectSummary:
    item = ProjectSummary(repository_id=repository_id, title=title, summary=summary, architecture=architecture)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
