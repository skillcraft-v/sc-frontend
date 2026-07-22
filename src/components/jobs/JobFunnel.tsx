"use client";

/**
 * Funil de vagas em chips pill (handoff §Vagas): dot 8px na cor do status, rótulo plural
 * e contagem. Cada chip filtra a listagem por aquele status (clicar de novo limpa o filtro).
 * Sem regra de negócio: a contagem vem da API e a ordem é a do enum do funil (P-006).
 */
import {
  JOB_STATUSES,
  STATUS_PLURAL_LABELS,
  type JobStatus,
} from "@/lib/jobs/types";
import type { JobFunnelCounts } from "@/lib/jobs/use-job-funnel";

const DOT_CLASSES: Record<JobStatus, string> = {
  saved: "bg-saved-fg",
  applied: "bg-applied-fg",
  interviewing: "bg-interviewing-fg",
  offer: "bg-offer-fg",
  rejected: "bg-rejected-fg",
  accepted: "bg-accepted-fg",
};

interface JobFunnelProps {
  /** `null` quando a contagem falhou ou ainda não chegou — chips aparecem sem número. */
  counts: JobFunnelCounts | null;
  /** Status filtrado no momento (nenhum = funil inteiro). */
  active?: JobStatus;
  onSelect: (status: JobStatus | undefined) => void;
}

export function JobFunnel({ counts, active, onSelect }: JobFunnelProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Funil de vagas">
      {JOB_STATUSES.map((status) => {
        const isActive = active === status;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? undefined : status)}
            className={`inline-flex items-center gap-[7px] rounded-full border px-3 py-1.5 text-meta font-medium transition-colors ${
              isActive
                ? "border-ink bg-hover-bg text-ink"
                : "border-line bg-card text-ink hover:bg-subtle-bg"
            }`}
          >
            <span className={`size-2 rounded-full ${DOT_CLASSES[status]}`} aria-hidden="true" />
            {STATUS_PLURAL_LABELS[status]}
            {counts ? (
              <span className={isActive ? "font-semibold text-ink" : "font-semibold text-soft"}>
                {counts[status]}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
