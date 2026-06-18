"use client";

import { useState, type FormEvent } from "react";
import {
  CATEGORY_LABELS,
  PROFICIENCY_LABELS,
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
  type SkillCategory,
  type ProficiencyLevel,
  type SkillFilters as Filters,
} from "@/lib/skills/types";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const categoryOptions = SKILL_CATEGORIES.map((v) => ({ value: v, label: CATEGORY_LABELS[v] }));
const proficiencyOptions = PROFICIENCY_LEVELS.map((v) => ({
  value: v,
  label: PROFICIENCY_LABELS[v],
}));

export function SkillFilters({ onApply }: { onApply: (filters: Filters) => void }) {
  const [category, setCategory] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onApply({
      category: (category || undefined) as SkillCategory | undefined,
      proficiency: (proficiency || undefined) as ProficiencyLevel | undefined,
      tags: tags || undefined,
      search: search || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Filtros de skills"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Select id="filter_category" label="Categoria" options={categoryOptions} placeholder="Todas" value={category} onChange={(e) => setCategory(e.target.value)} />
      <Select id="filter_proficiency" label="Proficiência" options={proficiencyOptions} placeholder="Todas" value={proficiency} onChange={(e) => setProficiency(e.target.value)} />
      <Field id="filter_tags" label="Tags" placeholder="python, fastapi" value={tags} onChange={(e) => setTags(e.target.value)} />
      <Field id="filter_search" label="Busca (PT/EN)" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="sm:col-span-2 lg:col-span-4">
        <Button type="submit">Filtrar</Button>
      </div>
    </form>
  );
}
