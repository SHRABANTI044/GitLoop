from __future__ import annotations

import base64
import time
from typing import Any
from urllib.parse import quote

import httpx
import jwt

from app.config import settings


async def exchange_oauth_code(code: str, redirect_uri: str) -> str:
    data = {
        "client_id": settings.github_client_id,
        "client_secret": settings.github_client_secret,
        "code": code,
        "redirect_uri": redirect_uri,
    }
    headers = {"Accept": "application/json"}
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post("https://github.com/login/oauth/access_token", data=data, headers=headers)
    response.raise_for_status()
    payload = response.json()
    token = payload.get("access_token")
    if not token:
        raise ValueError(payload.get("error_description") or "GitHub OAuth token exchange failed")
    return str(token)


async def fetch_github_user(access_token: str) -> dict[str, str | None]:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get("https://api.github.com/user", headers=headers)
    response.raise_for_status()
    payload = response.json()
    return {
        "github_user_id": str(payload.get("id")),
        "username": payload.get("login"),
        "avatar_url": payload.get("avatar_url"),
        "email": payload.get("email"),
        "profile_url": payload.get("html_url"),
    }


async def list_user_repositories(access_token: str) -> list[dict[str, Any]]:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    params: dict[str, str | int] | None = {
        "per_page": 100,
        "sort": "updated",
        "affiliation": "owner,collaborator,organization_member",
    }
    url = "https://api.github.com/user/repos"
    repositories: list[dict[str, Any]] = []
    async with httpx.AsyncClient(timeout=15.0) as client:
        while url:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            page = response.json()
            if not isinstance(page, list):
                raise ValueError("GitHub returned an invalid repository list")
            repositories.extend(page)
            url = response.links.get("next", {}).get("url", "")
            params = None
    return repositories


async def fetch_repository_metadata(access_token: str, full_name: str) -> dict[str, Any]:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    url = f"https://api.github.com/repos/{quote(full_name, safe='/')}"
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=headers)
    response.raise_for_status()
    metadata = response.json()
    if not isinstance(metadata, dict):
        raise ValueError("GitHub returned invalid repository metadata")
    return metadata


async def fetch_repository_tree(
    access_token: str,
    full_name: str,
    default_branch: str,
    *,
    max_entries: int = 20_000,
) -> tuple[list[dict[str, Any]], bool]:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    repository_url = f"https://api.github.com/repos/{quote(full_name, safe='/')}"
    branch = quote(default_branch, safe="")
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(
            f"{repository_url}/git/trees/{branch}",
            headers=headers,
            params={"recursive": "1"},
        )
        response.raise_for_status()
        tree_response = response.json()
        if not isinstance(tree_response, dict) or not isinstance(tree_response.get("tree"), list):
            raise ValueError("GitHub returned an invalid repository tree")

        entries = [
            item for item in tree_response["tree"]
            if isinstance(item, dict) and item.get("type") in {"blob", "tree"}
        ]
        if not tree_response.get("truncated"):
            return entries[:max_entries], len(entries) > max_entries

        entries = []
        pending: list[tuple[str, str]] = [(default_branch, "")]
        visited_directories = 0
        while pending and len(entries) < max_entries:
            tree_sha, parent_path = pending.pop()
            visited_directories += 1
            if visited_directories > 2_000:
                return entries, True
            response = await client.get(
                f"{repository_url}/git/trees/{quote(tree_sha, safe='')}",
                headers=headers,
            )
            response.raise_for_status()
            directory_tree = response.json()
            children = directory_tree.get("tree") if isinstance(directory_tree, dict) else None
            if not isinstance(children, list):
                raise ValueError("GitHub returned an invalid directory tree")
            for item in children:
                if not isinstance(item, dict) or item.get("type") not in {"blob", "tree"}:
                    continue
                relative_path = str(item.get("path") or "")
                item["path"] = f"{parent_path}/{relative_path}" if parent_path else relative_path
                entries.append(item)
                if item.get("type") == "tree" and isinstance(item.get("sha"), str):
                    pending.append((item["sha"], item["path"]))
                if len(entries) >= max_entries:
                    return entries, True
        return entries, False


async def fetch_repository_file(
    access_token: str,
    full_name: str,
    branch: str,
    path: str,
    client: httpx.AsyncClient | None = None,
    max_bytes: int = 32_000,
) -> str:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    url = f"https://api.github.com/repos/{quote(full_name, safe='/')}/contents/{quote(path, safe='/')}"
    if client is None:
        async with httpx.AsyncClient(timeout=15.0) as owned_client:
            response = await owned_client.get(url, headers=headers, params={"ref": branch})
    else:
        response = await client.get(url, headers=headers, params={"ref": branch})
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict) or payload.get("encoding") != "base64" or not isinstance(payload.get("content"), str):
        raise ValueError("GitHub returned an unsupported file format")
    size = payload.get("size")
    if isinstance(size, int) and size > max_bytes:
        raise ValueError(f"The selected file is too large to read (maximum {max_bytes // 1000} KB).")
    try:
        content = base64.b64decode(payload["content"], validate=False)
    except ValueError as exc:
        raise ValueError("GitHub returned invalid base64 file content.") from exc
    if len(content) > max_bytes:
        raise ValueError(f"The selected file is too large to read (maximum {max_bytes // 1000} KB).")
    try:
        return content.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ValueError("The selected repository file is not UTF-8 text") from exc


async def fetch_installation_details(installation_id: str, access_token: str | None = None) -> dict[str, Any]:
    headers = {"Accept": "application/vnd.github+json"}
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(f"https://api.github.com/app/installations/{installation_id}", headers=headers)
    response.raise_for_status()
    return response.json()


def create_github_app_jwt() -> str:
    if not settings.github_app_id or not settings.github_app_private_key:
        raise ValueError("GitHub App configuration is incomplete")
    payload = {
        "iat": int(time.time()) - 60,
        "exp": int(time.time()) + 600,
        "iss": settings.github_app_id,
    }
    return jwt.encode(payload, settings.github_app_private_key, algorithm="RS256")


async def create_installation_access_token(installation_id: str) -> dict[str, Any]:
    headers = {"Authorization": f"Bearer {create_github_app_jwt()}", "Accept": "application/vnd.github+json"}
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"https://api.github.com/app/installations/{installation_id}/access_tokens",
            headers=headers,
        )
    response.raise_for_status()
    payload = response.json()
    return payload


async def list_installation_repositories(access_token: str, page: int = 1) -> dict[str, Any]:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"}
    params = {"page": page, "per_page": 100}
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get("https://api.github.com/installation/repositories", headers=headers, params=params)
    response.raise_for_status()
    return response.json()
