/**
 * Card editorial de uma vaga na listagem (handoff §Vagas): título display + badge de status,
 * empresa · modalidade · local, hover lift. O card inteiro é o link para o detalhe.
 * Sem regra de negócio (P-006).
 */
import Link from "next/link";
import type { JobSummary } from "@/lib/jobs/types";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { JobCompatibility } from "@/components/jobs/JobCompatibility";

/** "Nubank · Remoto · São Paulo" — partes ausentes simplesmente não entram. */
function jobMeta(job: JobSummary): string {
  return [job.company, job.is_remote ? "Remoto" : "Presencial", job.location]
    .filter(Boolean)
    .join(" · ");
}

export function JobCard({ job }: { job: JobSummary }) {
  return (
    <article className="rounded-card-lg border border-line bg-card shadow-rest transition-[box-shadow,transform] duration-[180ms] ease-out hover:-translate-y-px hover:shadow-lift">
      <Link
        href={`/vagas/${job.id}`}
        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-2.5">
            <span className="font-display text-card-title font-[560]">{job.title}</span>
            <JobStatusBadge status={job.status} />
          </span>
          <span className="text-secondary text-soft">{jobMeta(job)}</span>
        </span>

        {typeof job.compatibility_score === "number" &&
        typeof job.matched_skills === "number" &&
        typeof job.total_skills === "number" ? (
          <JobCompatibility
            score={job.compatibility_score}
            matchedSkills={job.matched_skills}
            totalSkills={job.total_skills}
          />
        ) : null}
      </Link>
    </article>
  );
}
