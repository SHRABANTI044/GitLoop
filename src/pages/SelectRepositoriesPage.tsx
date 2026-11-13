import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, FolderGit2, Lock, Globe, Clock3, CheckCircle2, Loader2, LogOut, ArrowRight, Inbox } from "lucide-react";
import Logo from "../components/Logo";
import { AlertBanner } from "../components/auth/AuthFields";
import { useAuth } from "../context/AuthContext";
import { AuthAPI, type Repository } from "../lib/auth";

const LANG_COLORS: Record<string, string> = {
  Python: "#22D3EE",
  TypeScript: "#3B82F6",
  JavaScript: "#FBBF24",
  Go: "#34D399",
  Rust: "#F87171",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function SelectRepositoriesPage() {
  const navigate = useNavigate();
  const { user, githubUsername, logout } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [banner, setBanner] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const syncStarted = useRef(false);

  useEffect(() => {
    if (!user || syncStarted.current) return;
    syncStarted.current = true;
    (async () => {
      try {
        const result = await AuthAPI.syncRepositories(user.id);
        setRepos(result.repos);
        setSelected(new Set(result.repos.filter((r) => r.selected).map((r) => r.id)));
      } catch (err) {
        setBanner({ type: "error", message: err instanceof Error ? err.message : "Could not load repositories." });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q) || (r.language ?? "").toLowerCase().includes(q)
    );
  }, [repos, query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  const handleContinue = async () => {
    if (!user) return;
    if (selected.size === 0) {
      setBanner({ type: "error", message: "Select at least one repository to continue. GitLoop only analyzes repositories you authorize." });
      return;
    }
    setSaving(true);
    setBanner(null);
    try {
      await AuthAPI.selectRepositories(user.id, Array.from(selected));
      setBanner({ type: "success", message: `${selected.size} repositor${selected.size > 1 ? "ies" : "y"} selected. Saving your workspace…` });
      await new Promise((r) => setTimeout(r, 800));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setBanner({ type: "error", message: err instanceof Error ? err.message : "Could not save selection. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060A] text-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[#05060A]" />
        <div className="absolute inset-0 bg-grid animate-grid-drift opacity-45 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,black_30%,transparent_100%)]" />
        <div className="absolute -top-32 right-1/4 h-[400px] w-[400px] rounded-full bg-[#8B5CF6]/[0.12] blur-[110px]" />
        <div className="absolute bottom-[-120px] left-[8%] h-[340px] w-[440px] rounded-full bg-[#3B82F6]/[0.09] blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo size={36} />
            <span className="text-[18px] font-extrabold tracking-tight">
              Git<span className="text-gradient">Loop</span>
            </span>
          </Link>
          <button onClick={async () => { await logout(); navigate("/login"); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#252D43] px-3.5 py-1.5 text-[12px] font-semibold text-[#94A3B8] transition-colors hover:border-[#F87171]/40 hover:text-white">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        {/* Progress */}
        <div className="mt-10 flex items-center gap-2" aria-label="Onboarding progress">
          {["Account", "Connect GitHub", "Select Repositories", "Dashboard"].map((step, i) => (
            <div key={step} className="flex flex-1 items-center gap-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                i < 2 ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300" : i === 2 ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-white shadow-[0_0_14px_rgba(139,92,246,0.3)]" : "border-[#252D43] text-[#64748B]"
              }`}>
                {i < 2 ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-[11.5px] font-semibold sm:block ${i <= 2 ? "text-white" : "text-[#64748B]"}`}>{step}</span>
              {i < 3 && <span className={`mx-1 h-px flex-1 ${i < 2 ? "bg-emerald-400/40" : "bg-[#252D43]"}`} />}
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h1 className="text-[28px] font-extrabold tracking-tight sm:text-[34px]">
            Select Your <span className="text-gradient">Repositories</span>
          </h1>
          <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-[#94A3B8]">
            Choose the repositories GitLoop should understand. Only repositories you authorize and select will be analyzed — nothing else.
            {githubUsername && (
              <> Connected as <span className="font-semibold text-white">@{githubUsername}</span>.</>
            )}
          </p>
        </div>

        {banner && (
          <div className="mt-6">
            <AlertBanner type={banner.type} message={banner.message} />
          </div>
        )}

        {/* Toolbar */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#64748B]" />
            <input
              type="search"
              placeholder="Search repositories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-[#252D43] bg-[#090D18]/80 py-3 pl-11 pr-4 text-[14px] text-white placeholder:text-[#64748B] outline-none transition-all focus:border-[#8B5CF6]/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]"
              aria-label="Search repositories"
            />
          </div>
          <button
            onClick={toggleAll}
            disabled={loading || filtered.length === 0}
            className="rounded-xl border border-[#252D43] bg-white/[0.03] px-4 py-3 text-[13px] font-semibold text-[#CBD5E1] transition-all hover:border-[#8B5CF6]/45 hover:text-white disabled:opacity-50"
          >
            {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
          </button>
          <span className="text-[12.5px] text-[#64748B] sm:text-right">
            <span className="font-bold text-white">{selected.size}</span> selected
          </span>
        </div>

        {/* List */}
        <div className="mt-5 overflow-hidden rounded-[24px] border border-[#252D43] bg-[#0B1020]/90 backdrop-blur">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#A855F7]" />
              <p className="text-[14px] font-semibold text-white">Loading your repositories…</p>
              <p className="text-[12.5px] text-[#64748B]">Fetching from GitHub API for your connected account.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#252D43] bg-white/[0.03] text-[#64748B]">
                <Inbox className="h-6 w-6" />
              </span>
              <p className="text-[14px] font-semibold text-white">No repositories found</p>
              <p className="max-w-xs text-[12.5px] text-[#64748B]">
                {query ? `Nothing matches “${query}”. Try a different search.` : "No repositories are accessible on this GitHub account."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#252D43]/70">
              {filtered.map((r) => {
                const checked = selected.has(r.id);
                return (
                  <li key={r.id}>
                    <label className={`flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors duration-200 ${checked ? "bg-[#8B5CF6]/[0.07]" : "hover:bg-white/[0.02]"}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(r.id)}
                        className="mt-1 h-4.5 w-4.5 shrink-0 rounded border-[#252D43] bg-[#090D18] accent-[#8B5CF6]"
                        aria-label={`Select ${r.name}`}
                      />
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#252D43] bg-[#151D32] text-[#94A3B8]">
                        <FolderGit2 className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-[14.5px] font-bold text-white">{r.fullName}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                            r.visibility === "private"
                              ? "border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24]"
                              : "border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#67E8F9]"
                          }`}>
                            {r.visibility === "private" ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                            {r.visibility.toUpperCase()}
                          </span>
                        </span>
                        {r.description && <span className="mt-1 block truncate text-[12.5px] text-[#94A3B8]">{r.description}</span>}
                        <span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[#64748B]">
                          {r.language && (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full" style={{ background: LANG_COLORS[r.language] ?? "#8B5CF6" }} />
                              {r.language}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3 w-3" /> Updated {timeAgo(r.lastUpdated)}
                          </span>
                        </span>
                      </span>
                      {checked && <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#22D3EE]" />}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleContinue}
            disabled={saving || loading}
            className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#3B82F6] px-6 py-3.5 text-[14.5px] font-semibold text-white glow-btn transition-all duration-300 hover:brightness-110 disabled:opacity-70 sm:flex-none sm:px-8"
          >
            {saving ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : null}
            {saving ? "Saving workspace…" : "Continue to Dashboard"}
            {!saving && <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />}
          </button>
          <Link to="/connect-github" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#64748B] transition-colors hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GitHub connection
          </Link>
          <p className="text-[11.5px] text-[#475569] sm:ml-auto">
            Selection is saved against your GitLoop account only.
          </p>
        </div>
      </div>
    </div>
  );
}
