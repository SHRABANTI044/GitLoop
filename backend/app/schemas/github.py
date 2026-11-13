from __future__ import annotations

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class GitHubRepositoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    user_id: str = Field(
        validation_alias=AliasChoices("userId", "user_id"),
        serialization_alias="userId",
    )
    github_repo_id: str = Field(
        validation_alias=AliasChoices("githubRepoId", "github_repo_id"),
        serialization_alias="githubRepoId",
    )
    name: str
    full_name: str = Field(
        validation_alias=AliasChoices("fullName", "full_name"),
        serialization_alias="fullName",
    )
    description: str | None = None
    default_branch: str | None = Field(
        default=None,
        validation_alias=AliasChoices("defaultBranch", "default_branch"),
        serialization_alias="defaultBranch",
    )
    visibility: str = "public"
    primary_language: str | None = Field(
        default=None,
        validation_alias=AliasChoices("language", "primary_language"),
        serialization_alias="language",
    )
    repository_url: str | None = Field(
        default=None,
        validation_alias=AliasChoices("repositoryUrl", "repository_url"),
        serialization_alias="repositoryUrl",
    )
    selected: bool = False


class RepositorySelectionRequest(BaseModel):
    repository_ids: list[str]


class GitHubSyncOut(BaseModel):
    status: str
    updated: int
    repositories: list[GitHubRepositoryOut]
