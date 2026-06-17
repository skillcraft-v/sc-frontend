import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth-tokens";
import type { TokenPair } from "@/lib/types";

const pair: TokenPair = {
  access_token: "access-1",
  refresh_token: "refresh-1",
  token_type: "bearer",
};

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("auth-tokens", () => {
  it("começa sem nenhum token", () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("setTokens guarda o access apenas em memória e o refresh no localStorage", () => {
    setTokens(pair);
    expect(getAccessToken()).toBe("access-1");
    expect(getRefreshToken()).toBe("refresh-1");
    // access_token NUNCA é persistido (decisão de segurança MVP).
    expect(window.localStorage.getItem("sc.refresh_token")).toBe("refresh-1");
  });

  it("clearTokens limpa memória e storage", () => {
    setTokens(pair);
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(window.localStorage.getItem("sc.refresh_token")).toBeNull();
  });

  it("sem window (SSR) o access continua em memória e o refresh vira no-op seguro", () => {
    vi.stubGlobal("window", undefined);
    expect(() => setTokens(pair)).not.toThrow();
    expect(getAccessToken()).toBe("access-1"); // memória independe de storage
    expect(getRefreshToken()).toBeNull(); // sem storage, nada a ler
    expect(() => clearTokens()).not.toThrow();
  });
});
