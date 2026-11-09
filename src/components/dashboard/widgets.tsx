import type { ReactNode } from "react";
import { Inbox, Loader2, type LucideIcon } from "lucide-react";
import type { TaskPriority } from "../../lib/dashboard";

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-5 backdrop-blur sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold tracking-tight text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-[13px] text-[#94A3B8]">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  grad,
  glow,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  grad: string;
  glow: string;
}) {
  return (
    <div className={`card-hover relative overflow-hidden rounded-2xl border border-[#252D43] bg-[#10182A]/80 p-5 backdrop-blur ${glow}`}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.03] blur-xl" aria-hidden />
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#64748B] uppercase">{label}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-[34px] font-extrabold leading-none tracking-tight text-white">{value}</p>
      <p className="mt-2 text-[12.5px] text-[#94A3B8]">{sub}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#252D43] bg-white/[0.015] px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#252D43] bg-[#151D32] text-[#64748B]">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 text-[14.5px] font-bold text-white">{title}</p>
      <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-[#94A3B8]">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} aria-hidden />;
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-[#94A3B8]">
      <Loader2 className="h-5 w-5 animate-spin text-[#A855F7]" />
      <span className="text-[13px]">{label}</span>
    </div>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-white/[0.07] ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles: Record<TaskPriority, string> = {
    high: "border-[#F87171]/35 bg-[#F87171]/12 text-[#FCA5A5]",
    medium: "border-[#FBBF24]/35 bg-[#FBBF24]/12 text-[#FCD34D]",
    low: "border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#67E8F9]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide uppercase ${styles[priority]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "border-[#3B82F6]/35 bg-[#3B82F6]/12 text-[#93C5FD]",
    "In Progress": "border-[#8B5CF6]/35 bg-[#8B5CF6]/12 text-[#C4B5FD]",
    "Needs Attention": "border-[#FBBF24]/35 bg-[#FBBF24]/12 text-[#FCD34D]",
    Completed: "border-emerald-400/35 bg-emerald-400/12 text-emerald-300",
    "Not Started": "border-[#252D43] bg-white/[0.04] text-[#94A3B8]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide ${styles[status] ?? styles["Not Started"]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function InboxIcon() {
  return <Inbox className="h-6 w-6" />;
}
