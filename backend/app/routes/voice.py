from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/voice", tags=["voice"])


@router.get("/status")
def voice_status() -> dict[str, str]:
    return {"status": "ready"}
