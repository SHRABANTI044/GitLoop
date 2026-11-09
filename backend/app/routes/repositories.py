from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.auth import get_current_user
from app.services.repository_service import get_selected_repositories
from app.services.github_service import select_repositories

router = APIRouter(prefix="/repositories", tags=["repositories"])


@router.get("")
def get_repositories(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return get_selected_repositories(db, current_user.id)


@router.post("/select")
def select_repository(payload: dict, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    repos = select_repositories(db, current_user.id, payload.get("repository_ids", []))
    return {"selected": len(repos), "repository_ids": [r.id for r in repos]}
