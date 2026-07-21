import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AppLayout from "@/app/(app)/layout";
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

function renderLayout() {
  return render(
    <SessionProvider>
      <AppLayout>
        <p>conteúdo da rota</p>
      </AppLayout>
    </SessionProvider>,
  );
}

function authenticate() {
  setTokens({ access_token: "a", refresh_token: "r" });
  server.use(
    http.get(url("/auth/me"), () =>
      HttpResponse.json({ id: "u1", email: "u@x.com", full_name: "U" }),
    ),
  );
}

beforeEach(() => {
  replace.mockClear();
  clearTokens();
  window.localStorage.clear();
});
afterEach(() => cleanup());

describe("layout do route group (app)", () => {
  it("renderiza o shell — sidebar + main — em volta da rota autenticada", async () => {
    authenticate();
    renderLayout();
    expect(await screen.findByText("conteúdo da rota")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegação principal" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("conteúdo da rota");
  });

  it("redireciona para /login e não expõe o shell quando não há sessão", async () => {
    renderLayout();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByText("conteúdo da rota")).not.toBeInTheDocument();
  });
});
