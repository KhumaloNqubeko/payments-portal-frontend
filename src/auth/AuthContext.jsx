import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/client";

const STORAGE_KEY = "payments-portal-auth";
const DEFAULT_AUTH_STATE = { token: "", role: "", user: null };
const AuthContext = createContext(null);

function stripSensitiveFields(value) {
  if (Array.isArray(value)) {
    return value.map(stripSensitiveFields);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.entries(value).reduce((sanitized, [key, entryValue]) => {
    if (["password", "passwordHash", "southAfricanIdNumber"].includes(key)) {
      return sanitized;
    }

    sanitized[key] = stripSensitiveFields(entryValue);
    return sanitized;
  }, {});
}

function sanitizeAuthState(value) {
  if (!value || typeof value !== "object") {
    return DEFAULT_AUTH_STATE;
  }

  const sanitized = stripSensitiveFields(value);
  return {
    ...DEFAULT_AUTH_STATE,
    ...sanitized
  };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_AUTH_STATE;
    }

    try {
      return sanitizeAuthState(JSON.parse(saved));
    } catch {
      return DEFAULT_AUTH_STATE;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeAuthState(auth)));
  }, [auth]);

  const login = useCallback(async (endpoint, payload) => {
    const result = await apiFetch(endpoint, { method: "POST", body: payload });
    const sanitizedResult = sanitizeAuthState(result);
    setAuth(sanitizedResult);
    return sanitizedResult;
  }, []);

  const logout = useCallback(async () => {
    if (auth.token) {
      try {
        await apiFetch("/auth/logout", { method: "POST", token: auth.token });
      } catch {
        // Ignore logout network errors and clear local state.
      }
    }
    setAuth(DEFAULT_AUTH_STATE);
  }, [auth.token]);

  const refreshMe = useCallback(async () => {
    if (!auth.token) {
      return null;
    }
    const user = await apiFetch("/auth/me", { token: auth.token });
    const sanitizedUser = stripSensitiveFields(user);
    setAuth((current) => ({ ...current, user: sanitizedUser }));
    return sanitizedUser;
  }, [auth.token]);

  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
