"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RequireAuth } from "@/lib/auth/require-auth";
import {
  changeJobStatus,
  deleteJob,
  getJob,
  listJobAdaptations,
  updateJob,
} from "@/lib/jobs/api";
import { jobErrorMessage } from "@/lib/jobs/error-messages";
import type { Job, JobAdaptationSummary, JobInput, JobStatus } from "@/lib/jobs/types";
import { createAdaptation } from "@/lib/adaptations/api";
import {
  STATUS_LABELS as ADAPTATION_STATUS_LABELS,
  type AdaptationStatus,
  type Language,
} from "@/lib/adaptations/types";
import { JobForm } from "@/components/jobs/JobForm";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { StatusChanger } from "@/components/jobs/StatusChanger";
import { AdaptTrigger } from "@/components/adaptations/AdaptTrigger";
import { Alert } from "@/components/ui/Alert";

export default function VagaPage() {
  return (
    <RequireAuth>
      <VagaDetalhe />
    </RequireAuth>
  );
}

type LoadState = "loading" | "loaded" | "notfound" | "error";

function VagaDetalhe() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setState("loading");
    getJob(id)
      .then((j) => {
        if (!active) return;
        setJob(j);
        setState("loaded");
      })
      .catch((err) => {
        if (!active) return;
        setState(jobErrorMessage(err).includes("não encontrada") ? "notfound" : "error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleUpdate(input: JobInput) {
    const updated = await updateJob(id, input);
    setJob(updated);
  }

  async function handleStatus(next: JobStatus) {
    const updated = await changeJobStatus(id, next);
    setJob(updated);
  }

  async function handleAdapt(language: Language) {
    const accepted = await createAdaptation({
      job_id: id,
      auto_select_skills: true,
      manual_skill_ids: [],
      language,
    });
    router.push(`/adaptacoes/${accepted.adaptation_id}`);
  }

  async function handleDelete() {
    setActionError(null);
    try {
      await deleteJob(id);
      router.push("/vagas");
    } catch (err) {
      setActionError(jobErrorMessage(err));
    }
  }

  if (state === "loading") {
    return (
      <p role="status" className="p-6 text-center text-foreground/80">
        Carregando vaga…
      </p>
    );
  }

  if (state === "notfound") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          Vaga não encontrada.
        </p>
        <Link href="/vagas" className="text-sm font-medium underline">
          Voltar para a lista
        </Link>
      </main>
    );
  }

  if (state === "error" || !job) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          Não foi possível carregar a vaga.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          <JobStatusBadge status={job.status} />
        </div>
        <Link href="/vagas" className="text-sm font-medium underline">
          Voltar
        </Link>
      </div>

      {actionError ? <Alert>{actionError}</Alert> : null}

      <StatusChanger status={job.status} onChange={handleStatus} />

      <div className="border-t border-foreground/15 pt-6">
        <AdaptTrigger onAdapt={handleAdapt} />
      </div>

      <section className="flex flex-col gap-3 border-t border-foreground/15 pt-6">
        <h2 className="text-sm font-semibold text-foreground/90">Editar vaga</h2>
        <JobForm initial={job} submitLabel="Salvar alterações" onSubmit={handleUpdate} />
      </section>

      <JobAdaptations jobId={job.id} />

      <section className="flex flex-col gap-2 border-t border-foreground/15 pt-6">
        <h2 className="text-sm font-semibold text-foreground/90">Excluir vaga</h2>
        <button
          onClick={handleDelete}
          className="self-start text-sm font-medium text-red-700 underline dark:text-red-400"
        >
          Excluir esta vaga
        </button>
      </section>
    </main>
  );
}

/** Histórico de adaptações da vaga (lista resumida, read-only no MVP — UI de ADP é o SKC-27). */
function JobAdaptations({ jobId }: { jobId: string }) {
  const [items, setItems] = useState<JobAdaptationSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    listJobAdaptations(jobId)
      .then((res) => {
        if (active) setItems(res);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [jobId]);

  return (
    <section className="flex flex-col gap-3 border-t border-foreground/15 pt-6">
      <h2 className="text-sm font-semibold text-foreground/90">Adaptações</h2>
      {failed ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          Não foi possível carregar as adaptações.
        </p>
      ) : items === null ? (
        <p role="status" className="text-sm text-foreground/80">
          Carregando adaptações…
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-foreground/80">Nenhuma adaptação ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                href={`/adaptacoes/${a.id}`}
                className="flex items-center justify-between gap-3 rounded-md border border-foreground/15 px-4 py-2 text-sm hover:border-foreground/40"
              >
                <span className="text-foreground/80">{a.created_at}</span>
                <span className="flex items-center gap-3">
                  {typeof a.match_score === "number" ? (
                    <span className="text-foreground/80">{Math.round(a.match_score * 100)}%</span>
                  ) : null}
                  <span className="font-medium">
                    {ADAPTATION_STATUS_LABELS[a.status as AdaptationStatus] ?? a.status}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
