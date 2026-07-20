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
    <section className="flex flex-col gap-4 border-t border-hairline pt-6">
      <h2 className="text-lg font-semibold">Evidências</h2>

      {evidences.length === 0 ? (
        <p className="text-sm text-soft">Nenhuma evidência ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {evidences.map((ev) => (
            <li key={ev.id} className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2 text-sm">
              <span>
                <strong>{EVIDENCE_TYPE_LABELS[ev.type]}</strong>
                {ev.url ? ` · ${ev.url}` : ""}
                {ev.description ? ` · ${ev.description}` : ""}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(ev.id)}
                aria-label={`Remover evidência ${EVIDENCE_TYPE_LABELS[ev.type]}`}
                className="text-sm font-medium text-rejected-fg underline"
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
