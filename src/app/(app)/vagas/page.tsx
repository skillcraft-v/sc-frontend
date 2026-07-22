"use client";

import { useState } from "react";
import { useJobList } from "@/lib/jobs/use-job-list";
import { useJobFunnel } from "@/lib/jobs/use-job-funnel";
import { createJob } from "@/lib/jobs/api";
import type { JobInput, JobStatus } from "@/lib/jobs/types";
import { JobFilters, type JobFieldFilters } from "@/components/jobs/JobFilters";
import { JobFunnel } from "@/components/jobs/JobFunnel";
import { JobCard } from "@/components/jobs/JobCard";
import { JobForm } from "@/components/jobs/JobForm";

export default function VagasPage() {
  return <VagasList />;
}

function VagasList() {
  const { data, status, filters, applyFilters, page, setPage, reload } = useJobList();
  const funnel = useJobFunnel({ company: filters.company, is_remote: filters.is_remote });
  const [creating, setCreating] = useState(false);
  const totalPages = data?.pages ?? 0;

  /** Listagem e contagem do funil vêm da mesma origem: recarregam juntas. */
  function reloadAll() {
    reload();
    funnel.reload();
  }

  async function handleCreate(input: JobInput) {
    await createJob(input);
    setCreating(false);
    reloadAll();
  }

  /** Chip do funil: seleciona ou limpa o status, preservando os demais filtros. */
  function handleSelectStatus(next: JobStatus | undefined) {
    applyFilters({ ...filters, status: next });
  }

  /** Formulário de filtros: troca empresa/modalidade, preservando o status do funil. */
  function handleApplyFields(fields: JobFieldFilters) {
    applyFilters({ ...fields, status: filters.status });
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">Vagas</h1>
          <p className="text-soft">Seu funil de candidaturas, do primeiro salvo à proposta.</p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="self-start rounded-control bg-ink px-4.5 py-2.5 font-semibold text-ink-inverse shadow-ink transition-opacity hover:opacity-[.88] sm:self-auto"
        >
          {creating ? "Cancelar" : "Nova vaga"}
        </button>
      </header>

      {creating ? (
        <section className="rounded-card border border-line bg-card p-5 shadow-rest">
          <h2 className="mb-4 text-h2">Nova vaga</h2>
          <JobForm submitLabel="Salvar vaga" onSubmit={handleCreate} />
        </section>
      ) : null}

      <JobFunnel counts={funnel.counts} active={filters.status} onSelect={handleSelectStatus} />

      <JobFilters onApply={handleApplyFields} />

      {status === "loading" ? (
        <p role="status" className="text-secondary text-soft">
          Carregando vagas…
        </p>
      ) : null}

      {status === "error" ? (
        <div className="flex items-center gap-3">
          <p role="alert" className="text-secondary text-rejected-fg">
            Não foi possível carregar as vagas.
          </p>
          <button onClick={reloadAll} className="text-secondary font-medium underline">
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
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary text-soft">Nenhuma vaga ainda.</p>
          )}

          {totalPages > 1 ? (
            <nav aria-label="Paginação" className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="text-secondary font-medium underline disabled:opacity-50 disabled:no-underline"
              >
                Anterior
              </button>
              <span className="text-secondary text-soft">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="text-secondary font-medium underline disabled:opacity-50 disabled:no-underline"
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
