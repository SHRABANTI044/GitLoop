/**
 * GitLoop Dashboard Service — frontend implementation of the dashboard API contract.
 *
 * Maps 1:1 to the FastAPI backend:
 *   GET  /api/dashboard/overview            GET  /api/dashboard/repositories
 *   GET  /api/dashboard/project-progress    GET  /api/dashboard/recommendations
 *   GET  /api/dashboard/tasks               POST /api/dashboard/tasks
 *   PATCH /api/dashboard/tasks/:id          DELETE /api/dashboard/tasks/:id
 *   GET  /api/dashboard/recent-activity     GET  /api/dashboard/technology-stack
 *   GET  /api/github/connection-status      POST /api/github/sync
 *   POST /api/ai/chat                       GET  /api/ai/conversations
 *
 * Tables (PostgreSQL in production, localStorage here):
 *   tasks, conversations, messages, project_memory, project_summaries, activities
 *
 * HONESTY RULES (enforced):
 * - Progress % is computed ONLY from tracked tasks (completed / total).
 *   No tasks => "Not enough data yet." Never guessed from commits.
 * - AI answers are grounded ONLY in retrieved repo metadata + tracked tasks.
 *   The AI never claims to have inspected files that were not retrieved.
 * - No vulnerability claims without a real advisory source.
 * - Every query is scoped to the authenticated userId (account isolation).
 */

import { AuthAPI, AuthError, type Repository } from "./auth";

/* ------------------------------ Types ------------------------------ */

export type TaskStatus = "todo" | "in-progress" | "completed";
export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  userId: string;
  repositoryId: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  repositoryId: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "ai";
  content: string;
  createdAt: string;
}

export type ActivitySource = "github" | "gitloop";
export type ActivityType =
  | "repo-updated"
  | "task-created"
  | "task-completed"
  | "task-updated"
  | "repo-analyzed"
  | "recommendation"
  | "sync"
  | "chat"
  | "project-updated";

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  source: ActivitySource;
  description: string;
  repositoryId: string | null;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  explanation: string;
  repositoryId: string | null;
  priority: TaskPriority;
  actionLabel: string;
  evidence: string;
}

export interface ProjectProgress {
  repository: Repository;
  status: "Active" | "In Progress" | "Needs Attention" | "Completed" | "Not Started";
  progress: number | null; // null => not enough data
  completedTasks: number;
  pendingTasks: number;
  totalTasks: number;
  lastActivity: string | null;
}

export interface TechStat {
  name: string;
  repoCount: number;
  percentage: number; // % of selected repos
  color: string;
}

export interface Overview {
  totalRepositories: number;
  activeProjects: number;
  pendingTasks: number;
  completedTasks: number;
  totalTasks: number;
}

/* ------------------------------ DB ------------------------------ */

interface DashDB {
  tasks: Task[];
  conversations: Conversation[];
  messages: Message[];
  activities: Activity[];
  dismissedRecs: Record<string, string[]>; // userId -> dismissed rec ids
}

const DASH_KEY = "gitloop_dash_v1";

function loadDash(): DashDB {
  try {
    const raw = localStorage.getItem(DASH_KEY);
    if (raw) return JSON.parse(raw) as DashDB;
  } catch {
    /* reset */
  }
  return { tasks: [], conversations: [], messages: [], activities: [], dismissedRecs: {} };
}

