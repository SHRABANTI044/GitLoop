import { BrainCircuit, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";
import GithubIcon from "./GithubIcon";

const steps = [
  {
    num: "01",
    title: "Connect GitHub",
    desc: "Securely connect your GitHub account and select the repositories you want GitLoop to understand.",
    icon: GithubIcon,
    isGithub: true,
    accent: "from-[#8B5CF6] to-[#3B82F6]",
    ring: "border-[#8B5CF6]/40 shadow-[0_0_36px_rgba(139,92,246,0.25)]",
    bullets: ["OAuth secure login", "Pick repos you own"],
  },
  {
    num: "02",
    title: "Let AI Understand",
    desc: "GitLoop analyzes your permitted repository information, code structure, documentation, and project history.",
    icon: BrainCircuit,
    isGithub: false,
    accent: "from-[#3B82F6] to-[#22D3EE]",
    ring: "border-[#3B82F6]/40 shadow-[0_0_36px_rgba(59,130,246,0.25)]",
    bullets: ["Architecture mapping", "Dependency scan"],
  },
  {
    num: "03",
    title: "Ask, Explore and Build",
    desc: "Ask questions, discover unfinished work, and receive intelligent next-step recommendations.",
    icon: MessageSquare,
    isGithub: false,
    accent: "from-[#A855F7] to-[#22D3EE]",
    ring: "border-[#22D3EE]/40 shadow-[0_0_36px_rgba(34,211,238,0.22)]",
    bullets: ["Chat + voice", "Smart next steps"],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-[#090D18]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[360px] w-[820px] -translate-x-1/2 rounded-full bg-[#8B5CF6]/[0.08] blur-[110px]" />
        <div className="absolute inset-0 bg-grid-fine opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-[#67E8F9] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
              How It Works
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="mt-5 text-[32px] font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-[42px]">
              From Repository to Understanding in <span className="text-gradient">Three Simple Steps.</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="mx-auto mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#94A3B8]">
              No setup headaches. No manual documentation. Just connect, understand, and build — in minutes.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-14">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden lg:block" aria-hidden>
            <div className="mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent" />
            <div className="mx-auto mt-[-1px] h-px max-w-4xl bg-gradient-to-r from-transparent via-[#22D3EE]/30 to-transparent blur-[1px]" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={(i) as 0 | 1 | 2}>
                <article className="card-hover relative h-full rounded-[28px] border border-[#252D43] bg-[#10182A]/80 p-7 text-center backdrop-blur">
                  <span className="absolute right-5 top-5 font-mono text-[13px] font-bold text-[#475569]">{s.num}</span>

                  <div className="relative mx-auto flex h-[104px] w-[104px] items-center justify-center">
                    <span className="absolute inset-0 rounded-full border border-dashed border-[#252D43] animate-[spin_24s_linear_infinite]" aria-hidden />
                    <span className="absolute inset-2 rounded-full border border-[#252D43]/60" aria-hidden />
                    <span className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-full border bg-[#0B1020] ${s.ring}`}>
                      {s.isGithub ? (
                        <GithubIcon className="h-8 w-8 text-white" />
                      ) : (
                        <s.icon className="h-8 w-8 text-white" />
                      )}
                    </span>
                    {i === 1 && (
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#22D3EE] to-[#3B82F6] text-white shadow-[0_0_14px_rgba(34,211,238,0.5)]">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      </span>
                    )}
                  </div>

                  <h3 className="mt-6 text-[18px] font-bold text-white">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-[300px] text-[13.5px] leading-relaxed text-[#94A3B8]">{s.desc}</p>

                  <div className="mt-5 space-y-2">
                    {s.bullets.map((b) => (
                      <div key={b} className="inline-flex items-center gap-2 rounded-full border border-[#252D43] bg-white/[0.03] px-3 py-1.5 text-[11.5px] font-medium text-[#CBD5E1] mr-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#22D3EE]" />
                        {b}
                      </div>
                    ))}
                  </div>

                  <div className={`mx-auto mt-6 h-1 w-16 rounded-full bg-gradient-to-r ${s.accent}`} />
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={2}>
          <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-[#252D43] bg-white/[0.02] px-5 py-3.5 text-center">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#22D3EE]" />
            <p className="text-[13px] leading-relaxed text-[#94A3B8]">
              <span className="font-semibold text-white">Private by design.</span> GitLoop only analyzes repositories you explicitly permit — your code stays yours.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
