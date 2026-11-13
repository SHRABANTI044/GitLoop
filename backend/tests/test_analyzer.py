import json
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app.config import settings
from app.database import SessionLocal
from app.main import app
from app.models.github_connection import GitHubConnection
from app.models.repository import Repository
from app.services import analyzer_service
from app.utils.security import encrypt_value

client = TestClient(app)


def create_account(full_name: str) -> tuple[str, str]:
    email = f"analyzer-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/auth/signup",
        json={"fullName": full_name, "email": email, "password": "StrongPass123"},
    )
    assert response.status_code == 201, response.text
    return response.json()["user"]["id"], response.json()["access_token"]


def test_analyzer_requires_ai_provider_configuration(monkeypatch):
    user_id, token = create_account("Analyzer User")
    db = SessionLocal()
    repository = Repository(
        user_id=user_id,
        github_repo_id=f"repo-{uuid.uuid4().hex}",
        name="example",
        full_name="analyzer-user/example",
        visibility="private",
    )
    db.add(repository)
    db.commit()
    repository_id = repository.id
    db.close()
    monkeypatch.setattr(settings, "ai_provider", "openai")
    monkeypatch.setattr(settings, "openai_api_key", "")

    response = client.post(
        "/api/analyzer/analyze",
        headers={"Authorization": f"Bearer {token}"},
        json={"repository_id": repository_id},
    )

    assert response.status_code == 503
    assert "OPENAI_API_KEY" in response.json()["detail"]


def test_analyzer_saves_report_and_enforces_user_scope(monkeypatch):
    user_id, token = create_account("Analyzer Owner")
    other_user_id, other_token = create_account("Other User")
    db = SessionLocal()
    repository = Repository(
        user_id=user_id,
        github_repo_id=f"repo-{uuid.uuid4().hex}",
        name="sample",
        full_name="analyzer-owner/sample",
        description="A small test service",
        default_branch="main",
        visibility="public",
    )
    db.add(repository)
    db.flush()
    db.add(
        GitHubConnection(
            user_id=user_id,
            github_user_id=f"github-{uuid.uuid4().hex}",
            github_username="analyzer-owner",
            access_token_encrypted=encrypt_value("test-token"),
        )
    )
    db.commit()
    repository_id = repository.id
    db.close()

    async def fake_metadata(_token, full_name):
        return {
            "id": 123,
            "name": "sample",
            "full_name": full_name,
            "description": "A small test service",
            "language": "Python",
            "visibility": "public",
            "default_branch": "main",
            "html_url": "https://github.com/analyzer-owner/sample",
        }

    async def fake_tree(_token, _full_name, _branch, **_kwargs):
        return [
            {"path": "README.md", "type": "blob", "size": 20, "sha": "readme"},
            {"path": "main.py", "type": "blob", "size": 29, "sha": "main"},
            {"path": ".env", "type": "blob", "size": 100, "sha": "secret"},
        ], False

    async def fake_file(_token, _full_name, _branch, path, client=None, max_bytes=32_000):
        if path == "README.md":
            return "# Sample service\n"
        if path == "main.py":
            return "def add(a, b):\n    return a + b\n"
        raise AssertionError(f"Unexpected file requested: {path}")

    draft = {
        "project_overview": {
            "project_name": "sample",
            "description": "A small test service",
            "main_purpose": "Provides an evidenced addition function.",
            "main_functionality": ["Adds two values."],
            "language": "Python",
            "visibility": "public",
            "observations": ["The inspected Python file defines one function."],
        },
        "technology_stack": [{"category": "Language", "name": "Python", "evidence": ["main.py"]}],
        "architecture": {
            "summary": "The inspected repository contains a small Python module.",
            "components": [{"name": "main.py", "responsibility": "Defines the add function.", "evidence": ["main.py"]}],
            "diagram": None,
        },
        "code_insights": [{
            "title": "No argument validation",
            "severity": "info",
            "explanation": "The function directly adds its input values.",
            "file_path": "main.py",
            "line_number": 2,
            "evidence": "return a + b",
            "suggested_improvement": "Add validation if the function accepts untrusted input.",
        }],
        "improvement_suggestions": [{
            "area": "Testing",
            "suggestion": "Add tests for the add function.",
            "reason": "No test files were present in the inspected tree.",
            "evidence": ["main.py"],
        }],
        "next_steps": [{
            "title": "Add tests for add",
            "description": "Cover integer and invalid input cases.",
            "priority": "medium",
            "reason": "The repository tree has no test files.",
            "related_files": ["main.py"],
        }],
    }

    async def fake_complete(self, _prompt, *, system_prompt, json_mode):
        assert "untrusted" in system_prompt.lower()
        assert json_mode is True
        return json.dumps(draft)

    monkeypatch.setattr(settings, "ai_provider", "openai")
    monkeypatch.setattr(settings, "openai_api_key", "test-api-key")
    monkeypatch.setattr(analyzer_service, "fetch_repository_metadata", fake_metadata)
    monkeypatch.setattr(analyzer_service, "fetch_repository_tree", fake_tree)
    monkeypatch.setattr(analyzer_service, "fetch_repository_file", fake_file)
    monkeypatch.setattr(analyzer_service.LLMProvider, "complete", fake_complete)

    start = client.post(
        "/api/analyzer/analyze",
        headers={"Authorization": f"Bearer {token}"},
        json={"repository_id": repository_id},
    )
    assert start.status_code == 202, start.text
    report_id = start.json()["id"]
    report_response = client.get(
        f"/api/analyzer/reports/{report_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert report_response.status_code == 200, report_response.text
    saved_report = report_response.json()
    assert saved_report["status"] == "completed"
    assert saved_report["files_analyzed"] == 2
    assert all(item["path"] != ".env" for item in saved_report["file_tree"])
    assert saved_report["report"]["dependencies"] == []

    file_response = client.get(
        f"/api/analyzer/repositories/{repository_id}/file",
        params={"path": "main.py"},
        headers={"Authorization": f"Bearer {token}"},
    )
    secret_response = client.get(
        f"/api/analyzer/repositories/{repository_id}/file",
        params={"path": ".env"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert file_response.status_code == 200
    assert file_response.json()["content"].startswith("def add")
    assert secret_response.status_code == 400

    forbidden_report = client.get(
        f"/api/analyzer/reports/{report_id}",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    forbidden_repository = client.post(
        "/api/analyzer/analyze",
        headers={"Authorization": f"Bearer {other_token}"},
        json={"repository_id": repository_id},
    )
    assert forbidden_report.status_code == 404
    assert forbidden_repository.status_code == 404
