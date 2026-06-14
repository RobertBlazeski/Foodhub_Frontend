import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "foodhub_token";
const USER_KEY = "foodhub_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }

    setReady(true);
  }, []);

  function persist(authResponse) {
    const loggedInUser = {
      ...authResponse.user,
      roles: authResponse.roles || [],
    };

    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));

    setToken(authResponse.token);
    setUser(loggedInUser);

    return loggedInUser;
  }

  async function login(email, password) {
    const authResponse = await authApi.login(email, password);
    return persist(authResponse);
  }

  async function register(payload) {
    const authResponse = await authApi.register(payload);
    return persist(authResponse);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  function hasRole(role) {
    return Boolean(user?.roles?.includes(role));
  }

  const value = {
    user,
    token,
    ready,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
