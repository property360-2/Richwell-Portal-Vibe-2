import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { initialPortalData } from "../data/initialData";

const AuthContext = createContext(null);

const SESSION_KEY = "rci-portal-session";
const DATA_KEY = "rci-portal-data";

function loadStoredData() {
  const saved = localStorage.getItem(DATA_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(DATA_KEY, JSON.stringify(initialPortalData));
  return initialPortalData;
}

function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return { user: null, token: null };
    try {
      return JSON.parse(stored);
    } catch {
      return { user: null, token: null };
    }
  });
  const [initialized, setInitialized] = useState(false);
  const [portalData, setPortalData] = useState(() => loadStoredData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.message || "Invalid credentials";
        setError(msg);
        throw new Error(msg);
      }
      const { user, token } = data || {};
      if (!user || !token) throw new Error("Invalid server response");
      setSession({ user, token });
      return user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setSession({ user: null, token: null });
  }, []);

  const updatePortalData = useCallback((updater) => {
    setPortalData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveData(next);
      return next;
    });
  }, []);

  useEffect(() => {
    setInitialized(true);
  }, []);

  const value = useMemo(
    () => ({
      user: session.user,
      token: session.token,
      loading,
      error,
      initialized,
      portalData,
      login,
      logout,
      updatePortalData,
      clearError: () => setError(null),
    }),
    [session, loading, error, initialized, portalData, login, logout, updatePortalData]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
