import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EditarProjetoPage from "@/app/(app)/carreira/projetos/[id]/page";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";
import type { Project } from "@/lib/career/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useParams: () => ({ id: "p1" }),
  usePathname: () => "/carreira/projetos/p1",
  useSearchParams: () => new URLSearchParams(),
}));

function renderPage() {
  return render(
    <SessionProvider>
      <EditarProjetoPage />
    </SessionProvider>,
  );
}

const baseProject: Project = {
  id: "p1",
  title: "Migração de API",
  company: "Acme",
  role: "Dev",
  start_date: "2025-01-01",
  end_date: null,
  description_pt: "d".repeat(80),
  description_en: "d".repeat(80),
  technologies: ["python"],
  skills: [],
};

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
  server.use(
    http.get(url("/auth/me"), () =>
      HttpResponse.json({ id: "u1", email: "u@x.com", full_name: "U" }),
    ),
    http.get(url("/skills"), () =>
      HttpResponse.json({ items: [], total: 0, page: 1, page_size: 100, pages: 0 }),
    ),
  );
});
afterEach(() => cleanup());

describe("EditarProjetoPage (smoke)", () => {
  it("renderiza o estado de carregamento sem lançar erro", () => {
    server.use(http.get(url("/projects/p1"), () => new Promise(() => {})));
    renderPage();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renderiza o formulário de edição após carregar o projeto", async () => {
    server.use(http.get(url("/projects/p1"), () => HttpResponse.json(baseProject)));
    renderPage();
    expect(await screen.findByRole("heading", { name: "Editar projeto" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();
  });
});
