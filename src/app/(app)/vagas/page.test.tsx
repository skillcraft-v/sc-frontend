import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VagasPage from "@/app/(app)/vagas/page";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/vagas",
  useSearchParams: () => new URLSearchParams(),
}));

function renderPage() {
  return render(
    <SessionProvider>
      <VagasPage />
    </SessionProvider>,
  );
}

const empty = { items: [], total: 0, page: 1, page_size: 20, pages: 0 };

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
  server.use(
    http.get(url("/auth/me"), () =>
      HttpResponse.json({ id: "u1", email: "u@x.com", full_name: "U" }),
    ),
  );
});
afterEach(() => cleanup());

describe("VagasPage", () => {
  it("renderiza estado vazio", async () => {
    server.use(http.get(url("/jobs"), () => HttpResponse.json(empty)));
    renderPage();
    expect(await screen.findByText("Nenhuma vaga ainda.")).toBeInTheDocument();
  });

  it("mostra estado de erro com retry quando a listagem falha", async () => {
    server.use(
      http.get(url("/jobs"), () => new HttpResponse(null, { status: 500 })),
    );
    renderPage();
    expect(await screen.findByText("Não foi possível carregar as vagas.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("tentar novamente recarrega a listagem e a contagem do funil", async () => {
    let failing = true;
    server.use(
      http.get(url("/jobs"), ({ request }) => {
        if (failing) return new HttpResponse(null, { status: 500 });
        const params = new URL(request.url).searchParams;
        if (params.get("page_size") !== "1") return HttpResponse.json(empty);
        return HttpResponse.json({ ...empty, total: 12, page_size: 1 });
      }),
    );
    renderPage();
    await screen.findByText("Não foi possível carregar as vagas.");

    failing = false;
    await userEvent.setup().click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByRole("button", { name: "Salvas 12" })).toBeInTheDocument();
  });

  it("clicar no chip do funil aplica o filtro de status na querystring", async () => {
    const listed: string[] = [];
    server.use(
      http.get(url("/jobs"), ({ request }) => {
        const params = new URL(request.url).searchParams;
        // Ignora as consultas de contagem do funil (page_size=1).
        if (params.get("page_size") !== "1") listed.push(params.get("status") ?? "");
        return HttpResponse.json(empty);
      }),
    );
    renderPage();
    await screen.findByText("Nenhuma vaga ainda.");

    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /Aplicadas/ }));

    await vi.waitFor(() => expect(listed).toContain("applied"));
  });

  it("chips do funil exibem a contagem por status vinda da API", async () => {
    const totals: Record<string, number> = {
      saved: 12,
      applied: 7,
      interviewing: 3,
      offer: 1,
      rejected: 4,
      accepted: 1,
    };
    server.use(
      http.get(url("/jobs"), ({ request }) => {
        const params = new URL(request.url).searchParams;
        if (params.get("page_size") !== "1") return HttpResponse.json(empty);
        return HttpResponse.json({
          ...empty,
          total: totals[params.get("status") ?? ""] ?? 0,
          page_size: 1,
        });
      }),
    );
    renderPage();

    expect(await screen.findByRole("button", { name: "Salvas 12" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrevistando 3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recusadas 4" })).toBeInTheDocument();
  });

  it("filtro de empresa preserva o status selecionado no funil", async () => {
    const listed: URLSearchParams[] = [];
    server.use(
      http.get(url("/jobs"), ({ request }) => {
        const params = new URL(request.url).searchParams;
        if (params.get("page_size") !== "1") listed.push(params);
        return HttpResponse.json(empty);
      }),
    );
    renderPage();
    await screen.findByText("Nenhuma vaga ainda.");

    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /Aplicadas/ }));
    await user.type(screen.getByLabelText("Empresa"), "Acme");
    await user.click(screen.getByRole("button", { name: "Filtrar" }));

    await vi.waitFor(() =>
      expect(
        listed.some((p) => p.get("company") === "Acme" && p.get("status") === "applied"),
      ).toBe(true),
    );
  });

  it("criar vaga reflete na lista após reload", async () => {
    const jobs: { id: string; title: string; company: string; status: string; is_remote: boolean; created_at: string }[] =
      [];
    server.use(
      http.get(url("/jobs"), () =>
        HttpResponse.json({ ...empty, items: jobs, total: jobs.length, pages: jobs.length ? 1 : 0 }),
      ),
      http.post(url("/jobs"), async ({ request }) => {
        const body = (await request.json()) as { title: string; company: string };
        const created = {
          id: "j1",
          title: body.title,
          company: body.company,
          status: "saved",
          is_remote: false,
          created_at: "2026-06-01",
        };
        jobs.push(created);
        return HttpResponse.json(created, { status: 201 });
      }),
    );
    renderPage();
    await screen.findByText("Nenhuma vaga ainda.");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Nova vaga" }));
    const form = screen.getByRole("heading", { name: "Nova vaga" }).closest("section")!;
    await user.type(within(form).getByLabelText("Cargo"), "Backend Dev");
    await user.type(within(form).getByLabelText("Empresa"), "Acme");
    await user.type(within(form).getByLabelText("Descrição da vaga"), "d".repeat(120));
    await user.click(within(form).getByRole("button", { name: "Salvar vaga" }));

    expect(await screen.findByText("Backend Dev")).toBeInTheDocument();
  });
});
