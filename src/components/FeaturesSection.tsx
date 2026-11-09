import {
  BrainCircuit, GitBranch, MessageSquare, ListChecks, Lightbulb,
  PackageSearch, Brain, AudioWaveform, ArrowUpRight
} from "lucide-react";
import Reveal from "./Reveal";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Project Understanding",
    desc: "Understand project architecture, frontend, backend, databases, and important source files through AI-generated explanations.",
    accent: "from-[#8B5CF6] to-[#3B82F6]",
    glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]",
  },
  {
    icon: GitBranch,
    title: "Smart Repository Analysis",
    desc: "Connect GitHub repositories and analyze README files, source code, folder structures, dependencies, and commit history.",
    accent: "from-[#3B82F6] to-[#22D3EE]",
    glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]",
  },
  {
    icon: MessageSquare,
    title: "AI Developer Assistant",
    desc: "Ask natural-language questions about your repositories and receive intelligent, context-aware answers.",
    accent: "from-[#A855F7] to-[#8B5CF6]",
    glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]",
  },
  {
    icon: ListChecks,
    title: "Unfinished Task Detection",
    desc: "Discover TODO comments, open issues, incomplete documentation, and pending development tasks.",
    accent: "from-[#F59E0B] to-[#8B5CF6]",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
  },
  {
    icon: Lightbulb,
    title: "Next-Step Recommendations",
    desc: "Get intelligent suggestions about what to implement, improve, or fix next in your projects.",
    accent: "from-[#22D3EE] to-[#8B5CF6]",
    glow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.22)]",
  },
  {
    icon: PackageSearch,
    title: "Dependency Analyzer",
    desc: "Analyze project dependencies, identify missing packages, detect version conflicts, and review security warnings.",
    accent: "from-[#8B5CF6] to-[#22D3EE]",
    glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]",
  },
  {
    icon: Brain,
    title: "Persistent Project Memory",
    desc: "Remember important project summaries, technical decisions, development notes, and unfinished tasks.",
    accent: "from-[#3B82F6] to-[#A855F7]",
    glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]",
  },
  {
    icon: AudioWaveform,
    title: "Voice Assistant",
    desc: "Interact with your development workspace using a conversational, Alexa-inspired voice experience.",
    accent: "from-[#A855F7] to-[#22D3EE]",
    glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden bg-[#05060A]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-[-180px] top-[20%] h-[480px] w-[480px] rounded-full bg-[#8B5CF6]/[0.09] blur-[120px]" />
        <div className="absolute right-[-180px] top-[55%] h-[480px] w-[480px] rounded-full bg-[#3B82F6]/[0.08] blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_30%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-[#DDD6FE] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]" />
              Features
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="mt-5 text-[32px] font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-[42px]">
              Everything Your Developer Workflow <span className="text-gradient">Needs.</span>
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="mx-auto mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#94A3B8]">
              Understand, organize, analyze, and improve every project with one intelligent AI companion.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <article className={`card-hover group relative h-full overflow-hidden rounded-3xl border border-[#252D43] bg-[#10182A]/80 p-6 backdrop-blur ${f.glow}`}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                <div className="flex items-start justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.accent} text-white shadow-[0_8px_24px_rgba(139,92,246,0.28)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                    <f.icon className="h-6 w-6" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#475569] transition-all duration-300 group-hover:text-[#A855F7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-5 text-[16px] font-bold leading-snug text-white">{f.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#94A3B8]">{f.desc}</p>
                <div className="mt-5 flex items-center gap-1.5">
                  <span className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${f.accent}`} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#252D43]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#252D43]" />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
