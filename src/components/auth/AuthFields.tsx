import { useState, type ReactNode } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import GithubIcon from "../GithubIcon";
import Logo from "../Logo";

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[12.5px] font-semibold tracking-wide text-[#CBD5E1]">
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-snug text-[#F87171]" role="alert">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

export function inputClass(error?: string | null) {
  return `w-full rounded-xl border bg-[#090D18]/80 px-4 py-3 text-[14px] text-white placeholder:text-[#64748B] outline-none transition-all duration-300 ${
    error
      ? "border-[#F87171]/60 shadow-[0_0_0_3px_rgba(248,113,113,0.08)]"
      : "border-[#252D43] focus:border-[#8B5CF6]/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12),0_0_20px_rgba(139,92,246,0.08)]"
  }`;
}

export function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  onBlur,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  autoComplete?: string;
  onBlur?: () => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass(error)} pr-12`}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:text-white"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function GithubButton({
  label,
  onClick,
  loading,
  disabled,
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="group flex w-full items-center justify-center gap-3 rounded-xl border border-[#252D43] bg-[#151D32]/80 px-5 py-3.5 text-[14.5px] font-semibold text-white transition-all duration-300 hover:border-[#8B5CF6]/55 hover:bg-[#151D32] hover:shadow-[0_0_28px_rgba(139,92,246,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-[#A855F7]" />
      ) : (
        <GithubIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
      )}
      {label}
    </button>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-4" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#252D43]" />
      <span className="text-[10.5px] font-bold tracking-[0.2em] text-[#64748B]">{label}</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#252D43]" />
    </div>
  );
}

export function PrimaryButton({
  children,
  loading,
  disabled,
  type = "submit",
}: {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#3B82F6] px-5 py-3.5 text-[14.5px] font-semibold text-white glow-btn transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100"
    >
      {loading && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
      {children}
    </button>
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-7">
      <div className="mb-5 flex items-center gap-3">
        <Logo size={36} />
        <span className="text-[16px] font-extrabold tracking-tight">
          Git<span className="text-gradient">Loop</span>
        </span>
        <span className="ml-auto rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-[#C4B5FD]">
          SECURE AUTH
        </span>
      </div>
      <h2 className="text-[26px] font-extrabold tracking-tight text-white">{title}</h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#94A3B8]">{subtitle}</p>
    </div>
  );
}

export function AlertBanner({ type, message }: { type: "error" | "success"; message: string }) {
  const isError = type === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[13px] leading-relaxed ${
        isError
          ? "border-[#F87171]/35 bg-[#F87171]/10 text-[#FCA5A5]"
          : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
