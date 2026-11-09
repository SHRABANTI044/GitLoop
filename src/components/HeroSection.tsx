import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronRight, Play } from "lucide-react";
import DashboardPreview from "./DashboardPreview";
import Reveal from "./Reveal";

export default function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden pt-[72px]">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[#05060A]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090D18] via-[#05060A] to-[#05060A]" />
        {/* grid */}
        <div className="absolute inset-0 bg-grid animate-grid-drift opacity-70 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]" />
        {/* radial glows */}
        <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#8B5CF6]/[0.16] blur-[120px]" />
        <div className="absolute top-10 right-[-160px] h-[520px] w-[520px] rounded-full bg-[#3B82F6]/[0.14] blur-[120px]" />
        <div className="absolute bottom-[-200px] left-1/3 h-[420px] w-[620px] rounded-full bg-[#22D3EE]/[0.07] blur-[130px]" />
        {/* particles */}
        <div className="absolute left-[12%] top-[22%] h-1.5 w-1.5 rounded-full bg-[#A855F7] shadow-[0_0_12px_#A855F7] animate-floaty-slow" />
        <div className="absolute left-[46%] top-[16%] h-1 w-1 rounded-full bg-[#22D3EE] shadow-[0_0_10px_#22D3EE] animate-floaty" />
        <div className="absolute right-[18%] top-[30%] h-1.5 w-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_12px_#3B82F6] animate-floaty-slow" />
        <div className="absolute left-[8%] bottom-[28%] h-1 w-1 rounded-full bg-[#22D3EE]/70 shadow-[0_0_8px_#22D3EE] animate-floaty-delayed" />
        <div className="absolute right-[38%] bottom-[18%] h-1 w-1 rounded-full bg-[#A855F7]/70 shadow-[0_0_8px_#A855F7] animate-floaty" />
        {/* decorative lines */}
        <div className="absolute left-0 top-[38%] h-px w-40 bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
        <div className="absolute right-0 top-[52%] h-px w-48 bg-gradient-to-r from-transparent via-[#22D3EE]/25 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 pb-20 pt-12 sm:pt-16 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:pb-28 lg:pt-20">
          {/* Left */}
          <div className="max-w-xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] text-[#DDD6FE] shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                <Sparkles className="h-3.5 w-3.5 text-[#A855F7]" />
                ✦ AI-POWERED DEVELOPER COMPANION
                <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE] animate-pulse" />
              </div>
            </Reveal>

            <Reveal delay={1}>
              <h1 className="mt-6 text-[42px] font-extrabold leading-[1.04] tracking-tight text-[#F8FAFC] sm:text-[56px] lg:text-[62px]">
                Your Code.
                <br />
                Your Context.
                <br />
                <span className="text-gradient">Your AI Companion.</span>
              </h1>
            </Reveal>

            <Reveal delay={2}>
              <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-[#94A3B8] sm:text-[17px]">
                Never lose track of your projects again. Connect your GitHub repositories, understand your codebase with AI, track unfinished work, and discover what to build next — all in one intelligent developer workspace.
              </p>
            </Reveal>

            <Reveal delay={3}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#3B82F6] px-7 py-3.5 text-[15px] font-semibold text-white glow-btn transition-all duration-300 hover:brightness-110 hover:-translate-y-[2px]"
                >
                  Get Started Free
                  <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to={{ pathname: "/", hash: "#features" }}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#8B5CF6]/35 bg-white/[0.03] px-7 py-3.5 text-[15px] font-semibold text-[#E2E8F0] backdrop-blur transition-all duration-300 hover:border-[#A855F7]/60 hover:bg-[#8B5CF6]/10 hover:text-white hover:shadow-[0_0_28px_rgba(139,92,246,0.22)] hover:-translate-y-[2px]"
                >
                  <Play className="h-4 w-4 text-[#A855F7]" />
                  Explore Features
                  <ChevronRight className="h-4 w-4 opacity-60 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={4}>
              <p className="mt-6 flex items-center gap-2.5 text-[13px] text-[#64748B]">
                <span className="h-px w-8 bg-gradient-to-r from-[#8B5CF6] to-transparent" />
                Built for developers who build, learn, and create.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-[#64748B]">
                <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" /> No credit card required</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" /> Connect in 30 seconds</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]" /> Private &amp; secure</span>
              </div>
            </Reveal>
          </div>

          {/* Right */}
          <Reveal delay={2} className="relative">
            <div className="animate-floaty-slow">
              <DashboardPreview />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
