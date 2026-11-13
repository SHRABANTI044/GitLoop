import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, ArrowDownToLine, CheckCircle2, ChevronRight, Clock3, FileCode2,
  FileText, Folder, FolderTree, Lightbulb, Loader2, Play, RefreshCw, Sparkles,
} from "lucide-react";
import { AlertBanner } from "../../components/auth/AuthFields";
import { LoadingBlock } from "../../components/dashboard/widgets";
import { useAuth } from "../../context/AuthContext";
import { DashboardAPI } from "../../lib/dashboard";
import { AuthAPI } from "../../lib/auth";
import {
  AnalyzerAPI,
  type AnalyzerFile,
  type AnalyzerNextStep,
  type AnalyzerReport,
  type AnalyzerRepository,
} from "../../lib/analyzer";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  language: string | null;
  children: Map<string, TreeNode>;
}

function makeTree(files: AnalyzerFile[]): TreeNode {
  const root: TreeNode = { name: "", path: "", type: "directory", size: 0, language: null, children: new Map() };
  for (const file of files) {
    const parts = file.path.split("/");
    let node = root;
    for (let index = 0; index < parts.length; index += 1) {
      const name = parts[index];
      const path = parts.slice(0, index + 1).join("/");
      const isFile = index === parts.length - 1 && file.type === "file";
      let child = node.children.get(name);
      if (!child) {
        child = {
          name,
          path,
          type: isFile ? "file" : "directory",
          size: isFile ? file.size : 0,
          language: isFile ? file.language : null,
          children: new Map(),
        };
        node.children.set(name, child);
      }
      node = child;
    }
  }
  return root;
}

