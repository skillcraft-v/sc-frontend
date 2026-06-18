"use client";

import { useState, type FormEvent } from "react";
import { skillErrorMessage, fieldErrors } from "@/lib/skills/error-messages";
import {
  CATEGORY_LABELS,
  PROFICIENCY_LABELS,
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
  type Skill,
  type SkillInput,
} from "@/lib/skills/types";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const categoryOptions = SKILL_CATEGORIES.map((v) => ({ value: v, label: CATEGORY_LABELS[v] }));
const proficiencyOptions = PROFICIENCY_LEVELS.map((v) => ({
  value: v,
  label: PROFICIENCY_LABELS[v],
}));

/** Converte "Python, FastAPI" → ["python","fastapi"] (UX; o backend é a autoridade). */
function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

interface SkillFormProps {
  initial?: Skill;
  submitLabel: string;
  onSubmit: (input: SkillInput) => Promise<void>;
}

export function SkillForm({ initial, submitLabel, onSubmit }: SkillFormProps) {
  const [titlePt, setTitlePt] = useState(initial?.title_pt ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? "");
  const [descPt, setDescPt] = useState(initial?.description_pt ?? "");
  const [descEn, setDescEn] = useState(initial?.description_en ?? "");
  const [category, setCategory] = useState(initial?.category ?? "backend");
  const [proficiency, setProficiency] = useState(initial?.proficiency ?? "intermediate");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [code, setCode] = useState(initial?.code_example ?? "");
  const [explPt, setExplPt] = useState(initial?.code_explanation_pt ?? "");
  const [explEn, setExplEn] = useState(initial?.code_explanation_en ?? "");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});
    const input: SkillInput = {
      title_pt: titlePt,
      title_en: titleEn,
      description_pt: descPt,
      description_en: descEn,
      category,
      proficiency,
      tags: parseTags(tags),
      code_example: code || null,
      code_explanation_pt: explPt || null,
      code_explanation_en: explEn || null,
    };
    try {
      await onSubmit(input);
    } catch (err) {
      setError(skillErrorMessage(err));
      setFields(fieldErrors(err));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? <Alert>{error}</Alert> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="title_pt" label="Título (PT)" required value={titlePt} error={fields.title_pt} onChange={(e) => setTitlePt(e.target.value)} />
        <Field id="title_en" label="Título (EN)" required value={titleEn} error={fields.title_en} onChange={(e) => setTitleEn(e.target.value)} />
        <Textarea id="description_pt" label="Descrição (PT)" rows={4} required value={descPt} error={fields.description_pt} onChange={(e) => setDescPt(e.target.value)} />
        <Textarea id="description_en" label="Descrição (EN)" rows={4} required value={descEn} error={fields.description_en} onChange={(e) => setDescEn(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select id="category" label="Categoria" options={categoryOptions} value={category} error={fields.category} onChange={(e) => setCategory(e.target.value as typeof category)} />
        <Select id="proficiency" label="Proficiência" options={proficiencyOptions} value={proficiency} error={fields.proficiency} onChange={(e) => setProficiency(e.target.value as typeof proficiency)} />
      </div>

      <Field id="tags" label="Tags (separadas por vírgula)" value={tags} error={fields.tags} onChange={(e) => setTags(e.target.value)} />

      <Textarea id="code_example" label="Exemplo de código" mono rows={6} value={code} error={fields.code_example} onChange={(e) => setCode(e.target.value)} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Textarea id="code_explanation_pt" label="Explicação do código (PT)" rows={3} value={explPt} error={fields.code_explanation_pt} onChange={(e) => setExplPt(e.target.value)} />
        <Textarea id="code_explanation_en" label="Explicação do código (EN)" rows={3} value={explEn} error={fields.code_explanation_en} onChange={(e) => setExplEn(e.target.value)} />
      </div>

      <Button type="submit" pending={pending} pendingLabel="Salvando…">
        {submitLabel}
      </Button>
    </form>
  );
}
