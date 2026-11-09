import { useEffect, useMemo, useState } from "react";
import { Plus, CheckCircle2, Pencil, Trash2, X, ChevronDown, CalendarClock, ListChecks, CircleDot, Loader2 } from "lucide-react";
import { EmptyState, LoadingBlock, PriorityBadge } from "../../components/dashboard/widgets";
import { useAuth } from "../../context/AuthContext";
import { DashboardAPI, type Task, type TaskPriority, type TaskStatus } from "../../lib/dashboard";
import type { Repository } from "../../lib/auth";

const COLUMNS: { key: TaskStatus; label: string; accent: string }[] = [
  { key: "todo", label: "To Do", accent: "text-[#94A3B8]" },
  { key: "in-progress", label: "In Progress", accent: "text-[#C4B5FD]" },
  { key: "completed", label: "Completed", accent: "text-emerald-300" },
];

export default function TasksPage() {
  const { user } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ title: string; repositoryId: string; priority: TaskPriority; dueDate: string; description: string }>({
    title: "", repositoryId: "", priority: "medium", dueDate: "", description: "",
  });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const [rs, tk] = await Promise.all([DashboardAPI.repositories(user.id), DashboardAPI.tasks(user.id)]);
    setRepos(rs);
    setTasks(tk);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const counts = useMemo(() => ({
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }), [tasks]);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", repositoryId: "", priority: "medium", dueDate: "", description: "" });
    setError(null);
    setFormOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({
      title: t.title,
      repositoryId: t.repositoryId ?? "",
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
      description: t.description ?? "",
    });
    setError(null);
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await DashboardAPI.updateTask(user.id, editing.id, {
          title: form.title,
          repositoryId: form.repositoryId || null,
          priority: form.priority,
          dueDate: form.dueDate || null,
        });
      } else {
        await DashboardAPI.createTask(user.id, {
          title: form.title,
          repositoryId: form.repositoryId || null,
          priority: form.priority,
          dueDate: form.dueDate || null,
          description: form.description || null,
        });
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save task.");
    } finally {
      setSaving(false);
    }
  };

  const cycleStatus = async (t: Task) => {
    if (!user) return;
    const next: TaskStatus = t.status === "todo" ? "in-progress" : t.status === "in-progress" ? "completed" : "todo";
    await DashboardAPI.updateTask(user.id, t.id, { status: next });
    await load();
  };

  const remove = async (t: Task) => {
    if (!user) return;
    if (!window.confirm(`Delete task “${t.title}”?`)) return;
    await DashboardAPI.deleteTask(user.id, t.id);
    await load();
  };

  if (loading) return <LoadingBlock label="Loading tasks…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-extrabold tracking-tight">Task <span className="text-gradient">Manager</span></h2>
          <p className="mt-1 text-[13.5px] text-[#94A3B8]">
            {counts.todo} to do · {counts["in-progress"]} in progress · {counts.completed} completed. Tasks are stored per account and linked to repositories.
          </p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-3 text-[13.5px] font-semibold text-white glow-btn transition-all hover:brightness-110">
          <Plus className="h-4.5 w-4.5" /> Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          message="Create your first task to start tracking progress. Progress percentages are calculated from your tasks — never guessed."
          action={<button onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-2.5 text-[13px] font-semibold text-white glow-btn"><Plus className="h-4 w-4" /> Add your first task</button>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <section key={col.key} className="rounded-[22px] border border-[#252D43] bg-[#10182A]/80 p-4 backdrop-blur">
                <header className="flex items-center justify-between px-1 pb-3">
                  <h3 className={`flex items-center gap-2 text-[13px] font-bold tracking-wide uppercase ${col.accent}`}>
                    <CircleDot className="h-4 w-4" /> {col.label}
                  </h3>
                  <span className="rounded-full border border-[#252D43] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-bold text-[#94A3B8]">{colTasks.length}</span>
                </header>
                <ul className="space-y-3">
                  {colTasks.length === 0 && (
                    <li className="rounded-xl border border-dashed border-[#252D43] px-4 py-6 text-center text-[12px] text-[#64748B]">No tasks here.</li>
                  )}
                  {colTasks.map((t) => {
                    const repo = t.repositoryId ? repos.find((r) => r.id === t.repositoryId) : null;
                    return (
                      <li key={t.id} className="card-hover rounded-2xl border border-[#252D43] bg-[#151D32]/70 p-4">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => cycleStatus(t)}
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                              t.status === "completed"
                                ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
                                : "border-[#252D43] text-transparent hover:border-emerald-400/60 hover:text-emerald-400"
                            }`}
                            aria-label={t.status === "completed" ? "Reopen task" : "Complete task"}
                            title={t.status === "completed" ? "Reopen" : "Mark complete"}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <p className={`min-w-0 flex-1 text-[13.5px] font-semibold leading-snug ${t.status === "completed" ? "text-[#64748B] line-through" : "text-white"}`}>{t.title}</p>
                          <div className="flex shrink-0 gap-1">
                            <button onClick={() => openEdit(t)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#252D43] text-[#94A3B8] transition-colors hover:border-[#8B5CF6]/45 hover:text-white" aria-label={`Edit ${t.title}`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => remove(t)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#252D43] text-[#94A3B8] transition-colors hover:border-[#F87171]/45 hover:text-[#FCA5A5]" aria-label={`Delete ${t.title}`}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {t.description && <p className="mt-2 text-[12px] leading-relaxed text-[#94A3B8]">{t.description}</p>}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <PriorityBadge priority={t.priority} />
                          {repo && <span className="rounded-md border border-[#252D43] bg-white/[0.03] px-2 py-0.5 font-mono text-[10.5px] text-[#67E8F9]">{repo.name}</span>}
                          {t.dueDate && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B]">
                              <CalendarClock className="h-3 w-3" /> {new Date(t.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={editing ? "Edit task" : "Add task"}>
          <div className="absolute inset-0 bg-[#05060A]/85 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <form onSubmit={save} className="relative w-full max-w-lg rounded-t-[24px] border border-[#252D43] bg-[#0B1020] p-6 shadow-[0_40px_100px_rgba(0,0,0,0.7)] sm:rounded-[24px]">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-extrabold text-white">{editing ? "Edit Task" : "Add Task"}</h3>
              <button type="button" onClick={() => setFormOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#252D43] text-[#94A3B8] hover:text-white" aria-label="Close">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {error && <p className="mt-4 rounded-xl border border-[#F87171]/35 bg-[#F87171]/10 px-4 py-3 text-[12.5px] text-[#FCA5A5]" role="alert">{error}</p>}

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="task-title" className="mb-1.5 block text-[12.5px] font-semibold text-[#CBD5E1]">Task title</label>
                <input
                  id="task-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Add API tests for /predict"
                  className="w-full rounded-xl border border-[#252D43] bg-[#090D18]/80 px-4 py-3 text-[14px] text-white placeholder:text-[#64748B] outline-none transition-all focus:border-[#8B5CF6]/60"
                  required
                />
              </div>
              <div>
                <label htmlFor="task-desc" className="mb-1.5 block text-[12.5px] font-semibold text-[#CBD5E1]">Description (optional)</label>
                <textarea
                  id="task-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What needs to be done?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#252D43] bg-[#090D18]/80 px-4 py-3 text-[14px] text-white placeholder:text-[#64748B] outline-none transition-all focus:border-[#8B5CF6]/60"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="task-repo" className="mb-1.5 block text-[12.5px] font-semibold text-[#CBD5E1]">Repository</label>
                  <div className="relative">
                    <select id="task-repo" value={form.repositoryId} onChange={(e) => setForm({ ...form, repositoryId: e.target.value })} className="w-full appearance-none rounded-xl border border-[#252D43] bg-[#090D18] px-3.5 py-3 pr-9 text-[13px] text-white outline-none focus:border-[#8B5CF6]/60">
                      <option value="">General</option>
                      {repos.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  </div>
                </div>
                <div>
                  <label htmlFor="task-priority" className="mb-1.5 block text-[12.5px] font-semibold text-[#CBD5E1]">Priority</label>
                  <div className="relative">
                    <select id="task-priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} className="w-full appearance-none rounded-xl border border-[#252D43] bg-[#090D18] px-3.5 py-3 pr-9 text-[13px] text-white outline-none focus:border-[#8B5CF6]/60">
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  </div>
                </div>
                <div>
                  <label htmlFor="task-due" className="mb-1.5 block text-[12.5px] font-semibold text-[#CBD5E1]">Due date</label>
                  <input id="task-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-xl border border-[#252D43] bg-[#090D18] px-3.5 py-3 text-[13px] text-white outline-none transition-all focus:border-[#8B5CF6]/60 [color-scheme:dark]" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setFormOpen(false)} className="flex-1 rounded-xl border border-[#252D43] px-4 py-3 text-[13.5px] font-semibold text-[#94A3B8] hover:text-white">Cancel</button>
              <button type="submit" disabled={saving || form.title.trim().length < 3} className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-4 py-3 text-[13.5px] font-semibold text-white glow-btn transition-all hover:brightness-110 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : "Create task"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
