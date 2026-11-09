from __future__ import annotations

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    full_name: str = Field(
        validation_alias=AliasChoices("fullName", "full_name"),
        serialization_alias="fullName",
    )
    email: str
    provider: str = "email"
    profile_image_url: str | None = Field(
        default=None,
        alias="profileImageUrl",
        validation_alias=AliasChoices("profileImageUrl", "profile_image_url"),
        serialization_alias="profileImageUrl",
    )
