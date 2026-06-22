"use client";

import { useState, type FormEvent } from "react";
import { careerErrorMessage, fieldErrors } from "@/lib/career/error-messages";
import type { Project, ProjectInput } from "@/lib/career/types";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const parseList = (raw: string): string[] =>
  raw.split(",").map((t) => t.trim()).filter(Boolean);

interface ProjectFormProps {
  initial?: Project;
  submitLabel: string;
  onSubmit: (input: ProjectInput) => Promise<void>;
}

export function ProjectForm({ initial, submitLabel, onSubmit }: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [ongoing, setOngoing] = useState(initial ? initial.end_date == null : false);
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");
  const [descPt, setDescPt] = useState(initial?.description_pt ?? "");
  const [descEn, setDescEn] = useState(initial?.description_en ?? "");
  const [technologies, setTechnologies] = useState((initial?.technologies ?? []).join(", "));

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});
    const input: ProjectInput = {
      title,
      company: company || null,
      role: role || null,
      start_date: startDate,
      end_date: ongoing ? null : endDate || null,
      description_pt: descPt || null,
      description_en: descEn || null,
      technologies: parseList(technologies),
    };
    try {
      await onSubmit(input);
    } catch (err) {
      setError(careerErrorMessage(err));
      setFields(fieldErrors(err));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? <Alert>{error}</Alert> : null}
      <Field id="project_title" label="Título" required value={title} error={fields.title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="project_company" label="Empresa" value={company} error={fields.company} onChange={(e) => setCompany(e.target.value)} />
        <Field id="project_role" label="Papel" value={role} error={fields.role} onChange={(e) => setRole(e.target.value)} />
        <Field id="project_start" label="Início" type="date" required value={startDate} error={fields.start_date} onChange={(e) => setStartDate(e.target.value)} />
        <Field id="project_end" label="Término" type="date" value={endDate} error={fields.end_date} disabled={ongoing} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <Checkbox id="project_ongoing" label="Em andamento (sem data de término)" checked={ongoing} onChange={(e) => setOngoing(e.target.checked)} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Textarea id="project_desc_pt" label="Descrição (PT)" rows={3} value={descPt} error={fields.description_pt} onChange={(e) => setDescPt(e.target.value)} />
        <Textarea id="project_desc_en" label="Descrição (EN)" rows={3} value={descEn} error={fields.description_en} onChange={(e) => setDescEn(e.target.value)} />
      </div>
      <Field id="project_tech" label="Tecnologias (separadas por vírgula)" value={technologies} error={fields.technologies} onChange={(e) => setTechnologies(e.target.value)} />
      <Button type="submit" pending={pending} pendingLabel="Salvando…">
        {submitLabel}
      </Button>
    </form>
  );
}
