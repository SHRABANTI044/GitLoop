from __future__ import annotations


class LLMProvider:
    def __init__(self, provider_name: str = "bedrock"):
        self.provider_name = provider_name

    async def complete(self, prompt: str) -> str:
        return "This is a placeholder AI response. Configure a provider to enable live generation."
