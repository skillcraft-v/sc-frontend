/** Badge pill pt-BR do status de uma vaga (texto/borda/fundo por estado). Sem regra de negócio. */
import { STATUS_LABELS, type JobStatus } from "@/lib/jobs/types";

const STATUS_CLASSES: Record<JobStatus, string> = {
  saved: "border-saved-line bg-saved-tint text-saved-fg",
  applied: "border-applied-line bg-applied-tint text-applied-fg",
  interviewing: "border-interviewing-line bg-interviewing-tint text-interviewing-fg",
  offer: "border-offer-line bg-offer-tint text-offer-fg",
  rejected: "border-rejected-line bg-rejected-tint text-rejected-fg",
  accepted: "border-accepted-line bg-accepted-tint text-accepted-fg",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-micro font-semibold ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
