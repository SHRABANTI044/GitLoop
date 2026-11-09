from __future__ import annotations


class ProjectMemoryStore:
    def __init__(self):
        self.items: list[str] = []

    def add(self, item: str) -> None:
        self.items.append(item)
