import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app.main import app

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
