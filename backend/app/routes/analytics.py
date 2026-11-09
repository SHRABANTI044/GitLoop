from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.analytics_service import get_overview

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
def overview(user_id: str, db: Session = Depends(get_db)) -> dict[str, int]:
    return get_overview(db, user_id)
