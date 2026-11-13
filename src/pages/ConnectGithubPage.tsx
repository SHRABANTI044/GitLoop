import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, FolderGit2, BrainCircuit, Lightbulb, CheckCircle2, Loader2, LogOut, Lock } from "lucide-react";
import GithubIcon from "../components/GithubIcon";
import Logo from "../components/Logo";
import GithubAuthorizeModal from "../components/auth/GithubAuthorizeModal";
import { AlertBanner } from "../components/auth/AuthFields";
import { useAuth } from "../context/AuthContext";
import { AuthAPI } from "../lib/auth";

const benefits = [
  { icon: FolderGit2, title: "Repository Understanding", desc: "Analyze your project structure, README files, and selected source files." },
  { icon: BrainCircuit, title: "Development Memory", desc: "Keep track of project information, tasks, and progress." },
  { icon: Lightbulb, title: "AI Recommendations", desc: "Get repository-aware explanations and suggestions for your next steps." },
];

export default function ConnectGithubPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [banner, setBanner] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const error = searchParams.get("github_error");
    if (!error) return;

    setBanner({
      type: "error",
      message: error === "cancelled"
        ? "GitHub authorization was cancelled. You can try again whenever you're ready."
        : "GitHub authorization could not be completed. Please try again.",
    });
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleAuthorize = async (_identity: { githubUserId: string; username: string; avatarUrl: string | null; email: string | null }) => {
    setConnecting(true);
    try {
      const { url } = await AuthAPI.beginGithubOAuth("signup");
      window.location.assign(url);
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Could not start GitHub authorization. Please try again.",
      });
      setShowModal(false);
    } finally {
      setConnecting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setCancelled(true);
    setBanner({ type: "error", message: "GitHub authorization was cancelled. You can try again whenever you're ready." });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060A] text-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[#05060A]" />
        <div className="absolute inset-0 bg-grid animate-grid-drift opacity-50 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black_30%,transparent_100%)]" />
        <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-[#8B5CF6]/[0.13] blur-[110px]" />
        <div className="absolute bottom-[-140px] right-[10%] h-[380px] w-[480px] rounded-full bg-[#22D3EE]/[0.07] blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-10 sm:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo size={36} />
            <span className="text-[18px] font-extrabold tracking-tight">
              Git<span className="text-gradient">Loop</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#252D43] bg-white/[0.03] px-3.5 py-1.5 text-[12px] text-[#94A3B8]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-[10px] font-extrabold text-white">
                {user?.fullName?.[0]?.toUpperCase() ?? "?"}
              </span>
              {user?.fullName} · {user?.email}
            </span>
            <button onClick={async () => { await logout(); navigate("/login"); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#252D43] px-3.5 py-1.5 text-[12px] font-semibold text-[#94A3B8] transition-colors hover:border-[#F87171]/40 hover:text-white">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-10 flex items-center gap-2" aria-label="Onboarding progress">
          {["Account", "Connect GitHub", "Select Repositories", "Dashboard"].map((step, i) => (
            <div key={step} className="flex flex-1 items-center gap-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                i === 0 ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300" : i === 1 ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-white shadow-[0_0_14px_rgba(139,92,246,0.3)]" : "border-[#252D43] text-[#64748B]"
              }`}>
                {i === 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-[11.5px] font-semibold sm:block ${i <= 1 ? "text-white" : "text-[#64748B]"}`}>{step}</span>
              {i < 3 && <span className={`mx-1 h-px flex-1 ${i === 0 ? "bg-emerald-400/40" : "bg-[#252D43]"}`} />}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <h1 className="text-[30px] font-extrabold tracking-tight sm:text-[36px]">
            Connect Your <span className="text-gradient">GitHub Account</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-[#94A3B8]">
            GitLoop needs access to your GitHub repositories to understand your projects, remember your progress, and provide intelligent development recommendations.
          </p>
        </div>

        {banner && (
          <div className="mx-auto mt-6 max-w-xl">
            <AlertBanner type={banner.type} message={banner.message} />
          </div>
        )}

        {/* Connection card */}
        <div className="relative mx-auto mt-8 max-w-xl">
          <div className="absolute -inset-4 rounded-[30px] bg-gradient-to-br from-[#8B5CF6]/18 via-transparent to-[#22D3EE]/10 blur-2xl" aria-hidden />
          <div className="absolute -inset-px rounded-[26px] bg-gradient-to-br from-[#8B5CF6]/40 via-[#252D43] to-[#22D3EE]/25" aria-hidden />
          <div className="glass-strong relative rounded-[25px] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-[#8B5CF6]/25 animate-pulse-ring" aria-hidden />
              <span className="absolute inset-0 rounded-full bg-[#8B5CF6]/15 blur-xl" aria-hidden />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#252D43] bg-[#151D32] shadow-[0_0_30px_rgba(139,92,246,0.25)]">
                <GithubIcon className="h-8 w-8 text-white" />
              </span>
            </div>
            <h2 className="mt-5 text-[22px] font-extrabold text-white">Connect GitHub</h2>
            <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-[#94A3B8]">
              Give GitLoop permission to analyze your selected repositories and become your personal AI developer companion.
            </p>

            <button
              onClick={() => { setCancelled(false); setShowModal(true); }}
              disabled={connecting}
              className="group mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#3B82F6] px-5 py-4 text-[15px] font-semibold text-white glow-btn transition-all duration-300 hover:brightness-110 disabled:opacity-70"
            >
              {connecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <GithubIcon className="h-5 w-5" />}
              {connecting ? "Connecting…" : "Connect with GitHub"}
            </button>

            <p className="mt-4 flex items-start justify-center gap-2 text-[11.5px] leading-relaxed text-[#64748B]">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22D3EE]" />
              <span>Read-only access to repositories you select. Tokens are encrypted server-side and never exposed in your browser.</span>
            </p>
            {cancelled && (
              <p className="mt-3 text-[12px] text-[#FCA5A5]">Authorization cancelled — no changes were made.</p>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="card-hover rounded-2xl border border-[#252D43] bg-[#10182A]/80 p-5 text-center backdrop-blur">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_8px_24px_rgba(139,92,246,0.3)]">
                <b.icon className="h-5.5 w-5.5" />
              </span>
              <p className="mt-3 text-[14px] font-bold text-white">{b.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#94A3B8]">{b.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-[12px] text-[#64748B]">
          <ShieldCheck className="h-4 w-4 text-[#22D3EE]" />
          Only repositories you explicitly select will ever be analyzed.
        </p>

        <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#64748B] transition-colors hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
      </div>

      <GithubAuthorizeModal open={showModal} mode="connect" onAuthorize={handleAuthorize} onCancel={handleCancel} />
    </div>
  );
}
