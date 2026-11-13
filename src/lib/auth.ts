import { apiFetch } from "./api";

export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  provider: "email" | "github";
}

export interface Repository {
  id: string;
  userId: string;
  githubRepoId: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  visibility: "public" | "private";
  lastUpdated: string;
  selected: boolean;
}

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const TOKEN_KEY = "gitloop_token_v1";
function storeToken(token: string) { localStorage.setItem(TOKEN_KEY, token); }
export function getToken() { return localStorage.getItem(TOKEN_KEY); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function mapUser(u: any): User {
  return {
    id: u.id,
    fullName: u.full_name ?? u.fullName ?? "",
    email: u.email,
    createdAt: u.created_at ?? u.createdAt ?? new Date().toISOString(),
    provider: u.provider ?? "email",
  };
}

async function authedFetch(path: string, init?: RequestInit) {
  const token = getToken();
  return apiFetch(path, {
    ...init,
    headers: { ...(init?.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
}

function mapRepository(r: any, userId: string): Repository {
  return {
    id: r.id,
    userId,
    githubRepoId: r.github_repo_id ?? r.githubRepoId,
    name: r.name,
    fullName: r.full_name ?? r.fullName,
    description: r.description ?? null,
    language: r.primary_language ?? r.language ?? null,
    visibility: r.visibility ?? "public",
    lastUpdated: r.last_synchronized_at ?? r.lastUpdated ?? new Date().toISOString(),
    selected: !!r.selected,
  };
}

export const AuthAPI = {
  async signup(payload: { fullName: string; email: string; password: string }): Promise<User> {
    const res = await apiFetch("/auth/signup", { method: "POST", body: JSON.stringify({ full_name: payload.fullName, email: payload.email, password: payload.password }) });
    storeToken(res.access_token);
    return mapUser(res.user);
  },
  async login(payload: { email: string; password: string; remember: boolean }): Promise<User> {
    const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email: payload.email, password: payload.password, remember: payload.remember }) });
    storeToken(res.access_token);
    return mapUser(res.user);
  },
  async logout(): Promise<void> {
    try { await authedFetch("/auth/logout", { method: "POST" }); } catch {}
    clearToken();
  },
  async me(): Promise<User | null> {
    const token = getToken();
    if (!token) return null;
    try {
      const res = await authedFetch("/auth/me");
      return mapUser(res);
    } catch {
      clearToken();
      return null;
    }
  },
  async connectionStatus(_userId: string): Promise<{ connected: boolean; username: string | null }> {
    try {
      const res = await authedFetch(`/github/connection-status`);
      return { connected: !!res.connected, username: res.username ?? null };
    } catch {
      return { connected: false, username: null };
    }
  },
  async repositories(userId: string): Promise<Repository[]> {
    const res = await authedFetch(`/github/repositories`);
    return (res || []).map((r: any) => mapRepository(r, userId));
  },
  async selectRepositories(_userId: string, ids: string[]): Promise<void> {
    await authedFetch(`/github/repositories/select`, { method: "POST", body: JSON.stringify({ repository_ids: ids }) });
  },
  async beginGithubOAuth(mode: string): Promise<{ url: string; state: string; mode: string }> {
    return authedFetch(`/auth/github?mode=${mode}`);
  },
  async exchangeGithubCode(payload: any): Promise<any> {
    return authedFetch(`/github/oauth/callback`, { method: "POST", body: JSON.stringify({ code: payload.code, state: payload.state }) });
  },
  async forgotPassword(email: string): Promise<void> {
    await apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  },
  async connectionDetail(userId: string): Promise<any> {
    const status = await this.connectionStatus(userId);
    return { connected: status.connected, username: status.username };
  },
  async syncRepositories(userId: string): Promise<{ syncedAt: string; updated: number; repos: Repository[] }> {
    const result = await authedFetch(`/github/sync`, { method: "POST" });
    const repos = (result.repositories || []).map((repository: any) => mapRepository(repository, userId));
    return { syncedAt: new Date().toISOString(), updated: result.updated, repos };
  },
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface PasswordCheck { label: string; ok: boolean; }

export interface PasswordStrength { score: number; checks: PasswordCheck[]; label: string; }

export function passwordStrength(p: string): PasswordStrength {
  const checks: PasswordCheck[] = [];
  let score = 0;

  const lenOk = p.length >= 8; score += lenOk ? 1 : 0;
  checks.push({ label: "At least 8 characters", ok: lenOk });

  const caseOk = /[a-z]/.test(p) && /[A-Z]/.test(p); score += caseOk ? 1 : 0;
  checks.push({ label: "Mix of upper and lower case", ok: caseOk });

  const digitOk = /\d/.test(p); score += digitOk ? 1 : 0;
  checks.push({ label: "At least one number", ok: digitOk });

  const symbolOk = /[^A-Za-z0-9]/.test(p); score += symbolOk ? 1 : 0;
  checks.push({ label: "At least one special character", ok: symbolOk });

  const label = score >= 3 ? "Strong" : score === 2 ? "Medium" : "Weak";
  return { score, checks, label };
}

export function validatePassword(p: string): string | undefined {
  if (p.length < 8) return "Password must be at least 8 characters.";
  return undefined;
}

export const DEMO_GITHUB_IDENTITIES: any[] = [];
