"use client";

import { useState, type FormEvent } from "react";
import { addEvidence, deleteEvidence } from "@/lib/skills/api";
import { skillErrorMessage } from "@/lib/skills/error-messages";
import {
  EVIDENCE_TYPES,
  EVIDENCE_TYPE_LABELS,
  type Evidence,
  type EvidenceType,
} from "@/lib/skills/types";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const typeOptions = EVIDENCE_TYPES.map((v) => ({ value: v, label: EVIDENCE_TYPE_LABELS[v] }));

export function EvidenceManager({
  skillId,
  initial,
}: {
  skillId: string;
  initial: Evidence[];
}) {
  const [evidences, setEvidences] = useState<Evidence[]>(initial);
  const [type, setType] = useState<EvidenceType>("github");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const created = await addEvidence(skillId, {
        type,
        url: url || null,
        description: description || null,
      });
      setEvidences((prev) => [...prev, created]);
      setUrl("");
      setDescription("");
    } catch (err) {
      setError(skillErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function handleRemove(id: string) {
    setError(null);
    try {
      await deleteEvidence(id);
      setEvidences((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(skillErrorMessage(err));
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-card border border-line bg-card p-5 shadow-rest">
      <h2 className="text-h2">Evidências</h2>

      {evidences.length === 0 ? (
        <p className="text-secondary text-soft">Nenhuma evidência ainda.</p>
      ) : (
        <ul className="flex flex-col">
          {evidences.map((ev) => (
            <li key={ev.id} className="text-secondary flex items-center justify-between gap-3 border-b border-hairline py-2.5 last:border-b-0">
              <span className="min-w-0 wrap-break-word">
                <strong>{EVIDENCE_TYPE_LABELS[ev.type]}</strong>
                {ev.url ? ` · ${ev.url}` : ""}
                {ev.description ? ` · ${ev.description}` : ""}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(ev.id)}
                aria-label={`Remover evidência ${EVIDENCE_TYPE_LABELS[ev.type]}`}
                className="shrink-0 font-medium text-rejected-fg underline"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-col gap-3" noValidate>
        {error ? <Alert>{error}</Alert> : null}
        <Select id="evidence_type" label="Tipo" options={typeOptions} value={type} onChange={(e) => setType(e.target.value as EvidenceType)} />
        <Field id="evidence_url" label="URL" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Field id="evidence_description" label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button type="submit" pending={pending} pendingLabel="Adicionando…">
          Adicionar evidência
        </Button>
      </form>
    </section>
  );
}
