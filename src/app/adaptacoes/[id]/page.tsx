"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { RequireAuth } from "@/lib/auth/require-auth";
import { useAdaptationPoll } from "@/lib/adaptations/use-adaptation-poll";
import { adaptationErrorMessage, failureMessage } from "@/lib/adaptations/error-messages";
import { STATUS_LABELS } from "@/lib/adaptations/types";
import { AdaptationResult } from "@/components/adaptations/AdaptationResult";
import { ResumeDocuments } from "@/components/adaptations/ResumeDocuments";
import { Alert } from "@/components/ui/Alert";

export default function AdaptacaoPage() {
  return (
    <RequireAuth>
      <Adaptacao />
    </RequireAuth>
  );
}

function Adaptacao() {
  const params = useParams<{ id: string }>();
  const { adaptation, phase, error } = useAdaptationPoll(params.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Adaptação</h1>
        {adaptation?.job_id ? (
          <Link href={`/vagas/${adaptation.job_id}`} className="text-sm font-medium underline">
            Voltar para a vaga
          </Link>
        ) : null}
      </div>

      {phase === "loading" ? (
        <p role="status" className="text-sm text-soft">
          Carregando adaptação…
        </p>
      ) : null}

      {phase === "error" ? (
        <Alert>{adaptationErrorMessage(error)}</Alert>
      ) : null}

      {phase === "processing" && adaptation ? (
        <div className="flex items-center gap-3" role="status">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-ink" />
          <p className="text-sm text-soft">
            {STATUS_LABELS[adaptation.status]}… isso costuma levar alguns segundos.
          </p>
        </div>
      ) : null}

      {phase === "done" && adaptation?.status === "failed" ? (
        <Alert>{failureMessage(adaptation.error?.code)}</Alert>
      ) : null}

      {phase === "done" && adaptation?.status === "completed" ? (
        <>
          <AdaptationResult adaptation={adaptation} />
          <ResumeDocuments adaptationId={adaptation.id} />
        </>
      ) : null}
    </main>
  );
}
