"use client";

import { useState, type FormEvent } from "react";
import { careerErrorMessage, fieldErrors } from "@/lib/career/error-messages";
import type { Education, EducationInput } from "@/lib/career/types";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface EducationFormProps {
  initial?: Education;
  submitLabel: string;
  onSubmit: (input: EducationInput) => Promise<void>;
}

export function EducationForm({ initial, submitLabel, onSubmit }: EducationFormProps) {
  const [institution, setInstitution] = useState(initial?.institution ?? "");
  const [degree, setDegree] = useState(initial?.degree ?? "");
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [ongoing, setOngoing] = useState(initial ? initial.end_date == null : false);
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");
  const [descPt, setDescPt] = useState(initial?.description_pt ?? "");
  const [descEn, setDescEn] = useState(initial?.description_en ?? "");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});
    const input: EducationInput = {
      institution,
      degree,
      start_date: startDate,
      end_date: ongoing ? null : endDate || null,
      description_pt: descPt || null,
      description_en: descEn || null,
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="edu_institution" label="Instituição" required value={institution} error={fields.institution} onChange={(e) => setInstitution(e.target.value)} />
        <Field id="edu_degree" label="Curso / grau" required value={degree} error={fields.degree} onChange={(e) => setDegree(e.target.value)} />
        <Field id="edu_start" label="Início" type="date" required value={startDate} error={fields.start_date} onChange={(e) => setStartDate(e.target.value)} />
        <Field id="edu_end" label="Término" type="date" value={endDate} error={fields.end_date} disabled={ongoing} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <Checkbox id="edu_ongoing" label="Em andamento (sem data de término)" checked={ongoing} onChange={(e) => setOngoing(e.target.checked)} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Textarea id="edu_desc_pt" label="Descrição (PT)" rows={3} value={descPt} error={fields.description_pt} onChange={(e) => setDescPt(e.target.value)} />
        <Textarea id="edu_desc_en" label="Descrição (EN)" rows={3} value={descEn} error={fields.description_en} onChange={(e) => setDescEn(e.target.value)} />
      </div>
      <Button type="submit" pending={pending} pendingLabel="Salvando…">
        {submitLabel}
      </Button>
    </form>
  );
}
