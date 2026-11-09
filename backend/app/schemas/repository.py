from __future__ import annotations

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class RepositorySummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    full_name: str = Field(
        validation_alias=AliasChoices("fullName", "full_name"),
        serialization_alias="fullName",
    )
    description: str | None = None
    primary_language: str | None = Field(
        default=None,
        validation_alias=AliasChoices("language", "primary_language"),
        serialization_alias="language",
    )
    visibility: str = "public"
    selected: bool = False
