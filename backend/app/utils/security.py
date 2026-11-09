from __future__ import annotations

from cryptography.fernet import Fernet

from app.config import settings


def _get_fernet() -> Fernet:
    key = settings.github_token_encryption_key or settings.jwt_secret_key
    if len(key.encode("utf-8")) < 32:
        key = key.ljust(32, "0")[:32]
    normalized = key.encode("utf-8")
    if len(normalized) > 32:
        normalized = normalized[:32]
    return Fernet(base64_url := __import__("base64").urlsafe_b64encode(normalized.ljust(32, b"0")))


def encrypt_value(value: str) -> str:
    return _get_fernet().encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_value(value: str) -> str:
    return _get_fernet().decrypt(value.encode("utf-8")).decode("utf-8")
