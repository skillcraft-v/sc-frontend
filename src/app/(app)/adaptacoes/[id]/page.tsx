"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useAdaptationPoll } from "@/lib/adaptations/use-adaptation-poll";
import { adaptationErrorMessage, failureMessage } from "@/lib/adaptations/error-messages";
import { AdaptationResult } from "@/components/adaptations/AdaptationResult";
import { ResumeDocuments } from "@/components/adaptations/ResumeDocuments";
import { Alert } from "@/components/ui/Alert";

export default function AdaptacaoPage() {
  return <Adaptacao />;
}

function Adaptacao() {
  const params = useParams<{ id: string }>();
  const { adaptation, phase, error } = useAdaptationPoll(params.id);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h1">Adaptação</h1>
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

      {phase === "error" ? <Alert>{adaptationErrorMessage(error)}</Alert> : null}

      {phase === "done" && adaptation?.status === "failed" ? (
        <Alert>{failureMessage(adaptation.error?.code)}</Alert>
      ) : null}

      {adaptation && adaptation.status !== "failed" ? (
        <div className="rounded-panel border border-line bg-card p-6 shadow-rest">
          <AdaptationResult adaptation={adaptation} />
        </div>
      ) : null}

      {phase === "done" && adaptation?.status === "completed" ? (
        <ResumeDocuments adaptationId={adaptation.id} />
      ) : null}
    </div>
  );
}
