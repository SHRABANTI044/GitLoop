import { Link } from "react-router-dom";
import { FolderGit2, ListChecks, PackageSearch, Compass, Sparkles, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import Logo from "./Logo";

const problems = [
  {
    icon: FolderGit2,
    title: "Forgotten Codebases",
    desc: "Returning to an old project means spending hours understanding its architecture and source code again.",
    accent: "from-[#8B5CF6] to-[#3B82F6]",
    tag: "01",
  },
  {
    icon: ListChecks,
    title: "Lost Development Progress",
    desc: "Important tasks, unfinished features, and development ideas often get forgotten.",
    accent: "from-[#A855F7] to-[#22D3EE]",
    tag: "02",
  },
  {
    icon: PackageSearch,
    title: "Dependency Confusion",
    desc: "Remembering libraries, package versions, and project configurations becomes difficult.",
    accent: "from-[#3B82F6] to-[#22D3EE]",
    tag: "03",
  },
  {
    icon: Compass,
    title: "No Clear Next Step",
    desc: "Developers often struggle to decide what to improve or implement next.",
    accent: "from-[#8B5CF6] to-[#22D3EE]",
    tag: "04",
  },
];

export default function ProblemSection() {
  return (
    <section id="about" className="relative overflow-hidden bg-[#0B1020]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-grid-fine opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[380px] w-[720px] rounded-full bg-[#8B5CF6]/[0.09] blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#252D43] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-[#94A3B8] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" />
              The Problem
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="mt-5 text-[32px] font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-[42px]">
              Building Projects Is Easy.
              <br />
              <span className="text-gradient">Remembering Everything Isn&apos;t.</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="mx-auto mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#94A3B8]">
              Every developer works on multiple projects. But returning to old codebases, remembering implementation decisions, and tracking unfinished work can become frustrating.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <article className="card-hover group relative h-full overflow-hidden rounded-3xl border border-[#8B5CF6]/20 bg-[#10182A]/70 p-6 backdrop-blur">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#8B5CF6]/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" aria-hidden />
                <div className="flex items-start justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.accent} text-white shadow-[0_8px_24px_rgba(139,92,246,0.3)]`}>
                    <p.icon className="h-6 w-6" />
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#475569]">{p.tag}</span>
                </div>
                <h3 className="mt-5 text-[17px] font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#94A3B8]">{p.desc}</p>
                <div className="mt-5 h-px bg-gradient-to-r from-[#8B5CF6]/40 via-[#252D43] to-transparent" />
                <p className="mt-3 text-[11px] font-semibold tracking-wide text-[#64748B] uppercase">Solved by GitLoop →</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Solution banner */}
        <Reveal delay={1}>
          <div className="relative mt-10 overflow-hidden rounded-[28px] border border-[#8B5CF6]/30 bg-gradient-to-br from-[#151D32] via-[#10182A] to-[#0B1020] p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#8B5CF6]/15 blur-[80px]" />
              <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[#22D3EE]/10 blur-[80px]" />
              <div className="absolute inset-0 bg-grid-fine opacity-40 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]" />
            </div>
            <div className="relative flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-[#8B5CF6]/30 blur-xl animate-pulse" aria-hidden />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-[#8B5CF6]/40 bg-[#0B1020]/90 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                  <Logo size={52} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/10 px-3 py-1 text-[10.5px] font-bold tracking-[0.16em] text-[#67E8F9] uppercase">
                  <Sparkles className="h-3.5 w-3.5" /> The Solution
                </div>
                <h3 className="mt-3 text-[24px] font-extrabold leading-tight text-white sm:text-[28px]">
                  Meet GitLoop — <span className="text-gradient">Your Personal AI Developer Memory.</span>
                </h3>
                <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-[#94A3B8]">
                  One intelligent workspace that understands your repositories, remembers your projects, and helps you move forward.
                </p>
              </div>
              <Link
                to={{ pathname: "/", hash: "#features" }}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-6 py-3 text-[14px] font-semibold text-white glow-btn transition-all duration-300 hover:brightness-110 hover:-translate-y-[2px]"
              >
                See how it works
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
