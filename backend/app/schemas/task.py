from __future__ import annotations

from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str
    description: str | None = None
    repository_id: str | None = Field(
        default=None,
        validation_alias=AliasChoices("repositoryId", "repository_id"),
        serialization_alias="repositoryId",
    )
    priority: str = "medium"
    due_date: datetime | None = Field(
        default=None,
        validation_alias=AliasChoices("dueDate", "due_date"),
        serialization_alias="dueDate",
    )


class TaskUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    repository_id: str | None = Field(
        default=None,
        validation_alias=AliasChoices("repositoryId", "repository_id"),
        serialization_alias="repositoryId",
    )
    due_date: datetime | None = Field(
        default=None,
        validation_alias=AliasChoices("dueDate", "due_date"),
        serialization_alias="dueDate",
    )


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    user_id: str = Field(
        validation_alias=AliasChoices("userId", "user_id"),
        serialization_alias="userId",
    )
    repository_id: str | None = Field(
        default=None,
        validation_alias=AliasChoices("repositoryId", "repository_id"),
        serialization_alias="repositoryId",
    )
    title: str
    description: str | None = None
    priority: str
    status: str
    due_date: datetime | None = Field(
        default=None,
        validation_alias=AliasChoices("dueDate", "due_date"),
        serialization_alias="dueDate",
    )
    created_at: datetime = Field(
        validation_alias=AliasChoices("createdAt", "created_at"),
        serialization_alias="createdAt",
    )
    updated_at: datetime = Field(
        validation_alias=AliasChoices("updatedAt", "updated_at"),
        serialization_alias="updatedAt",
    )
