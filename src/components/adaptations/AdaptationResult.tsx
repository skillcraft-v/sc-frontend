/**
 * Apresenta o resultado de uma adaptação `completed`: aderência estimada, gaps por
 * severidade, recomendações, ajuste de tom e custo. Apenas apresentação (P-006).
 */
import { SEVERITY_LABELS, type Adaptation, type GapSeverity } from "@/lib/adaptations/types";

const SEVERITY_CLASSES: Record<GapSeverity, string> = {
  low: "border-foreground/30 text-foreground/80",
  medium: "border-amber-600/40 text-amber-700 dark:text-amber-400",
  high: "border-red-600/40 text-red-700 dark:text-red-400",
};

const pct = (value: number): string => `${Math.round(value * 100)}%`;

export function AdaptationResult({ adaptation }: { adaptation: Adaptation }) {
  const suggestions = adaptation.ai_suggestions;
  const cost = adaptation.cost;
  const skillCount = adaptation.relevance_scores
    ? Object.keys(adaptation.relevance_scores).length
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {suggestions ? (
        <section className="flex flex-col gap-1" aria-label="Aderência">
          <span className="text-sm text-foreground/70">Aderência estimada à vaga</span>
          <span className="text-3xl font-bold tracking-tight">{pct(suggestions.estimated_match)}</span>
          {skillCount > 0 ? (
            <span className="text-sm text-foreground/70">
              {skillCount} skill(s) priorizada(s) pela IA
            </span>
          ) : null}
        </section>
      ) : null}

      {suggestions && suggestions.gaps.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground/90">Lacunas identificadas</h2>
          <ul className="flex flex-col gap-3">
            {suggestions.gaps.map((gap, i) => (
              <li key={i} className="flex flex-col gap-1 rounded-md border border-foreground/15 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{gap.required}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${SEVERITY_CLASSES[gap.severity]}`}
                  >
                    {SEVERITY_LABELS[gap.severity]}
                  </span>
                </div>
                <span className="text-sm text-foreground/80">Atual: {gap.current}</span>
                <span className="text-sm text-foreground/80">{gap.recommendation}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {suggestions && suggestions.recommendations.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-foreground/90">Recomendações</h2>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-foreground/80">
            {suggestions.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {suggestions?.tone_adjustment ? (
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground/90">Ajuste de tom</h2>
          <p className="text-sm text-foreground/80">{suggestions.tone_adjustment}</p>
        </section>
      ) : null}

      {cost ? (
        <section className="flex flex-col gap-1 border-t border-foreground/15 pt-4">
          <h2 className="text-sm font-semibold text-foreground/90">Custo da análise</h2>
          <p className="text-sm text-foreground/70">
            {cost.model} · {cost.input_tokens + cost.output_tokens} tokens · US$
            {" "}
            {cost.estimated_cost_usd.toFixed(3)}
          </p>
        </section>
      ) : null}
    </div>
  );
}
