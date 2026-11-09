import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FolderGit2, Search, ChevronDown, Lock, Globe, Clock3, X, Bot, ArrowRight, ExternalLink, GitBranch, ListChecks, CheckCircle2, Plus } from "lucide-react";
import { EmptyState, LoadingBlock, ProgressBar, StatusBadge, timeAgo } from "../../components/dashboard/widgets";
import { useAuth } from "../../context/AuthContext";
import { DashboardAPI, langColor, type ProjectProgress, type Task } from "../../lib/dashboard";
import type { Repository } from "../../lib/auth";

export default function RepositoriesPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [progress, setProgress] = useState<ProjectProgress[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [lang, setLang] = useState("all");
  const [vis, setVis] = useState("all");
  const [detailId, setDetailId] = useState<string | null>(params.get("repo"));

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [rs, pr, tk] = await Promise.all([
        DashboardAPI.repositories(user.id),
        DashboardAPI.projectProgress(user.id),
        DashboardAPI.tasks(user.id),
      ]);
      setRepos(rs);
      setProgress(pr);
      setTasks(tk);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    setDetailId(params.get("repo"));
    const q = params.get("q");
    if (q !== null) setQuery(q);
  }, [params]);

  const languages = useMemo(() => Array.from(new Set(repos.map((r) => r.language).filter(Boolean) as string[])), [repos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repos
      .filter((r) => (lang === "all" ? true : r.language === lang))
      .filter((r) => (vis === "all" ? true : r.visibility === vis))
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.fullName.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q))
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
  }, [repos, query, lang, vis]);

  const detail = detailId ? repos.find((r) => r.id === detailId) ?? null : null;
  const detailProgress = detail ? progress.find((p) => p.repository.id === detail.id) ?? null : null;
  const detailTasks = detail ? tasks.filter((t) => t.repositoryId === detail.id) : [];

  const closeDetail = () => {
    const next = new URLSearchParams(params);
    next.delete("repo");
    setParams(next, { replace: true });
    setDetailId(null);
  };

  if (loading) return <LoadingBlock label="Loading repositories…" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-extrabold tracking-tight">My <span className="text-gradient">Repositories</span></h2>
        <p className="mt-1 text-[13.5px] text-[#94A3B8]">Your connected GitHub projects, all in one place. Only repositories you authorized and selected are shown.</p>
      </div>

      {repos.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No repositories yet"
          message="Connect your GitHub account and select repositories to bring your projects into GitLoop."
          action={<Link to="/select-repositories" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-2.5 text-[13px] font-semibold text-white glow-btn">Select repositories</Link>}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search repositories…"
                className="w-full rounded-xl border border-[#252D43] bg-[#090D18]/80 py-3 pl-11 pr-4 text-[13.5px] text-white placeholder:text-[#64748B] outline-none transition-all focus:border-[#8B5CF6]/55"
                aria-label="Search repositories"
              />
            </div>
            <label className="relative">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full appearance-none rounded-xl border border-[#252D43] bg-[#090D18] py-3 pl-4 pr-9 text-[13px] text-[#CBD5E1] outline-none focus:border-[#8B5CF6]/55 sm:w-auto" aria-label="Filter by language">
                <option value="all">All languages</option>
                {languages.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            </label>
            <label className="relative">
              <select value={vis} onChange={(e) => setVis(e.target.value)} className="w-full appearance-none rounded-xl border border-[#252D43] bg-[#090D18] py-3 pl-4 pr-9 text-[13px] text-[#CBD5E1] outline-none focus:border-[#8B5CF6]/55 sm:w-auto" aria-label="Filter by visibility">
                <option value="all">All visibility</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            </label>
            <span className="text-[12.5px] text-[#64748B]">{filtered.length} of {repos.length} shown · sorted by recently updated</span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No matches" message="Try a different search or clear your filters." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((r) => {
                const p = progress.find((x) => x.repository.id === r.id);
                return (
                  <article key={r.id} className="card-hover flex flex-col rounded-2xl border border-[#252D43] bg-[#10182A]/80 p-5 backdrop-blur">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#252D43] bg-[#151D32] text-[#94A3B8]">
                        <FolderGit2 className="h-5.5 w-5.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold text-white">{r.fullName}</p>
                        <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-[#94A3B8]">{r.description ?? "No description provided."}</p>
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${r.visibility === "private" ? "border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FCD34D]" : "border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#67E8F9]"}`}>
                        {r.visibility === "private" ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                        {r.visibility.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-[#64748B]">
                      {r.language && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: langColor(r.language) }} /> {r.language}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3 w-3" /> Updated {timeAgo(r.lastUpdated)}</span>
                      {p && <StatusBadge status={p.status} />}
                    </div>

                    {p && (
                      <div className="mt-3.5">
                        {p.progress === null ? (
                          <p className="text-[11.5px] italic text-[#64748B]">Progress: not enough data yet — add tasks to track it.</p>
                        ) : (
                          <div className="flex items-center gap-3">
                            <ProgressBar value={p.progress} className="flex-1" />
                            <span className="font-mono text-[12px] font-bold text-[#67E8F9]">{p.progress}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2 pt-1">
                      <button
                        onClick={() => setParams((prev) => { const n = new URLSearchParams(prev); n.set("repo", r.id); return n; })}
                        className="flex-1 rounded-lg border border-[#252D43] bg-white/[0.03] px-3 py-2.5 text-[12.5px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#8B5CF6]/45 hover:text-white"
                      >
                        View Repository
                      </button>
                      <Link to={`/dashboard/assistant?repo=${r.id}`} className="flex-1 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-3 py-2.5 text-center text-[12.5px] font-semibold text-white transition-all hover:brightness-110">
                        Ask AI
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Repository details modal */}
      {detail && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Repository details for ${detail.fullName}`}>
          <div className="absolute inset-0 bg-[#05060A]/85 backdrop-blur-sm" onClick={closeDetail} />
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[24px] border border-[#252D43] bg-[#0B1020] shadow-[0_40px_100px_rgba(0,0,0,0.7)] sm:rounded-[24px]">
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-[#252D43]/70 bg-[#0B1020]/95 px-6 py-5 backdrop-blur">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-[#64748B] uppercase">
                  <FolderGit2 className="h-3.5 w-3.5" /> Repository Details
                </p>
                <h3 className="mt-1.5 truncate text-[19px] font-extrabold text-white">{detail.fullName}</h3>
              </div>
              <button onClick={closeDetail} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#252D43] text-[#94A3B8] hover:text-white" aria-label="Close details">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <p className="text-[13.5px] leading-relaxed text-[#CBD5E1]">{detail.description ?? "No description provided on GitHub."}</p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Language", value: detail.language ?? "—" },
                  { label: "Visibility", value: detail.visibility },
                  { label: "Last updated", value: timeAgo(detail.lastUpdated) },
                  { label: "Status", value: detailProgress?.status ?? "—" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-[#252D43] bg-white/[0.02] px-3.5 py-3">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-[#64748B] uppercase">{s.label}</p>
                    <p className="mt-1 truncate text-[13px] font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[12px] font-bold tracking-[0.14em] text-[#64748B] uppercase">Project progress</p>
                {detailProgress && detailProgress.progress !== null ? (
                  <div className="mt-2.5 flex items-center gap-3">
                    <ProgressBar value={detailProgress.progress} className="flex-1" />
                    <span className="font-mono text-[13px] font-bold text-[#67E8F9]">{detailProgress.progress}%</span>
                    <span className="text-[12px] text-[#94A3B8]">{detailProgress.completedTasks}/{detailProgress.totalTasks} tasks</span>
                  </div>
                ) : (
                  <p className="mt-2.5 rounded-xl border border-dashed border-[#252D43] px-4 py-3 text-[12.5px] text-[#64748B]">
                    Not enough data yet — progress is calculated from tracked tasks. Add a task to start measuring.
                  </p>
                )}
              </div>

              <div>
                <p className="flex items-center justify-between text-[12px] font-bold tracking-[0.14em] text-[#64748B] uppercase">
                  Tracked tasks
                  <Link to="/dashboard/tasks" className="inline-flex items-center gap-1 text-[11px] font-semibold normal-case tracking-normal text-[#A855F7] hover:text-white">
                    <Plus className="h-3 w-3" /> Add task
                  </Link>
                </p>
                {detailTasks.length === 0 ? (
                  <p className="mt-2.5 text-[12.5px] text-[#64748B]">No tasks tracked for this repository yet.</p>
                ) : (
                  <ul className="mt-2.5 space-y-2">
                    {detailTasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 rounded-xl border border-[#252D43] bg-white/[0.02] px-4 py-2.5">
                        {t.status === "completed" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : <ListChecks className="h-4 w-4 shrink-0 text-[#64748B]" />}
                        <span className={`min-w-0 flex-1 truncate text-[13px] ${t.status === "completed" ? "text-[#64748B] line-through" : "text-white"}`}>{t.title}</span>
                        <span className="shrink-0 text-[11px] text-[#64748B]">{t.status === "todo" ? "To Do" : t.status === "in-progress" ? "In Progress" : "Done"}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link to={`/dashboard/assistant?repo=${detail.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-4 py-3 text-[13.5px] font-semibold text-white glow-btn transition-all hover:brightness-110">
                  <Bot className="h-4.5 w-4.5" /> Ask AI about this repo
                </Link>
                <span className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#252D43] px-4 py-3 text-[13px] text-[#64748B]" title="Opens the repository on GitHub">
                  <ExternalLink className="h-4 w-4" /> View on GitHub
                </span>
              </div>
              <p className="flex items-center gap-2 text-[11.5px] text-[#64748B]">
                <GitBranch className="h-3.5 w-3.5 text-[#22D3EE]" />
                Details are based on GitHub metadata and your tracked tasks — GitLoop never invents file-level analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Link to="/select-repositories" className="group inline-flex items-center gap-2 text-[13px] font-semibold text-[#A855F7] hover:text-white">
          Manage repository selection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
