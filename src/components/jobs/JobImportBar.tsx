"use client";

/**
 * Barra de importação de vaga por URL (handoff §Vagas, ⚡): fetch + parsing heurístico no
 * backend (SKC-53, sem IA) devolve um payload pré-preenchido — não persiste. O componente só
 * chama `onImported` com o payload; a criação continua pelo `JobForm`/`createJob` de sempre
 * (P-006).
 */
import { useState, type FormEvent } from "react";
import { importJob } from "@/lib/jobs/api";
import { jobErrorMessage } from "@/lib/jobs/error-messages";
import type { JobImportPayload } from "@/lib/jobs/types";

export function JobImportBar({
  onImported,
}: {
  onImported: (payload: JobImportPayload) => void;
}) {
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = await importJob(url);
      onImported(payload);
      setUrl("");
    } catch (err) {
      setError(jobErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2.5 rounded-chip border border-dashed border-ink/25 bg-subtle-bg px-4 py-3.5"
      >
        <span aria-hidden="true" className="text-lg">
          ⚡
        </span>
        <label htmlFor="job_import_url" className="sr-only">
          Link da vaga
        </label>
        <input
          id="job_import_url"
          type="text"
          placeholder="Cole o link de uma vaga — extraímos título, empresa, requisitos e skills sozinhos"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-soft"
        />
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          className="shrink-0 rounded-control border border-ink px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-ink-inverse disabled:opacity-60"
        >
          {pending ? "Importando…" : "Importar"}
        </button>
      </form>
      {pending ? (
        <p role="status" className="text-secondary text-soft">
          Importando…
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-secondary text-rejected-fg">
          {error}
        </p>
      ) : null}
    </div>
  );
}
