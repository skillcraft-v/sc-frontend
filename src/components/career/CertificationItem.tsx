"use client";

import { useState } from "react";
import { deleteCertification, updateCertification } from "@/lib/career/api";
import { careerErrorMessage } from "@/lib/career/error-messages";
import type { Certification } from "@/lib/career/types";
import { CertificationForm } from "@/components/career/CertificationForm";
import { CareerRow } from "@/components/career/CareerRow";
import { Alert } from "@/components/ui/Alert";

const period = (item: Certification) =>
  `${item.issued_at}${item.expires_at ? ` · válida até ${item.expires_at}` : ""}`;

export function CertificationItem({
  item,
  onUpdated,
  onDeleted,
}: {
  item: Certification;
  onUpdated: (c: Certification) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    try {
      await deleteCertification(item.id);
      onDeleted(item.id);
    } catch (err) {
      setError(careerErrorMessage(err));
    }
  }

  if (editing) {
    return (
      <li className="border-b border-hairline p-5 last:border-b-0">
        <CertificationForm
          initial={item}
          submitLabel="Salvar"
          onSubmit={async (input) => {
            const updated = await updateCertification(item.id, input);
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
        title={item.name}
        subtitle={item.issuer}
        period={period(item)}
        actions={
          <div className="flex gap-3">
            <button onClick={() => setEditing(true)} className="text-secondary font-medium underline">
              Editar
            </button>
            <button
              onClick={handleDelete}
              aria-label={`Excluir certificação ${item.name}`}
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
