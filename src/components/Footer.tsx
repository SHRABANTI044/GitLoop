import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import Logo from "./Logo";
import GithubIcon from "./GithubIcon";

const columns: { title: string; links: { label: string; to: string | { pathname: string; hash: string } }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", to: { pathname: "/", hash: "#features" } },
      { label: "AI Assistant", to: { pathname: "/", hash: "#features" } },
      { label: "GitHub Integration", to: "/connect-github" },
      { label: "Voice Assistant", to: { pathname: "/", hash: "#features" } },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How It Works", to: { pathname: "/", hash: "#how-it-works" } },
      { label: "About", to: { pathname: "/", hash: "#about" } },
      { label: "Documentation", to: { pathname: "/", hash: "#home" } },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", to: "/signup" },
      { label: "Contact", to: "/login" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[#252D43]/80 bg-[#05060A]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent" aria-hidden />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <Logo size={38} />
              <span className="text-[19px] font-extrabold tracking-tight text-[#F8FAFC]">
                Git<span className="text-gradient">Loop</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-[#94A3B8]">
              Your personal AI developer companion. Understand your code, remember your projects, and build smarter.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <Link
                to="/signup"
                aria-label="GitLoop on GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#252D43] bg-white/[0.03] text-[#94A3B8] transition-all duration-300 hover:border-[#8B5CF6]/50 hover:text-white hover:shadow-[0_0_16px_rgba(139,92,246,0.2)]"
              >
                <GithubIcon className="h-4.5 w-4.5" />
              </Link>
              <Link
                to="/login"
                aria-label="Contact GitLoop"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#252D43] bg-white/[0.03] text-[#94A3B8] transition-all duration-300 hover:border-[#22D3EE]/50 hover:text-white hover:shadow-[0_0_16px_rgba(34,211,238,0.2)]"
              >
                <Mail className="h-4.5 w-4.5" />
              </Link>
              <span className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                All systems operational
              </span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-[11px] font-bold tracking-[0.18em] text-[#64748B] uppercase">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-1 text-[13.5px] text-[#94A3B8] transition-colors duration-300 hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-[#A855F7]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#252D43]/70 pt-7 sm:flex-row">
          <p className="text-[12.5px] text-[#64748B]">© 2026 GitLoop. Built for developers.</p>
          <p className="flex items-center gap-2 text-[12px] text-[#475569]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]" />
            Your Code. Your Context. Your AI Companion.
            <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
          </p>
        </div>
      </div>
    </footer>
  );
}
