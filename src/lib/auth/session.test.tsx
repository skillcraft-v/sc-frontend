import { renderHook, waitFor, act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { SessionProvider, useSession } from "@/lib/auth/session";
import { clearTokens, getAccessToken, getRefreshToken } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

const wrapper = ({ children }: { children: ReactNode }) => <SessionProvider>{children}</SessionProvider>;

const PROFILE = { id: "u1", email: "u@x.com", full_name: "User", headline: null };

beforeEach(() => {
  clearTokens(); // limpa access em memória + refresh no storage (estado determinístico)
  window.localStorage.clear();
});

afterEach(() => {
  cleanup(); // desmonta providers entre testes (evita árvore React suja)
});

describe("SessionProvider — hidratação no mount", () => {
  it("sem refresh token → unauthenticated, sem chamada de rede", async () => {
    const { result } = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));
    expect(result.current.user).toBeNull();
  });

  it("com refresh token válido → refresh automático restaura a sessão (reload)", async () => {
    // Simula reload: refresh no storage, access perdido (memória).
    window.localStorage.setItem("sc.refresh_token", "refresh-1");
    server.use(
      http.get(url("/auth/me"), ({ request }) =>
        request.headers.get("Authorization") === "Bearer new-access"
          ? HttpResponse.json(PROFILE)
          : new HttpResponse(null, { status: 401 }),
      ),
      http.post(url("/auth/refresh"), () =>
        HttpResponse.json({ access_token: "new-access", refresh_token: "refresh-2" }),
      ),
    );

    const { result } = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("authenticated"));
    expect(result.current.user).toEqual(PROFILE);
    expect(getAccessToken()).toBe("new-access");
  });

  it("refresh inválido → desloga e limpa a sessão", async () => {
    window.localStorage.setItem("sc.refresh_token", "expired");
    server.use(
      http.get(url("/auth/me"), () => new HttpResponse(null, { status: 401 })),
      http.post(url("/auth/refresh"), () => new HttpResponse(null, { status: 401 })),
    );

    const { result } = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));
    expect(result.current.user).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});

describe("SessionProvider — login/register/logout", () => {
  it("login bem-sucedido autentica e persiste tokens", async () => {
    server.use(
      http.post(url("/auth/login"), () =>
        HttpResponse.json({ user: PROFILE, access_token: "a", refresh_token: "r" }),
      ),
    );
    const { result } = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));

    await act(async () => {
      await result.current.login({ email: "u@x.com", password: "Str0ng!Pass" });
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.user).toEqual(PROFILE);
    expect(getAccessToken()).toBe("a");
    expect(getRefreshToken()).toBe("r");
  });

  it("login com erro propaga e mantém não autenticado", async () => {
    server.use(
      http.post(url("/auth/login"), () =>
        HttpResponse.json({ error: { code: "INVALID_CREDENTIALS", message: "x" } }, { status: 401 }),
      ),
    );
    const { result } = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));

    await act(async () => {
      await expect(result.current.login({ email: "u@x.com", password: "wrong" })).rejects.toThrow();
    });
    expect(result.current.status).toBe("unauthenticated");
  });

  it("register autentica (auto-login) e logout limpa a sessão", async () => {
    server.use(
      http.post(url("/auth/register"), () =>
        HttpResponse.json(
          { user: PROFILE, access_token: "a", refresh_token: "r" },
          { status: 201 },
        ),
      ),
    );
    const { result } = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));

    await act(async () => {
      await result.current.register({ email: "u@x.com", password: "Str0ng!Pass", full_name: "User" });
    });
    expect(result.current.status).toBe("authenticated");

    act(() => result.current.logout());
    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.user).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});

describe("useSession", () => {
  it("lança erro fora do provider", () => {
    expect(() => renderHook(() => useSession())).toThrow(/SessionProvider/);
  });
});
