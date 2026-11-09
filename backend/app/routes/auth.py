from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.github.client import exchange_oauth_code, fetch_github_user
from app.github.oauth import build_github_authorize_url, build_github_connect_url
from app.models.user import User
from app.schemas.auth import LoginRequest, PasswordResetRequest, SignupRequest
from app.schemas.user import UserRead
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_oauth_state,
    create_user,
    decode_access_token,
    decode_oauth_state,
    get_user_by_id,
)
from app.services.github_service import upsert_connection_for_user

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user_id = decode_access_token(credentials.credentials)
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> dict:
    user = create_user(db, full_name=payload.full_name, email=str(payload.email), password=payload.password)
    token = create_access_token(user.id)
    user_payload = UserRead.model_validate(user).model_dump(by_alias=True)
    return {"user": user_payload, "access_token": token, "token_type": "bearer"}


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    user = authenticate_user(db, email=str(payload.email), password=payload.password)
    token = create_access_token(user.id)
    user_payload = UserRead.model_validate(user).model_dump(by_alias=True)
    return {"user": user_payload, "access_token": token, "token_type": "bearer"}


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/forgot-password")
def forgot_password(payload: PasswordResetRequest) -> dict[str, str]:
    return {"status": "ok", "email": str(payload.email)}


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/github")
def begin_github_oauth(current_user: User = Depends(get_current_user), mode: str = "login") -> dict[str, str]:
    if not settings.github_client_id and not settings.github_app_slug:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="GitHub OAuth is not configured")

    state = create_oauth_state(current_user.id)
    if settings.github_app_slug:
        url = build_github_connect_url(state)
    else:
        url = build_github_authorize_url(settings.github_client_id, settings.github_redirect_uri, state)
    return {"url": url, "state": state, "mode": mode}


@router.get("/github/callback")
async def github_callback(
    code: str | None = None,
    state: str | None = None,
    installation_id: str | None = None,
    setup_action: str | None = None,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    if not state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing GitHub OAuth state")

    user_id = decode_oauth_state(state)
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="GitLoop user no longer exists")

    if not code:
        return {
            "status": "ok",
            "user_id": user.id,
            "installation_id": installation_id,
            "setup_action": setup_action,
            "message": "GitHub installation callback received",
        }

    access_token = await exchange_oauth_code(code, settings.github_redirect_uri)
    profile = await fetch_github_user(access_token)
    installation_token = None
    if installation_id and settings.github_app_id and settings.github_app_private_key:
        from app.github.client import create_installation_access_token

        installation_payload = await create_installation_access_token(installation_id)
        installation_token = installation_payload.get("token")

    connection = upsert_connection_for_user(
        db,
        user.id,
        github_user_id=str(profile["github_user_id"] or ""),
        github_username=str(profile["username"] or "github-user"),
        github_account_type="user",
        avatar_url=profile.get("avatar_url"),
        github_profile_url=profile.get("profile_url"),
        installation_id=installation_id,
        installation_owner_login=None,
        installation_owner_type=None,
        access_token=access_token,
        installation_token=installation_token,
    )

    return {
        "status": "connected",
        "user_id": user.id,
        "github_user_id": connection.github_user_id,
        "github_username": connection.github_username,
        "installation_id": connection.installation_id,
        "avatar_url": connection.avatar_url,
    }
