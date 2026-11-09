from __future__ import annotations


class EmbeddingModel:
    def __init__(self, model_name: str = "text-embedding-3-small"):
        self.model_name = model_name

    async def embed(self, text: str) -> list[float]:
        return [float(ord(ch)) / 255.0 for ch in text[:128]]
