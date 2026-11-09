from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.repository import Repository
from app.models.task import Task


def get_overview(db: Session, user_id: str) -> dict[str, int]:
    repos = db.query(Repository).filter(Repository.user_id == user_id, Repository.selected.is_(True)).all()
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    return {
        "total_repositories": len(repos),
        "active_projects": len(repos),
        "pending_tasks": sum(1 for task in tasks if task.status != "completed"),
        "completed_tasks": sum(1 for task in tasks if task.status == "completed"),
        "total_tasks": len(tasks),
    }
