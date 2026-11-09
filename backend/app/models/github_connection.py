from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class GitHubConnection(Base):
    __tablename__ = "github_connections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    github_user_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    github_username: Mapped[str] = mapped_column(String(255), nullable=False)
    github_account_type: Mapped[str] = mapped_column(String(50), default="user", nullable=False)
    github_profile_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    installation_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    installation_owner_login: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    installation_owner_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    access_token_encrypted: Mapped[str] = mapped_column(String(1024), nullable=False)
    installation_token_encrypted: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    connection_status: Mapped[str] = mapped_column(String(50), default="connected", nullable=False)
    connected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_synchronized_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="github_connections")

    __table_args__ = (UniqueConstraint("user_id", "github_user_id", "installation_id", name="uq_github_connection_user_account_installation"),)
