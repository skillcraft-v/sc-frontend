import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RequireAuth } from "@/lib/auth/require-auth";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace, prefetch: vi.fn() }),
  usePathname: () => "/vagas",
  useSearchParams: () => new URLSearchParams(),
}));

function renderGuard() {
  return render(
    <SessionProvider>
      <RequireAuth>
        <p>conteúdo protegido</p>
      </RequireAuth>
    </SessionProvider>,
  );
}

beforeEach(() => {
  replace.mockClear();
  clearTokens();
  window.localStorage.clear();
});
afterEach(() => cleanup());

describe("RequireAuth", () => {
  it("mostra estado de carregamento enquanto a sessão hidrata", () => {
    setTokens({ access_token: "a", refresh_token: "r" });
    server.use(http.get(url("/auth/me"), () => new Promise(() => {})));
    renderGuard();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");
  });

  it("redireciona para /login quando não há sessão", async () => {
    renderGuard();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("conteúdo protegido")).not.toBeInTheDocument();
  });

  it("renderiza os filhos quando autenticado", async () => {
    setTokens({ access_token: "a", refresh_token: "r" });
    server.use(
      http.get(url("/auth/me"), () =>
        HttpResponse.json({ id: "u1", email: "u@x.com", full_name: "U" }),
      ),
    );
    renderGuard();
    expect(await screen.findByText("conteúdo protegido")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("não renderiza chrome de navegação: o shell é responsabilidade do layout do route group", async () => {
    setTokens({ access_token: "a", refresh_token: "r" });
    server.use(
      http.get(url("/auth/me"), () =>
        HttpResponse.json({ id: "u1", email: "u@x.com", full_name: "U" }),
      ),
    );
    renderGuard();
    await screen.findByText("conteúdo protegido");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });
});
