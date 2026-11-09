import { Atom, FileCode2, Zap, Database, Cloud } from "lucide-react";
import Reveal from "./Reveal";

function GithubIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const techs = [
  { name: "GitHub", icon: GithubIcon },
  { name: "React", icon: Atom },
  { name: "Python", icon: FileCode2 },
  { name: "FastAPI", icon: Zap },
  { name: "PostgreSQL", icon: Database },
  { name: "Amazon Web Services", icon: Cloud },
];

export default function TechnologyStrip() {
  const row = [...techs, ...techs];
  return (
    <section className="relative border-y border-[#252D43]/80 bg-[#090D18]/80">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10">
        <Reveal>
          <p className="text-center text-[12px] font-bold tracking-[0.22em] text-[#64748B] uppercase">
            Your Development Workflow, <span className="text-gradient-soft">Connected.</span>
          </p>
        </Reveal>
        <Reveal delay={1}>
          <div className="relative mt-7 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max items-center gap-4 animate-marquee hover:[animation-play-state:paused]">
              {row.map((t, i) => (
                <div
                  key={`${t.name}-${i}`}
                  className="group flex items-center gap-3 rounded-2xl border border-[#252D43]/80 bg-[#10182A]/60 px-5 py-3.5 transition-all duration-300 hover:border-[#8B5CF6]/45 hover:bg-[#151D32] hover:shadow-[0_0_24px_rgba(139,92,246,0.15)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#252D43] bg-white/[0.03] text-[#94A3B8] transition-all duration-300 group-hover:text-white group-hover:border-[#8B5CF6]/40 group-hover:shadow-[0_0_16px_rgba(139,92,246,0.25)]">
                    <t.icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="whitespace-nowrap text-[14px] font-semibold text-[#94A3B8] transition-colors duration-300 group-hover:text-white">
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <p className="mt-5 text-center text-[11px] text-[#475569]">Works with the tools you already use. No official partnerships implied.</p>
      </div>
    </section>
  );
}
