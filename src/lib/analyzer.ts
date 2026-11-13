import { apiFetch } from "./api";
import { getToken } from "./auth";

export interface AnalyzerRepository {
  id: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  visibility: string;
  default_branch: string | null;
  repository_url: string | null;
}

export interface AnalyzerFile {
  path: string;
  type: "file" | "directory";
  size: number;
  sha: string | null;
  language: string | null;
}

export interface AnalyzerTechnology {
  category: string;
  name: string;
  evidence: string[];
}

export interface AnalyzerDependency {
  package_name: string;
  version_constraint: string | null;
  ecosystem: string;
  purpose: string | null;
  source_file: string;
}

export interface AnalyzerCodeInsight {
  title: string;
  severity: "info" | "low" | "medium" | "high";
  explanation: string;
  file_path: string;
  line_number: number | null;
  evidence: string;
  suggested_improvement: string;
}

export interface AnalyzerNextStep {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  reason: string;
  related_files: string[];
}

export interface AnalyzerReportContent {
  project_overview: {
    project_name: string;
    description: string | null;
    main_purpose: string;
    main_functionality: string[];
    language: string | null;
    visibility: string;
    observations: string[];
  };
  technology_stack: AnalyzerTechnology[];
  architecture: {
    summary: string;
    components: { name: string; responsibility: string; evidence: string[] }[];
    diagram: string | null;
  };
  file_tree: AnalyzerFile[];
  code_insights: AnalyzerCodeInsight[];
  dependencies: AnalyzerDependency[];
  improvement_suggestions: {
    area: string;
    suggestion: string;
    reason: string;
    evidence: string[];
  }[];
  next_steps: AnalyzerNextStep[];
}

export interface AnalyzerReport {
  id: string;
  repository_id: string;
  repository_full_name: string;
  status: "queued" | "running" | "completed" | "failed";
  stage: string;
  progress: number;
  error_message: string | null;
  repository_metadata: Record<string, unknown> | null;
  file_tree: AnalyzerFile[];
  files_analyzed: number;
  report: AnalyzerReportContent | null;
  created_at: string;
  completed_at: string | null;
}

export interface RepositoryStructure {
  repository_id: string;
  file_tree: AnalyzerFile[];
  truncated: boolean;
}

const analyzerFetch = (path: string, init?: RequestInit) => {
  const token = getToken();
  if (!token) throw new Error("Please sign in again to use the Repository Analyzer.");
  return apiFetch(path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};

export const AnalyzerAPI = {
  repositories(): Promise<AnalyzerRepository[]> {
    return analyzerFetch("/analyzer/repositories");
  },

  reports(): Promise<AnalyzerReport[]> {
    return analyzerFetch("/analyzer/reports");
  },

  report(reportId: string): Promise<AnalyzerReport> {
    return analyzerFetch(`/analyzer/reports/${encodeURIComponent(reportId)}`);
  },

  analyze(repositoryId: string): Promise<AnalyzerReport> {
    return analyzerFetch("/analyzer/analyze", {
      method: "POST",
      body: JSON.stringify({ repository_id: repositoryId }),
    });
  },

  reanalyze(reportId: string): Promise<AnalyzerReport> {
    return analyzerFetch(`/analyzer/reports/${encodeURIComponent(reportId)}/reanalyze`, {
      method: "POST",
    });
  },

  structure(repositoryId: string): Promise<RepositoryStructure> {
    return analyzerFetch(`/analyzer/repositories/${encodeURIComponent(repositoryId)}/structure`);
  },

  file(repositoryId: string, path: string): Promise<{ path: string; content: string }> {
    const query = new URLSearchParams({ path });
    return analyzerFetch(`/analyzer/repositories/${encodeURIComponent(repositoryId)}/file?${query}`);
  },

  explainFile(repositoryId: string, path: string): Promise<{ path: string; explanation: string }> {
    return analyzerFetch("/analyzer/explain-file", {
      method: "POST",
      body: JSON.stringify({ repository_id: repositoryId, path }),
    });
  },
};
