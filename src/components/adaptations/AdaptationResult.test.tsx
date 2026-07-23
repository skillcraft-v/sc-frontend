import { render, screen, cleanup, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { AdaptationResult } from "@/components/adaptations/AdaptationResult";
import type { Adaptation } from "@/lib/adaptations/types";

const completed: Adaptation = {
  id: "ad1",
  job_id: "j1",
  status: "completed",
  relevance_scores: { "s1": 0.9, "s2": 0.7 },
  ai_suggestions: {
    gaps: [
      { required: "5+ anos Python", current: "3 anos", severity: "high", recommendation: "Destaque projetos Python." },
    ],
    tone_adjustment: "Tom mais sênior.",
    recommendations: ["Inclua métricas de impacto."],
    estimated_match: 0.82,
  },
  cost: { model: "claude-sonnet", input_tokens: 4200, output_tokens: 1100, estimated_cost_usd: 0.029 },
};

afterEach(() => cleanup());

describe("AdaptationResult", () => {
  it("exibe aderência, gaps, recomendações e custo", () => {
    render(<AdaptationResult adaptation={completed} />);
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("2 skill(s) priorizada(s) pela IA")).toBeInTheDocument();
    expect(screen.getByText("5+ anos Python")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument(); // severidade pt-BR
    expect(screen.getByText("Inclua métricas de impacto.")).toBeInTheDocument();
    expect(screen.getByText(/claude-sonnet/)).toBeInTheDocument();
    expect(screen.getByText(/US\$\s*0\.029/)).toBeInTheDocument();
  });

  it("não quebra sem ai_suggestions/cost (apenas status completed)", () => {
    render(<AdaptationResult adaptation={{ id: "ad1", job_id: "j1", status: "completed" }} />);
    expect(screen.queryByText(/Aderência/)).not.toBeInTheDocument();
  });

  it("não tem violações de acessibilidade (axe)", async () => {
    const { container } = render(<AdaptationResult adaptation={completed} />);
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });

  describe("pipeline: mapeia cada estado da API para a etapa visual correta", () => {
    /** Etapa ativa é a única com `aria-current="step"` — sinal semântico, não classe CSS. */
    function activeStepLabel(list: HTMLElement): string | null {
      const item = within(list).getByRole("listitem", { current: "step" });
      return within(item).getByText(/^(Analisando|Cruzando|Reescrevendo|Gerando)/).textContent;
    }

    it("pending: etapa 1 (Analisando a vaga) ativa, demais pendentes", () => {
      render(<AdaptationResult adaptation={{ id: "ad1", job_id: "j1", status: "pending" }} />);
      const list = screen.getByRole("list", { name: "Progresso da adaptação" });
      expect(activeStepLabel(list)).toBe("Analisando a vaga");
      expect(within(list).getAllByText("em andamento…")).toHaveLength(1);
      expect(within(list).queryByText("concluído")).not.toBeInTheDocument();
    });

    it("analyzing: etapa 1 concluída, etapa 2 (Cruzando com seu perfil) ativa", () => {
      render(<AdaptationResult adaptation={{ id: "ad1", job_id: "j1", status: "analyzing" }} />);
      const list = screen.getByRole("list", { name: "Progresso da adaptação" });
      expect(activeStepLabel(list)).toBe("Cruzando com seu perfil");
      expect(within(list).getAllByText("concluído")).toHaveLength(1);
    });

    it("rendering: as 3 primeiras etapas concluídas, 'Gerando documentos' ativa", () => {
      render(<AdaptationResult adaptation={{ id: "ad1", job_id: "j1", status: "rendering" }} />);
      const list = screen.getByRole("list", { name: "Progresso da adaptação" });
      expect(activeStepLabel(list)).toBe("Gerando documentos");
      expect(within(list).getAllByText("concluído")).toHaveLength(3);
      expect(within(list).getAllByText("em andamento…")).toHaveLength(1);
    });

    it("completed: as 4 etapas concluídas, nenhuma ativa", () => {
      render(<AdaptationResult adaptation={{ id: "ad1", job_id: "j1", status: "completed" }} />);
      const list = screen.getByRole("list", { name: "Progresso da adaptação" });
      expect(within(list).queryByRole("listitem", { current: "step" })).not.toBeInTheDocument();
      expect(within(list).getAllByText("concluído")).toHaveLength(4);
      expect(within(list).queryByText("em andamento…")).not.toBeInTheDocument();
    });
  });
});
