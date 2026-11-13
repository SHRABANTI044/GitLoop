import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app.config import settings
from app.database import SessionLocal
from app.models.github_connection import GitHubConnection
from app.main import app
from app.routes import auth as auth_routes, github as github_routes
from app.services.auth_service import create_oauth_state
from app.utils.security import encrypt_value

client = TestClient(app)


def test_healthcheck():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] in {"ok", "degraded"}


def test_signup_and_login():
    email = f"jane-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/auth/signup",
        json={"fullName": "Jane Doe", "email": email, "password": "StrongPass123"},
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert "user" in data
    assert data["user"]["fullName"] == "Jane Doe"
    login = client.post(
        "/api/auth/login",
        json={"email": email, "password": "StrongPass123", "remember": True},
    )
    assert login.status_code == 200, login.text
    login_data = login.json()
    assert login_data["user"]["fullName"] == "Jane Doe"


def test_begin_github_oauth_explains_missing_configuration(monkeypatch):
    monkeypatch.setattr(settings, "github_client_id", "")
    monkeypatch.setattr(settings, "github_client_secret", "")
    monkeypatch.setattr(settings, "github_app_slug", "")
    email = f"oauth-{uuid.uuid4().hex[:8]}@example.com"
    signup = client.post(
        "/api/auth/signup",
        json={"fullName": "OAuth User", "email": email, "password": "StrongPass123"},
    )
    token = signup.json()["access_token"]

    response = client.get("/api/auth/github", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 500
    assert "GITHUB_CLIENT_ID" in response.json()["detail"]
    assert "backend/.env" in response.json()["detail"]


def test_github_oauth_cancellation_returns_to_connect_page(monkeypatch):
    email = f"oauth-cancel-{uuid.uuid4().hex[:8]}@example.com"
    signup = client.post(
        "/api/auth/signup",
        json={"fullName": "OAuth User", "email": email, "password": "StrongPass123"},
    )
    state = create_oauth_state(signup.json()["user"]["id"])
    monkeypatch.setattr(settings, "frontend_url", "http://localhost:5173")

    response = client.get(
        "/api/auth/github/callback",
        params={"state": state, "error": "access_denied"},
        follow_redirects=False,
    )

    assert response.status_code == 303
    assert response.headers["location"] == "http://localhost:5173/connect-github?github_error=cancelled"


def test_github_oauth_success_returns_to_repository_selection(monkeypatch):
    email = f"oauth-success-{uuid.uuid4().hex[:8]}@example.com"
    signup = client.post(
        "/api/auth/signup",
        json={"fullName": "OAuth User", "email": email, "password": "StrongPass123"},
    )
    state = create_oauth_state(signup.json()["user"]["id"])

    async def exchange_oauth_code(_code, _redirect_uri):
        return "github-access-token"

    async def fetch_github_user(_access_token):
        return {
            "github_user_id": "12345",
            "username": "octocat",
            "avatar_url": None,
            "email": "octocat@example.com",
            "profile_url": "https://github.com/octocat",
        }

    connection = type(
        "Connection",
        (),
        {
            "github_user_id": "12345",
            "github_username": "octocat",
            "installation_id": None,
            "avatar_url": None,
        },
    )()
    monkeypatch.setattr(auth_routes, "exchange_oauth_code", exchange_oauth_code)
    monkeypatch.setattr(auth_routes, "fetch_github_user", fetch_github_user)
    monkeypatch.setattr(auth_routes, "upsert_connection_for_user", lambda *_args, **_kwargs: connection)

    response = client.get(
        "/api/auth/github/callback",
        params={"state": state, "code": "oauth-code"},
        follow_redirects=False,
    )

    assert response.status_code == 303
    assert response.headers["location"] == "http://localhost:5173/select-repositories"


def test_github_sync_fetches_and_preserves_repository_selection(monkeypatch):
    email = f"sync-{uuid.uuid4().hex[:8]}@example.com"
    signup = client.post(
        "/api/auth/signup",
        json={"fullName": "Sync User", "email": email, "password": "StrongPass123"},
    )
    token = signup.json()["access_token"]
    user_id = signup.json()["user"]["id"]
    db = SessionLocal()
    db.add(
        GitHubConnection(
            user_id=user_id,
            github_user_id=f"github-{uuid.uuid4().hex}",
            github_username="sync-user",
            access_token_encrypted=encrypt_value("test-access-token"),
        )
    )
    db.commit()
    db.close()
    github_repositories = [
        {
            "id": 123,
            "name": "sample",
            "full_name": "sync-user/sample",
            "description": "A test repository",
            "default_branch": "main",
            "private": True,
            "visibility": "private",
            "language": "Python",
            "html_url": "https://github.com/sync-user/sample",
        }
    ]

    async def list_user_repositories(access_token):
        assert access_token == "test-access-token"
        return github_repositories

    monkeypatch.setattr(github_routes, "list_user_repositories", list_user_repositories)

    headers = {"Authorization": f"Bearer {token}"}
    first_sync = client.post("/api/github/sync", headers=headers)
    assert first_sync.status_code == 200, first_sync.text
    data = first_sync.json()
    assert data["updated"] == 1
    repository = data["repositories"][0]
    assert repository["fullName"] == "sync-user/sample"
    assert repository["selected"] is False

    selection = client.post(
        "/api/github/repositories/select",
        headers=headers,
        json={"repository_ids": [repository["id"]]},
    )
    assert selection.status_code == 200

    github_repositories[0]["description"] = "Updated description"
    second_sync = client.post("/api/github/sync", headers=headers)
    assert second_sync.status_code == 200, second_sync.text
    updated_repository = second_sync.json()["repositories"][0]
    assert updated_repository["description"] == "Updated description"
    assert updated_repository["selected"] is True
