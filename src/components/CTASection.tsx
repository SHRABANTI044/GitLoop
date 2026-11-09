import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import Logo from "./Logo";

export default function CTASection() {
  return (
    <section id="cta" className="relative overflow-hidden bg-[#05060A]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/[0.13] blur-[130px]" />
        <div className="absolute left-[20%] top-[30%] h-[300px] w-[300px] rounded-full bg-[#3B82F6]/[0.10] blur-[90px]" />
        <div className="absolute right-[18%] bottom-[20%] h-[300px] w-[300px] rounded-full bg-[#22D3EE]/[0.08] blur-[90px]" />
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_65%_65%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-24">
        <Reveal>
          <div className="relative mx-auto max-w-4xl">
            {/* animated gradient border */}
            <div className="animated-border absolute -inset-[1.5px] rounded-[30px] opacity-70" aria-hidden />
            <div className="relative overflow-hidden rounded-[29px] border border-[#252D43] bg-[#0B1020]/95 px-6 py-14 text-center sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute left-1/2 top-0 h-64 w-[560px] -translate-x-1/2 rounded-full bg-[#8B5CF6]/15 blur-[80px]" />
                <div className="absolute inset-0 bg-grid-fine opacity-40 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_40%,black,transparent)]" />
              </div>

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#8B5CF6]/40 bg-[#0B1020] shadow-[0_0_36px_rgba(139,92,246,0.35)]">
                  <Logo size={44} />
                </div>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-[#DDD6FE] uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-[#A855F7]" />
                  Start building smarter
                </div>

                <h2 className="mx-auto mt-5 max-w-2xl text-[32px] font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-[44px]">
                  Your Next Great Idea Deserves a <span className="text-gradient">Better Memory.</span>
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-[#94A3B8]">
                  Connect your repositories, understand your code, and keep every project moving forward with GitLoop.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    to="/signup"
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#3B82F6] px-8 py-3.5 text-[15px] font-semibold text-white glow-btn transition-all duration-300 hover:brightness-110 hover:-translate-y-[2px]"
                  >
                    Get Started with GitLoop
                    <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>

                <p className="mt-6 flex items-center justify-center gap-2.5 text-[13px] text-[#64748B]">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#8B5CF6]" />
                  Your developer journey, connected.
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#22D3EE]" />
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-[#64748B]">
                  <span>Free to start</span>
                  <span className="h-1 w-1 rounded-full bg-[#475569]" />
                  <span>GitHub OAuth</span>
                  <span className="h-1 w-1 rounded-full bg-[#475569]" />
                  <span>No credit card</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
