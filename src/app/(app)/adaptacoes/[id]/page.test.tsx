import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdaptacaoPage from "@/app/(app)/adaptacoes/[id]/page";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useParams: () => ({ id: "ad1" }),
  usePathname: () => "/adaptacoes/ad1",
  useSearchParams: () => new URLSearchParams(),
}));

function renderPage() {
  return render(
    <SessionProvider>
      <AdaptacaoPage />
    </SessionProvider>,
  );
}

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
  server.use(
    http.get(url("/auth/me"), () =>
      HttpResponse.json({ id: "u1", email: "u@x.com", full_name: "U" }),
    ),
    http.get(url("/adaptations/ad1/documents"), () => HttpResponse.json([])),
  );
});
afterEach(() => cleanup());

describe("AdaptacaoPage", () => {
  it("completed exibe os resultados (aderência + download)", async () => {
    server.use(
      http.get(url("/adaptations/ad1"), () =>
        HttpResponse.json({
          id: "ad1",
          job_id: "j1",
          status: "completed",
          ai_suggestions: { gaps: [], tone_adjustment: "", recommendations: [], estimated_match: 0.82 },
          cost: { model: "claude-sonnet", input_tokens: 1, output_tokens: 1, estimated_cost_usd: 0.01 },
        }),
      ),
    );
    renderPage();
    expect(await screen.findByText("82%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Baixar PDF" })).toBeInTheDocument();
  });

  it("failed exibe o erro pt-BR a partir do error.code", async () => {
    server.use(
      http.get(url("/adaptations/ad1"), () =>
        HttpResponse.json({
          id: "ad1",
          job_id: "j1",
          status: "failed",
          error: { code: "AI_TIMEOUT", message: "raw" },
        }),
      ),
    );
    renderPage();
    expect(await screen.findByText(/expirou/i)).toBeInTheDocument();
  });

  it("mostra estado de processamento enquanto não terminal", async () => {
    server.use(
      http.get(url("/adaptations/ad1"), () =>
        HttpResponse.json({ id: "ad1", job_id: "j1", status: "analyzing" }),
      ),
    );
    renderPage();
    expect(await screen.findByText(/Analisando seu perfil com IA/i)).toBeInTheDocument();
  });
});
