import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderGit2, Bot, ListChecks, PackageSearch, BarChart3,
  AudioWaveform, Settings, LifeBuoy, User, LogOut, Menu, X, Search,
  Bell, ChevronDown, ShieldCheck, CircleHelp, Sparkles,
} from "lucide-react";
import Logo from "../Logo";
import GithubIcon from "../GithubIcon";
import { useAuth } from "../../context/AuthContext";
import { DashboardAPI } from "../../lib/dashboard";
import type { Activity } from "../../lib/dashboard";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/repositories", label: "My Repositories", icon: FolderGit2 },
  { to: "/dashboard/analyzer", label: "AI Repository Analyzer", icon: Sparkles },
  { to: "/dashboard/assistant", label: "AI Project Assistant", icon: Bot },
  { to: "/dashboard/tasks", label: "Task Manager", icon: ListChecks },
  { to: "/dashboard/dependencies", label: "Dependency Analyzer", icon: PackageSearch },
  { to: "/dashboard/analytics", label: "Project Analytics", icon: BarChart3 },
  { to: "/dashboard/voice", label: "Voice Assistant", icon: AudioWaveform },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/repositories": "My Repositories",
  "/dashboard/analyzer": "AI Repository Analyzer",
  "/dashboard/assistant": "AI Project Assistant",
  "/dashboard/tasks": "Task Manager",
  "/dashboard/dependencies": "Dependency Analyzer",
  "/dashboard/analytics": "Project Analytics",
  "/dashboard/voice": "Voice Assistant",
  "/dashboard/settings": "Settings",
};

