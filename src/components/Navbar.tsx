import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const links = [
  { label: "Home", hash: "#home" },
  { label: "Features", hash: "#features" },
  { label: "How It Works", hash: "#how-it-works" },
  { label: "About", hash: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Home");
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;
    const sections = ["home", "features", "how-it-works", "about"];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const link = links.find((l) => l.hash === `#${e.target.id}`);
            if (link) setActive(link.label);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#05060A]/85 backdrop-blur-xl border-b border-[#8B5CF6]/20 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b border-[#8B5CF6]/10"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-[72px] items-center justify-between gap-4">
          {/* Left */}
          <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="GitLoop home">
            <Logo size={38} />
            <span className="text-[19px] font-extrabold tracking-tight text-[#F8FAFC]">
              Git<span className="text-gradient">Loop</span>
            </span>
            <span className="hidden sm:inline-flex ml-1 items-center gap-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#C4B5FD]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
              AI BETA
            </span>
          </Link>

          {/* Center */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {links.map((l) => (
              <Link
                key={l.label}
                to={{ pathname: "/", hash: l.hash }}
                onClick={() => setActive(l.label)}
                className={`relative rounded-full px-4 py-2 text-[13.5px] font-medium transition-all duration-300 ${
                  active === l.label
                    ? "text-white bg-white/[0.06] border border-[#8B5CF6]/25"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {l.label}
                {active === l.label && (
                  <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full bg-gradient-to-r from-[#A855F7] to-[#22D3EE] shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {user ? (
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-2.5 text-[13.5px] font-semibold text-white glow-btn transition-all duration-300 hover:brightness-110 hover:-translate-y-[1px]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-extrabold">
                  {user.fullName[0]?.toUpperCase() ?? "?"}
                </span>
                Dashboard
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-[#252D43] bg-white/[0.03] px-5 py-2.5 text-[13.5px] font-semibold text-[#E2E8F0] transition-all duration-300 hover:border-[#8B5CF6]/50 hover:text-white hover:bg-[#8B5CF6]/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.18)]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-2.5 text-[13.5px] font-semibold text-white glow-btn transition-all duration-300 hover:brightness-110 hover:-translate-y-[1px]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#252D43] bg-white/[0.03] text-white"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-[#252D43]/70 bg-[#05060A]/95 backdrop-blur-xl px-5 py-5 space-y-1">
          {links.map((l) => (
            <Link
              key={l.label}
              to={{ pathname: "/", hash: l.hash }}
              onClick={() => { setActive(l.label); setOpen(false); }}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${
                active === l.label
                  ? "bg-[#8B5CF6]/12 text-white border border-[#8B5CF6]/25"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {l.label}
              <ArrowRight className="h-4 w-4 opacity-50" />
            </Link>
          ))}
          <div className="flex gap-3 pt-4">
            {user ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="flex-1 text-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-3 text-sm font-semibold text-white glow-btn">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center rounded-full border border-[#252D43] px-5 py-3 text-sm font-semibold text-white">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 text-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-3 text-sm font-semibold text-white glow-btn">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
