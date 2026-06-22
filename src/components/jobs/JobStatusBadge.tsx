/** Badge pt-BR do status de uma vaga (cor por estado do funil). Sem regra de negócio. */
import { STATUS_LABELS, type JobStatus } from "@/lib/jobs/types";

const STATUS_CLASSES: Record<JobStatus, string> = {
  saved: "border-foreground/30 text-foreground/80",
  applied: "border-blue-600/40 text-blue-700 dark:text-blue-400",
  interviewing: "border-amber-600/40 text-amber-700 dark:text-amber-400",
  offer: "border-violet-600/40 text-violet-700 dark:text-violet-400",
  rejected: "border-red-600/40 text-red-700 dark:text-red-400",
  accepted: "border-green-600/40 text-green-700 dark:text-green-400",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
