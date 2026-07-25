/**
 * Bloco de compatibilidade do card de vaga (handoff §Vagas): label + score (700), barra 5px
 * animada colorida por faixa e contagem "N de M skills em comum". Score/contagens vêm 100% do
 * backend (SKC-55, JOB-07) — a cor por faixa é a única decisão daqui, e é apresentação, não
 * regra de negócio (P-006): reaproveita os tokens de cor já usados no funil de vagas.
 */

/** Faixas do handoff: verde ≥85%, âmbar ≥70%, cinza abaixo. */
const BAND_COLORS = {
  high: "var(--color-accepted-fg)",
  medium: "var(--color-interviewing-fg)",
  low: "var(--color-soft)",
} as const;

function band(score: number): keyof typeof BAND_COLORS {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "low";
}

export function JobCompatibility({
  score,
  matchedSkills,
  totalSkills,
}: {
  score: number;
  matchedSkills: number;
  totalSkills: number;
}) {
  return (
    <div className="w-[150px] shrink-0">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-soft">Compatibilidade</span>
        <span className="font-bold text-ink">{score}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="Compatibilidade"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        className="h-[5px] overflow-hidden rounded-full bg-hover-bg"
      >
        <div
          className="h-full animate-sc-grow rounded-full"
          style={{ width: `${score}%`, backgroundColor: BAND_COLORS[band(score)] }}
        />
      </div>
      <div className="text-micro mt-1 text-soft">
        {matchedSkills} de {totalSkills} skills em comum
      </div>
    </div>
  );
}
