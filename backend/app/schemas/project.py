from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ProjectSummaryCreate(BaseModel):
    title: str
    summary: str
    architecture: str | None = None


class ProjectSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    repository_id: str
    title: str
    summary: str
    architecture: str | None = None
