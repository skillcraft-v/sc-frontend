"use client";

/**
 * Painel de sugestões automáticas de skill (handoff §Skills, ✨): heurística sem IA do
 * backend (SKC-57, SKL-06/07) já deduplicada contra o catálogo e contra decisões anteriores —
 * a UI só apresenta os chips e aceita/dispara "aceitar todas" (P-006). Painel some sozinho
 * quando não há sugestões pendentes.
 */
import { useState } from "react";
import { acceptAllSkillSuggestions, acceptSkillSuggestion } from "@/lib/skills/api";
import { skillErrorMessage } from "@/lib/skills/error-messages";
import { useSkillSuggestions } from "@/lib/skills/use-skill-suggestions";
import { Alert } from "@/components/ui/Alert";

export function SkillSuggestions({ onAccepted }: { onAccepted: () => void }) {
  const { items, status, reload, removeItem } = useSkillSuggestions();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [pendingAll, setPendingAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleAccept(key: string) {
    setPendingKey(key);
    setActionError(null);
    try {
      await acceptSkillSuggestion(key);
      removeItem(key);
      onAccepted();
    } catch (err) {
      setActionError(skillErrorMessage(err));
    } finally {
      setPendingKey(null);
    }
  }

  async function handleAcceptAll() {
    setPendingAll(true);
    setActionError(null);
    try {
      await acceptAllSkillSuggestions();
      reload();
      onAccepted();
    } catch (err) {
      setActionError(skillErrorMessage(err));
    } finally {
      setPendingAll(false);
    }
  }

  if (status === "loading") {
    return (
      <p role="status" className="text-secondary text-soft">
        Carregando sugestões…
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-3">
        <p role="alert" className="text-secondary text-rejected-fg">
          Não foi possível carregar as sugestões.
        </p>
        <button onClick={reload} className="text-secondary font-medium underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="Sugestões automáticas de skills"
      className="flex flex-col gap-2.5 rounded-chip border border-auto-line bg-auto-tint p-4.5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-auto-fg">
          ✨ Detectamos {items.length} skill{items.length > 1 ? "s" : ""} nos seus projetos e
          vagas salvas
        </span>
        <button
          type="button"
          onClick={handleAcceptAll}
          disabled={pendingAll}
          aria-busy={pendingAll || undefined}
          className="shrink-0 rounded-control bg-auto-solid px-3.5 py-1.5 text-sm font-semibold text-ink-inverse transition-opacity hover:opacity-[.88] disabled:opacity-60"
        >
          {pendingAll ? "Adicionando…" : "Adicionar todas"}
        </button>
      </div>

      {actionError ? <Alert>{actionError}</Alert> : null}

      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => handleAccept(s.key)}
            disabled={pendingKey === s.key}
            aria-busy={pendingKey === s.key || undefined}
            className="rounded-chip border border-auto-chip bg-card px-3 py-1 text-secondary font-medium text-auto-fg disabled:opacity-60"
          >
            + {s.title_pt}
          </button>
        ))}
      </div>
    </section>
  );
}
