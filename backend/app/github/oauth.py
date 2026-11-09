from __future__ import annotations

from __future__ import annotations

from urllib.parse import quote, urlencode

from app.config import settings


def build_github_authorize_url(client_id: str, redirect_uri: str, state: str) -> str:
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "state": state,
        "scope": "read:user,repo,user:email",
    }
    return f"https://github.com/login/oauth/authorize?{urlencode(params)}"


def build_github_app_install_url(state: str) -> str:
    slug = settings.github_app_slug.strip()
    if not slug:
        raise ValueError("GitHub App slug is not configured.")
    return f"https://github.com/apps/{slug}/installations/new?{urlencode({'state': state})}"


def build_github_connect_url(state: str) -> str:
    if settings.github_app_slug:
        return build_github_app_install_url(state)
    if not settings.github_client_id:
        raise ValueError("GitHub App or OAuth client is not configured.")
    return build_github_authorize_url(settings.github_client_id, settings.github_app_installation_redirect_uri or settings.github_redirect_uri, state)
