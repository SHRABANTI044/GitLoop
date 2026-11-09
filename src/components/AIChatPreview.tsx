import { useEffect, useRef, useState } from "react";
import { Bot, Mic, Send, ChevronDown, ShieldCheck, Sparkles, User, Paperclip, Zap } from "lucide-react";
import Reveal from "./Reveal";

type Msg = { role: "user" | "ai"; text: string };

const script: Msg[] = [
  { role: "user", text: "Explain how my backend works." },
  { role: "ai", text: "Your project uses Node.js and Express.js for backend APIs and communicates with a Python machine learning service for fake-news classification." },
  { role: "user", text: "What should I implement next?" },
  { role: "ai", text: "I recommend improving backend error handling, adding API tests, and updating your project documentation." },
];

function useTypewriter() {
  const [visible, setVisible] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    let idx = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const step = () => {
      if (cancelled || idx >= script.length) return;
      const msg = script[idx];
      if (msg.role === "ai") {
        setTyping(true);
        timers.push(setTimeout(() => {
          if (cancelled) return;
          setTyping(false);
          setVisible((v) => [...v, msg]);
          idx++;
          timers.push(setTimeout(step, 700));
        }, 1100));
      } else {
        timers.push(setTimeout(() => {
          if (cancelled) return;
          setVisible((v) => [...v, msg]);
          idx++;
          timers.push(setTimeout(step, 600));
        }, 500));
      }
    };
    timers.push(setTimeout(step, 400));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [started]);

  return { visible, typing, ref };
}

export default function AIChatPreview() {
  const { visible, typing, ref } = useTypewriter();

  return (
    <section className="relative overflow-hidden bg-[#05060A]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-[-160px] top-[10%] h-[460px] w-[460px] rounded-full bg-[#8B5CF6]/[0.10] blur-[120px]" />
        <div className="absolute right-[-160px] bottom-[5%] h-[460px] w-[460px] rounded-full bg-[#22D3EE]/[0.07] blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-35 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* Copy */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-[#DDD6FE] uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#A855F7]" />
                AI Assistant
              </span>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="mt-5 text-[32px] font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-[40px]">
                Your Entire Project, <span className="text-gradient">Just One Question Away.</span>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-[#94A3B8]">
                Stop searching through hundreds of files. Start having intelligent conversations with your codebase.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <ul className="mt-7 space-y-3.5">
                {[
                  { t: "Repository-aware answers", d: "Every response is grounded in your actual code, not generic guesses." },
                  { t: "Architecture explanations", d: "Ask how frontend, backend, and databases connect — get clear breakdowns." },
                  { t: "Actionable next steps", d: "Turn questions into prioritized tasks you can implement today." },
                ].map((f) => (
                  <li key={f.t} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/12 text-[#A855F7]">
                      <Zap className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[14.5px] font-semibold text-white">{f.t}</p>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed text-[#94A3B8]">{f.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={4}>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-[#67E8F9] uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                Repository-Aware AI
              </div>
            </Reveal>
          </div>

          {/* Chat panel */}
          <Reveal delay={2}>
            <div className="relative">
              <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-br from-[#8B5CF6]/20 via-transparent to-[#22D3EE]/12 blur-2xl" aria-hidden />
              <div className="absolute -inset-px rounded-[26px] bg-gradient-to-br from-[#8B5CF6]/45 via-[#252D43] to-[#22D3EE]/30" aria-hidden />
              <div ref={ref} className="relative overflow-hidden rounded-[25px] border border-[#252D43] bg-[#0B1020]/95 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                {/* header */}
                <div className="flex items-center gap-3 border-b border-[#252D43]/80 bg-[#090D18]/90 px-5 py-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_20px_rgba(139,92,246,0.45)]">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[14px] font-bold text-white">GitLoop AI Assistant</p>
                    <p className="flex items-center gap-1.5 text-[11.5px] text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                      Online · context loaded
                    </p>
                  </div>
                  <button className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#252D43] bg-white/[0.03] px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:border-[#8B5CF6]/40">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] text-[10px] font-extrabold">T</span>
                    TruthGuard AI
                    <ChevronDown className="h-3.5 w-3.5 text-[#94A3B8]" />
                  </button>
                </div>

                {/* context bar */}
                <div className="flex items-center gap-2 border-b border-[#252D43]/60 bg-[#8B5CF6]/[0.06] px-5 py-2.5 text-[11.5px] text-[#94A3B8]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#A855F7]" />
                  <span>Context: <span className="font-semibold text-white">TruthGuard AI</span> · 142 files indexed · 12k LOC</span>
                  <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#252D43] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-[#CBD5E1]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE]" /> 98% relevance
                  </span>
                </div>

                {/* messages */}
                <div className="min-h-[320px] space-y-4 px-5 py-6">
                  {visible.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-[#3B82F6] to-[#22D3EE]"
                          : "bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] shadow-[0_0_14px_rgba(139,92,246,0.4)]"
                      }`}>
                        {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </span>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${
                        m.role === "user"
                          ? "rounded-br-md bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_6px_20px_rgba(139,92,246,0.3)]"
                          : "rounded-bl-md border border-[#252D43] bg-white/[0.04] text-[#E2E8F0]"
                      }`}>
                        {m.text}
                        {m.role === "ai" && i === visible.length - 1 && (
                          <span className="mt-2 flex flex-wrap gap-1.5">
                            <span className="rounded-md border border-[#252D43] bg-white/[0.04] px-2 py-1 text-[10.5px] text-[#94A3B8] font-mono">server.js</span>
                            <span className="rounded-md border border-[#252D43] bg-white/[0.04] px-2 py-1 text-[10.5px] text-[#94A3B8] font-mono">ml_service.py</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {typing && (
                    <div className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white">
                        <Bot className="h-4 w-4" />
                      </span>
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#252D43] bg-white/[0.04] px-4 py-3.5">
                        <span className="typing-dot h-2 w-2 rounded-full bg-[#A855F7]" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-[#3B82F6]" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-[#22D3EE]" />
                      </div>
                    </div>
                  )}

                  {visible.length === 0 && !typing && (
                    <div className="flex h-[280px] flex-col items-center justify-center text-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#A855F7]">
                        <Sparkles className="h-6 w-6" />
                      </span>
                      <p className="mt-4 text-[14px] font-semibold text-white">Ask anything about TruthGuard AI</p>
                      <p className="mt-1 max-w-[280px] text-[12.5px] text-[#64748B]">Try “Explain how my backend works” or “What should I implement next?”</p>
                    </div>
                  )}
                </div>

                {/* input */}
                <div className="border-t border-[#252D43]/80 bg-[#090D18]/80 px-5 py-4">
                  <div className="flex items-center gap-2 rounded-full border border-[#252D43] bg-white/[0.03] py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-[#8B5CF6]/50">
                    <Paperclip className="h-4 w-4 shrink-0 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Ask about your codebase…"
                      className="min-w-0 flex-1 bg-transparent text-[13.5px] text-white placeholder:text-[#64748B] outline-none"
                      aria-label="Ask about your codebase"
                    />
                    <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#252D43] text-[#94A3B8] transition-colors hover:border-[#8B5CF6]/40 hover:text-white" aria-label="Voice input">
                      <Mic className="h-4 w-4" />
                    </button>
                    <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-transform hover:scale-105" aria-label="Send message">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2.5 text-center text-[10.5px] text-[#475569]">Illustrative conversation · GitLoop answers are grounded in your repository context.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
