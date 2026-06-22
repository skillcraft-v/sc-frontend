import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VagaPage from "@/app/vagas/[id]/page";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url, errorEnvelope } from "@/test/msw/handlers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useParams: () => ({ id: "j1" }),
  usePathname: () => "/vagas/j1",
  useSearchParams: () => new URLSearchParams(),
}));

function renderPage() {
  return render(
    <SessionProvider>
      <VagaPage />
    </SessionProvider>,
  );
}

const baseJob = {
  id: "j1",
  title: "Backend Dev",
  company: "Acme",
  status: "saved",
  is_remote: true,
  created_at: "2026-06-01",
  description: "d".repeat(120),
};

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
  server.use(
    http.get(url("/auth/me"), () =>
      HttpResponse.json({ id: "u1", email: "u@x.com", full_name: "U" }),
    ),
    http.get(url("/jobs/j1/adaptations"), () => HttpResponse.json([])),
  );
});
afterEach(() => cleanup());

describe("VagaPage", () => {
  it("carrega a vaga e mostra a ação de transição válida (saved → applied)", async () => {
    server.use(http.get(url("/jobs/j1"), () => HttpResponse.json(baseJob)));
    renderPage();

    expect(await screen.findByRole("heading", { name: "Backend Dev" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Marcar como Candidatada" })).toBeInTheDocument();
    expect(await screen.findByText("Nenhuma adaptação ainda.")).toBeInTheDocument();
  });

  it("transição válida atualiza o status na UI", async () => {
    server.use(
      http.get(url("/jobs/j1"), () => HttpResponse.json(baseJob)),
      http.patch(url("/jobs/j1/status"), () =>
        HttpResponse.json({ ...baseJob, status: "applied" }),
      ),
    );
    renderPage();
    await screen.findByRole("heading", { name: "Backend Dev" });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Marcar como Candidatada" }));

    // novo destino do funil após applied: "Em entrevista"
    expect(await screen.findByRole("button", { name: "Marcar como Em entrevista" })).toBeInTheDocument();
  });

  it("transição inválida mostra a mensagem pt-BR do backend (409)", async () => {
    server.use(
      http.get(url("/jobs/j1"), () => HttpResponse.json(baseJob)),
      http.patch(url("/jobs/j1/status"), () =>
        HttpResponse.json(
          errorEnvelope("INVALID_STATUS_TRANSITION", "raw backend message"),
          { status: 409 },
        ),
      ),
    );
    renderPage();
    await screen.findByRole("heading", { name: "Backend Dev" });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Marcar como Candidatada" }));

    expect(await screen.findByText(/transição de status não permitida/i)).toBeInTheDocument();
  });

  it("lista as adaptações da vaga", async () => {
    server.use(
      http.get(url("/jobs/j1"), () => HttpResponse.json(baseJob)),
      http.get(url("/jobs/j1/adaptations"), () =>
        HttpResponse.json([{ id: "a1", status: "completed", created_at: "2026-06-02", match_score: 0.75 }]),
      ),
    );
    renderPage();
    await screen.findByRole("heading", { name: "Backend Dev" });

    const section = screen.getByRole("heading", { name: "Adaptações" }).closest("section")!;
    expect(await within(section).findByText("completed")).toBeInTheDocument();
    expect(within(section).getByText("75%")).toBeInTheDocument();
  });

  it("vaga inexistente mostra estado not found", async () => {
    server.use(
      http.get(url("/jobs/j1"), () =>
        HttpResponse.json(errorEnvelope("JOB_NOT_FOUND", "x"), { status: 404 }),
      ),
    );
    renderPage();
    expect(await screen.findByText("Vaga não encontrada.")).toBeInTheDocument();
  });
});