export default function DashboardLayout() {
  const { user, githubUsername, githubConnected, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const title = TITLES[location.pathname] ?? "Dashboard";

  useEffect(() => {
    if (!user) return;
    DashboardAPI.recentActivity(user.id, 5).then(setActivities).catch(() => setActivities([]));
  }, [user, location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/dashboard/repositories?q=${encodeURIComponent(search.trim())}`);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="border-b border-[#252D43]/70 px-5 py-5">
        <Link to="/" className="flex items-center gap-3">
          <Logo size={36} />
          <span className="leading-tight">
            <span className="block text-[17px] font-extrabold tracking-tight">
              Git<span className="text-gradient">Loop</span>
            </span>
            <span className="block text-[10px] font-medium tracking-wide text-[#64748B]">Your AI Developer Companion</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
        <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-[#475569] uppercase">Workspace</p>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[#8B5CF6]/25 to-[#3B82F6]/12 text-white border border-[#8B5CF6]/35 shadow-[0_0_20px_rgba(139,92,246,0.18)]"
                  : "text-[#94A3B8] border border-transparent hover:bg-white/[0.04] hover:text-white"
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}

        <p className="px-3 pb-2 pt-5 text-[10px] font-bold tracking-[0.18em] text-[#475569] uppercase">Account</p>
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-[#8B5CF6]/25 to-[#3B82F6]/12 text-white border border-[#8B5CF6]/35 shadow-[0_0_20px_rgba(139,92,246,0.18)]"
                : "text-[#94A3B8] border border-transparent hover:bg-white/[0.04] hover:text-white"
            }`
          }
        >
          <Settings className="h-4.5 w-4.5 shrink-0" /> Settings
        </NavLink>
        <NavLink
          to="/dashboard/settings"
          className="flex items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-[13.5px] font-medium text-[#94A3B8] transition-all duration-300 hover:bg-white/[0.04] hover:text-white"
        >
          <CircleHelp className="h-4.5 w-4.5 shrink-0" /> Help &amp; Support
        </NavLink>
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#252D43]/70 p-3">
        <div className="flex items-center gap-3 rounded-xl border border-[#252D43] bg-white/[0.02] px-3 py-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-[13px] font-extrabold text-white">
            {user?.fullName?.[0]?.toUpperCase() ?? "?"}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13px] font-semibold text-white">{user?.fullName}</span>
            <span className="block truncate text-[11px] text-[#64748B]">{githubConnected ? `@${githubUsername}` : user?.email}</span>
          </span>
          <button
            onClick={handleLogout}
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#252D43] text-[#94A3B8] transition-colors hover:border-[#F87171]/40 hover:text-white"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 flex items-center gap-1.5 px-1 text-[10.5px] text-[#475569]">
          <ShieldCheck className="h-3 w-3 text-[#22D3EE]" /> Session secured · Data isolated to your account
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05060A] text-[#F8FAFC]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-[#252D43]/80 bg-[#090D18] lg:block" aria-label="Sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "" : "pointer-events-none"}`} aria-hidden={!sidebarOpen}>
        <div
          className={`absolute inset-0 bg-[#05060A]/70 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[280px] border-r border-[#252D43] bg-[#090D18] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          aria-label="Mobile navigation"
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[#252D43] text-[#94A3B8] hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
          {sidebarContent}
        </aside>
      </div>

      {/* Main column */}
      <div className="lg:pl-[260px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-[#252D43]/80 bg-[#05060A]/85 backdrop-blur-xl">
          <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#252D43] bg-white/[0.03] text-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="hidden text-[16px] font-bold tracking-tight sm:block">{title}</h1>

            {/* Search */}
            <form onSubmit={submitSearch} className="mx-auto hidden w-full max-w-md md:block" role="search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search repositories, projects, or tasks..."
                  className="w-full rounded-full border border-[#252D43] bg-white/[0.03] py-2.5 pl-11 pr-4 text-[13px] text-white placeholder:text-[#64748B] outline-none transition-all focus:border-[#8B5CF6]/55 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]"
                  aria-label="Search repositories, projects, or tasks"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-2.5 md:ml-0">
              {/* GitHub status */}
              <span
                className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold sm:inline-flex ${
                  githubConnected
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FCD34D]"
                }`}
                title={githubConnected ? `Connected as @${githubUsername}` : "GitHub not connected"}
              >
                <GithubIcon className="h-3.5 w-3.5" />
                {githubConnected ? `@${githubUsername}` : "Not connected"}
              </span>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#252D43] bg-white/[0.03] text-[#94A3B8] transition-colors hover:text-white"
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                >
                  <Bell className="h-4.5 w-4.5" />
                  {activities.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-1 text-[9px] font-extrabold text-white">
                      {activities.length}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-[320px] overflow-hidden rounded-2xl border border-[#252D43] bg-[#0B1020] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
                    <p className="border-b border-[#252D43]/70 px-4 py-3 text-[12px] font-bold tracking-wide text-white uppercase">Recent activity</p>
                    {activities.length === 0 ? (
                      <p className="px-4 py-6 text-center text-[12.5px] text-[#64748B]">No activity yet.</p>
                    ) : (
                      <ul className="max-h-[300px] divide-y divide-[#252D43]/60 overflow-y-auto">
                        {activities.map((a) => (
                          <li key={a.id} className="px-4 py-3">
                            <p className="text-[12.5px] leading-snug text-[#E2E8F0]">{a.description}</p>
                            <p className="mt-1 text-[11px] text-[#64748B]">
                              {a.source === "github" ? "GitHub" : "GitLoop"} · {new Date(a.createdAt).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 rounded-full border border-[#252D43] bg-white/[0.03] py-1.5 pl-1.5 pr-3 transition-colors hover:border-[#8B5CF6]/40"
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-[12px] font-extrabold text-white">
                    {user?.fullName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-[12.5px] font-semibold text-white">{user?.fullName}</span>
                    <span className="block text-[10.5px] text-[#64748B]">{user?.email}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#64748B] transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 w-[240px] overflow-hidden rounded-2xl border border-[#252D43] bg-[#0B1020] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
                    <div className="border-b border-[#252D43]/70 px-4 py-3">
                      <p className="text-[13px] font-bold text-white">{user?.fullName}</p>
                      <p className="truncate text-[11.5px] text-[#64748B]">{user?.email}</p>
                      {githubUsername && <p className="mt-1 text-[11.5px] text-[#67E8F9]">GitHub: @{githubUsername}</p>}
                    </div>
                    <nav className="p-2" aria-label="Profile">
                      <Link to="/dashboard/settings" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-[#CBD5E1] hover:bg-white/[0.04] hover:text-white">
                        <User className="h-4 w-4 text-[#94A3B8]" /> My Profile
                      </Link>
                      <Link to="/dashboard/settings" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-[#CBD5E1] hover:bg-white/[0.04] hover:text-white">
                        <Settings className="h-4 w-4 text-[#94A3B8]" /> Account Settings
                      </Link>
                      <Link to="/connect-github" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-[#CBD5E1] hover:bg-white/[0.04] hover:text-white">
                        <GithubIcon className="h-4 w-4 text-[#94A3B8]" /> GitHub Connection
                      </Link>
                      <Link to="/dashboard/settings" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-[#CBD5E1] hover:bg-white/[0.04] hover:text-white">
                        <LifeBuoy className="h-4 w-4 text-[#94A3B8]" /> Help &amp; Support
                      </Link>
                      <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#FCA5A5] hover:bg-[#F87171]/10">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="relative px-4 py-6 sm:px-6 sm:py-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute -top-24 right-0 h-[320px] w-[420px] rounded-full bg-[#8B5CF6]/[0.06] blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
