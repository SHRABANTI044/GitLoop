from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine
from app.routes.ai_assistant import router as ai_assistant_router
from app.routes.analyzer import router as analyzer_router
from app.routes.analytics import router as analytics_router
from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.dependencies import router as dependencies_router
from app.routes.github import router as github_router
from app.routes.projects import router as projects_router
from app.routes.repositories import router as repositories_router
from app.routes.sync import router as sync_router
from app.routes.tasks import router as tasks_router
from app.routes.voice import router as voice_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="0.1.0", debug=settings.debug)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(github_router, prefix="/api")
app.include_router(repositories_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(dependencies_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(ai_assistant_router, prefix="/api")
app.include_router(analyzer_router, prefix="/api")
app.include_router(voice_router, prefix="/api")
app.include_router(sync_router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    return {"name": settings.app_name, "status": "ok"}


@app.get("/api/health")
def healthcheck() -> dict[str, str]:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception:
        return {"status": "degraded"}
