from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.sync_service import synchronize_repositories

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/repositories")
def sync_repositories(user_id: str, payload: list[dict[str, object]], db: Session = Depends(get_db)) -> dict[str, int]:
    rows = synchronize_repositories(db, user_id, payload)
    return {"synced": len(rows)}
