from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Repository(Base):
    __tablename__ = "repositories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    installation_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    github_repo_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    default_branch: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    visibility: Mapped[str] = mapped_column(String(20), default="public", nullable=False)
    primary_language: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    repository_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    selected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_synchronized_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="repositories")
    summaries = relationship("ProjectSummary", back_populates="repository", cascade="all, delete-orphan")
    memories = relationship("ProjectMemory", back_populates="repository", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="repository")

    __table_args__ = (UniqueConstraint("user_id", "github_repo_id"),)
