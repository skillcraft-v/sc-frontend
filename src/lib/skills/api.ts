/**
 * Chamadas tipadas do domínio SKL, todas via o cliente único (`@/lib/api`).
 * Sem regra de negócio (P-006); apenas monta requests e tipa respostas.
 */
import { api } from "@/lib/api";
import type { Paginated } from "@/lib/types";
import type {
  AcceptAllSuggestionsResult,
  Evidence,
  EvidenceInput,
  Skill,
  SkillFilters,
  SkillInput,
  SkillSuggestion,
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

/** Tamanho de página do painel de sugestões (SKC-58) — sem paginação visível na UI (A2). */
export const SUGGESTIONS_PAGE_SIZE = 50;

/** Lista as sugestões automáticas pendentes (`GET /skills/suggestions`, SKC-57). */
export const listSkillSuggestions = (): Promise<Paginated<SkillSuggestion>> =>
  api.get<Paginated<SkillSuggestion>>(
    `/skills/suggestions?page=1&page_size=${SUGGESTIONS_PAGE_SIZE}`,
  );

/**
 * Aceita uma sugestão (`POST /skills/suggestions/{key}/accept`): cria a skill pelo fluxo
 * padrão do backend e registra a decisão — idempotente se já aceita (SKL-08).
 */
export const acceptSkillSuggestion = (key: string): Promise<Skill> =>
  api.post<Skill>(`/skills/suggestions/${key}/accept`);

/** Aceita todas as sugestões pendentes de uma vez (`POST /skills/suggestions/accept-all`, SKL-09). */
export const acceptAllSkillSuggestions = (): Promise<AcceptAllSuggestionsResult> =>
  api.post<AcceptAllSuggestionsResult>("/skills/suggestions/accept-all");
