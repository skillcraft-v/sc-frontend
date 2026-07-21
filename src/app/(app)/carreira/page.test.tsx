import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CarreiraPage from "@/app/(app)/carreira/page";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/carreira",
  useSearchParams: () => new URLSearchParams(),
}));

function renderPage() {
  return render(
    <SessionProvider>
      <CarreiraPage />
    </SessionProvider>,
  );
}

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
  server.use(
    http.get(url("/auth/me"), () => HttpResponse.json({ id: "u1", email: "u@x.com", full_name: "U" })),
    http.get(url("/education"), () => HttpResponse.json([])),
    http.get(url("/certifications"), () => HttpResponse.json([])),
  );
});
afterEach(() => cleanup());

describe("CarreiraPage", () => {
  it("renderiza as três seções e estados vazios", async () => {
    server.use(http.get(url("/projects"), () => HttpResponse.json([])));
    renderPage();

    expect(await screen.findByRole("heading", { name: "Projetos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Educação" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Certificações" })).toBeInTheDocument();
    expect(await screen.findByText("Nenhum projeto ainda.")).toBeInTheDocument();
  });

  it("adicionar projeto cria e reflete na lista", async () => {
    const projects: { id: string; title: string; start_date: string; end_date: null; technologies: string[] }[] = [];
    server.use(
      http.get(url("/projects"), () => HttpResponse.json(projects)),
      http.post(url("/projects"), async ({ request }) => {
        const body = (await request.json()) as { title: string };
        const created = { id: "p1", title: body.title, start_date: "2024-01-01", end_date: null, technologies: [] };
        projects.push(created);
        return HttpResponse.json(created, { status: 201 });
      }),
    );
    renderPage();
    await screen.findByText("Nenhum projeto ainda.");

    const user = userEvent.setup();
    // primeiro "Adicionar" = seção Projetos
    await user.click(screen.getAllByRole("button", { name: "Adicionar" })[0]!);
    await user.type(screen.getByLabelText("Título"), "Plataforma X");
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "2024-01-01" } });
    await user.click(screen.getByRole("button", { name: "Adicionar projeto" }));

    expect(await screen.findByText("Plataforma X")).toBeInTheDocument();
  });
});
