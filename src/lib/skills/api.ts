/**
 * Chamadas tipadas do domínio SKL, todas via o cliente único (`@/lib/api`).
 * Sem regra de negócio (P-006); apenas monta requests e tipa respostas.
 */
import { api } from "@/lib/api";
import type { Paginated } from "@/lib/types";
import type {
  Evidence,
  EvidenceInput,
  Skill,
  SkillFilters,
  SkillInput,
  SkillSummary,
} from "@/lib/skills/types";

/** Monta a querystring de listagem incluindo apenas filtros definidos e não vazios. */
export function buildSkillsQuery(filters: SkillFilters, page: number, pageSize: number): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.proficiency) params.set("proficiency", filters.proficiency);
  if (filters.tags?.trim()) params.set("tags", filters.tags.trim());
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  return params.toString();
}

export function listSkills(
  filters: SkillFilters,
  page: number,
  pageSize: number,
): Promise<Paginated<SkillSummary>> {
  return api.get<Paginated<SkillSummary>>(`/skills?${buildSkillsQuery(filters, page, pageSize)}`);
}

export const getSkill = (id: string): Promise<Skill> => api.get<Skill>(`/skills/${id}`);

export const createSkill = (input: SkillInput): Promise<Skill> => api.post<Skill>("/skills", input);

export const updateSkill = (id: string, input: Partial<SkillInput>): Promise<Skill> =>
  api.put<Skill>(`/skills/${id}`, input);

export const deleteSkill = (id: string): Promise<null> => api.delete<null>(`/skills/${id}`);

export const addEvidence = (skillId: string, input: EvidenceInput): Promise<Evidence> =>
  api.post<Evidence>(`/skills/${skillId}/evidences`, input);

export const deleteEvidence = (id: string): Promise<null> => api.delete<null>(`/evidences/${id}`);
