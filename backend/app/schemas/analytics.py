from __future__ import annotations

from pydantic import BaseModel


class OverviewStat(BaseModel):
    total_repositories: int
    active_projects: int
    pending_tasks: int
    completed_tasks: int
    total_tasks: int
