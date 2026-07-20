"use client";

/**
 * Disparo de adaptação a partir da vaga: o usuário escolhe o idioma e gera. No MVP a
 * seleção de skills é automática (auto_select_skills); seleção manual é follow-up.
 * Erros (incl. 429 RATE_LIMIT_EXCEEDED) traduzidos em pt-BR.
 */
import { useState } from "react";
import { adaptationErrorMessage } from "@/lib/adaptations/error-messages";
import { LANGUAGE_LABELS, type Language } from "@/lib/adaptations/types";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const languageOptions = (Object.keys(LANGUAGE_LABELS) as Language[]).map((v) => ({
  value: v,
  label: LANGUAGE_LABELS[v],
}));

export function AdaptTrigger({ onAdapt }: { onAdapt: (language: Language) => Promise<void> }) {
  const [language, setLanguage] = useState<Language>("pt");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      await onAdapt(language);
    } catch (err) {
      setError(adaptationErrorMessage(err));
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-3" aria-label="Adaptar currículo">
      <h2 className="text-sm font-semibold text-ink">Adaptar currículo para esta vaga</h2>
      {error ? <Alert>{error}</Alert> : null}
      <div className="flex flex-wrap items-end gap-3">
        <Select
          id="adapt_language"
          label="Idioma do currículo"
          options={languageOptions}
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        />
        <Button type="button" onClick={handleClick} pending={pending} pendingLabel="Gerando…">
          Gerar currículo adaptado
        </Button>
      </div>
    </section>
  );
}
