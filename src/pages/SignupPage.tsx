import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, User, CheckCircle2, XCircle } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { AuthHeader, AlertBanner, FieldLabel, FieldError, PasswordField, GithubButton, Divider, PrimaryButton, inputClass } from "../components/auth/AuthFields";
import GithubAuthorizeModal from "../components/auth/GithubAuthorizeModal";
import { useAuth } from "../context/AuthContext";
import { AuthAPI, AuthError, EMAIL_RE, passwordStrength, validatePassword } from "../lib/auth";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, refreshConnection } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirm?: string; terms?: string }>({});
  const [banner, setBanner] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [showGithub, setShowGithub] = useState(false);

  const strength = passwordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const next: typeof errors = {};
    if (fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    const pwErr = validatePassword(password);
    if (pwErr) next.password = pwErr;
    if (!confirm) next.confirm = "Please confirm your password.";
    else if (confirm !== password) next.confirm = "Passwords do not match.";
    if (!terms) next.terms = "You must agree to the Terms of Service and Privacy Policy.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await signup(fullName, email, password);
      setBanner({ type: "success", message: "Your account has been created successfully!" });
      await new Promise((r) => setTimeout(r, 900));
      navigate("/connect-github", { replace: true });
    } catch (err) {
      if (err instanceof AuthError && err.code === "EMAIL_TAKEN") {
        setErrors((p) => ({ ...p, email: err.message }));
      } else {
        setBanner({ type: "error", message: err instanceof Error ? err.message : "Could not create your account. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuthorize = async (identity: { githubUserId: string; username: string; avatarUrl: string | null; email: string | null }) => {
    setGithubLoading(true);
    try {
      const { url } = await AuthAPI.beginGithubOAuth("signup");
      const code = new URLSearchParams(url.split("?")[1]).get("code") ?? "";
      await AuthAPI.exchangeGithubCode({ code, identity, mode: "signup" });
      await refreshConnection();
      setShowGithub(false);
      navigate("/select-repositories", { replace: true });
    } catch (err) {
      throw err;
    } finally {
      setGithubLoading(false);
    }
  };

  const strengthColor = strength.score <= 1 ? "bg-[#F87171]" : strength.score === 2 ? "bg-[#FBBF24]" : strength.score === 3 ? "bg-[#3B82F6]" : "bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]";

  return (
    <AuthLayout>
      <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#64748B] transition-colors hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to home
      </Link>

      <AuthHeader title="Create Your Account" subtitle="Start your journey with GitLoop and give your projects an AI-powered memory." />
      {banner && <AlertBanner type={banner.type} message={banner.message} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <FieldLabel htmlFor="fullname">Full Name</FieldLabel>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#64748B]" />
            <input
              id="fullname"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: undefined })); }}
              className={`${inputClass(errors.fullName)} pl-11`}
              autoComplete="name"
              aria-invalid={!!errors.fullName}
            />
          </div>
          <FieldError message={errors.fullName} />
        </div>

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

        <div>
          <PasswordField
            id="password"
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); }}
            error={errors.password}
            autoComplete="new-password"
          />
          {password && (
            <div className="mt-2.5">
              <div className="flex gap-1.5" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < strength.score ? strengthColor : "bg-[#252D43]"}`} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {strength.checks.map((c) => (
                  <span key={c.label} className={`inline-flex items-center gap-1 text-[11px] ${c.ok ? "text-emerald-400" : "text-[#64748B]"}`}>
                    {c.ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {c.label}
                  </span>
                ))}
                <span className="ml-auto text-[11px] font-semibold text-[#94A3B8]">{strength.label}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <PasswordField
            id="confirm"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirm}
            onChange={(v) => { setConfirm(v); setErrors((p) => ({ ...p, confirm: undefined })); }}
            error={errors.confirm ?? (confirm && confirm !== password ? "Passwords do not match." : undefined)}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-relaxed text-[#94A3B8] select-none">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => { setTerms(e.target.checked); setErrors((p) => ({ ...p, terms: undefined })); }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#252D43] bg-[#090D18] accent-[#8B5CF6]"
            />
            <span>
              I agree to the <span className="font-semibold text-[#C4B5FD] underline decoration-[#8B5CF6]/40 underline-offset-2">Terms of Service</span> and{" "}
              <span className="font-semibold text-[#C4B5FD] underline decoration-[#8B5CF6]/40 underline-offset-2">Privacy Policy</span>.
            </span>
          </label>
          <FieldError message={errors.terms} />
        </div>

        <PrimaryButton loading={loading}>{loading ? "Creating account…" : "Create Account"}</PrimaryButton>
      </form>

      <Divider label="OR SIGN UP WITH" />

      <GithubButton label="Continue with GitHub" loading={githubLoading} onClick={() => setShowGithub(true)} />

      <p className="mt-6 text-center text-[13.5px] text-[#94A3B8]">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#A855F7] transition-colors hover:text-white">
          Sign In
        </Link>
      </p>

      <GithubAuthorizeModal open={showGithub} mode="signup" onAuthorize={handleGithubAuthorize} onCancel={() => setShowGithub(false)} />
    </AuthLayout>
  );
}
