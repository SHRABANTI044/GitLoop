from __future__ import annotations

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    repository_id: str | None = None
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str | None = None
