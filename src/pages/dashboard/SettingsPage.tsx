import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, ShieldCheck, LogOut, RefreshCw, CheckCircle2, AlertTriangle, LifeBuoy, ArrowRight } from "lucide-react";
import GithubIcon from "../../components/GithubIcon";
import { LoadingBlock } from "../../components/dashboard/widgets";
import { useAuth } from "../../context/AuthContext";
import { DashboardAPI } from "../../lib/dashboard";
import { AuthAPI } from "../../lib/auth";

export default function SettingsPage() {
  const { user, githubUsername, logout } = useAuth();
  const navigate = useNavigate();
  const [conn, setConn] = useState<{ connectedAt: string | null; lastSyncedAt: string | null; selectedCount: number } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    AuthAPI.connectionDetail(user.id).then(setConn).catch(() => setConn(null));
  }, [user]);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await DashboardAPI.sync(user.id);
      setSyncMsg(`Synchronized ${res.updated} repositories · ${new Date(res.syncedAt).toLocaleTimeString()}`);
      setConn(await AuthAPI.connectionDetail(user.id));
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  if (!user) return <LoadingBlock label="Loading settings…" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-extrabold tracking-tight">Account <span className="text-gradient">Settings</span></h2>
        <p className="mt-1 text-[13.5px] text-[#94A3B8]">Manage your profile, GitHub connection, and session.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <section className="rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-6 backdrop-blur">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
            <User className="h-4.5 w-4.5 text-[#A855F7]" /> My Profile
          </h3>
          <div className="mt-5 flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-[24px] font-extrabold text-white shadow-[0_0_30px_rgba(139,92,246,0.35)]">
              {user.fullName[0]?.toUpperCase() ?? "?"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[17px] font-extrabold text-white">{user.fullName}</p>
              <p className="flex items-center gap-1.5 truncate text-[13px] text-[#94A3B8]">
                <Mail className="h-3.5 w-3.5 shrink-0" /> {user.email}
              </p>
              <p className="mt-1 text-[12px] text-[#64748B]">
                Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })} · Signed up with {user.provider === "github" ? "GitHub" : "email & password"}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-[#252D43] bg-white/[0.02] px-4 py-3 text-[12.5px] leading-relaxed text-[#94A3B8]">
            Your profile is managed by your GitLoop account. To change your name or email, contact support — account identity changes are verified for security.
          </div>
        </section>

        {/* GitHub connection */}
        <section className="rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-6 backdrop-blur">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
            <GithubIcon className="h-4.5 w-4.5 text-white" /> GitHub Connection
          </h3>
          <div className="mt-5 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#252D43] bg-[#151D32]">
              <GithubIcon className="h-7 w-7 text-white" />
            </span>
            <div>
              <p className="flex items-center gap-2 text-[15px] font-bold text-white">
                @{githubUsername ?? "—"}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> CONNECTED
                </span>
              </p>
              <p className="mt-1 text-[12.5px] text-[#94A3B8]">
                Connected {conn?.connectedAt ? new Date(conn.connectedAt).toLocaleDateString() : "—"} · {conn?.selectedCount ?? 0} repositories selected
              </p>
              <p className="text-[12px] text-[#64748B]">Last synced {conn?.lastSyncedAt ? new Date(conn.lastSyncedAt).toLocaleString() : "—"}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={handleSync} disabled={syncing} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-4 py-2.5 text-[13px] font-semibold text-white glow-btn transition-all hover:brightness-110 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing…" : "Sync Repositories"}
            </button>
            <Link to="/select-repositories" className="inline-flex items-center gap-2 rounded-xl border border-[#252D43] px-4 py-2.5 text-[13px] font-semibold text-[#CBD5E1] transition-colors hover:border-[#8B5CF6]/45 hover:text-white">
              Manage repositories <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {syncMsg && (
            <p className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-[12.5px] ${syncMsg.includes("Synchronized") ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-[#F87171]/35 bg-[#F87171]/10 text-[#FCA5A5]"}`}>
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {syncMsg}
            </p>
          )}
          <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-[#64748B]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22D3EE]" />
            Access tokens are encrypted server-side and never exposed in the frontend.
          </p>
        </section>

        {/* Help */}
        <section className="rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-6 backdrop-blur">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
            <LifeBuoy className="h-4.5 w-4.5 text-[#22D3EE]" /> Help &amp; Support
          </h3>
          <ul className="mt-4 space-y-3 text-[13px] leading-relaxed text-[#94A3B8]">
            <li><span className="font-semibold text-white">How progress works:</span> GitLoop calculates progress only from tasks you track. No tasks → “Not enough data yet.”</li>
            <li><span className="font-semibold text-white">How AI answers work:</span> Responses are grounded in GitHub metadata and your tasks. GitLoop never invents file-level analysis.</li>
            <li><span className="font-semibold text-white">Privacy:</span> Only repositories you select are analyzed, and data is isolated to your account.</li>
          </ul>
        </section>

        {/* Danger zone */}
        <section className="rounded-[22px] border border-[#F87171]/25 bg-[#10182A]/80 p-6 backdrop-blur">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
            <AlertTriangle className="h-4.5 w-4.5 text-[#FCA5A5]" /> Session
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[#94A3B8]">
            Signing out ends your authenticated session securely and clears your local auth state. Your repositories, tasks, and conversations stay saved for your next sign-in.
          </p>
          <button onClick={handleLogout} disabled={loggingOut} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#F87171]/40 bg-[#F87171]/10 px-5 py-3 text-[13.5px] font-semibold text-[#FCA5A5] transition-all hover:bg-[#F87171]/20 disabled:opacity-60">
            <LogOut className="h-4.5 w-4.5" /> {loggingOut ? "Signing out…" : "Logout"}
          </button>
          <p className="mt-3 text-[11.5px] text-[#64748B]">You&apos;ll be redirected to the Login page. Other devices stay signed in until their sessions expire.</p>
        </section>
      </div>
    </div>
  );
}
