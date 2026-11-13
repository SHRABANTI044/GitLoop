from __future__ import annotations

import httpx

from app.ai.prompts import SYSTEM_PROMPT
from app.config import settings


class AIProviderConfigurationError(RuntimeError):
    pass


class AIProviderError(RuntimeError):
    pass


class LLMProvider:
    def __init__(self, provider_name: str | None = None):
        self.provider_name = (provider_name or settings.ai_provider).strip().lower()

    @property
    def is_configured(self) -> bool:
        return self.provider_name == "openai" and bool(settings.openai_api_key.strip())

    def configuration_error(self) -> str:
        if self.provider_name != "openai":
            return f"Unsupported AI_PROVIDER '{self.provider_name}'. Set AI_PROVIDER=openai."
        return "AI is not configured. Set OPENAI_API_KEY in backend/.env and restart the backend."

    async def complete(
        self,
        prompt: str,
        *,
        system_prompt: str = SYSTEM_PROMPT,
        json_mode: bool = False,
    ) -> str:
        if not self.is_configured:
            raise AIProviderConfigurationError(self.configuration_error())

        payload: dict[str, object] = {
            "model": settings.openai_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            async with httpx.AsyncClient(timeout=settings.ai_request_timeout_seconds) as client:
                response = await client.post(
                    f"{settings.openai_base_url.rstrip('/')}/chat/completions",
                    headers={"Authorization": f"Bearer {settings.openai_api_key.strip()}"},
                    json=payload,
                )
                response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise AIProviderError("The AI provider timed out. Please retry the analysis.") from exc
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in {401, 403}:
                raise AIProviderError("The AI provider rejected its configured credentials. Check OPENAI_API_KEY.") from exc
            raise AIProviderError(f"The AI provider returned HTTP {exc.response.status_code}. Please retry later.") from exc
        except httpx.RequestError as exc:
            raise AIProviderError("Could not reach the configured AI provider. Please retry later.") from exc

        try:
            content = response.json()["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            raise AIProviderError("The AI provider returned an invalid response.") from exc
        if not isinstance(content, str) or not content.strip():
            raise AIProviderError("The AI provider returned an empty response.")
        return content.strip()
