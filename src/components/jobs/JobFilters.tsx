"use client";

/**
 * Filtros da listagem de vagas — empresa e modalidade. O filtro de status é o funil
 * (`JobFunnel`), por isso não aparece aqui; a página combina os dois.
 */
import { useState, type FormEvent } from "react";
import type { JobFilters as Filters } from "@/lib/jobs/types";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const remoteOptions = [
  { value: "true", label: "Remoto" },
  { value: "false", label: "Presencial" },
];

/** Filtros controlados por este formulário (o status vem do funil). */
export type JobFieldFilters = Omit<Filters, "status">;

export function JobFilters({ onApply }: { onApply: (filters: JobFieldFilters) => void }) {
  const [company, setCompany] = useState("");
  const [isRemote, setIsRemote] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onApply({
      company: company || undefined,
      is_remote: isRemote === "" ? undefined : isRemote === "true",
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Filtros de vagas"
      className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,240px)_minmax(0,180px)_auto] sm:items-end sm:justify-start"
    >
      <Field
        id="filter_company"
        label="Empresa"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <Select
        id="filter_remote"
        label="Modalidade"
        options={remoteOptions}
        placeholder="Todas"
        value={isRemote}
        onChange={(e) => setIsRemote(e.target.value)}
      />
      <Button type="submit">Filtrar</Button>
    </form>
  );
}
