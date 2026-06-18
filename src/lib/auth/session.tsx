"use client";

/**
 * Camada de sessão client-side (USR). Reutiliza o cliente tipado (`src/lib/api.ts`) e o
 * armazenamento de tokens (`src/lib/auth-tokens.ts`, SKC-13). Nenhuma regra de negócio
 * vive aqui (P-006); a autoridade é o sc-api.
 *
 * Hidratação no mount: se há refresh token persistido, um `GET /auth/me` dispara o refresh
 * automático do cliente (401 → refresh → retry) e restaura a sessão após reload.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { clearTokens, getRefreshToken, setTokens } from "@/lib/auth-tokens";
import type { AuthResponse, LoginInput, RegisterInput, UserProfile } from "@/lib/auth/types";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface SessionContextValue {
  status: SessionStatus;
  user: UserProfile | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;

    if (!getRefreshToken()) {
      setStatus("unauthenticated");
      return;
    }

    api
      .get<UserProfile>("/auth/me")
      .then((profile) => {
        if (!active) return;
        setUser(profile);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        clearTokens();
        setUser(null);
        setStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const res = await api.post<AuthResponse>("/auth/login", input);
    setTokens(res);
    setUser(res.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await api.post<AuthResponse>("/auth/register", input);
    setTokens(res);
    setUser(res.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await api.get<UserProfile>("/auth/me");
    setUser(profile);
    setStatus("authenticated");
  }, []);

  return (
    <SessionContext.Provider value={{ status, user, login, register, logout, refreshProfile }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession deve ser usado dentro de <SessionProvider>");
  return ctx;
}
