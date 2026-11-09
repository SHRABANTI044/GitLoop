from __future__ import annotations


class RAGPipeline:
    async def answer(self, question: str, context: list[str]) -> str:
        if not context:
            return "No repository context available yet."
        return f"Based on repository context, answer to: {question}"
