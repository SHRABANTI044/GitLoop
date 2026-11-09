from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.dependency import Dependency
from app.services.dependency_service import list_dependencies

router = APIRouter(prefix="/dependencies", tags=["dependencies"])


@router.get("", response_model=None)
def read_dependencies(user_id: str, db: Session = Depends(get_db)) -> list[Dependency]:
    return list_dependencies(db, user_id)