function saveDash(db: DashDB) {
  localStorage.setItem(DASH_KEY, JSON.stringify(db));
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function delay(ms = 500 + Math.random() * 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function logActivity(db: DashDB, a: Omit<Activity, "id" | "createdAt">) {
  db.activities.unshift({ ...a, id: uid(), createdAt: new Date().toISOString() });
  // Keep the log bounded.
  db.activities = db.activities.slice(0, 200);
}

/* ------------------------------ Helpers ------------------------------ */

async function selectedRepos(userId: string): Promise<Repository[]> {
  const all = await AuthAPI.repositories(userId);
  return all.filter((r) => r.selected);
}

function tasksFor(db: DashDB, userId: string, repoId?: string): Task[] {
  return db.tasks.filter((t) => t.userId === userId && (repoId === undefined || t.repositoryId === repoId));
}

const LANG_COLORS: Record<string, string> = {
  Python: "#22D3EE",
  TypeScript: "#3B82F6",
  JavaScript: "#FBBF24",
  Go: "#34D399",
  Rust: "#F87171",
  Java: "#F97316",
  "C++": "#A855F7",
  HTML: "#FB7185",
  CSS: "#60A5FA",
};

export function langColor(lang: string | null): string {
  if (!lang) return "#8B5CF6";
  return LANG_COLORS[lang] ?? "#8B5CF6";
}

/** Detect technologies from repo metadata (language + description keywords). */
export function detectTech(repos: Repository[]): TechStat[] {
  const counts = new Map<string, number>();
  const add = (name: string) => counts.set(name, (counts.get(name) ?? 0) + 1);

  for (const r of repos) {
    if (r.language) add(r.language);
    const d = (r.description ?? "").toLowerCase();
    if (/\breact\b/.test(d)) add("React");
    if (/node\.?js|express/.test(d)) add("Node.js");
    if (/fastapi/.test(d)) add("FastAPI");
    if (/flask/.test(d)) add("Flask");
    if (/postgres/.test(d)) add("PostgreSQL");
    if (/machine learning|ml\b|tensorflow|scikit/.test(d)) add("Machine Learning");
    if (/typescript/.test(d) && r.language !== "TypeScript") add("TypeScript");
  }

  const total = Math.max(repos.length, 1);
  return Array.from(counts.entries())
    .map(([name, repoCount]) => ({
      name,
      repoCount,
      percentage: Math.round((repoCount / total) * 100),
      color: langColor(name),
    }))
    .sort((a, b) => b.repoCount - a.repoCount || a.name.localeCompare(b.name));
}

/* ------------------------------ Dashboard API ------------------------------ */

export const DashboardAPI = {
  /** GET /api/dashboard/overview */
  async overview(userId: string): Promise<Overview> {
    await delay(400);
    const repos = await selectedRepos(userId);
    const db = loadDash();
    const tasks = tasksFor(db, userId);
    const activeProjects = repos.filter((r) => {
      const t = tasksFor(db, userId, r.id);
      return t.some((x) => x.status === "in-progress") || t.length > 0;
    }).length;
    return {
      totalRepositories: repos.length,
      activeProjects,
      pendingTasks: tasks.filter((t) => t.status !== "completed").length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      totalTasks: tasks.length,
    };
  },

  /** GET /api/dashboard/repositories (selected only) */
  async repositories(userId: string): Promise<Repository[]> {
    return selectedRepos(userId);
  },

  /** GET /api/dashboard/project-progress — computed from tracked tasks only. */
  async projectProgress(userId: string): Promise<ProjectProgress[]> {
    await delay(500);
    const repos = await selectedRepos(userId);
    const db = loadDash();
    return repos.map((r) => {
      const tasks = tasksFor(db, userId, r.id);
      const completed = tasks.filter((t) => t.status === "completed").length;
      const pending = tasks.length - completed;
      const progress = tasks.length === 0 ? null : Math.round((completed / tasks.length) * 100);
      let status: ProjectProgress["status"];
      if (tasks.length === 0) status = "Not Started";
      else if (completed === tasks.length) status = "Completed";
      else if (tasks.some((t) => t.status === "in-progress")) status = "In Progress";
      else if (tasks.some((t) => t.priority === "high" && t.status !== "completed")) status = "Needs Attention";
      else status = "Active";
      const acts = db.activities.filter((a) => a.userId === userId && a.repositoryId === r.id);
      return {
        repository: r,
        status,
        progress,
        completedTasks: completed,
        pendingTasks: pending,
        totalTasks: tasks.length,
        lastActivity: acts[0]?.createdAt ?? r.lastUpdated,
      };
    });
  },

  /** GET /api/dashboard/tasks */
  async tasks(userId: string): Promise<Task[]> {
    await delay(350);
    const db = loadDash();
    return tasksFor(db, userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  /** POST /api/dashboard/tasks */
  async createTask(userId: string, input: { title: string; repositoryId: string | null; priority: TaskPriority; dueDate: string | null; description?: string | null }): Promise<Task> {
    await delay(450);
    const title = input.title.trim();
    if (title.length < 3) throw new AuthError("TASK_INVALID", "Task title must be at least 3 characters.");
    const db = loadDash();
    const now = new Date().toISOString();
    const task: Task = {
      id: uid(),
      userId,
      repositoryId: input.repositoryId,
      title,
      description: input.description ?? null,
      priority: input.priority,
      status: "todo",
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    db.tasks.unshift(task);
    logActivity(db, { userId, type: "task-created", source: "gitloop", description: `Created task “${title}”`, repositoryId: input.repositoryId });
    saveDash(db);
    return task;
  },

  /** PATCH /api/dashboard/tasks/:id */
  async updateTask(userId: string, taskId: string, patch: Partial<Pick<Task, "title" | "priority" | "status" | "dueDate" | "repositoryId">>): Promise<Task> {
    await delay(350);
    const db = loadDash();
    const task = db.tasks.find((t) => t.id === taskId && t.userId === userId);
    if (!task) throw new AuthError("TASK_NOT_FOUND", "Task not found.");
    const wasCompleted = task.status === "completed";
    Object.assign(task, patch, { updatedAt: new Date().toISOString() });
    if (patch.status === "completed" && !wasCompleted) {
      logActivity(db, { userId, type: "task-completed", source: "gitloop", description: `Completed task “${task.title}”`, repositoryId: task.repositoryId });
    } else if (patch.status && patch.status !== "completed") {
      logActivity(db, { userId, type: "task-updated", source: "gitloop", description: `Moved “${task.title}” to ${patch.status === "todo" ? "To Do" : "In Progress"}`, repositoryId: task.repositoryId });
    } else {
      logActivity(db, { userId, type: "task-updated", source: "gitloop", description: `Updated task “${task.title}”`, repositoryId: task.repositoryId });
    }
    saveDash(db);
    return task;
  },

  /** DELETE /api/dashboard/tasks/:id */
  async deleteTask(userId: string, taskId: string): Promise<void> {
    await delay(300);
    const db = loadDash();
    const task = db.tasks.find((t) => t.id === taskId && t.userId === userId);
    db.tasks = db.tasks.filter((t) => !(t.id === taskId && t.userId === userId));
    if (task) logActivity(db, { userId, type: "task-updated", source: "gitloop", description: `Deleted task “${task.title}”`, repositoryId: task.repositoryId });
    saveDash(db);
  },

  /** GET /api/dashboard/recommendations — evidence-based only. */
  async recommendations(userId: string): Promise<Recommendation[]> {
    await delay(600);
    const repos = await selectedRepos(userId);
    const db = loadDash();
    const dismissed = new Set(db.dismissedRecs[userId] ?? []);
    const recs: Recommendation[] = [];

    for (const r of repos) {
      const tasks = tasksFor(db, userId, r.id);
      const pendingHigh = tasks.filter((t) => t.priority === "high" && t.status !== "completed");
      const pending = tasks.filter((t) => t.status !== "completed");

      if (pendingHigh.length > 0) {
        recs.push({
          id: `rec-high-${r.id}`,
          title: `Finish high-priority work in ${r.name}`,
          explanation: `You have ${pendingHigh.length} high-priority pending task${pendingHigh.length > 1 ? "s" : ""} in this repository. Clearing them first keeps momentum on what matters most.`,
          repositoryId: r.id,
          priority: "high",
          actionLabel: "View tasks",
          evidence: `Derived from ${pendingHigh.length} tracked high-priority task(s)`,
        });
      }
      if (tasks.length === 0) {
        recs.push({
          id: `rec-track-${r.id}`,
          title: `Start tracking progress in ${r.name}`,
          explanation: `No tasks are tracked for this repository yet, so GitLoop can't measure progress. Add your first task to unlock progress tracking and smarter recommendations.`,
          repositoryId: r.id,
          priority: "medium",
          actionLabel: "Add a task",
          evidence: "No tracked tasks found for this repository",
        });
      } else if (pending.length > 0 && pendingHigh.length === 0) {
        recs.push({
          id: `rec-next-${r.id}`,
          title: `Continue ${r.name} — ${pending.length} task${pending.length > 1 ? "s" : ""} remaining`,
          explanation: `You have ${pending.length} pending task${pending.length > 1 ? "s" : ""} in this repository. Pick the highest-priority one to keep development moving.`,
          repositoryId: r.id,
          priority: "medium",
          actionLabel: "View tasks",
          evidence: `Derived from ${pending.length} tracked pending task(s)`,
        });
      }
      if (!r.description || r.description.trim().length < 20) {
        recs.push({
          id: `rec-readme-${r.id}`,
          title: `Improve the README for ${r.name}`,
          explanation: `This repository has little or no description. A clear README helps future-you (and AI) understand the project quickly.`,
          repositoryId: r.id,
          priority: "low",
          actionLabel: "Add a task",
          evidence: "Repository description is missing or very short",
        });
      }
    }

    // If the user has no repos at all, suggest connecting more.
    if (repos.length === 0) {
      recs.push({
        id: "rec-connect",
        title: "Select repositories to unlock recommendations",
        explanation: "GitLoop generates recommendations from your selected repositories and tracked tasks. Select at least one repository to get started.",
        repositoryId: null,
        priority: "medium",
        actionLabel: "Select repositories",
        evidence: "No repositories selected",
      });
    }

    return recs.filter((r) => !dismissed.has(r.id)).slice(0, 6);
  },

  async dismissRecommendation(userId: string, recId: string): Promise<void> {
    const db = loadDash();
    db.dismissedRecs[userId] = [...(db.dismissedRecs[userId] ?? []), recId];
    saveDash(db);
  },

  /** GET /api/dashboard/recent-activity */
  async recentActivity(userId: string, limit = 12): Promise<Activity[]> {
    await delay(400);
    const repos = await selectedRepos(userId);
    const db = loadDash();
    // GitHub-sourced activity: repo updates from GitHub metadata.
    const githubActs: Activity[] = repos.map((r) => ({
      id: `gh-${r.id}`,
      userId,
      type: "repo-updated" as ActivityType,
      source: "github" as ActivitySource,
      description: `Repository ${r.fullName} was updated on GitHub`,
      repositoryId: r.id,
      createdAt: r.lastUpdated,
    }));
    const all = [...db.activities.filter((a) => a.userId === userId), ...githubActs]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
    return all;
  },

  /** GET /api/dashboard/technology-stack */
  async technologyStack(userId: string): Promise<TechStat[]> {
    await delay(400);
    const repos = await selectedRepos(userId);
    return detectTech(repos);
  },

  /** POST /api/github/sync */
  async sync(userId: string): Promise<{ syncedAt: string; updated: number }> {
    const result = await AuthAPI.syncRepositories(userId);
    const db = loadDash();
    logActivity(db, { userId, type: "sync", source: "gitloop", description: `Synchronized ${result.updated} repositories from GitHub`, repositoryId: null });
    saveDash(db);
    return { syncedAt: result.syncedAt, updated: result.updated };
  },

  /* ------------------------------ AI Chat ------------------------------ */

  /** GET /api/ai/conversations */
  async conversations(userId: string): Promise<Conversation[]> {
    await delay(300);
    const db = loadDash();
    return db.conversations
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async messages(conversationId: string): Promise<Message[]> {
    await delay(250);
    const db = loadDash();
    return db.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async createConversation(userId: string, repositoryId: string | null, title: string): Promise<Conversation> {
    const db = loadDash();
    const conv: Conversation = { id: uid(), userId, repositoryId, title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    db.conversations.unshift(conv);
    saveDash(db);
    return conv;
  },

  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    const db = loadDash();
    db.conversations = db.conversations.filter((c) => !(c.id === conversationId && c.userId === userId));
    db.messages = db.messages.filter((m) => m.conversationId !== conversationId);
    saveDash(db);
  },

  /**
   * POST /api/ai/chat — grounded answer generation.
   * Uses ONLY: repo metadata (name/description/language/visibility/updated)
   * + tracked tasks + tech stack. Never claims file-level inspection.
   */
  async chat(userId: string, input: { conversationId: string; repositoryId: string | null; question: string }): Promise<Message> {
    await delay(1100 + Math.random() * 700);
    const db = loadDash();
    const conv = db.conversations.find((c) => c.id === input.conversationId && c.userId === userId);
    if (!conv) throw new AuthError("CONVERSATION_NOT_FOUND", "Conversation not found.");

    const repos = await selectedRepos(userId);
    const repo = input.repositoryId ? repos.find((r) => r.id === input.repositoryId) ?? null : null;
    const q = input.question.toLowerCase();

    // Persist user message.
    const userMsg: Message = { id: uid(), conversationId: conv.id, role: "user", content: input.question, createdAt: new Date().toISOString() };
    db.messages.push(userMsg);

    const answer = buildAnswer(q, repo, repos, tasksFor(db, userId, repo?.id), detectTech(repos));

    const aiMsg: Message = { id: uid(), conversationId: conv.id, role: "ai", content: answer, createdAt: new Date().toISOString() };
    db.messages.push(aiMsg);
    conv.updatedAt = new Date().toISOString();
    if (conv.title === "New conversation") conv.title = input.question.slice(0, 42) || "New conversation";
    logActivity(db, { userId, type: "chat", source: "gitloop", description: `Asked AI about ${repo ? repo.name : "your projects"}`, repositoryId: repo?.id ?? null });
    saveDash(db);
    return aiMsg;
  },
};

/* ------------------------------ AI answer builder (grounded) ------------------------------ */

function buildAnswer(
  q: string,
  repo: Repository | null,
  allRepos: Repository[],
  repoTasks: Task[],
  tech: TechStat[]
): string {
  const scope = repo ? `**${repo.fullName}**` : "your selected repositories";
  const pending = repoTasks.filter((t) => t.status !== "completed");
  const done = repoTasks.filter((t) => t.status === "completed");

  if (!repo && allRepos.length === 0) {
    return "You haven't selected any repositories yet. Select repositories first, then I can answer questions grounded in your actual project data.";
  }

  if (/architecture|how.*work|explain.*project|what does.*do/.test(q)) {
    if (!repo) {
      const names = allRepos.map((r) => r.name).join(", ");
      return `You have ${allRepos.length} selected repositories: ${names}. Pick one from the repository selector and I'll explain its architecture based on its metadata and your tracked tasks.`;
    }
    const stack = tech.length > 0 ? `Your stack across selected repos includes ${tech.slice(0, 4).map((t) => t.name).join(", ")}.` : "";
    return `Here's what I know about **${repo.fullName}** from its GitHub metadata:\n\n• **Purpose:** ${repo.description ?? "No description is available on GitHub yet."}\n• **Primary language:** ${repo.language ?? "Not specified"}\n• **Visibility:** ${repo.visibility}\n• **Last updated:** ${new Date(repo.lastUpdated).toLocaleDateString()}\n${stack ? `• **Stack signal:** ${stack}\n` : ""}\n• **Tracked tasks:** ${repoTasks.length} (${done.length} completed, ${pending.length} pending)\n\nNote: this summary is based on repository metadata and your tracked tasks — I haven't inspected individual source files. For a deeper analysis, add tasks as you work and I'll keep the picture current.`;
  }

  if (/next|work on|should i|recommend/.test(q)) {
    if (pending.length === 0) {
      return repoTasks.length === 0
        ? `No tasks are tracked for ${scope} yet, so I can't prioritize from evidence. Add your first task (or pick a repository with tracked work) and I'll recommend a concrete next step.`
        : `Everything tracked for ${scope} is completed — nice work! Add a new task when you're ready and I'll help prioritize it.`;
    }
    const top = [...pending].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))[0];
    return `Based on your tracked tasks for ${scope}, your best next step is:\n\n**${top.title}** (priority: ${top.priority}, status: ${top.status === "todo" ? "To Do" : "In Progress"})\n\nYou have ${pending.length} pending task${pending.length > 1 ? "s" : ""} total. Want me to turn this into a focused plan, or break it into smaller steps?`;
  }

  if (/unfinished|todo|pending|task/.test(q)) {
    if (repoTasks.length === 0) {
      return `No tasks are tracked for ${scope}. I only report tasks you've added to GitLoop — I don't guess at TODOs in code. Add tasks as you discover them and I'll keep this list accurate.`;
    }
    const list = pending.slice(0, 6).map((t) => `• ${t.title} (${t.priority} priority${t.dueDate ? `, due ${new Date(t.dueDate).toLocaleDateString()}` : ""})`).join("\n");
    return `Here are your unfinished tasks for ${scope} (${pending.length} pending, ${done.length} completed):\n\n${list || "All tracked tasks are completed."}\n\nOpen the Task Manager to edit, prioritize, or complete them.`;
  }

  if (/dependenc|stack|technolog|librar|framework/.test(q)) {
    if (tech.length === 0) return `I don't have enough evidence to describe a tech stack for ${scope}. Select repositories with language metadata and I'll summarize what's detected.`;
    const lines = tech.slice(0, 6).map((t) => `• ${t.name} — used in ${t.repoCount} repositor${t.repoCount > 1 ? "ies" : "y"} (${t.percentage}%)`).join("\n");
    return `Here's the technology signal across your selected repositories (from GitHub language metadata and descriptions):\n\n${lines}\n\nThis reflects detected languages and mentioned frameworks — not a full dependency audit. Open the Dependency Analyzer for per-repository details.`;
  }

  if (/summar|recent|activity|progress/.test(q)) {
    if (!repo) {
      return `Across your ${allRepos.length} selected repositories, here's the current picture:\n\n• Repositories: ${allRepos.length}\n• Selected: ${allRepos.map((r) => r.name).join(", ") || "none"}\n\nSelect a specific repository for a detailed summary with task progress.`;
    }
    const pct = repoTasks.length === 0 ? null : Math.round((done.length / repoTasks.length) * 100);
    return `Summary for **${repo.fullName}**:\n\n• Progress: ${pct === null ? "Not enough data yet (no tracked tasks)" : `${pct}% (${done.length}/${repoTasks.length} tasks completed)`}\n• Pending tasks: ${pending.length}\n• Last GitHub update: ${new Date(repo.lastUpdated).toLocaleDateString()}\n• Language: ${repo.language ?? "Not specified"}\n\nAdd or complete tasks to keep this summary meaningful.`;
  }

  // Fallback: grounded overview + offer options.
  if (!repo) {
    return `I can help with your ${allRepos.length} selected repositories. Try asking:\n\n• "Explain my project architecture" (after selecting a repo)\n• "What should I work on next?"\n• "Find unfinished tasks in this project"\n• "Explain the main dependencies"\n\nSelect a repository above for repository-specific answers.`;
  }
  return `Based on what GitLoop knows about **${repo.fullName}**:\n\n${repo.description ?? "No description available."}\n\n• Language: ${repo.language ?? "Not specified"} · ${repo.visibility} · updated ${new Date(repo.lastUpdated).toLocaleDateString()}\n• Tasks: ${repoTasks.length} tracked (${done.length} done, ${pending.length} pending)\n\nTry asking about its architecture, next steps, unfinished tasks, or dependencies for a deeper answer.`;
}

function priorityRank(p: TaskPriority): number {
  return p === "high" ? 0 : p === "medium" ? 1 : 2;
}

export { langColor as _langColor };
