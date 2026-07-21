"use client";

import { useState } from "react";
import Link from "next/link";
import { useJobList } from "@/lib/jobs/use-job-list";
import { createJob } from "@/lib/jobs/api";
import type { JobInput } from "@/lib/jobs/types";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobForm } from "@/components/jobs/JobForm";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";

export default function VagasPage() {
  return <VagasList />;
}

function VagasList() {
  const { data, status, applyFilters, page, setPage, reload } = useJobList();
  const [creating, setCreating] = useState(false);
  const totalPages = data?.pages ?? 0;

  async function handleCreate(input: JobInput) {
    await createJob(input);
    setCreating(false);
    reload();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Vagas</h1>
        <button
          onClick={() => setCreating((v) => !v)}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-ink-inverse hover:opacity-90"
        >
          {creating ? "Cancelar" : "Nova vaga"}
        </button>
      </div>

      {creating ? (
        <section className="rounded-md border border-line p-4">
          <h2 className="mb-4 text-sm font-semibold text-ink">Nova vaga</h2>
          <JobForm submitLabel="Salvar vaga" onSubmit={handleCreate} />
        </section>
      ) : null}

      <JobFilters onApply={applyFilters} />

      {status === "loading" ? (
        <p role="status" className="text-sm text-soft">
          Carregando vagas…
        </p>
      ) : null}

      {status === "error" ? (
        <div className="flex items-center gap-3">
          <p role="alert" className="text-sm text-rejected-fg">
            Não foi possível carregar as vagas.
          </p>
          <button onClick={reload} className="text-sm font-medium underline">
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === "success" ? (
        <>
          {data && data.items.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {data.items.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/vagas/${job.id}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-line px-4 py-3 hover:border-ink"
                  >
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{job.title}</span>
                      <span className="text-sm text-soft">
                        {job.company}
                        {job.is_remote ? " · Remoto" : job.location ? ` · ${job.location}` : ""}
                      </span>
                    </span>
                    <JobStatusBadge status={job.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-soft">Nenhuma vaga ainda.</p>
          )}

          {totalPages > 1 ? (
            <nav aria-label="Paginação" className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="text-sm font-medium underline disabled:opacity-50 disabled:no-underline"
              >
                Anterior
              </button>
              <span className="text-sm text-soft">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="text-sm font-medium underline disabled:opacity-50 disabled:no-underline"
              >
                Próxima
              </button>
            </nav>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
