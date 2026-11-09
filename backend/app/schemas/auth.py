from __future__ import annotations

from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field


class SignupRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    full_name: str = Field(
        ...,
        min_length=2,
        validation_alias=AliasChoices("fullName", "full_name"),
        serialization_alias="fullName",
    )
    email: EmailStr
    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr
    password: str = Field(..., min_length=1)
    remember: bool = False


class PasswordResetRequest(BaseModel):
    email: EmailStr


class AuthSuccess(BaseModel):
    access_token: str
    token_type: str = "bearer"
