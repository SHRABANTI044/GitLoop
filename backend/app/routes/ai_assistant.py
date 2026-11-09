from __future__ import annotations

from fastapi import APIRouter

from app.ai.llm_provider import LLMProvider
from app.schemas.ai import ChatRequest, ChatResponse

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    provider = LLMProvider("bedrock")
    reply = await provider.complete(payload.message)
    return ChatResponse(reply=reply, conversation_id=payload.conversation_id)
