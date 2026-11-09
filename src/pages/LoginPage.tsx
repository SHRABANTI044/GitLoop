import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2, KeyRound } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { AuthHeader, AlertBanner, FieldLabel, FieldError, PasswordField, GithubButton, Divider, PrimaryButton, inputClass } from "../components/auth/AuthFields";
import GithubAuthorizeModal from "../components/auth/GithubAuthorizeModal";
import { useAuth } from "../context/AuthContext";
import { AuthAPI, AuthError, EMAIL_RE } from "../lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refreshConnection } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [banner, setBanner] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const routeAfterAuth = async () => {
    const status = await AuthAPI.connectionStatus((await AuthAPI.me())?.id ?? "");
    if (!status.connected) navigate("/connect-github", { replace: true });
    else navigate(from, { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await login(email, password, remember);
      setBanner({ type: "success", message: "Signed in successfully. Checking your GitHub connection…" });
      await routeAfterAuth();
    } catch (err) {
      setBanner({ type: "error", message: err instanceof Error ? err.message : "Sign in failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!EMAIL_RE.test(email.trim())) {
      setErrors({ email: "Enter a valid email address." });
      return;
    }
    setLoading(true);
    try {
      await AuthAPI.forgotPassword(email);
      setForgotSent(true);
    } catch (err) {
      setBanner({ type: "error", message: err instanceof Error ? err.message : "Could not send reset email." });
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuthorize = async (identity: { githubUserId: string; username: string; avatarUrl: string | null; email: string | null }) => {
    setGithubLoading(true);
    try {
      const { url } = await AuthAPI.beginGithubOAuth("login");
      const code = new URLSearchParams(url.split("?")[1]).get("code") ?? "";
      const result = await AuthAPI.exchangeGithubCode({ code, identity, mode: "login" });
      await refreshConnection();
      setShowGithub(false);
      if (!result.linked) navigate("/connect-github", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof AuthError && err.code === "GITHUB_NOT_LINKED") {
        setShowGithub(false);
        setBanner({ type: "error", message: err.message });
        navigate("/signup", { state: { githubIdentity: identity } });
        return;
      }
      throw err;
    } finally {
      setGithubLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#64748B] transition-colors hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to home
      </Link>

      {forgotMode ? (
        <>
          <AuthHeader title="Reset Password" subtitle="Enter your account email and we'll send you a secure reset link." />
          {banner && <AlertBanner type={banner.type} message={banner.message} />}
          {forgotSent ? (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-4 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
              <p className="mt-2 text-[14px] font-semibold text-emerald-300">Check your inbox</p>
              <p className="mt-1 text-[12.5px] text-[#94A3B8]">If an account exists for {email}, a reset link is on its way.</p>
              <button onClick={() => { setForgotMode(false); setForgotSent(false); }} className="mt-3 text-[13px] font-semibold text-[#A855F7] hover:text-white">
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgot} noValidate className="space-y-4">
              <div>
                <FieldLabel htmlFor="forgot-email">Email Address</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#64748B]" />
                  <input id="forgot-email" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass(errors.email)} pl-11`} />
                </div>
                <FieldError message={errors.email} />
              </div>
              <PrimaryButton loading={loading}>Send Reset Link</PrimaryButton>
              <button type="button" onClick={() => setForgotMode(false)} className="w-full text-center text-[13px] font-medium text-[#94A3B8] hover:text-white">
                Back to sign in
              </button>
            </form>
          )}
        </>
      ) : (
        <>
          <AuthHeader title="Welcome Back" subtitle="Sign in to continue building with your AI-powered developer companion." />
          {banner && <AlertBanner type={banner.type} message={banner.message} />}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#64748B]" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  className={`${inputClass(errors.email)} pl-11`}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                />
              </div>
              <FieldError message={errors.email} />
            </div>

            <PasswordField
              id="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }}
              error={errors.password}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#94A3B8] select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[#252D43] bg-[#090D18] accent-[#8B5CF6]"
                />
                Remember me
              </label>
              <button type="button" onClick={() => setForgotMode(true)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#A855F7] transition-colors hover:text-white">
                <KeyRound className="h-3.5 w-3.5" /> Forgot Password?
              </button>
            </div>

            <PrimaryButton loading={loading}>{loading ? "Signing in…" : "Sign In"}</PrimaryButton>
          </form>

          <Divider label="OR CONTINUE WITH" />

          <GithubButton label="Continue with GitHub" loading={githubLoading} onClick={() => setShowGithub(true)} />

          <p className="mt-6 text-center text-[13.5px] text-[#94A3B8]">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-[#A855F7] transition-colors hover:text-white">
              Create Account
            </Link>
          </p>
        </>
      )}

      <GithubAuthorizeModal open={showGithub} mode="login" onAuthorize={handleGithubAuthorize} onCancel={() => setShowGithub(false)} />
    </AuthLayout>
  );
}
