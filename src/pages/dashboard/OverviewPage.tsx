import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderGit2, Activity, ListChecks, CheckCircle2, Sparkles, Bot, Send, ChevronDown,
  Lightbulb, Plus, ArrowRight, GitCommitHorizontal, RefreshCw, Lock, Globe, Clock3,
  Search, Filter, CalendarClock, ShieldCheck, Zap, MessageSquare,
} from "lucide-react";
import GithubIcon from "../../components/GithubIcon";
import { SectionCard, StatCard, EmptyState, LoadingBlock, ProgressBar, PriorityBadge, StatusBadge, timeAgo } from "../../components/dashboard/widgets";
import { useAuth } from "../../context/AuthContext";
import { DashboardAPI, langColor, type Overview, type ProjectProgress, type Recommendation, type Task, type Activity as ActivityItem, type TechStat, type Conversation } from "../../lib/dashboard";
import type { Repository } from "../../lib/auth";

const SUGGESTED = [
  "Explain my project architecture.",
  "What does this repository do?",
  "What should I work on next?",
  "Find unfinished tasks in this project.",
  "Explain the main dependencies.",
  "Summarize my recent development activity.",
];

const ACTIVITY_ICONS: Record<string, typeof GitCommitHorizontal> = {
  "repo-updated": GitCommitHorizontal,
  "task-created": Plus,
  "task-completed": CheckCircle2,
  "task-updated": ListChecks,
  "repo-analyzed": Sparkles,
  recommendation: Lightbulb,
  sync: RefreshCw,
  chat: MessageSquare,
  "project-updated": Activity,
};

