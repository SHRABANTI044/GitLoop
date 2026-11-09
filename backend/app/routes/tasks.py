from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate
from app.services.task_service import create_task, delete_task, list_tasks, update_task

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskOut])
def read_tasks(user_id: str, db: Session = Depends(get_db)) -> list[Task]:
    return list_tasks(db, user_id)


@router.post("", response_model=TaskOut, status_code=201)
def create_task_route(user_id: str, payload: TaskCreate, db: Session = Depends(get_db)) -> Task:
    return create_task(db, user_id, payload.model_dump())


@router.patch("/{task_id}", response_model=TaskOut)
def update_task_route(user_id: str, task_id: str, payload: TaskUpdate, db: Session = Depends(get_db)) -> Task:
    return update_task(db, task_id, user_id, payload.model_dump(exclude_unset=True))


@router.delete("/{task_id}")
def delete_task_route(user_id: str, task_id: str, db: Session = Depends(get_db)) -> dict[str, str]:
    delete_task(db, task_id, user_id)
    return {"status": "deleted"}
