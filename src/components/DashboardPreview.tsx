import {
  LayoutDashboard, FolderGit2, Bot, ListChecks, Settings, Search,
  Bell, Sparkles, GitBranch, CircleDot, FileCode2, TrendingUp,
  AlertTriangle, Lightbulb, Mic, Send, ChevronDown, Star, GitCommitHorizontal,
  CheckCircle2, Clock3, ShieldCheck, Zap
} from "lucide-react";
import Logo from "./Logo";

const repos = [
  { name: "TruthGuard AI", lang: "Python", color: "#22D3EE", active: true, stars: 24 },
  { name: "Lerni", lang: "React", color: "#8B5CF6", active: false, stars: 18 },
  { name: "Breast Cancer Prediction", lang: "Python", color: "#3B82F6", active: false, stars: 31 },
  { name: "Kisan Setu", lang: "Node.js", color: "#A855F7", active: false, stars: 12 },
];

const activities = [
  { icon: GitCommitHorizontal, text: "Committed fix: auth middleware", time: "2m", color: "#8B5CF6" },
  { icon: AlertTriangle, text: "3 TODOs detected in /api", time: "18m", color: "#F59E0B" },
  { icon: CheckCircle2, text: "README analysis completed", time: "1h", color: "#22D3EE" },
];

export default function DashboardPreview() {
  return (
    <div className="relative">
      {/* outer glow */}
      <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-[#8B5CF6]/25 via-[#3B82F6]/15 to-[#22D3EE]/10 blur-2xl" aria-hidden />
      <div className="absolute -inset-px rounded-[26px] bg-gradient-to-br from-[#8B5CF6]/50 via-[#252D43] to-[#22D3EE]/30" aria-hidden />

      <div className="relative overflow-hidden rounded-[25px] border border-[#252D43] bg-[#0B1020]/95 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        {/* top window bar */}
        <div className="flex items-center justify-between border-b border-[#252D43]/80 bg-[#090D18]/90 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]/80" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#252D43] bg-white/[0.03] px-3 py-1 text-[11px] text-[#94A3B8] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            app.gitloop.ai/dashboard
          </div>
          <div className="flex items-center gap-2 text-[#64748B]">
            <Bell className="h-3.5 w-3.5" />
            <span className="relative">
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]" />
              <span className="h-3.5 w-3.5 block" />
            </span>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden sm:flex w-[172px] shrink-0 flex-col border-r border-[#252D43]/80 bg-[#090D18]/80 p-3">
            <div className="flex items-center gap-2 px-1 pb-3">
              <Logo size={26} />
              <span className="text-[13px] font-bold text-white">GitLoop</span>
              <span className="ml-auto rounded-md bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#C4B5FD]">PRO</span>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[#252D43] bg-white/[0.03] px-2.5 py-2 text-[11px] text-[#64748B]">
              <Search className="h-3.5 w-3.5" />
              Search repos…
              <kbd className="ml-auto rounded border border-[#252D43] px-1 text-[9px]">⌘K</kbd>
            </div>

            <nav className="mt-3 space-y-0.5 text-[12px]">
              {[
                { icon: LayoutDashboard, label: "Overview", active: true },
                { icon: FolderGit2, label: "Repositories", badge: "4" },
                { icon: Bot, label: "AI Assistant" },
                { icon: ListChecks, label: "Tasks", badge: "7" },
                { icon: Settings, label: "Settings" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium ${
                    item.active
                      ? "bg-gradient-to-r from-[#8B5CF6]/20 to-[#3B82F6]/10 text-white border border-[#8B5CF6]/25"
                      : "text-[#94A3B8] hover:bg-white/[0.03]"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${item.active ? "text-[#A855F7]" : ""}`} />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-white/[0.06] border border-[#252D43] px-1.5 py-0.5 text-[10px] text-[#94A3B8]">{item.badge}</span>
                  )}
                </div>
              ))}
            </nav>

            <div className="mt-4">
              <p className="px-1 text-[10px] font-bold tracking-[0.14em] text-[#64748B] uppercase">Repositories</p>
              <div className="mt-2 space-y-1">
                {repos.map((r) => (
                  <div
                    key={r.name}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] ${
                      r.active ? "bg-white/[0.05] text-white border border-[#252D43]" : "text-[#94A3B8]"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
                    <span className="truncate font-medium">{r.name}</span>
                    <Star className="ml-auto h-3 w-3 shrink-0 text-[#64748B]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto rounded-xl border border-[#8B5CF6]/25 bg-gradient-to-br from-[#8B5CF6]/15 to-[#3B82F6]/10 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5 text-[#A855F7]" /> AI Memory
              </div>
              <p className="mt-1 text-[10.5px] leading-relaxed text-[#94A3B8]">128 summaries stored across 4 projects</p>
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" />
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            {/* header */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#64748B] uppercase">Project Overview</p>
                <h3 className="text-[17px] font-bold text-white leading-tight">TruthGuard AI</h3>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/10 px-2.5 py-1 text-[10.5px] font-semibold text-[#67E8F9]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] animate-pulse" /> Synced
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#252D43] bg-white/[0.03] px-2.5 py-1 text-[10.5px] text-[#94A3B8]">
                  <GitBranch className="h-3 w-3" /> main · 42 commits
                </span>
              </div>
            </div>

            {/* language badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                { l: "Node.js", c: "#A855F7" },
                { l: "Python", c: "#22D3EE" },
                { l: "React", c: "#3B82F6" },
                { l: "FastAPI", c: "#8B5CF6" },
                { l: "PostgreSQL", c: "#60A5FA" },
              ].map((b) => (
                <span key={b.l} className="inline-flex items-center gap-1.5 rounded-full border border-[#252D43] bg-white/[0.03] px-2.5 py-1 text-[10.5px] font-medium text-[#CBD5E1]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.c }} />
                  {b.l}
                </span>
              ))}
            </div>

            {/* stat cards */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                { label: "Health Score", value: "86%", sub: "▲ 4% this week", icon: TrendingUp, grad: "from-[#8B5CF6] to-[#3B82F6]" },
                { label: "Open Tasks", value: "7", sub: "3 high priority", icon: ListChecks, grad: "from-[#F59E0B] to-[#EF4444]" },
                { label: "Files Analyzed", value: "142", sub: "12k LOC scanned", icon: FileCode2, grad: "from-[#22D3EE] to-[#3B82F6]" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-[#252D43] bg-[#10182A]/80 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold tracking-wide text-[#64748B] uppercase">{s.label}</p>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${s.grad} text-white`}>
                      <s.icon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="mt-1.5 text-[20px] font-extrabold leading-none text-white">{s.value}</p>
                  <p className="mt-1 text-[10px] text-[#94A3B8]">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* progress + recommendation */}
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl border border-[#252D43] bg-[#10182A]/80 p-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-white">Project Progress</span>
                  <span className="font-mono text-[#22D3EE]">68%</span>
                </div>
                <div className="mt-2.5 space-y-2">
                  {[
                    { label: "Backend API", pct: 82, c: "from-[#8B5CF6] to-[#3B82F6]" },
                    { label: "ML Service", pct: 64, c: "from-[#3B82F6] to-[#22D3EE]" },
                    { label: "Frontend", pct: 51, c: "from-[#A855F7] to-[#22D3EE]" },
                  ].map((p) => (
                    <div key={p.label}>
                      <div className="flex justify-between text-[10px] text-[#94A3B8]">
                        <span>{p.label}</span><span>{p.pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${p.c}`} style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#8B5CF6]/25 bg-gradient-to-br from-[#8B5CF6]/12 to-[#3B82F6]/8 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
                  <Lightbulb className="h-3.5 w-3.5 text-[#FBBF24]" /> AI Recommendation
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#CBD5E1]">
                  Improve error handling in <span className="font-mono text-[#67E8F9]">/api/predict</span> and add API tests before next release.
                </p>
                <div className="mt-2 flex gap-1.5">
                  <span className="rounded-md bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 px-2 py-1 text-[10px] font-semibold text-[#DDD6FE]">View plan →</span>
                  <span className="rounded-md border border-[#252D43] px-2 py-1 text-[10px] text-[#94A3B8]">Dismiss</span>
                </div>
              </div>
            </div>

            {/* activity + chat */}
            <div className="mt-2.5 grid gap-2.5 lg:grid-cols-5">
              <div className="rounded-xl border border-[#252D43] bg-[#10182A]/80 p-3 lg:col-span-2">
                <p className="text-[11px] font-semibold text-white">Recent Activity</p>
                <div className="mt-2 space-y-2">
                  {activities.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#252D43] bg-white/[0.03]" style={{ color: a.color }}>
                        <a.icon className="h-3.5 w-3.5" />
                      </span>
                      <p className="min-w-0 flex-1 text-[11px] leading-snug text-[#CBD5E1] truncate">{a.text}</p>
                      <span className="text-[10px] text-[#64748B] shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-[#252D43] bg-white/[0.02] px-2.5 py-2">
                  <CircleDot className="h-3.5 w-3.5 text-[#22D3EE]" />
                  <span className="text-[10.5px] text-[#64748B] font-mono truncate">TODO: validate input schema</span>
                  <span className="ml-auto rounded bg-[#F59E0B]/15 border border-[#F59E0B]/25 px-1.5 py-0.5 text-[9px] font-bold text-[#FBBF24]">TODO</span>
                </div>
              </div>

              <div className="rounded-xl border border-[#252D43] bg-[#0B1020] p-3 lg:col-span-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_14px_rgba(139,92,246,0.45)]">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[11.5px] font-semibold text-white">GitLoop AI</p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-emerald-400" /> Context: TruthGuard AI</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2 py-0.5 text-[9.5px] font-bold tracking-wide text-[#C4B5FD]">
                    <ShieldCheck className="h-3 w-3" /> REPO-AWARE
                  </span>
                </div>
                <div className="mt-2.5 space-y-2">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-3 py-2 text-[11.5px] text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)]">
                    Explain how my backend works.
                  </div>
                  <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[#252D43] bg-white/[0.04] px-3 py-2 text-[11.5px] leading-relaxed text-[#E2E8F0]">
                    Your backend uses <span className="text-[#67E8F9] font-medium">Node.js + Express</span> for APIs and calls a Python ML service for classification.
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2 rounded-full border border-[#252D43] bg-white/[0.03] pl-3 pr-1.5 py-1.5">
                  <span className="text-[11px] text-[#64748B] truncate">Ask about your codebase…</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-[#94A3B8]" />
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white">
                      <Send className="h-3 w-3" />
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* footer strip */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[#252D43]/70 pt-3 text-[10.5px] text-[#64748B]">
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3 w-3 text-[#A855F7]" /> 142 files indexed</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3 w-3 text-[#22D3EE]" /> Last sync 2m ago</span>
              <span className="inline-flex items-center gap-1.5"><ChevronDown className="h-3 w-3" /> main branch</span>
              <span className="ml-auto font-mono text-[10px]">v2.4.1 · secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: AI Insight */}
      <div className="absolute -left-3 sm:-left-8 top-[18%] z-10 animate-floaty">
        <div className="glass-strong rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.55),0_0_28px_rgba(168,85,247,0.22)] max-w-[210px]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#A855F7] to-[#3B82F6] text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="text-[11px] font-bold tracking-wide text-white">AI INSIGHT</p>
            <span className="ml-auto h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_10px_#22D3EE] animate-pulse" />
          </div>
          <p className="mt-2 text-[12.5px] font-semibold leading-snug text-[#F8FAFC]">3 tasks need your attention.</p>
          <p className="mt-0.5 text-[11px] text-[#94A3B8]">2 TODOs · 1 open issue in TruthGuard AI</p>
          <div className="mt-2.5 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#A855F7] to-[#22D3EE]" />
          </div>
        </div>
      </div>

      {/* Floating: Repository */}
      <div className="absolute -right-2 sm:-right-6 bottom-[14%] z-10 animate-floaty-delayed">
        <div className="glass-strong rounded-2xl px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.55),0_0_28px_rgba(59,130,246,0.22)] max-w-[220px]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] text-white font-extrabold text-[13px] shadow-[0_0_16px_rgba(59,130,246,0.4)]">T</span>
            <div className="leading-tight">
              <p className="text-[13px] font-bold text-white">TruthGuard AI</p>
              <p className="text-[11px] text-[#94A3B8]">Node.js · Python · React</p>
            </div>
            <span className="ml-auto rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">● Live</span>
          </div>
          <div className="mt-2.5 flex items-center gap-3 text-[10.5px] text-[#94A3B8]">
            <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-[#FBBF24]" /> 24</span>
            <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3 text-[#A855F7]" /> 6 branches</span>
            <span className="ml-auto text-[#22D3EE] font-semibold">86% health</span>
          </div>
        </div>
      </div>
    </div>
  );
}
