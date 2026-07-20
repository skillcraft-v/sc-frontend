import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SkillDetalhePage from "@/app/skills/[id]/page";
import { SessionProvider } from "@/lib/auth/session";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";
import type { Skill } from "@/lib/skills/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useParams: () => ({ id: "s1" }),
  usePathname: () => "/skills/s1",
  useSearchParams: () => new URLSearchParams(),
}));

function renderPage() {
  return render(
    <SessionProvider>
      <SkillDetalhePage />
    </SessionProvider>,
  );
}

const baseSkill: Skill = {
  id: "s1",
  title_pt: "FastAPI",
  title_en: "FastAPI",
  category: "backend",
  proficiency: "advanced",
  tags: ["python"],
  description_pt: "d".repeat(80),
  description_en: "d".repeat(80),
  evidences: [],
};

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

describe("EditarSkillPage (smoke)", () => {
  it("renderiza o estado de carregamento sem lançar erro", () => {
    server.use(http.get(url("/skills/s1"), () => new Promise(() => {})));
    renderPage();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renderiza o formulário de edição após carregar a skill", async () => {
    server.use(http.get(url("/skills/s1"), () => HttpResponse.json(baseSkill)));
    renderPage();
    expect(await screen.findByRole("heading", { name: "Editar skill" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();
  });
});
