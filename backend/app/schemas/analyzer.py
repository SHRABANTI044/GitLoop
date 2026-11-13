from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class AnalysisStartRequest(BaseModel):
    repository_id: str = Field(min_length=1, max_length=36)


class ExplainFileRequest(BaseModel):
    repository_id: str = Field(min_length=1, max_length=36)
    path: str = Field(min_length=1, max_length=512)


class AnalyzerFile(BaseModel):
    path: str
    type: Literal["file", "directory"]
    size: int = 0
    sha: str | None = None
    language: str | None = None


class ProjectOverview(BaseModel):
    project_name: str
    description: str | None = None
    main_purpose: str
    main_functionality: list[str] = Field(default_factory=list)
    language: str | None = None
    visibility: str
    observations: list[str] = Field(default_factory=list)


class Technology(BaseModel):
    category: str
    name: str
    evidence: list[str] = Field(default_factory=list)


class ArchitectureComponent(BaseModel):
    name: str
    responsibility: str
    evidence: list[str] = Field(default_factory=list)


class ArchitectureAnalysis(BaseModel):
    summary: str
    components: list[ArchitectureComponent] = Field(default_factory=list)
    diagram: str | None = None


class CodeInsight(BaseModel):
    title: str
    severity: Literal["info", "low", "medium", "high"] = "info"
    explanation: str
    file_path: str
    line_number: int | None = Field(default=None, ge=1)
    evidence: str
    suggested_improvement: str


class DependencyFinding(BaseModel):
    package_name: str
    version_constraint: str | None = None
    ecosystem: str
    purpose: str | None = None
    source_file: str


class ImprovementSuggestion(BaseModel):
    area: str
    suggestion: str
    reason: str
    evidence: list[str] = Field(default_factory=list)


class RecommendedTask(BaseModel):
    title: str
    description: str
    priority: Literal["high", "medium", "low"]
    reason: str
    related_files: list[str] = Field(default_factory=list)


class AnalysisDraft(BaseModel):
    project_overview: ProjectOverview
    technology_stack: list[Technology] = Field(default_factory=list)
    architecture: ArchitectureAnalysis
    code_insights: list[CodeInsight] = Field(default_factory=list)
    improvement_suggestions: list[ImprovementSuggestion] = Field(default_factory=list)
    next_steps: list[RecommendedTask] = Field(default_factory=list)


class AnalysisReportContent(AnalysisDraft):
    file_tree: list[AnalyzerFile] = Field(default_factory=list)
    dependencies: list[DependencyFinding] = Field(default_factory=list)


class AnalyzerReportOut(BaseModel):
    id: str
    repository_id: str
    repository_full_name: str
    status: Literal["queued", "running", "completed", "failed"]
    stage: str
    progress: int
    error_message: str | None = None
    repository_metadata: dict[str, Any] | None = None
    file_tree: list[AnalyzerFile] = Field(default_factory=list)
    files_analyzed: int = 0
    report: AnalysisReportContent | None = None
    created_at: datetime
    completed_at: datetime | None = None


class AnalyzerRepositoryOut(BaseModel):
    id: str
    name: str
    full_name: str
    description: str | None = None
    language: str | None = None
    visibility: str
    default_branch: str | None = None
    repository_url: str | None = None


class RepositoryStructureOut(BaseModel):
    repository_id: str
    file_tree: list[AnalyzerFile]
    truncated: bool


class FileExplanationOut(BaseModel):
    path: str
    explanation: str


class FileContentOut(BaseModel):
    path: str
    content: str
