import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { SkillSuggestions } from "@/components/skills/SkillSuggestions";
import { clearTokens, setTokens } from "@/lib/auth-tokens";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url, errorEnvelope } from "@/test/msw/handlers";

const suggestion = (key: string, titlePt = key) => ({
  key,
  title_pt: titlePt,
  title_en: titlePt,
  description_pt: "d",
  description_en: "d",
  category: "devops" as const,
  tags: [key],
  matched_job_ids: ["j1"],
});

function mockList(items: ReturnType<typeof suggestion>[]) {
  server.use(
    http.get(url("/skills/suggestions"), () =>
      HttpResponse.json({ items, total: items.length, page: 1, page_size: 50, pages: 1 }),
    ),
  );
}

beforeEach(() => {
  clearTokens();
  window.localStorage.clear();
  setTokens({ access_token: "a", refresh_token: "r" });
});
afterEach(() => cleanup());

describe("SkillSuggestions", () => {
  it("renderiza os chips das sugestões com o título e a contagem", async () => {
    mockList([suggestion("docker", "Docker"), suggestion("kubernetes", "Kubernetes")]);
    render(<SkillSuggestions onAccepted={vi.fn()} />);
    expect(await screen.findByText(/Detectamos 2 skills/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Docker" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Kubernetes" })).toBeInTheDocument();
  });

  it("painel oculto quando não há sugestões", async () => {
    mockList([]);
    render(<SkillSuggestions onAccepted={vi.fn()} />);
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(screen.queryByText(/Detectamos/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Adicionar todas" })).not.toBeInTheDocument();
  });

  it("erro ao carregar mostra alerta com retry", async () => {
    server.use(http.get(url("/skills/suggestions"), () => new HttpResponse(null, { status: 500 })));
    render(<SkillSuggestions onAccepted={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/não foi possível carregar/i);
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("aceite individual chama onAccepted e remove o chip", async () => {
    mockList([suggestion("docker", "Docker")]);
    server.use(
      http.post(url("/skills/suggestions/docker/accept"), () =>
        HttpResponse.json({ id: "s9", title_pt: "Docker", title_en: "Docker" }),
      ),
    );
    const onAccepted = vi.fn();
    render(<SkillSuggestions onAccepted={onAccepted} />);

    const chip = await screen.findByRole("button", { name: "+ Docker" });
    await userEvent.click(chip);

    await waitFor(() => expect(onAccepted).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("button", { name: "+ Docker" })).not.toBeInTheDocument();
  });

  it("aceite individual já decidido mostra erro pt-BR e mantém o chip", async () => {
    mockList([suggestion("docker", "Docker")]);
    server.use(
      http.post(url("/skills/suggestions/docker/accept"), () =>
        HttpResponse.json(errorEnvelope("SUGGESTION_ALREADY_DECIDED", "x"), { status: 409 }),
      ),
    );
    render(<SkillSuggestions onAccepted={vi.fn()} />);

    const chip = await screen.findByRole("button", { name: "+ Docker" });
    await userEvent.click(chip);

    expect(await screen.findByRole("alert")).toHaveTextContent(/já foi decidida/i);
    expect(screen.getByRole("button", { name: "+ Docker" })).toBeInTheDocument();
  });

  it("'Adicionar todas' chama onAccepted e recarrega a lista de sugestões", async () => {
    mockList([suggestion("docker", "Docker"), suggestion("kubernetes", "Kubernetes")]);
    server.use(
      http.post(url("/skills/suggestions/accept-all"), () =>
        HttpResponse.json({
          results: [
            { key: "docker", status: "created", skill_id: "s1", error_code: null },
            { key: "kubernetes", status: "created", skill_id: "s2", error_code: null },
          ],
          accepted_count: 2,
          failed_count: 0,
        }),
      ),
    );
    const onAccepted = vi.fn();
    render(<SkillSuggestions onAccepted={onAccepted} />);
    await screen.findByText(/Detectamos 2 skills/i);

    mockList([]); // após aceitar todas, o reload não encontra mais pendências
    await userEvent.click(screen.getByRole("button", { name: "Adicionar todas" }));

    await waitFor(() => expect(onAccepted).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByText(/Detectamos/i)).not.toBeInTheDocument());
  });

  it("não tem violações de acessibilidade (axe)", async () => {
    mockList([suggestion("docker", "Docker")]);
    const { container } = render(<SkillSuggestions onAccepted={vi.fn()} />);
    await screen.findByRole("button", { name: "+ Docker" });
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
