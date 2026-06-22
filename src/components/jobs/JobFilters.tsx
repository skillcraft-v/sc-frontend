"use client";

import { useState, type FormEvent } from "react";
import {
  JOB_STATUSES,
  STATUS_LABELS,
  type JobFilters as Filters,
  type JobStatus,
} from "@/lib/jobs/types";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const statusOptions = JOB_STATUSES.map((v) => ({ value: v, label: STATUS_LABELS[v] }));
const remoteOptions = [
  { value: "true", label: "Remoto" },
  { value: "false", label: "Presencial" },
];

export function JobFilters({ onApply }: { onApply: (filters: Filters) => void }) {
  const [status, setStatus] = useState("");
  const [company, setCompany] = useState("");
  const [isRemote, setIsRemote] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onApply({
      status: (status || undefined) as JobStatus | undefined,
      company: company || undefined,
      is_remote: isRemote === "" ? undefined : isRemote === "true",
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Filtros de vagas"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Select
        id="filter_status"
        label="Status"
        options={statusOptions}
        placeholder="Todos"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      />
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
      <div className="flex items-end">
        <Button type="submit">Filtrar</Button>
      </div>
    </form>
  );
}
