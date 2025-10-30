import { create } from "zustand";
import { usePortalDataStore } from "./usePortalDataStore";

const SESSION_KEY = "richwell-portal-session";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,

  login: async (email, password, role) => {
    set({ loading: true, error: null });
    try {
      const authenticate = usePortalDataStore.getState().authenticate;
      const user = authenticate(email, password, role);
      if (!user) {
        set({ loading: false, error: "Invalid credentials" });
        return null;
      }
      const session = { userId: user.id, issuedAt: Date.now() };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      set({ user, token: session.userId, loading: false, initialized: true });
      return user;
    } catch (err) {
      console.error("Failed to login", err);
      set({ loading: false, error: "Login failed" });
      return null;
    }
  },

  logout: () => {
    window.localStorage.removeItem(SESSION_KEY);
    set({ user: null, token: null, initialized: true });
  },

  loadUser: () => {
    const hydrate = usePortalDataStore.getState().hydrate;
    hydrate();
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) {
        set({ user: null, token: null, initialized: true });
        return;
      }
      const session = JSON.parse(raw);
      const user = usePortalDataStore
        .getState()
        .users.find((u) => u.id === session.userId);
      if (!user) {
        window.localStorage.removeItem(SESSION_KEY);
        set({ user: null, token: null, initialized: true });
        return;
      }
      set({ user, token: session.userId, initialized: true });
    } catch (err) {
      console.error("Failed to restore session", err);
      set({ user: null, token: null, initialized: true });
    }
  },
}));
