"use client";

/**
 * Botões de transição do funil. Só oferece os destinos válidos do grafo (NEXT_STATUSES,
 * JOB-01) — mas a autoridade é o backend (transição inválida → 409, traduzida em pt-BR).
 */
import { useState } from "react";
import { jobErrorMessage } from "@/lib/jobs/error-messages";
import { NEXT_STATUSES, STATUS_LABELS, type JobStatus } from "@/lib/jobs/types";
import { Alert } from "@/components/ui/Alert";

interface StatusChangerProps {
  status: JobStatus;
  onChange: (next: JobStatus) => Promise<void>;
}

export function StatusChanger({ status, onChange }: StatusChangerProps) {
  const [pending, setPending] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const targets = NEXT_STATUSES[status];

  async function handleClick(next: JobStatus) {
    setPending(next);
    setError(null);
    try {
      await onChange(next);
    } catch (err) {
      setError(jobErrorMessage(err));
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="flex flex-col gap-3" aria-label="Mudar status">
      <h2 className="text-sm font-semibold text-foreground/90">Mover no funil</h2>
      {error ? <Alert>{error}</Alert> : null}
      {targets.length === 0 ? (
        <p className="text-sm text-foreground/70">Esta vaga chegou ao fim do funil.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {targets.map((next) => (
            <button
              key={next}
              type="button"
              onClick={() => handleClick(next)}
              disabled={pending !== null}
              aria-busy={pending === next || undefined}
              className="rounded-md border border-foreground/30 px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending === next ? "Movendo…" : `Marcar como ${STATUS_LABELS[next]}`}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
