import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { login as apiLogin, logout as apiLogout, fetchProfile, request as apiRequest } from '../services/authApi.js';

const AuthContext = createContext(null);

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return initialValue;
      return typeof initialValue === 'object' ? JSON.parse(stored) : stored;
    } catch (error) {
      console.warn('Failed to read localStorage', error);
      return initialValue;
    }
  });

  const updateValue = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        try {
          if (resolved === null || resolved === undefined) {
            localStorage.removeItem(key);
          } else if (typeof resolved === 'object') {
            localStorage.setItem(key, JSON.stringify(resolved));
          } else {
            localStorage.setItem(key, String(resolved));
          }
        } catch (error) {
          console.warn('Failed to write localStorage', error);
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, updateValue];
}

export function AuthProvider({ children }) {
  const [token, setToken] = useStoredState('token', null);
  const [user, setUser] = useStoredState('user', null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const res = await apiLogin(credentials);
      setToken(res.token);
      setUser(res.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [setToken, setUser]);

  const logout = useCallback(async () => {
    try {
      if (token) await apiLogout(token);
    } catch (error) {
      console.warn('Failed to logout', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  }, [token, setToken, setUser]);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const data = await fetchProfile(token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      await logout();
      return null;
    }
  }, [logout, setUser, token]);

  const value = useMemo(
    () => ({ token, user, loading, login, logout, refreshProfile, apiRequest }),
    [token, user, loading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;
