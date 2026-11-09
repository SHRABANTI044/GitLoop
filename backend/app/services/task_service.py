from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task


def list_tasks(db: Session, user_id: str) -> list[Task]:
    return db.query(Task).filter(Task.user_id == user_id).order_by(Task.updated_at.desc()).all()


def create_task(db: Session, user_id: str, data: dict[str, object]) -> Task:
    task = Task(user_id=user_id, **data)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: str, user_id: str, update: dict[str, object]) -> Task:
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    for field, value in update.items():
        if value is not None:
            setattr(task, field, value)
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: str, user_id: str) -> None:
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    db.delete(task)
    db.commit()
