from __future__ import annotations


class RepositoryAnalyzer:
    async def analyze(self, repository_name: str, metadata: dict[str, object]) -> str:
        return f"Repository analysis for {repository_name}: {metadata.get('description', 'No summary available.')}"
