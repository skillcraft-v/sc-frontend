/**
 * Armazenamento de tokens no cliente (decisão MVP, SKC-13):
 * - access_token: somente em memória (não persiste; reduz exposição).
 * - refresh_token: localStorage, para sobreviver a reloads.
 *
 * Tokens NUNCA são logados (restrição não negociável do CLAUDE.md).
 */
import type { TokenPair } from "@/lib/types";

const REFRESH_STORAGE_KEY = "sc.refresh_token";

let accessToken: string | null = null;

const hasStorage = (): boolean => typeof window !== "undefined" && !!window.localStorage;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (!hasStorage()) return null;
  return window.localStorage.getItem(REFRESH_STORAGE_KEY);
}

export function setTokens(tokens: TokenPair): void {
  accessToken = tokens.access_token;
  if (hasStorage()) {
    window.localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refresh_token);
  }
}

export function clearTokens(): void {
  accessToken = null;
  if (hasStorage()) {
    window.localStorage.removeItem(REFRESH_STORAGE_KEY);
  }
}
