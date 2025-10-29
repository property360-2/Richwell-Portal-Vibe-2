import { create } from "zustand";
import axios from "axios";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,

  // --- LOGIN ---
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      const { user, token } = res.data;
      localStorage.setItem("token", token);
      set({ user, token, loading: false, initialized: true });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false,
      });
    }
  },

  // --- LOGOUT ---
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, initialized: true });
  },

  // --- LOAD FROM LOCAL STORAGE ---
  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ initialized: true, user: null, token: null });
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: res.data, token, initialized: true });
    } catch {
      set({ user: null, token: null, initialized: true });
    }
  },
}));
