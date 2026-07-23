"use client";

/**
 * Download e regeneração do PDF da adaptação. Lista as versões (`GET /documents`),
 * baixa o mais recente (`GET /resume`, binário) e regenera em outro idioma
 * (`POST /regenerate`, sem IA — PDF-02/03). Erros traduzidos em pt-BR.
 */
import { useEffect, useState } from "react";
import {
  downloadResumeBlob,
  listDocuments,
  regenerateResume,
} from "@/lib/adaptations/api";
import { adaptationErrorMessage } from "@/lib/adaptations/error-messages";
import { saveBlob } from "@/lib/adaptations/save-blob";
import { LANGUAGE_LABELS, type Language, type ResumeDocument } from "@/lib/adaptations/types";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const languageOptions = (Object.keys(LANGUAGE_LABELS) as Language[]).map((v) => ({
  value: v,
  label: LANGUAGE_LABELS[v],
}));

export function ResumeDocuments({ adaptationId }: { adaptationId: string }) {
  const [documents, setDocuments] = useState<ResumeDocument[] | null>(null);
  const [language, setLanguage] = useState<Language>("pt");
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listDocuments(adaptationId)
      .then((docs) => {
        if (active) setDocuments(docs);
      })
      .catch(() => {
        if (active) setDocuments([]);
      });
    return () => {
      active = false;
    };
  }, [adaptationId]);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const blob = await downloadResumeBlob(adaptationId);
      saveBlob(blob, `curriculo_${adaptationId}.pdf`);
    } catch (err) {
      setError(adaptationErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    setError(null);
    try {
      const doc = await regenerateResume(adaptationId, language);
      setDocuments((prev) => [doc, ...(prev ?? [])]);
    } catch (err) {
      setError(adaptationErrorMessage(err));
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 border-t border-hairline pt-6" aria-label="Currículo em PDF">
      <h2 className="text-sm font-semibold text-ink">Currículo em PDF</h2>
      {error ? <Alert>{error}</Alert> : null}

      <div className="flex flex-wrap items-end gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          aria-busy={downloading || undefined}
          className="inline-flex items-center gap-2 rounded-chip border border-line bg-subtle-bg px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-60"
        >
          <span aria-hidden="true">↓</span>
          {downloading ? "Baixando…" : "Baixar PDF"}
        </button>
        <Select
          id="regen_language"
          label="Regenerar em outro idioma"
          options={languageOptions}
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        />
        <Button
          type="button"
          onClick={handleRegenerate}
          pending={regenerating}
          pendingLabel="Regenerando…"
        >
          Regenerar
        </Button>
      </div>

      {documents && documents.length > 0 ? (
        <ul className="flex flex-col divide-y divide-hairline">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-soft">
                {LANGUAGE_LABELS[doc.language]} · {Math.round(doc.file_size / 1024)} KB
              </span>
              <span className="text-meta text-soft">{doc.generated_at}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
