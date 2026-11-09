import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FolderGit2, BrainCircuit, Lightbulb, GitBranch, FileCode2, Star, Sparkles } from "lucide-react";
import Logo from "../Logo";

const highlights = [
  { icon: FolderGit2, title: "Understand Your Repositories", desc: "AI maps your architecture, stack, and key files." },
  { icon: BrainCircuit, title: "Remember Your Project Progress", desc: "Decisions, tasks, and TODOs — never lost again." },
  { icon: Lightbulb, title: "Get AI-Powered Development Guidance", desc: "Know exactly what to build next." },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060A] text-[#F8FAFC]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[#05060A]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#090D18] via-[#05060A] to-[#05060A]" />
        <div className="absolute inset-0 bg-grid animate-grid-drift opacity-60 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,black_30%,transparent_100%)]" />
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[#8B5CF6]/[0.15] blur-[120px]" />
        <div className="absolute top-1/4 right-[-160px] h-[480px] w-[480px] rounded-full bg-[#3B82F6]/[0.12] blur-[120px]" />
        <div className="absolute bottom-[-180px] left-1/3 h-[380px] w-[560px] rounded-full bg-[#22D3EE]/[0.06] blur-[120px]" />
        <div className="absolute left-[10%] top-[24%] h-1.5 w-1.5 rounded-full bg-[#A855F7] shadow-[0_0_12px_#A855F7] animate-floaty-slow" />
        <div className="absolute right-[14%] top-[18%] h-1 w-1 rounded-full bg-[#22D3EE] shadow-[0_0_10px_#22D3EE] animate-floaty" />
        <div className="absolute left-[42%] bottom-[16%] h-1 w-1 rounded-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6] animate-floaty-delayed" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        {/* Left — branding */}
        <div className="relative hidden flex-col justify-between px-10 py-10 lg:flex xl:px-14">
          <Link to="/" className="inline-flex w-fit items-center gap-3" aria-label="Back to GitLoop home">
            <Logo size={40} />
            <span className="text-[20px] font-extrabold tracking-tight">
              Git<span className="text-gradient">Loop</span>
            </span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] text-[#DDD6FE]">
              <Sparkles className="h-3.5 w-3.5 text-[#A855F7]" />
              ✦ AI-POWERED DEVELOPER COMPANION
            </div>
            <h1 className="mt-6 text-[40px] font-extrabold leading-[1.08] tracking-tight xl:text-[46px]">
              Your Code. Your Context.
              <br />
              <span className="text-gradient">Your AI Companion.</span>
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-[#94A3B8]">
              Your personal AI developer companion that understands your GitHub repositories, remembers your development progress, and helps you decide what to build next.
            </p>

            <ul className="mt-8 space-y-4">
              {highlights.map((h) => (
                <li key={h.title} className="flex gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/12 text-[#A855F7] shadow-[0_0_18px_rgba(139,92,246,0.18)]">
                    <h.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[14.5px] font-semibold text-white">{h.title}</p>
                    <p className="mt-0.5 text-[13px] text-[#94A3B8]">{h.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Floating visual */}
          <div className="relative mt-10 h-[190px]" aria-hidden>
            <div className="absolute left-0 top-2 w-[270px] animate-floaty rounded-2xl border border-[#252D43] bg-[#10182A]/85 p-4 backdrop-blur shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] text-[12px] font-extrabold text-white">T</span>
                <div className="leading-tight">
                  <p className="text-[12.5px] font-bold text-white">truthguard-ai</p>
                  <p className="text-[10.5px] text-[#94A3B8]">Python · Node.js · React</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-[#FBBF24]"><Star className="h-3 w-3" /> 24</span>
              </div>
              <div className="mt-3 flex gap-1.5">
                <span className="rounded-md border border-[#252D43] bg-white/[0.03] px-2 py-1 text-[10px] text-[#94A3B8]">142 files</span>
                <span className="rounded-md border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2 py-1 text-[10px] text-[#C4B5FD]">AI indexed</span>
              </div>
            </div>
            <div className="absolute left-[240px] top-[70px] w-[250px] animate-floaty-delayed rounded-2xl border border-[#252D43] bg-[#0B1020]/90 p-4 backdrop-blur shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-white">
                <GitBranch className="h-3.5 w-3.5 text-[#A855F7]" /> main · 42 commits
              </div>
              <p className="mt-2 font-mono text-[11px] leading-relaxed text-[#67E8F9]">
                $ gitloop analyze ./truthguard-ai
              </p>
              <p className="mt-1 font-mono text-[11px] leading-relaxed text-[#94A3B8]">
                ✓ architecture mapped · 3 TODOs found
              </p>
            </div>
            <div className="absolute bottom-0 left-[90px] flex items-center gap-2 rounded-xl border border-[#8B5CF6]/25 bg-[#151D32]/90 px-3.5 py-2.5 backdrop-blur animate-floaty-slow">
              <FileCode2 className="h-4 w-4 text-[#22D3EE]" />
              <span className="text-[11.5px] text-[#CBD5E1]">AI Insight · 3 tasks need attention</span>
            </div>
          </div>
        </div>

        {/* Right — auth card */}
        <div className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
          {/* Mobile brand */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-6 lg:hidden" aria-hidden>
            <Link to="/" className="pointer-events-auto inline-flex items-center gap-2.5">
              <Logo size={34} />
              <span className="text-[18px] font-extrabold tracking-tight">
                Git<span className="text-gradient">Loop</span>
              </span>
            </Link>
          </div>

          <div className="relative w-full max-w-[460px]">
            <div className="absolute -inset-4 rounded-[30px] bg-gradient-to-br from-[#8B5CF6]/18 via-transparent to-[#22D3EE]/10 blur-2xl" aria-hidden />
            <div className="absolute -inset-px rounded-[26px] bg-gradient-to-br from-[#8B5CF6]/40 via-[#252D43] to-[#22D3EE]/25" aria-hidden />
            <div className="glass-strong relative rounded-[25px] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:p-9">
              {children}
            </div>
            <p className="mt-5 text-center text-[11.5px] text-[#475569]">
              Protected by industry-standard encryption · Your code stays yours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
