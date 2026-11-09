import { useState } from "react";
import { X, ShieldCheck, Lock, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import GithubIcon from "../GithubIcon";
import Logo from "../Logo";
import { DEMO_GITHUB_IDENTITIES } from "../../lib/auth";

/**
 * Simulated GitHub OAuth consent screen.
 * In production the browser is redirected to github.com/login/oauth/authorize
 * and GitHub returns the user to /auth/github/callback with a code. This modal
 * reproduces that consent step so the full flow can be exercised end-to-end
 * without real OAuth credentials. Tokens are exchanged server-side only.
 */
export default function GithubAuthorizeModal({
  open,
  mode,
  onAuthorize,
  onCancel,
}: {
  open: boolean;
  mode: "login" | "signup" | "connect";
  onAuthorize: (identity: { githubUserId: string; username: string; avatarUrl: string | null; email: string | null }) => Promise<void>;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState(DEMO_GITHUB_IDENTITIES[0]);
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleAuthorize = async () => {
    setAuthorizing(true);
    setError(null);
    try {
      await onAuthorize(selected);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authorization failed. Please try again.");
      setAuthorizing(false);
    }
  };

  const title = mode === "connect" ? "Connect GitHub to GitLoop" : "Authorize GitLoop";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="GitHub authorization">
      <div className="absolute inset-0 bg-[#05060A]/85 backdrop-blur-sm" onClick={authorizing ? undefined : onCancel} />
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[24px] border border-[#252D43] bg-[#0B1020] shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
        {/* GitHub header */}
        <div className="flex items-center justify-between border-b border-[#252D43] bg-[#090D18] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <GithubIcon className="h-6 w-6 text-white" />
            <span className="text-[14px] font-bold text-white">GitHub</span>
            <span className="rounded-md border border-[#252D43] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-[#94A3B8]">OAuth</span>
          </div>
          <button
            onClick={onCancel}
            disabled={authorizing}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#252D43] text-[#94A3B8] transition-colors hover:text-white disabled:opacity-50"
            aria-label="Cancel authorization"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#252D43] bg-[#151D32]">
              <GithubIcon className="h-6 w-6 text-white" />
            </span>
            <span className="h-px w-8 bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" />
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#8B5CF6]/40 bg-[#0B1020] shadow-[0_0_20px_rgba(139,92,246,0.25)]">
              <Logo size={30} />
            </span>
          </div>

          <h3 className="mt-5 text-center text-[18px] font-bold text-white">{title}</h3>
          <p className="mt-1.5 text-center text-[13px] leading-relaxed text-[#94A3B8]">
            GitLoop wants to access your GitHub account to understand your repositories.
          </p>

          {/* Identity picker (demo) */}
          <p className="mt-5 text-[11px] font-bold tracking-[0.14em] text-[#64748B] uppercase">Sign in as (demo)</p>
          <div className="mt-2 space-y-2">
            {DEMO_GITHUB_IDENTITIES.map((id) => (
              <button
                key={id.githubUserId}
                type="button"
                disabled={authorizing}
                onClick={() => setSelected(id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                  selected.githubUserId === id.githubUserId
                    ? "border-[#8B5CF6]/55 bg-[#8B5CF6]/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                    : "border-[#252D43] bg-white/[0.02] hover:border-[#3B82F6]/40"
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] text-[13px] font-extrabold text-white">
                  {id.username[0].toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold text-white">@{id.username}</span>
                  <span className="block text-[11.5px] text-[#64748B]">{id.email}</span>
                </span>
                {selected.githubUserId === id.githubUserId && (
                  <CheckCircle2 className="ml-auto h-4.5 w-4.5 shrink-0 text-[#22D3EE]" />
                )}
              </button>
            ))}
          </div>

          {/* Permissions */}
          <div className="mt-5 rounded-xl border border-[#252D43] bg-white/[0.02] p-4">
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-[#94A3B8] uppercase">
              <Lock className="h-3.5 w-3.5 text-[#22D3EE]" /> Permissions requested
            </p>
            <ul className="mt-2.5 space-y-1.5 text-[12.5px] text-[#CBD5E1]">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Read public &amp; private repositories you select</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Read profile &amp; email for account linking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Read commit history &amp; README files</li>
            </ul>
            <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-[#64748B]">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A855F7]" />
              Minimum scopes only. Tokens are stored encrypted on the server — never in your browser.
            </p>
          </div>

          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#F87171]/35 bg-[#F87171]/10 px-4 py-3 text-[12.5px] leading-relaxed text-[#FCA5A5]" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              disabled={authorizing}
              className="flex-1 rounded-xl border border-[#252D43] px-5 py-3 text-[14px] font-semibold text-[#94A3B8] transition-colors hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAuthorize}
              disabled={authorizing}
              className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-3 text-[14px] font-semibold text-white glow-btn transition-all hover:brightness-110 disabled:opacity-70"
            >
              {authorizing ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <ShieldCheck className="h-4.5 w-4.5" />}
              {authorizing ? "Authorizing…" : "Authorize GitLoop"}
            </button>
          </div>
          <p className="mt-3 text-center text-[10.5px] text-[#475569]">
            Demo OAuth consent screen · In production this is github.com/login/oauth/authorize
          </p>
        </div>
      </div>
    </div>
  );
}
