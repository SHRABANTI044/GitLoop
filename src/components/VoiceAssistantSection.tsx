import { Link } from "react-router-dom";
import { Mic, ArrowRight, Bot, User, AudioWaveform, Sparkles } from "lucide-react";
import Reveal from "./Reveal";

const bars = [14, 26, 38, 52, 44, 62, 48, 70, 56, 40, 64, 50, 34, 58, 42, 66, 46, 30, 52, 38, 24, 44, 32, 20];

export default function VoiceAssistantSection() {
  return (
    <section className="relative overflow-hidden bg-[#090D18]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/[0.10] blur-[130px]" />
        <div className="absolute left-[15%] top-[20%] h-[300px] w-[300px] rounded-full bg-[#3B82F6]/[0.10] blur-[90px]" />
        <div className="absolute right-[12%] bottom-[15%] h-[300px] w-[300px] rounded-full bg-[#22D3EE]/[0.07] blur-[90px]" />
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_65%_60%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-[#67E8F9] uppercase">
              <AudioWaveform className="h-3.5 w-3.5" />
              Voice Assistant
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="mt-5 text-[32px] font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-[42px]">
              Talk to Your Projects. <span className="text-gradient">Literally.</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="mx-auto mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#94A3B8]">
              Explore your repositories, discover unfinished work, and get development recommendations through a conversational voice assistant.
            </p>
          </Reveal>
        </div>

        <div className="relative mx-auto mt-14 max-w-4xl">
          {/* glow frame */}
          <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-[#8B5CF6]/18 via-transparent to-[#22D3EE]/12 blur-2xl" aria-hidden />

          <div className="relative overflow-hidden rounded-[28px] border border-[#252D43] bg-[#0B1020]/90 backdrop-blur">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute left-1/2 top-[46%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/12 blur-[90px]" />
            </div>

            <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.1fr]">
              {/* Mic visual */}
              <div className="relative mx-auto flex h-[280px] w-[280px] items-center justify-center sm:h-[320px] sm:w-[320px]">
                {/* rings */}
                <span className="absolute inset-0 rounded-full border border-[#8B5CF6]/20 animate-pulse-ring" aria-hidden />
                <span className="absolute inset-6 rounded-full border border-[#3B82F6]/20 animate-pulse-ring [animation-delay:0.8s]" aria-hidden />
                <span className="absolute inset-12 rounded-full border border-dashed border-[#22D3EE]/25 animate-[spin_30s_linear_infinite]" aria-hidden />
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8B5CF6]/10 to-[#22D3EE]/8 blur-xl" aria-hidden />

                {/* waveform ring */}
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
                  <div className="flex h-full w-full items-center justify-center gap-[3px] px-6">
                    {bars.map((h, i) => (
                      <span
                        key={i}
                        className="wave-bar w-[3px] rounded-full bg-gradient-to-t from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE]"
                        style={{ height: `${h}%`, animationDelay: `${i * 0.07}s`, opacity: 0.35 + (h / 100) * 0.65 }}
                      />
                    ))}
                  </div>
                </div>

                {/* mic core */}
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-[#8B5CF6]/30 blur-2xl animate-pulse" aria-hidden />
                  <div className="relative flex h-[110px] w-[110px] items-center justify-center rounded-full border border-[#A855F7]/50 bg-gradient-to-br from-[#151D32] to-[#0B1020] shadow-[0_0_50px_rgba(139,92,246,0.45),inset_0_0_30px_rgba(139,92,246,0.15)]">
                    <Mic className="h-11 w-11 text-white drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#22D3EE] to-[#3B82F6] text-white shadow-[0_0_16px_rgba(34,211,238,0.6)]">
                    <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                  </span>
                </div>

                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#252D43] bg-[#0B1020]/90 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-[#94A3B8] uppercase">
                  Listening…
                </span>
              </div>

              {/* Conversation */}
              <div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] text-white">
                      <User className="h-4.5 w-4.5" />
                    </span>
                    <div className="rounded-2xl rounded-tl-md border border-[#252D43] bg-white/[0.04] px-4 py-3">
                      <p className="text-[10px] font-bold tracking-[0.14em] text-[#64748B] uppercase">You · Voice</p>
                      <p className="mt-1 text-[14.5px] font-medium text-white">“Which project needs my attention?”</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_16px_rgba(139,92,246,0.45)]">
                      <Bot className="h-4.5 w-4.5" />
                    </span>
                    <div className="rounded-2xl rounded-tl-md border border-[#8B5CF6]/25 bg-gradient-to-br from-[#8B5CF6]/12 to-[#3B82F6]/8 px-4 py-3">
                      <p className="text-[10px] font-bold tracking-[0.14em] text-[#C4B5FD] uppercase">GitLoop AI · Voice</p>
                      <p className="mt-1 text-[14.5px] leading-relaxed text-[#E2E8F0]">
                        Your <span className="font-semibold text-white">TruthGuard AI</span> project has pending backend tasks. Would you like me to explain them?
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-3.5 py-1.5 text-[12px] font-semibold text-white">Yes, explain →</span>
                        <span className="rounded-full border border-[#252D43] px-3.5 py-1.5 text-[12px] font-medium text-[#94A3B8]">Show tasks</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* mini waveform */}
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#252D43] bg-white/[0.02] px-4 py-3">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#A855F7]" />
                  <div className="flex h-8 flex-1 items-center gap-[2.5px]" aria-hidden>
                    {Array.from({ length: 42 }).map((_, i) => {
                      const h = 20 + Math.abs(Math.sin(i * 0.55)) * 70;
                      return (
                        <span
                          key={i}
                          className="wave-bar w-[2.5px] rounded-full bg-gradient-to-t from-[#8B5CF6] to-[#22D3EE]"
                          style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
                        />
                      );
                    })}
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-[#64748B]">0:07</span>
                </div>

                <Link
                  to="/signup"
                  className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-6 py-3 text-[14px] font-semibold text-white glow-btn transition-all duration-300 hover:brightness-110 hover:-translate-y-[2px]"
                >
                  Explore Voice Assistant
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
