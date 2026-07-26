import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SkillsPage from "@/app/(app)/skills/page";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/skills",
  useSearchParams: () => new URLSearchParams(),
}));

const summary = (id: string, title: string) => ({
  id,
  title_pt: title,
  title_en: title,
  category: "backend",
  proficiency: "advanced",
  tags: ["python"],
});

function renderPage() {
  return render(
    <SessionProvider>
      <SkillsPage />
    </SessionProvider>,
  );
}

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
  server.use(
    http.get(url("/auth/me"), () => HttpResponse.json({ id: "u1", email: "u@x.com", full_name: "U" })),
    http.get(url("/skills/suggestions"), () =>
      HttpResponse.json({ items: [], total: 0, page: 1, page_size: 50, pages: 0 }),
    ),
  );
});
afterEach(() => cleanup());

describe("SkillsPage", () => {
  it("filtra por categoria e lista o resultado", async () => {
    server.use(
      http.get(url("/skills"), ({ request }) => {
        const category = new URL(request.url).searchParams.get("category");
        return HttpResponse.json({
          items: category === "backend" ? [summary("s1", "FastAPI")] : [],
          total: category === "backend" ? 1 : 0,
          page: 1,
          page_size: 20,
          pages: category === "backend" ? 1 : 0,
        });
      }),
    );
    renderPage();
    const user = userEvent.setup();
    await user.selectOptions(await screen.findByLabelText("Categoria"), "backend");
    await user.click(screen.getByRole("button", { name: "Filtrar" }));

    expect(await screen.findByText("FastAPI")).toBeInTheDocument();
  });

  it("a barra de proficiência da linha reflete o nível vindo da API", async () => {
    server.use(
      http.get(url("/skills"), () =>
        HttpResponse.json({
          items: [{ ...summary("s1", "FastAPI"), proficiency: "expert" }],
          total: 1,
          page: 1,
          page_size: 20,
          pages: 1,
        }),
      ),
    );
    renderPage();

    const bar = await screen.findByRole("progressbar", { name: "Proficiência" });
    expect(bar).toHaveAttribute("aria-valuenow", "4");
    expect(bar).toHaveAttribute("aria-valuetext", "Especialista");
  });

  it("mostra estado vazio quando não há skills", async () => {
    server.use(
      http.get(url("/skills"), () =>
        HttpResponse.json({ items: [], total: 0, page: 1, page_size: 20, pages: 0 }),
      ),
    );
    renderPage();
    expect(await screen.findByText(/Nenhuma skill encontrada/i)).toBeInTheDocument();
  });

  it("navega na paginação (Próxima carrega a página 2)", async () => {
    server.use(
      http.get(url("/skills"), ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        return HttpResponse.json({
          items: [summary(`p${page}`, page === 2 ? "Skill da página 2" : "Skill da página 1")],
          total: 40,
          page,
          page_size: 20,
          pages: 2,
        });
      }),
    );
    renderPage();
    expect(await screen.findByText("Skill da página 1")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Próxima" }));
    expect(await screen.findByText("Skill da página 2")).toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: "Paginação" });
    expect(within(nav).getByText(/Página 2 de 2/)).toBeInTheDocument();
  });

  it("aceitar uma sugestão recarrega a listagem de skills sem reload manual", async () => {
    let skillsCalls = 0;
    server.use(
      http.get(url("/skills"), () => {
        skillsCalls += 1;
        return HttpResponse.json({
          items: skillsCalls > 1 ? [summary("s1", "Docker")] : [],
          total: skillsCalls > 1 ? 1 : 0,
          page: 1,
          page_size: 20,
          pages: skillsCalls > 1 ? 1 : 0,
        });
      }),
      http.get(url("/skills/suggestions"), () =>
        HttpResponse.json({
          items: [
            {
              key: "docker",
              title_pt: "Docker",
              title_en: "Docker",
              description_pt: "d",
              description_en: "d",
              category: "devops",
              tags: ["docker"],
              matched_job_ids: ["j1"],
            },
          ],
          total: 1,
          page: 1,
          page_size: 50,
          pages: 1,
        }),
      ),
      http.post(url("/skills/suggestions/docker/accept"), () =>
        HttpResponse.json({ id: "s1", title_pt: "Docker", title_en: "Docker" }),
      ),
    );
    renderPage();

    await screen.findByText(/Detectamos 1 skill/i);
    await userEvent.click(screen.getByRole("button", { name: "+ Docker" }));

    expect(await screen.findByText("Docker")).toBeInTheDocument();
  });
});
