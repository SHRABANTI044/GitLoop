export const API_BASE = "/api";

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text || res.statusText;
    if (res.headers.get("content-type")?.includes("application/json")) {
      const payload = JSON.parse(text) as { detail?: unknown };
      if (typeof payload.detail === "string") message = payload.detail;
    }
    throw new Error(message);
  }
  return res.json();
}