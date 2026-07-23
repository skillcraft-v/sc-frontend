/**
 * Card de progresso/resultado da adaptação (handoff §Adaptação): pipeline de 4 etapas sempre
 * visível, dirigido por `adaptation.status` (nunca por timer — ADP-01), e banner de resultado
 * (aderência, gaps, recomendações, custo) quando `completed`. Apenas apresentação (P-006): o
 * mapeamento estado→etapa não é regra de negócio, só leitura do que o backend já decidiu.
 */
import { SEVERITY_LABELS, type Adaptation, type GapSeverity } from "@/lib/adaptations/types";

const SEVERITY_CLASSES: Record<GapSeverity, string> = {
  low: "border-line text-soft",
  medium: "border-interviewing-line text-interviewing-fg",
  high: "border-rejected-line text-rejected-fg",
};

const pct = (value: number): string => `${Math.round(value * 100)}%`;

const STEPS = [
  "Analisando a vaga",
  "Cruzando com seu perfil",
  "Reescrevendo destaques",
  "Gerando documentos",
] as const;

/**
 * Índice (0-3) da etapa visual atual a partir do estado real do polling. A API expõe só 3
 * estados intermediários para as 4 etapas do protótipo: `pending`/`analyzing` cobrem juntas as
 * 3 primeiras (a IA não distingue "cruzar perfil" de "reescrever destaques" dentro de
 * `analyzing`) e `rendering` é a etapa final. `completed` marca as 4 como concluídas.
 */
function currentStepIndex(status: Adaptation["status"]): number {
  switch (status) {
    case "pending":
      return 0;
    case "analyzing":
      return 1;
    case "rendering":
      return 3;
    case "completed":
      return STEPS.length;
    default:
      return 0;
  }
}

function AdaptationPipeline({ status }: { status: Adaptation["status"] }) {
  const current = currentStepIndex(status);

  return (
    <ol className="flex flex-col" aria-label="Progresso da adaptação">
      {STEPS.map((label, i) => {
        const done = current > i;
        const active = current === i;
        const meta = done ? "concluído" : active ? "em andamento…" : "";
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex items-center gap-3 border-b border-hairline py-2.5 last:border-b-0"
          >
            <span
              aria-hidden="true"
              className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-accepted-fg text-ink-inverse"
                  : active
                    ? "animate-sc-pulse bg-ink text-ink-inverse"
                    : "bg-hover-bg text-soft"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={done || active ? "font-semibold text-ink" : "text-soft"}>
              {label}
            </span>
            {meta ? <span className="text-meta ml-auto text-soft">{meta}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function AdaptationResult({ adaptation }: { adaptation: Adaptation }) {
  const suggestions = adaptation.ai_suggestions;
  const cost = adaptation.cost;
  const skillCount = adaptation.relevance_scores
    ? Object.keys(adaptation.relevance_scores).length
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <AdaptationPipeline status={adaptation.status} />

      {suggestions ? (
        <section
          className="flex items-center gap-4 rounded-card border border-success-line bg-success-tint px-4.5 py-3.5"
          aria-label="Aderência"
        >
          <span className="text-score font-display font-semibold text-success-fg">
            {pct(suggestions.estimated_match)}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-success-fg">
              Currículo adaptado com alta compatibilidade
            </span>
            {skillCount > 0 ? (
              <span className="text-secondary text-soft">
                {skillCount} skill(s) priorizada(s) pela IA
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      {suggestions && suggestions.gaps.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">Lacunas identificadas</h2>
          <ul className="flex flex-col gap-3">
            {suggestions.gaps.map((gap, i) => (
              <li key={i} className="flex flex-col gap-1 rounded-md border border-line px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{gap.required}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${SEVERITY_CLASSES[gap.severity]}`}
                  >
                    {SEVERITY_LABELS[gap.severity]}
                  </span>
                </div>
                <span className="text-sm text-soft">Atual: {gap.current}</span>
                <span className="text-sm text-soft">{gap.recommendation}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {suggestions && suggestions.recommendations.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-ink">Recomendações</h2>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-soft">
            {suggestions.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {suggestions?.tone_adjustment ? (
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-ink">Ajuste de tom</h2>
          <p className="text-sm text-soft">{suggestions.tone_adjustment}</p>
        </section>
      ) : null}

      {cost ? (
        <section className="flex flex-col gap-1 border-t border-hairline pt-4">
          <h2 className="text-sm font-semibold text-ink">Custo da análise</h2>
          <p className="text-sm text-soft">
            {cost.model} · {cost.input_tokens + cost.output_tokens} tokens · US$
            {" "}
            {cost.estimated_cost_usd.toFixed(3)}
          </p>
        </section>
      ) : null}
    </div>
  );
}
