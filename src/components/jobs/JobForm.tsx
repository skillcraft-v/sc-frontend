"use client";

import { useState, type FormEvent } from "react";
import { jobErrorMessage, fieldErrors } from "@/lib/jobs/error-messages";
import { MIN_DESCRIPTION_LENGTH, type Job, type JobInput } from "@/lib/jobs/types";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface JobFormProps {
  initial?: Job;
  submitLabel: string;
  onSubmit: (input: JobInput) => Promise<void>;
}

export function JobForm({ initial, submitLabel, onSubmit }: JobFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [requirements, setRequirements] = useState(initial?.requirements ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [salaryRange, setSalaryRange] = useState(initial?.salary_range ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [isRemote, setIsRemote] = useState(initial?.is_remote ?? false);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const remaining = MIN_DESCRIPTION_LENGTH - description.trim().length;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});
    const input: JobInput = {
      title,
      company,
      description,
      requirements: requirements || null,
      url: url || null,
      salary_range: salaryRange || null,
      location: location || null,
      is_remote: isRemote,
    };
    try {
      await onSubmit(input);
    } catch (err) {
      setError(jobErrorMessage(err));
      setFields(fieldErrors(err));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="job_title"
          label="Cargo"
          required
          value={title}
          error={fields.title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Field
          id="job_company"
          label="Empresa"
          required
          value={company}
          error={fields.company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Textarea
          id="job_description"
          label="Descrição da vaga"
          rows={8}
          required
          value={description}
          error={fields.description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-xs text-soft">
          {remaining > 0
            ? `Cole a descrição da vaga — faltam ${remaining} caractere(s) (mínimo ${MIN_DESCRIPTION_LENGTH}).`
            : `${description.trim().length} caracteres.`}
        </p>
      </div>
      <Textarea
        id="job_requirements"
        label="Requisitos (opcional)"
        rows={4}
        value={requirements}
        error={fields.requirements}
        onChange={(e) => setRequirements(e.target.value)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="job_url"
          label="URL da vaga (opcional)"
          type="url"
          value={url}
          error={fields.url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Field
          id="job_salary"
          label="Faixa salarial (opcional)"
          value={salaryRange}
          error={fields.salary_range}
          onChange={(e) => setSalaryRange(e.target.value)}
        />
        <Field
          id="job_location"
          label="Localização (opcional)"
          value={location}
          error={fields.location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <Checkbox
        id="job_remote"
        label="Vaga remota"
        checked={isRemote}
        onChange={(e) => setIsRemote(e.target.checked)}
      />
      <Button type="submit" pending={pending} pendingLabel="Salvando…">
        {submitLabel}
      </Button>
    </form>
  );
}