export default function OverviewPage() {
  const { user, githubUsername } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [progress, setProgress] = useState<ProjectProgress[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [tech, setTech] = useState<TechStat[]>([]);
  const [conn, setConn] = useState<{ connected: boolean; username: string | null; lastSyncedAt: string | null; selectedCount: number } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Quick chat
  const [chatRepoId, setChatRepoId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatPreview, setChatPreview] = useState<{ q: string; a: string } | null>(null);

  // Repo filters
  const [repoQuery, setRepoQuery] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [visFilter, setVisFilter] = useState("all");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [ov, rs, pr, tk, rc, ac, tc, cn] = await Promise.all([
        DashboardAPI.overview(user.id),
        DashboardAPI.repositories(user.id),
        DashboardAPI.projectProgress(user.id),
        DashboardAPI.tasks(user.id),
        DashboardAPI.recommendations(user.id),
        DashboardAPI.recentActivity(user.id, 8),
        DashboardAPI.technologyStack(user.id),
        (async () => {
          const { AuthAPI } = await import("../../lib/auth");
          return AuthAPI.connectionDetail(user.id);
        })(),
      ]);
      setOverview(ov);
      setRepos(rs);
      setProgress(pr);
      setTasks(tk);
      setRecs(rc);
      setActivities(ac);
      setTech(tc);
      setConn(cn);
      if (rs.length > 0 && !chatRepoId) setChatRepoId(rs[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const languages = useMemo(() => Array.from(new Set(repos.map((r) => r.language).filter(Boolean) as string[])), [repos]);

  const filteredRepos = useMemo(() => {
    return repos
      .filter((r) => (langFilter === "all" ? true : r.language === langFilter))
      .filter((r) => (visFilter === "all" ? true : r.visibility === visFilter))
      .filter((r) => {
        const q = repoQuery.trim().toLowerCase();
        if (!q) return true;
        return r.name.toLowerCase().includes(q) || r.fullName.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q);
      })
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
  }, [repos, repoQuery, langFilter, visFilter]);

  const pendingTasks = tasks.filter((t) => t.status !== "completed").slice(0, 5);
  const firstName = user?.fullName?.split(" ")[0] ?? "Developer";
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await DashboardAPI.sync(user.id);
      setSyncMsg(`Synchronized ${res.updated} repositories · ${new Date(res.syncedAt).toLocaleTimeString()}`);
      await load();
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : "Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const sendQuickChat = async (question: string) => {
    if (!user || !question.trim() || chatBusy) return;
    setChatBusy(true);
    setChatPreview({ q: question, a: "" });
    try {
      let conv: Conversation = (await DashboardAPI.conversations(user.id))[0] ?? (await DashboardAPI.createConversation(user.id, chatRepoId, "New conversation"));
      if (conv.repositoryId !== chatRepoId) {
        conv = await DashboardAPI.createConversation(user.id, chatRepoId, "New conversation");
      }
      const msg = await DashboardAPI.chat(user.id, { conversationId: conv.id, repositoryId: chatRepoId, question });
      setChatPreview({ q: question, a: msg.content });
      setChatInput("");
    } catch (e) {
      setChatPreview({ q: question, a: e instanceof Error ? e.message : "Something went wrong. Please try again." });
    } finally {
      setChatBusy(false);
    }
  };

  const addRecAsTask = async (rec: Recommendation) => {
    if (!user) return;
    await DashboardAPI.createTask(user.id, {
      title: rec.title,
      repositoryId: rec.repositoryId,
      priority: rec.priority,
      dueDate: null,
      description: rec.explanation,
    });
    await DashboardAPI.dismissRecommendation(user.id, rec.id);
    await load();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />)}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
        <LoadingBlock label="Loading your workspace…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1 — Welcome */}
      <section className="relative overflow-hidden rounded-[22px] border border-[#8B5CF6]/25 bg-gradient-to-br from-[#151D32] via-[#10182A] to-[#0B1020] p-6 sm:p-7">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#8B5CF6]/15 blur-[70px]" />
          <div className="absolute -bottom-20 left-1/3 h-48 w-72 rounded-full bg-[#22D3EE]/8 blur-[70px]" />
        </div>
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-[24px] font-extrabold text-white shadow-[0_0_36px_rgba(139,92,246,0.4)]">
            {user?.fullName?.[0]?.toUpperCase() ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-[#94A3B8]">{today}</p>
            <h2 className="mt-1 text-[24px] font-extrabold tracking-tight sm:text-[28px]">
              Welcome back, <span className="text-gradient">{firstName}!</span>
            </h2>
            <p className="mt-1 text-[13.5px] text-[#94A3B8]">Here&apos;s what&apos;s happening across your projects today.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#252D43] bg-white/[0.03] px-3 py-1 text-[11.5px] text-[#CBD5E1]">
                <GithubIcon className="h-3.5 w-3.5" /> @{githubUsername ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11.5px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" /> GitHub connected
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-[11.5px] font-semibold text-[#C4B5FD]">
                <Zap className="h-3.5 w-3.5" /> Keep building — every commit counts.
              </span>
            </div>
          </div>
          <Link to="/dashboard/assistant" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-3 text-[13.5px] font-semibold text-white glow-btn transition-all hover:brightness-110">
            <Bot className="h-4.5 w-4.5" /> Ask AI
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* 2 — Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FolderGit2} label="Total Repositories" value={String(overview?.totalRepositories ?? 0)} sub="Selected by you" grad="from-[#8B5CF6] to-[#3B82F6]" glow="hover:shadow-[0_0_32px_rgba(139,92,246,0.15)]" />
        <StatCard icon={Activity} label="Active Projects" value={String(overview?.activeProjects ?? 0)} sub="With tracked work" grad="from-[#3B82F6] to-[#22D3EE]" glow="hover:shadow-[0_0_32px_rgba(59,130,246,0.15)]" />
        <StatCard icon={ListChecks} label="Pending Tasks" value={String(overview?.pendingTasks ?? 0)} sub="Incomplete tasks" grad="from-[#22D3EE] to-[#8B5CF6]" glow="hover:shadow-[0_0_32px_rgba(34,211,238,0.15)]" />
        <StatCard icon={CheckCircle2} label="Completed Tasks" value={String(overview?.completedTasks ?? 0)} sub="Finished tasks" grad="from-emerald-400 to-[#22D3EE]" glow="hover:shadow-[0_0_32px_rgba(52,211,153,0.15)]" />
      </div>

      {/* 3 — Repositories */}
      <SectionCard
        title="My Repositories"
        subtitle="Your connected GitHub projects, all in one place."
        action={<Link to="/dashboard/repositories" className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#A855F7] hover:text-white">View All Repositories <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>}
      >
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
                  value={repoQuery}
                  onChange={(e) => setRepoQuery(e.target.value)}
                  placeholder="Search repositories…"
                  className="w-full rounded-xl border border-[#252D43] bg-[#090D18]/80 py-2.5 pl-10 pr-4 text-[13px] text-white placeholder:text-[#64748B] outline-none transition-all focus:border-[#8B5CF6]/55"
                  aria-label="Search repositories"
                />
              </div>
              <div className="flex gap-2">
                <label className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
                  <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)} className="appearance-none rounded-xl border border-[#252D43] bg-[#090D18] py-2.5 pl-9 pr-8 text-[12.5px] text-[#CBD5E1] outline-none focus:border-[#8B5CF6]/55" aria-label="Filter by language">
                    <option value="all">All languages</option>
                    {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
                </label>
                <label className="relative">
                  <select value={visFilter} onChange={(e) => setVisFilter(e.target.value)} className="appearance-none rounded-xl border border-[#252D43] bg-[#090D18] py-2.5 pl-3.5 pr-8 text-[12.5px] text-[#CBD5E1] outline-none focus:border-[#8B5CF6]/55" aria-label="Filter by visibility">
                    <option value="all">All visibility</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
                </label>
              </div>
            </div>

            {filteredRepos.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-[#252D43] px-4 py-8 text-center text-[13px] text-[#64748B]">No repositories match your filters.</p>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {filteredRepos.slice(0, 4).map((r) => (
                  <article key={r.id} className="card-hover group rounded-2xl border border-[#252D43] bg-[#151D32]/60 p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#252D43] bg-[#0B1020] text-[#94A3B8]">
                        <FolderGit2 className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-bold text-white">{r.fullName}</p>
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
                      <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" /> Active</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link to={`/dashboard/repositories?repo=${r.id}`} className="flex-1 rounded-lg border border-[#252D43] bg-white/[0.03] px-3 py-2 text-center text-[12.5px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#8B5CF6]/45 hover:text-white">
                        View Repository
                      </Link>
                      <Link to={`/dashboard/assistant?repo=${r.id}`} className="flex-1 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-3 py-2 text-center text-[12.5px] font-semibold text-white transition-all hover:brightness-110">
                        Ask AI
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* 4 — Project Progress */}
      <SectionCard title="Project Progress" subtitle="Progress is calculated from your tracked tasks — never guessed.">
        {progress.length === 0 ? (
          <EmptyState icon={Activity} title="No project data yet" message="Select repositories to start tracking project progress." />
        ) : (
          <ul className="space-y-3">
            {progress.map((p) => (
              <li key={p.repository.id} className="flex flex-col gap-3 rounded-2xl border border-[#252D43] bg-[#151D32]/50 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[14px] font-bold text-white">{p.repository.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-[#64748B]">{p.repository.fullName} · {p.completedTasks} done · {p.pendingTasks} pending · Last activity {p.lastActivity ? timeAgo(p.lastActivity) : "—"}</p>
                </div>
                <div className="flex items-center gap-4 sm:w-[240px]">
                  {p.progress === null ? (
                    <p className="text-[12px] italic text-[#64748B]">Not enough data yet</p>
                  ) : (
                    <>
                      <ProgressBar value={p.progress} className="flex-1" />
                      <span className="w-10 text-right font-mono text-[13px] font-bold text-[#67E8F9]">{p.progress}%</span>
                    </>
                  )}
                  <Link to={`/dashboard/repositories?repo=${p.repository.id}`} className="shrink-0 rounded-lg border border-[#252D43] px-3 py-1.5 text-[12px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#8B5CF6]/45 hover:text-white">
                    View Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* 5 — AI Quick Chat */}
      <SectionCard
        title="Ask Your AI Developer Companion"
        subtitle="Your AI understands your projects. Ask questions, explore your code, and find your next step."
        action={<Link to="/dashboard/assistant" className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#A855F7] hover:text-white">Open AI Assistant <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>}
      >
        <div className="relative overflow-hidden rounded-2xl border border-[#8B5CF6]/25 bg-[#0B1020]/80">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#8B5CF6]/12 blur-[60px]" aria-hidden />
          <div className="relative p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_20px_rgba(139,92,246,0.45)]">
                <Bot className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-[13.5px] font-bold text-white">GitLoop AI</p>
                <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Repository-aware · Grounded in your data
                </p>
              </div>
              <label className="relative ml-auto">
                <span className="sr-only">Select repository context</span>
                <select
                  value={chatRepoId ?? ""}
                  onChange={(e) => setChatRepoId(e.target.value || null)}
                  className="max-w-[200px] appearance-none truncate rounded-full border border-[#252D43] bg-white/[0.03] py-2 pl-3.5 pr-9 text-[12px] font-semibold text-white outline-none focus:border-[#8B5CF6]/55"
                >
                  <option value="">All repositories</option>
                  {repos.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
              </label>
            </div>

            {chatPreview && (
              <div className="mt-4 space-y-3">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-4 py-2.5 text-[13px] text-white">
                  {chatPreview.q}
                </div>
                <div className="max-w-[92%] whitespace-pre-line rounded-2xl rounded-bl-md border border-[#252D43] bg-white/[0.04] px-4 py-3 text-[13px] leading-relaxed text-[#E2E8F0]">
                  {chatBusy && !chatPreview.a ? (
                    <span className="flex items-center gap-1.5">
                      <span className="typing-dot h-2 w-2 rounded-full bg-[#A855F7]" />
                      <span className="typing-dot h-2 w-2 rounded-full bg-[#3B82F6]" />
                      <span className="typing-dot h-2 w-2 rounded-full bg-[#22D3EE]" />
                    </span>
                  ) : (
                    chatPreview.a
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => sendQuickChat(s)}
                  disabled={chatBusy}
                  className="rounded-full border border-[#252D43] bg-white/[0.03] px-3.5 py-1.5 text-[12px] text-[#CBD5E1] transition-all hover:border-[#8B5CF6]/50 hover:text-white disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); sendQuickChat(chatInput); }}
              className="mt-4 flex items-center gap-2 rounded-full border border-[#252D43] bg-[#090D18]/80 py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-[#8B5CF6]/55"
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about your codebase…"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-white placeholder:text-[#64748B] outline-none"
                aria-label="Ask your AI companion"
              />
              <button type="submit" disabled={chatBusy || !chatInput.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-transform hover:scale-105 disabled:opacity-50" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2.5 text-[11px] text-[#475569]">Answers are grounded in repository metadata and your tracked tasks — never invented file analysis.</p>
          </div>
        </div>
      </SectionCard>

      {/* 6 — Recommendations */}
      <SectionCard
        title="Recommended Next Steps"
        subtitle="Let GitLoop help you decide what to work on next."
        action={<Link to="/dashboard/tasks" className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#A855F7] hover:text-white">View All Recommendations <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>}
      >
        {recs.length === 0 ? (
          <EmptyState icon={Lightbulb} title="No recommendations right now" message="GitLoop generates recommendations from your repositories and tracked tasks. Add tasks or select more repositories to get suggestions." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recs.slice(0, 4).map((rec) => {
              const repo = rec.repositoryId ? repos.find((r) => r.id === rec.repositoryId) : null;
              return (
                <article key={rec.id} className="card-hover rounded-2xl border border-[#252D43] bg-[#151D32]/60 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#8B5CF6] text-white">
                      <Lightbulb className="h-5 w-5" />
                    </span>
                    <PriorityBadge priority={rec.priority} />
                  </div>
                  <h3 className="mt-3.5 text-[14.5px] font-bold leading-snug text-white">{rec.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#94A3B8]">{rec.explanation}</p>
                  <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <ShieldCheck className="h-3 w-3 text-[#22D3EE]" /> {rec.evidence}
                    {repo && <span className="ml-auto font-mono text-[#67E8F9]">{repo.name}</span>}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => addRecAsTask(rec)} className="flex-1 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-3 py-2 text-[12.5px] font-semibold text-white transition-all hover:brightness-110">
                      {rec.actionLabel} — Add as task
                    </button>
                    <button onClick={async () => { if (user) { await DashboardAPI.dismissRecommendation(user.id, rec.id); await load(); } }} className="rounded-lg border border-[#252D43] px-3 py-2 text-[12.5px] text-[#94A3B8] transition-colors hover:text-white">
                      Dismiss
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* 7 — Tasks */}
      <SectionCard
        title="Your Development Tasks"
        subtitle="Your most relevant pending work."
        action={<Link to="/dashboard/tasks" className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#A855F7] hover:text-white">View All Tasks <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></Link>}
      >
        {pendingTasks.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No pending tasks"
            message={tasks.length === 0 ? "You haven't created any tasks yet. Add your first task to start tracking progress." : "All tasks are completed. Great work — add a new task when you're ready."}
            action={<Link to="/dashboard/tasks" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-2.5 text-[13px] font-semibold text-white glow-btn"><Plus className="h-4 w-4" /> Add a task</Link>}
          />
        ) : (
          <ul className="space-y-2.5">
            {pendingTasks.map((t) => {
              const repo = t.repositoryId ? repos.find((r) => r.id === t.repositoryId) : null;
              return (
                <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#252D43] bg-[#151D32]/50 px-4 py-3">
                  <button
                    onClick={async () => { if (user) { await DashboardAPI.updateTask(user.id, t.id, { status: "completed" }); await load(); } }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#252D43] text-transparent transition-all hover:border-emerald-400/60 hover:text-emerald-400"
                    aria-label={`Complete ${t.title}`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-white">{t.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[11.5px] text-[#64748B]">
                      {repo && <span className="font-mono text-[#67E8F9]">{repo.name}</span>}
                      <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" /> {t.status === "todo" ? "To Do" : "In Progress"}</span>
                      {t.dueDate && <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                    </p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* 8 — Activity + 9 — Tech stack */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Recent Activity" subtitle="GitHub updates and GitLoop actions, clearly separated.">
          {activities.length === 0 ? (
            <EmptyState icon={GitCommitHorizontal} title="No recent activity" message="Activity will appear here as you work — commits from GitHub and actions inside GitLoop." />
          ) : (
            <ul className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-[#252D43]">
              {activities.slice(0, 6).map((a) => {
                const Icon = ACTIVITY_ICONS[a.type] ?? Activity;
                return (
                  <li key={a.id} className="relative flex gap-3.5 pl-0">
                    <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${a.source === "github" ? "border-[#3B82F6]/40 bg-[#3B82F6]/12 text-[#93C5FD]" : "border-[#8B5CF6]/40 bg-[#8B5CF6]/12 text-[#C4B5FD]"}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-[#E2E8F0]">{a.description}</p>
                      <p className="mt-1 flex items-center gap-2 text-[11px] text-[#64748B]">
                        <span className={`rounded-full border px-2 py-0.5 text-[9.5px] font-bold tracking-wide ${a.source === "github" ? "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#93C5FD]" : "border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD]"}`}>
                          {a.source === "github" ? "GITHUB" : "GITLOOP"}
                        </span>
                        {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Your Tech Stack" subtitle="Detected from your selected repositories.">
          {tech.length === 0 ? (
            <EmptyState icon={Zap} title="No stack detected yet" message="Select repositories with language metadata to see your technology distribution." />
          ) : (
            <ul className="space-y-3.5">
              {tech.slice(0, 6).map((t) => (
                <li key={t.name}>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} /> {t.name}
                    </span>
                    <span className="text-[#94A3B8]">{t.repoCount} repo{t.repoCount > 1 ? "s" : ""} · <span className="font-mono font-bold text-[#67E8F9]">{t.percentage}%</span></span>
                  </div>
                  <ProgressBar value={t.percentage} className="mt-1.5" />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* 10 — GitHub Integration */}
      <SectionCard title="GitHub Integration" subtitle="Your connection and synchronization status.">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#252D43] bg-[#151D32]">
              <GithubIcon className="h-7 w-7 text-white" />
            </span>
            <div>
              <p className="flex items-center gap-2 text-[15px] font-bold text-white">
                @{conn?.username ?? githubUsername ?? "—"}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> CONNECTED
                </span>
              </p>
              <p className="mt-1 text-[12.5px] text-[#94A3B8]">
                {conn?.selectedCount ?? repos.length} selected repositories · Last synced {conn?.lastSyncedAt ? timeAgo(conn.lastSyncedAt) : "—"}
              </p>
              <p className="mt-0.5 text-[11.5px] text-[#64748B]">Sync status: {syncing ? "Syncing…" : "Up to date"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            <Link to="/connect-github" className="rounded-xl border border-[#252D43] bg-white/[0.03] px-4 py-2.5 text-[13px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#8B5CF6]/45 hover:text-white">
              View GitHub Connection
            </Link>
            <button onClick={handleSync} disabled={syncing} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-4 py-2.5 text-[13px] font-semibold text-white glow-btn transition-all hover:brightness-110 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Sync Repositories"}
            </button>
          </div>
        </div>
        {syncMsg && (
          <p className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-[12.5px] ${syncMsg.includes("Synchronized") ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-[#F87171]/35 bg-[#F87171]/10 text-[#FCA5A5]"}`}>
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {syncMsg}
          </p>
        )}
        <p className="mt-4 flex items-start gap-2 text-[11.5px] text-[#64748B]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22D3EE]" />
          Access tokens are stored encrypted on the server and never exposed in the frontend.
        </p>
      </SectionCard>

      {/* Footer nav hint */}
      <div className="flex flex-wrap items-center justify-center gap-3 pb-4">
        <Link to="/dashboard/tasks" className="inline-flex items-center gap-2 rounded-full border border-[#252D43] bg-white/[0.03] px-5 py-2.5 text-[13px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#8B5CF6]/45 hover:text-white">
          <ListChecks className="h-4 w-4 text-[#A855F7]" /> Open Task Manager
        </Link>
        <Link to="/dashboard/analytics" className="inline-flex items-center gap-2 rounded-full border border-[#252D43] bg-white/[0.03] px-5 py-2.5 text-[13px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#8B5CF6]/45 hover:text-white">
          <Activity className="h-4 w-4 text-[#22D3EE]" /> View Analytics
        </Link>
        <Link to="/dashboard/voice" className="inline-flex items-center gap-2 rounded-full border border-[#252D43] bg-white/[0.03] px-5 py-2.5 text-[13px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#8B5CF6]/45 hover:text-white">
          <Sparkles className="h-4 w-4 text-[#3B82F6]" /> Try Voice Assistant
        </Link>
      </div>
    </div>
  );
}
