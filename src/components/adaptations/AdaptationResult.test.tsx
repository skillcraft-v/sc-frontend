import { render, screen, cleanup } from "@testing-library/react";
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
});
