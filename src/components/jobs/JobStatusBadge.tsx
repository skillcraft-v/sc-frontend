/** Badge pt-BR do status de uma vaga (cor por estado do funil). Sem regra de negócio. */
import { STATUS_LABELS, type JobStatus } from "@/lib/jobs/types";

const STATUS_CLASSES: Record<JobStatus, string> = {
  saved: "border-saved-line text-saved-fg",
  applied: "border-applied-line text-applied-fg",
  interviewing: "border-interviewing-line text-interviewing-fg",
  offer: "border-offer-line text-offer-fg",
  rejected: "border-rejected-line text-rejected-fg",
  accepted: "border-accepted-line text-accepted-fg",
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
