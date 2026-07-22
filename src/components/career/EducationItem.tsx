"use client";

import { useState } from "react";
import { deleteEducation, updateEducation } from "@/lib/career/api";
import { careerErrorMessage } from "@/lib/career/error-messages";
import type { Education } from "@/lib/career/types";
import { EducationForm } from "@/components/career/EducationForm";
import { CareerRow } from "@/components/career/CareerRow";
import { Alert } from "@/components/ui/Alert";

const period = (item: Education) => `${item.start_date} – ${item.end_date ?? "atual"}`;

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
      <li className="border-b border-hairline p-5 last:border-b-0">
        <EducationForm
          initial={item}
          submitLabel="Salvar"
          onSubmit={async (input) => {
            const updated = await updateEducation(item.id, input);
            onUpdated(updated);
            setEditing(false);
          }}
        />
        <button onClick={() => setEditing(false)} className="text-secondary mt-2 underline">
          Cancelar
        </button>
      </li>
    );
  }

  return (
    <>
      {error ? (
        <li className="border-b border-hairline px-5 py-3 last:border-b-0">
          <Alert>{error}</Alert>
        </li>
      ) : null}
      <CareerRow
        title={item.degree}
        subtitle={item.institution}
        period={period(item)}
        actions={
          <div className="flex gap-3">
            <button onClick={() => setEditing(true)} className="text-secondary font-medium underline">
              Editar
            </button>
            <button
              onClick={handleDelete}
              aria-label={`Excluir formação ${item.degree}`}
              className="text-secondary font-medium text-rejected-fg underline"
            >
              Excluir
            </button>
          </div>
        }
      />
    </>
  );
}
