"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type User = { id: number; email: string; role: string; name: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isModalOpen: boolean;
  modalMode: "login" | "register";
  openModal: (mode?: "login" | "register") => void;
  closeModal: () => void;
  /** Returns true if already logged in; otherwise opens the login modal and resolves false. */
  requireLogin: () => boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("login");

  useEffect(() => {
    const storedToken = localStorage.getItem("marajo_token");
    const storedUser = localStorage.getItem("marajo_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("marajo_token", newToken);
    localStorage.setItem("marajo_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("marajo_token");
    localStorage.removeItem("marajo_user");
    setToken(null);
    setUser(null);
  }, []);

  const openModal = useCallback((mode: "login" | "register" = "login") => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const requireLogin = useCallback(() => {
    if (user && token) return true;
    openModal("login");
    return false;
  }, [user, token, openModal]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isModalOpen, modalMode, openModal, closeModal, requireLogin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Helper for API calls that need the bearer token. */
export function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
