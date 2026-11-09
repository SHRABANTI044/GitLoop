import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { AuthAPI, AuthError, DEMO_GITHUB_IDENTITIES } from "../lib/auth";

/**
 * GET /api/auth/github/callback
 * In production GitHub redirects here with ?code=...&state=...
 * and the backend exchanges the code for a token server-side.
 * This page validates state, then completes the exchange via AuthAPI.
 */
export default function GithubCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshConnection } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Exchanging authorization code with GitHub…");

  useEffect(() => {
    (async () => {
      const code = params.get("code");
      const state = params.get("state");
      const expected = sessionStorage.getItem("gitloop_oauth_state");
      const mode = (sessionStorage.getItem("gitloop_oauth_mode") as "login" | "signup") ?? "login";

      if (!code || !state || (expected && state !== expected)) {
        setStatus("error");
        setMessage("Invalid or expired authorization state. Please try connecting GitHub again.");
        return;
      }

      try {
        // In production the backend verifies the code with GitHub and returns
        // the verified profile. Here we resolve the demo identity bound to the flow.
        const identity = DEMO_GITHUB_IDENTITIES[0];
        const me = await AuthAPI.me();
        const result = await AuthAPI.exchangeGithubCode({
          code,
          identity,
          mode,
          currentUserId: me?.id ?? null,
        });
        await refreshConnection();
        sessionStorage.removeItem("gitloop_oauth_state");
        sessionStorage.removeItem("gitloop_oauth_mode");

        if (result.isNew) navigate("/select-repositories", { replace: true });
        else if (!result.linked) navigate("/connect-github", { replace: true });
        else {
          const conn = await AuthAPI.connectionStatus(result.user.id);
          navigate(conn.connected ? "/dashboard" : "/connect-github", { replace: true });
        }
      } catch (err) {
        if (err instanceof AuthError && err.code === "GITHUB_NOT_LINKED") {
          navigate("/signup", { replace: true });
          return;
        }
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "GitHub authorization failed. Please try again.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05060A] px-5 text-[#F8FAFC]">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/[0.12] blur-[110px]" />
      </div>
      <div className="relative w-full max-w-sm rounded-[24px] border border-[#252D43] bg-[#0B1020]/95 p-8 text-center backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8B5CF6]/40 bg-[#0B1020] shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <Logo size={38} />
        </div>
        {status === "loading" ? (
          <>
            <Loader2 className="mx-auto mt-6 h-8 w-8 animate-spin text-[#A855F7]" />
            <p className="mt-4 text-[14px] font-semibold text-white">Connecting GitHub…</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#94A3B8]">{message}</p>
            <p className="mt-4 font-mono text-[10.5px] text-[#475569]">GET /api/auth/github/callback</p>
          </>
        ) : (
          <>
            <AlertTriangle className="mx-auto mt-6 h-8 w-8 text-[#F87171]" />
            <p className="mt-4 text-[14px] font-semibold text-white">Authorization failed</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#94A3B8]">{message}</p>
            <button
              onClick={() => navigate("/connect-github", { replace: true })}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-2.5 text-[13px] font-semibold text-white glow-btn"
            >
              <CheckCircle2 className="h-4 w-4" /> Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
