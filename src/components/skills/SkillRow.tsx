/**
 * Linha editorial de uma skill na listagem (handoff §Skills): nome + meta à esquerda,
 * barra de proficiência de 180px e rótulo do nível à direita. A linha inteira é o link
 * para o detalhe. O mapeamento nível→largura é apresentação, não regra de negócio (P-006).
 */
import Link from "next/link";
import {
  CATEGORY_LABELS,
  PROFICIENCY_LABELS,
  PROFICIENCY_LEVELS,
  type SkillSummary,
} from "@/lib/skills/types";

/** "Backend · python, async" — tags ausentes simplesmente não entram. */
function skillMeta(skill: SkillSummary): string {
  return [CATEGORY_LABELS[skill.category], skill.tags.join(", ")].filter(Boolean).join(" · ");
}

export function SkillRow({ skill }: { skill: SkillSummary }) {
  const level = PROFICIENCY_LEVELS.indexOf(skill.proficiency) + 1;
  const label = PROFICIENCY_LABELS[skill.proficiency];

  return (
    <article className="rounded-card border border-line bg-card shadow-rest transition-shadow duration-[180ms] ease-out hover:shadow-row">
      <Link
        href={`/skills/${skill.id}`}
        className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-5"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-row font-semibold">{skill.title_pt}</span>
          <span className="text-meta text-soft">{skillMeta(skill)}</span>
        </span>

        <span className="flex items-center gap-3 sm:shrink-0">
          <span
            role="progressbar"
            aria-label="Proficiência"
            aria-valuemin={1}
            aria-valuemax={PROFICIENCY_LEVELS.length}
            aria-valuenow={level}
            aria-valuetext={label}
            className="h-1.5 w-full overflow-hidden rounded-full bg-hover-bg sm:w-[180px]"
          >
            <span
              className="block h-full animate-sc-grow rounded-full bg-ink"
              style={{ width: `${(level / PROFICIENCY_LEVELS.length) * 100}%` }}
            />
          </span>
          <span className="text-meta whitespace-nowrap text-soft">{label}</span>
        </span>
      </Link>
    </article>
  );
}