function TreeItem({
  node,
  repositoryId,
  selectedPath,
  onOpen,
}: {
  node: TreeNode;
  repositoryId: string;
  selectedPath: string | null;
  onOpen: (path: string) => void;
}) {
  const children = [...node.children.values()].sort((a, b) =>
    a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1
  );
  if (node.type === "directory") {
    return (
      <details className="group" open={node.path === "" ? true : undefined}>
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-[#CBD5E1] hover:bg-white/[0.04]">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-90" />
          <Folder className="h-4 w-4 shrink-0 text-[#A78BFA]" />
          <span className="truncate">{node.name || "Repository root"}</span>
        </summary>
        {children.length > 0 && (
          <ul className="ml-3 border-l border-[#252D43] pl-2">
            {children.map((child) => (
              <li key={child.path}>
                <TreeItem node={child} repositoryId={repositoryId} selectedPath={selectedPath} onOpen={onOpen} />
              </li>
            ))}
          </ul>
        )}
      </details>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen(node.path)}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] ${
        selectedPath === node.path ? "bg-[#8B5CF6]/15 text-white" : "text-[#94A3B8] hover:bg-white/[0.04] hover:text-white"
      }`}
      aria-label={`Read ${node.path}`}
      data-repository-id={repositoryId}
    >
      <FileCode2 className="h-4 w-4 shrink-0 text-[#67E8F9]" />
      <span className="min-w-0 flex-1 truncate">{node.name}</span>
      {node.size > 0 && <span className="shrink-0 text-[10px] text-[#475569]">{Math.ceil(node.size / 1024)} KB</span>}
    </button>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#252D43] bg-[#10182A]/80 p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
        <Icon className="h-4 w-4 text-[#A78BFA]" />
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

function priorityStyle(priority: AnalyzerNextStep["priority"]) {
  if (priority === "high") return "border-[#F87171]/30 bg-[#F87171]/10 text-[#FCA5A5]";
  if (priority === "medium") return "border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FCD34D]";
  return "border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#67E8F9]";
}

export default function AnalyzerPage() {
  const { user, githubConnected } = useAuth();
  const [repositories, setRepositories] = useState<AnalyzerRepository[]>([]);
  const [reports, setReports] = useState<AnalyzerReport[]>([]);
  const [repositoryId, setRepositoryId] = useState("");
  const [search, setSearch] = useState("");
  const [report, setReport] = useState<AnalyzerReport | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [fileExplanation, setFileExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [taskAdded, setTaskAdded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollInFlight = useRef(false);

  const loadPage = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const [repoList, reportList] = await Promise.all([
        AnalyzerAPI.repositories(),
        AnalyzerAPI.reports(),
      ]);
      setRepositories(repoList);
      setReports(reportList);
      setRepositoryId((current) => current || repoList[0]?.id || "");
      setReport((current) => current ?? reportList[0] ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load analyzer data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (!report || (report.status !== "queued" && report.status !== "running")) return;
    const timer = window.setInterval(async () => {
      if (pollInFlight.current) return;
      pollInFlight.current = true;
      try {
        const latest = await AnalyzerAPI.report(report.id);
        setReport(latest);
        setReports((items) => [latest, ...items.filter((item) => item.id !== latest.id)]);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not refresh analysis status.");
      } finally {
        pollInFlight.current = false;
      }
    }, 1200);
    return () => window.clearInterval(timer);
  }, [report?.id, report?.status]);

  const filteredRepositories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return repositories;
    return repositories.filter((repository) =>
      `${repository.full_name} ${repository.description ?? ""} ${repository.language ?? ""}`.toLowerCase().includes(term)
    );
  }, [repositories, search]);

  const selectedRepository = repositories.find((repository) => repository.id === repositoryId) ?? null;
  const tree = useMemo(() => makeTree(report?.report?.file_tree ?? report?.file_tree ?? []), [report]);

  const refreshRepositories = async () => {
    if (!user) return;
    setRefreshing(true);
    setError(null);
    try {
      const result = await AuthAPI.syncRepositories(user.id);
      const refreshed: AnalyzerRepository[] = result.repos.map((repository) => ({
        id: repository.id,
        name: repository.name,
        full_name: repository.fullName,
        description: repository.description,
        language: repository.language,
        visibility: repository.visibility,
        default_branch: null,
        repository_url: null,
      }));
      setRepositories(refreshed);
      setRepositoryId((current) => current || refreshed[0]?.id || "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not refresh repositories from GitHub.");
    } finally {
      setRefreshing(false);
    }
  };

  const startAnalysis = async () => {
    if (!repositoryId) return;
    setError(null);
    setSelectedFile(null);
    setFileExplanation(null);
    setAnalyzing(true);
    try {
      const started = await AnalyzerAPI.analyze(repositoryId);
      setReport(started);
      setReports((items) => [started, ...items.filter((item) => item.id !== started.id)]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start repository analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reanalyze = async () => {
    if (!report) return;
    setError(null);
    setAnalyzing(true);
    try {
      const started = await AnalyzerAPI.reanalyze(report.id);
      setReport(started);
      setReports((items) => [started, ...items.filter((item) => item.id !== started.id)]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not restart repository analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const openFile = async (path: string) => {
    if (!report) return;
    setFileLoading(true);
    setSelectedFile(null);
    setFileExplanation(null);
    setError(null);
    try {
      setSelectedFile(await AnalyzerAPI.file(report.repository_id, path));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not read this repository file.");
    } finally {
      setFileLoading(false);
    }
  };

  const explainFile = async () => {
    if (!report || !selectedFile) return;
    setExplaining(true);
    setError(null);
    try {
      const result = await AnalyzerAPI.explainFile(report.repository_id, selectedFile.path);
      setFileExplanation(result.explanation);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not explain this file.");
    } finally {
      setExplaining(false);
    }
  };

  const addRecommendedTask = async (step: AnalyzerNextStep) => {
    if (!user || !report) return;
    setTaskAdded(null);
    try {
      await DashboardAPI.createTask(user.id, {
        title: step.title,
        description: `${step.description}\n\nReason: ${step.reason}${step.related_files.length ? `\nRelated files: ${step.related_files.join(", ")}` : ""}`,
        repositoryId: report.repository_id,
        priority: step.priority,
        dueDate: null,
      });
      setTaskAdded(step.title);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not add the recommended task.");
    }
  };

  const openSavedReport = async (id: string) => {
    setError(null);
    try {
      const saved = await AnalyzerAPI.report(id);
      setReport(saved);
      setRepositoryId(saved.repository_id);
      setSelectedFile(null);
      setFileExplanation(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not open the saved report.");
    }
  };

  if (loading) return <LoadingBlock label="Loading Repository Analyzer…" />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-[11px] font-bold text-[#C4B5FD]">
            <Sparkles className="h-3.5 w-3.5" /> EVIDENCE-BASED ANALYSIS
          </p>
          <h2 className="mt-3 text-[26px] font-extrabold tracking-tight">AI Repository <span className="text-gradient">Analyzer</span></h2>
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-[#94A3B8]">
            Analyze authorized repository files, inspect architecture, and save evidence-backed reports to your account.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshRepositories}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-[#252D43] bg-white/[0.03] px-4 py-2.5 text-[12.5px] font-semibold text-[#CBD5E1] hover:border-[#8B5CF6]/40 disabled:opacity-60"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh GitHub
        </button>
      </header>

      {error && <AlertBanner type="error" message={error} />}
      {taskAdded && (
        <AlertBanner type="success" message={`Added “${taskAdded}” to the Task Manager.`} />
      )}

      {!githubConnected && (
        <AlertBanner
          type="error"
          message="Connect a GitHub account before analyzing repositories."
        />
      )}

      <section className="rounded-2xl border border-[#252D43] bg-[#10182A]/80 p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,360px)_auto] lg:items-end">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-[#94A3B8] uppercase">Find repository</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, language, or description"
              className="w-full rounded-xl border border-[#252D43] bg-[#090D18] px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-[#8B5CF6]/60"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-[#94A3B8] uppercase">Repository</span>
            <select
              value={repositoryId}
              onChange={(event) => setRepositoryId(event.target.value)}
              disabled={filteredRepositories.length === 0}
              className="w-full rounded-xl border border-[#252D43] bg-[#090D18] px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-[#8B5CF6]/60 disabled:opacity-60"
            >
              {filteredRepositories.length === 0 && <option value="">No repositories found</option>}
              {filteredRepositories.map((repository) => (
                <option key={repository.id} value={repository.id}>{repository.full_name}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={startAnalysis}
            disabled={!selectedRepository || analyzing || report?.status === "queued" || report?.status === "running"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-2.5 text-[13px] font-bold text-white glow-btn disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Analyze Repository
          </button>
        </div>

        {selectedRepository && (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#252D43]/70 pt-3 text-[12px] text-[#94A3B8]">
            <span className="font-semibold text-white">{selectedRepository.full_name}</span>
            <span className="rounded-full border border-[#252D43] px-2 py-0.5">{selectedRepository.visibility}</span>
            {selectedRepository.language && <span>{selectedRepository.language}</span>}
            {selectedRepository.description && <span className="min-w-0 flex-1 truncate">{selectedRepository.description}</span>}
          </div>
        )}
        {repositories.length === 0 && (
          <p className="mt-3 text-[12.5px] text-[#94A3B8]">
            {githubConnected
              ? "No repositories are available yet. Use Refresh GitHub to sync repositories you have authorized."
              : <>No connected repositories. <Link className="font-semibold text-[#C4B5FD] hover:text-white" to="/connect-github">Connect GitHub</Link>.</>}
          </p>
        )}
      </section>

      {report && (report.status === "queued" || report.status === "running") && (
        <section className="rounded-2xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/[0.07] p-5" aria-live="polite">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#C4B5FD]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13.5px] font-bold text-white">{report.stage}</p>
                <p className="font-mono text-[12px] text-[#C4B5FD]">{report.progress}%</p>
              </div>
              <p className="mt-1 text-[11.5px] text-[#94A3B8]">{report.repository_full_name} · {report.files_analyzed} files collected</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#252D43]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] transition-[width] duration-500" style={{ width: `${report.progress}%` }} />
              </div>
            </div>
          </div>
        </section>
      )}

      {report?.status === "failed" && (
        <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/[0.07] p-4" role="alert">
          <p className="flex items-center gap-2 text-[13px] font-bold text-[#FCA5A5]"><AlertTriangle className="h-4 w-4" /> Analysis failed</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#CBD5E1]">{report.error_message}</p>
          {report.error_message?.includes("OPENAI_API_KEY") && (
            <p className="mt-2 text-[11.5px] text-[#94A3B8]">Add the key to backend/.env and restart the backend. Never put it in frontend code or chat.</p>
          )}
        </div>
      )}

      {reports.length > 0 && (
        <section className="rounded-2xl border border-[#252D43] bg-[#10182A]/70 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-[12px] font-bold tracking-wide text-[#94A3B8] uppercase">
            <Clock3 className="h-4 w-4" /> Saved analysis reports
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {reports.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openSavedReport(item.id)}
                className={`min-w-[220px] rounded-xl border px-3 py-2.5 text-left ${
                  report?.id === item.id ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/10" : "border-[#252D43] bg-[#090D18] hover:border-[#8B5CF6]/35"
                }`}
              >
                <span className="block truncate text-[12px] font-semibold text-white">{item.repository_full_name}</span>
                <span className="mt-1 block text-[10.5px] text-[#94A3B8]">{item.status} · {formatTime(item.created_at)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {report?.status === "completed" && report.report && (
        <>
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
              <div>
                <h3 className="text-[14px] font-bold text-white">{report.repository_full_name}</h3>
                <p className="mt-1 text-[11.5px] text-[#94A3B8]">
                  Analyzed {formatTime(report.completed_at ?? report.created_at)} · {report.files_analyzed} source/configuration files · {report.report.dependencies.length} dependencies
                </p>
              </div>
            </div>
            <button type="button" onClick={reanalyze} disabled={analyzing} className="inline-flex items-center gap-2 rounded-xl border border-[#252D43] px-3.5 py-2 text-[12px] font-semibold text-[#CBD5E1] hover:border-[#8B5CF6]/50 disabled:opacity-50">
              {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Re-analyze
            </button>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="A · Project Overview" icon={FileText}>
              <p className="text-[13px] leading-relaxed text-[#CBD5E1]">{report.report.project_overview.main_purpose}</p>
              {report.report.project_overview.description && <p className="mt-2 text-[12px] text-[#94A3B8]">{report.report.project_overview.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-[#252D43] px-2.5 py-1 text-[#CBD5E1]">{report.report.project_overview.visibility}</span>
                {report.report.project_overview.language && <span className="rounded-full border border-[#252D43] px-2.5 py-1 text-[#67E8F9]">{report.report.project_overview.language}</span>}
              </div>
              <EvidenceList items={report.report.project_overview.main_functionality} />
              <EvidenceList items={report.report.project_overview.observations} />
            </Panel>

            <Panel title="B · Technology Stack" icon={Sparkles}>
              {report.report.technology_stack.length === 0 ? <NoEvidence /> : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {report.report.technology_stack.map((technology, index) => (
                    <div key={`${technology.category}-${technology.name}-${index}`} className="rounded-xl border border-[#252D43] bg-[#090D18]/70 p-3">
                      <p className="text-[13px] font-bold text-white">{technology.name}</p>
                      <p className="mt-0.5 text-[10.5px] font-semibold tracking-wide text-[#A78BFA] uppercase">{technology.category}</p>
                      <EvidenceList items={technology.evidence} compact />
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="C · Architecture" icon={FolderTree}>
              <p className="text-[12.5px] leading-relaxed text-[#CBD5E1]">{report.report.architecture.summary}</p>
              <div className="mt-3 space-y-2">
                {report.report.architecture.components.map((component, index) => (
                  <div key={`${component.name}-${index}`} className="rounded-xl border border-[#252D43] p-3">
                    <p className="text-[12.5px] font-bold text-white">{component.name}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-[#94A3B8]">{component.responsibility}</p>
                    <EvidenceList items={component.evidence} compact />
                  </div>
                ))}
              </div>
              {report.report.architecture.diagram && (
                <pre className="mt-3 overflow-x-auto rounded-xl border border-[#252D43] bg-[#090D18] p-3 text-[10.5px] text-[#67E8F9]">{report.report.architecture.diagram}</pre>
              )}
            </Panel>

            <Panel title="D · File & Folder Explorer" icon={FolderTree}>
              {!!report.repository_metadata?.tree_truncated && (
                <p className="mb-3 text-[11px] text-[#FCD34D]">The repository is large; the displayed structure is bounded to the first 20,000 entries.</p>
              )}
              {report.report.file_tree.length === 0 ? <NoEvidence /> : (
                <div className="grid min-h-[260px] gap-3 lg:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.2fr)]">
                  <div className="max-h-[460px] overflow-auto rounded-xl border border-[#252D43] bg-[#090D18]/70 p-2">
                    {[...tree.children.values()].sort((a, b) => a.name.localeCompare(b.name)).map((node) => (
                      <TreeItem key={node.path} node={node} repositoryId={report.repository_id} selectedPath={selectedFile?.path ?? null} onOpen={openFile} />
                    ))}
                  </div>
                  <div className="min-h-[220px] overflow-hidden rounded-xl border border-[#252D43] bg-[#090D18]/70">
                    {fileLoading ? (
                      <div className="flex h-full items-center justify-center gap-2 text-[12px] text-[#94A3B8]"><Loader2 className="h-4 w-4 animate-spin" /> Reading file from GitHub…</div>
                    ) : selectedFile ? (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252D43] px-3 py-2">
                          <span className="min-w-0 truncate font-mono text-[11px] text-[#CBD5E1]">{selectedFile.path}</span>
                          <button type="button" onClick={explainFile} disabled={explaining} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#8B5CF6]/30 px-2.5 py-1.5 text-[10.5px] font-semibold text-[#C4B5FD] disabled:opacity-50">
                            {explaining ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Explain file
                          </button>
                        </div>
                        <pre className="max-h-[310px] overflow-auto p-3 text-[10.5px] leading-relaxed text-[#CBD5E1]">{selectedFile.content}</pre>
                        {fileExplanation && <p className="border-t border-[#252D43] p-3 text-[11.5px] leading-relaxed text-[#C4B5FD]">{fileExplanation}</p>}
                      </>
                    ) : (
                      <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 px-4 text-center text-[11.5px] text-[#64748B]">
                        <FileCode2 className="h-6 w-6" /> Select a supported text file to view it from GitHub.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Panel>

            <Panel title="E · Code Insights" icon={AlertTriangle}>
              {report.report.code_insights.length === 0 ? <NoEvidence text="No code insights met the evidence requirements for this analysis." /> : (
                <div className="space-y-3">
                  {report.report.code_insights.map((insight, index) => (
                    <article key={`${insight.file_path}-${insight.title}-${index}`} className="rounded-xl border border-[#252D43] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-[12.5px] font-bold text-white">{insight.title}</h4>
                        <span className="rounded-full border border-[#FBBF24]/25 px-2 py-0.5 text-[9px] font-bold text-[#FCD34D] uppercase">{insight.severity}</span>
                      </div>
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#CBD5E1]">{insight.explanation}</p>
                      <p className="mt-2 font-mono text-[10px] text-[#67E8F9]">{insight.file_path}{insight.line_number ? `:${insight.line_number}` : ""}</p>
                      <blockquote className="mt-1 border-l-2 border-[#8B5CF6]/50 pl-2 text-[10.5px] text-[#94A3B8]">{insight.evidence}</blockquote>
                      <p className="mt-2 text-[11px] text-[#C4B5FD]">Suggestion: {insight.suggested_improvement}</p>
                    </article>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="F · Dependency Analysis" icon={ArrowDownToLine}>
              {report.report.dependencies.length === 0 ? <NoEvidence text="No supported dependency manifests were found in the files inspected." /> : (
                <div className="max-h-[390px] overflow-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="sticky top-0 bg-[#10182A] text-[#64748B]">
                      <tr><th className="px-2 py-2">Package</th><th className="px-2 py-2">Constraint</th><th className="px-2 py-2">Ecosystem</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[#252D43]">
                      {report.report.dependencies.map((dependency, index) => (
                        <tr key={`${dependency.ecosystem}-${dependency.package_name}-${index}`} className="text-[#CBD5E1]">
                          <td className="px-2 py-2">
                            <span className="font-semibold text-white">{dependency.package_name}</span>
                            <span className="block text-[9.5px] text-[#64748B]">{dependency.source_file}</span>
                          </td>
                          <td className="px-2 py-2 font-mono">{dependency.version_constraint ?? "Not specified"}</td>
                          <td className="px-2 py-2">{dependency.ecosystem}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-[10.5px] text-[#64748B]">Versions are shown as declared in manifests. No vulnerability/advisory data was queried.</p>
                </div>
              )}
            </Panel>

            <Panel title="G · Improvement Suggestions" icon={Lightbulb}>
              {report.report.improvement_suggestions.length === 0 ? <NoEvidence /> : (
                <div className="space-y-3">
                  {report.report.improvement_suggestions.map((suggestion, index) => (
                    <article key={`${suggestion.area}-${index}`} className="rounded-xl border border-[#252D43] p-3">
                      <p className="text-[10px] font-bold tracking-wide text-[#A78BFA] uppercase">{suggestion.area}</p>
                      <p className="mt-1 text-[12px] font-semibold text-white">{suggestion.suggestion}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#94A3B8]">{suggestion.reason}</p>
                      <EvidenceList items={suggestion.evidence} compact />
                    </article>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="H · Recommended Next Steps" icon={CheckCircle2}>
              {report.report.next_steps.length === 0 ? <NoEvidence /> : (
                <div className="space-y-3">
                  {report.report.next_steps.map((step, index) => (
                    <article key={`${step.title}-${index}`} className="rounded-xl border border-[#252D43] p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h4 className="text-[12.5px] font-bold text-white">{step.title}</h4>
                          <p className="mt-1 text-[11.5px] leading-relaxed text-[#CBD5E1]">{step.description}</p>
                        </div>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${priorityStyle(step.priority)}`}>{step.priority}</span>
                      </div>
                      <p className="mt-2 text-[10.5px] text-[#94A3B8]">{step.reason}</p>
                      {step.related_files.length > 0 && <p className="mt-1 font-mono text-[9.5px] text-[#67E8F9]">{step.related_files.join(", ")}</p>}
                      <button type="button" onClick={() => addRecommendedTask(step)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#8B5CF6]/30 px-2.5 py-1.5 text-[10.5px] font-semibold text-[#C4B5FD] hover:bg-[#8B5CF6]/10">
                        <CheckCircle2 className="h-3 w-3" /> Add to Task Manager
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function EvidenceList({ items, compact = false }: { items: string[]; compact?: boolean }) {
  if (items.length === 0) return null;
  return (
    <ul className={`space-y-1 ${compact ? "mt-2" : "mt-3"}`}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2 text-[11px] leading-relaxed text-[#94A3B8]">
          <span className="text-[#22D3EE]">•</span><span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NoEvidence({ text = "No evidence was available for this section." }: { text?: string }) {
  return <p className="text-[12px] text-[#64748B]">{text}</p>;
}
