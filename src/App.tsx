import { useEffect, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ConnectGithubPage from "./pages/ConnectGithubPage";
import SelectRepositoriesPage from "./pages/SelectRepositoriesPage";
import GithubCallbackPage from "./pages/GithubCallbackPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import RepositoriesPage from "./pages/dashboard/RepositoriesPage";
import AssistantPage from "./pages/dashboard/AssistantPage";
import TasksPage from "./pages/dashboard/TasksPage";
import DependenciesPage from "./pages/dashboard/DependenciesPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import VoicePage from "./pages/dashboard/VoicePage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import Logo from "./components/Logo";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05060A] text-[#F8FAFC]">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8B5CF6]/40 bg-[#0B1020] shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <Logo size={38} />
        </div>
        <Loader2 className="mx-auto mt-5 h-6 w-6 animate-spin text-[#A855F7]" />
        <p className="mt-3 text-[13px] text-[#94A3B8]">Loading GitLoop…</p>
      </div>
    </div>
  );
}

/** Requires an authenticated session. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/** Requires auth + connected GitHub (onboarding gate). */
function RequireGithub({ children }: { children: ReactNode }) {
  const { user, loading, githubConnected } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!githubConnected) return <Navigate to="/connect-github" replace />;
  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05060A] px-5 text-center text-[#F8FAFC]">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8B5CF6]/40 bg-[#0B1020]">
          <Logo size={38} />
        </div>
        <h1 className="mt-5 text-[28px] font-extrabold">404 — Page not found</h1>
        <p className="mt-2 text-[14px] text-[#94A3B8]">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-6 py-3 text-[14px] font-semibold text-white glow-btn">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollManager />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/github/callback" element={<GithubCallbackPage />} />
          <Route
            path="/connect-github"
            element={
              <RequireAuth>
                <ConnectGithubPage />
              </RequireAuth>
            }
          />
          <Route
            path="/select-repositories"
            element={
              <RequireGithub>
                <SelectRepositoriesPage />
              </RequireGithub>
            }
          />
          {/* Authenticated dashboard with sidebar layout */}
          <Route
            path="/dashboard"
            element={
              <RequireGithub>
                <DashboardLayout />
              </RequireGithub>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="repositories" element={<RepositoriesPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="dependencies" element={<DependenciesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="voice" element={<VoicePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
