from __future__ import annotations

import base64
import time
from typing import Any

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
