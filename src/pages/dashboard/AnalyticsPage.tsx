import { useEffect, useMemo, useState } from "react";
import { BarChart3, FolderGit2, ListChecks, CheckCircle2, Zap } from "lucide-react";
import { EmptyState, LoadingBlock, ProgressBar, StatCard } from "../../components/dashboard/widgets";
import { useAuth } from "../../context/AuthContext";
import { DashboardAPI, type Overview, type ProjectProgress, type Task, type TechStat, type Activity } from "../../lib/dashboard";
import type { Repository } from "../../lib/auth";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [progress, setProgress] = useState<ProjectProgress[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tech, setTech] = useState<TechStat[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [ov, rs, pr, tk, tc, ac] = await Promise.all([
        DashboardAPI.overview(user.id),
        DashboardAPI.repositories(user.id),
        DashboardAPI.projectProgress(user.id),
        DashboardAPI.tasks(user.id),
        DashboardAPI.technologyStack(user.id),
        DashboardAPI.recentActivity(user.id, 30),
      ]);
      setOverview(ov);
      setRepos(rs);
      setProgress(pr);
      setTasks(tk);
      setTech(tc);
      setActivities(ac);
      setLoading(false);
    })();
  }, [user]);

  const completionRate = useMemo(() => {
    if (!overview || overview.totalTasks === 0) return null;
    return Math.round((overview.completedTasks / overview.totalTasks) * 100);
  }, [overview]);

  const byPriority = useMemo(() => ({
    high: tasks.filter((t) => t.priority === "high" && t.status !== "completed").length,
    medium: tasks.filter((t) => t.priority === "medium" && t.status !== "completed").length,
    low: tasks.filter((t) => t.priority === "low" && t.status !== "completed").length,
  }), [tasks]);

  const last7 = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        count: activities.filter((a) => new Date(a.createdAt).toDateString() === key).length,
      });
    }
    return days;
  }, [activities]);

  const maxBar = Math.max(...last7.map((d) => d.count), 1);

  if (loading) return <LoadingBlock label="Loading analytics…" />;

  const hasData = repos.length > 0 || tasks.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-extrabold tracking-tight">Project <span className="text-gradient">Analytics</span></h2>
        <p className="mt-1 text-[13.5px] text-[#94A3B8]">Every chart is computed from your real repositories and tracked tasks.</p>
      </div>

      {!hasData ? (
        <EmptyState icon={BarChart3} title="Not enough data yet" message="Select repositories and track tasks to unlock analytics. Charts are never fabricated." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={FolderGit2} label="Repositories" value={String(overview?.totalRepositories ?? 0)} sub="Selected" grad="from-[#8B5CF6] to-[#3B82F6]" glow="" />
            <StatCard icon={ListChecks} label="Total Tasks" value={String(overview?.totalTasks ?? 0)} sub={`${overview?.pendingTasks ?? 0} pending`} grad="from-[#3B82F6] to-[#22D3EE]" glow="" />
            <StatCard icon={CheckCircle2} label="Completion Rate" value={completionRate === null ? "—" : `${completionRate}%`} sub={completionRate === null ? "Add tasks to measure" : `${overview?.completedTasks ?? 0} completed`} grad="from-emerald-400 to-[#22D3EE]" glow="" />
            <StatCard icon={Zap} label="Activity (7d)" value={String(last7.reduce((s, d) => s + d.count, 0))} sub="Events logged" grad="from-[#FBBF24] to-[#8B5CF6]" glow="" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Task completion */}
            <section className="rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-5 backdrop-blur sm:p-6">
              <h3 className="text-[15px] font-bold text-white">Task completion by repository</h3>
              <p className="mt-1 text-[12.5px] text-[#94A3B8]">Computed from tracked tasks only.</p>
              {progress.length === 0 ? (
                <p className="mt-5 text-[13px] text-[#64748B]">No repositories selected.</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {progress.map((p) => (
                    <li key={p.repository.id}>
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="font-semibold text-white">{p.repository.name}</span>
                        <span className="text-[#94A3B8]">{p.progress === null ? "No data" : `${p.progress}% · ${p.completedTasks}/${p.totalTasks}`}</span>
                      </div>
                      {p.progress === null ? (
                        <p className="mt-1.5 text-[11.5px] italic text-[#64748B]">Not enough data yet</p>
                      ) : (
                        <ProgressBar value={p.progress} className="mt-1.5" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Pending by priority */}
            <section className="rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-5 backdrop-blur sm:p-6">
              <h3 className="text-[15px] font-bold text-white">Pending tasks by priority</h3>
              <p className="mt-1 text-[12.5px] text-[#94A3B8]">Where your unfinished work sits.</p>
              <div className="mt-5 space-y-4">
                {([
                  { label: "High", value: byPriority.high, color: "#F87171" },
                  { label: "Medium", value: byPriority.medium, color: "#FBBF24" },
                  { label: "Low", value: byPriority.low, color: "#22D3EE" },
                ]).map((row) => {
                  const total = Math.max(byPriority.high + byPriority.medium + byPriority.low, 1);
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="font-semibold text-white">{row.label}</span>
                        <span className="font-mono font-bold" style={{ color: row.color }}>{row.value}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(row.value / total) * 100}%`, background: row.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Activity bars */}
            <section className="rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-5 backdrop-blur sm:p-6">
              <h3 className="text-[15px] font-bold text-white">Activity — last 7 days</h3>
              <p className="mt-1 text-[12.5px] text-[#94A3B8]">GitHub updates + GitLoop actions.</p>
              <div className="mt-6 flex h-36 items-end gap-2.5">
                {last7.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#67E8F9]">{d.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#8B5CF6]/70 to-[#22D3EE]/80 transition-all duration-700"
                      style={{ height: `${Math.max(6, (d.count / maxBar) * 100)}%` }}
                      title={`${d.label}: ${d.count} events`}
                    />
                    <span className="text-[10.5px] text-[#64748B]">{d.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Tech distribution */}
            <section className="rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-5 backdrop-blur sm:p-6">
              <h3 className="text-[15px] font-bold text-white">Technology distribution</h3>
              <p className="mt-1 text-[12.5px] text-[#94A3B8]">Share of selected repositories using each technology.</p>
              {tech.length === 0 ? (
                <p className="mt-5 text-[13px] text-[#64748B]">No technology signal detected yet.</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {tech.slice(0, 6).map((t) => (
                    <li key={t.name}>
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="flex items-center gap-2 font-semibold text-white">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} /> {t.name}
                        </span>
                        <span className="font-mono font-bold text-[#67E8F9]">{t.percentage}%</span>
                      </div>
                      <ProgressBar value={t.percentage} className="mt-1.5" />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
