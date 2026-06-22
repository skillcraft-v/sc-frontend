"use client";

import { useState } from "react";
import { deleteEducation, updateEducation } from "@/lib/career/api";
import { careerErrorMessage } from "@/lib/career/error-messages";
import type { Education } from "@/lib/career/types";
import { EducationForm } from "@/components/career/EducationForm";
import { Alert } from "@/components/ui/Alert";

export function EducationItem({
  item,
  onUpdated,
  onDeleted,
}: {
  item: Education;
  onUpdated: (e: Education) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    try {
      await deleteEducation(item.id);
      onDeleted(item.id);
    } catch (err) {
      setError(careerErrorMessage(err));
    }
  }

  if (editing) {
    return (
      <li className="rounded-md border border-foreground/15 p-4">
        <EducationForm
          initial={item}
          submitLabel="Salvar"
          onSubmit={async (input) => {
            const updated = await updateEducation(item.id, input);
            onUpdated(updated);
            setEditing(false);
          }}
        />
        <button onClick={() => setEditing(false)} className="mt-2 text-sm underline">
          Cancelar
        </button>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 rounded-md border border-foreground/15 px-4 py-3">
      {error ? <Alert>{error}</Alert> : null}
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm">
          <p className="font-medium">{item.degree}</p>
          <p className="text-foreground/80">
            {item.institution} · {item.start_date} – {item.end_date ?? "atual"}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-sm font-medium underline">
            Editar
          </button>
          <button
            onClick={handleDelete}
            aria-label={`Excluir formação ${item.degree}`}
            className="text-sm font-medium text-red-700 underline dark:text-red-400"
          >
            Excluir
          </button>
        </div>
      </div>
    </li>
  );
}
