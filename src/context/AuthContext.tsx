import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthAPI, type User } from "../lib/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  githubConnected: boolean;
  githubUsername: string | null;
  refreshConnection: () => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<User>;
  signup: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  const refreshConnection = useCallback(async () => {
    const current = await AuthAPI.me();
    setUser(current);
    if (current) {
      const status = await AuthAPI.connectionStatus(current.id);
      setGithubConnected(status.connected);
      setGithubUsername(status.username);
    } else {
      setGithubConnected(false);
      setGithubUsername(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshConnection();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshConnection]);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const u = await AuthAPI.login({ email, password, remember });
    setUser(u);
    const status = await AuthAPI.connectionStatus(u.id);
    setGithubConnected(status.connected);
    setGithubUsername(status.username);
    return u;
  }, []);

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    const u = await AuthAPI.signup({ fullName, email, password });
    // Auto sign-in after registration (session created server-side in production).
    const logged = await AuthAPI.login({ email, password, remember: true });
    setUser(logged);
    setGithubConnected(false);
    setGithubUsername(null);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await AuthAPI.logout();
    setUser(null);
    setGithubConnected(false);
    setGithubUsername(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, githubConnected, githubUsername, refreshConnection, login, signup, logout, setUser }),
    [user, loading, githubConnected, githubUsername, refreshConnection, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
