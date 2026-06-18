/**
 * Tipos do domínio SKL (skills e evidências), refletindo o contrato do sc-api
 * (FDD-SKL §5 + domain-context). A UI nunca duplica regra de negócio (P-006).
 */

/** Enums nativos do backend (valores canônicos) com rótulos pt-BR para exibição. */
export const SKILL_CATEGORIES = [
  "backend",
  "frontend",
  "ml_ai",
  "data",
  "devops",
  "mobile",
  "soft_skill",
  "other",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  backend: "Backend",
  frontend: "Frontend",
  ml_ai: "ML / IA",
  data: "Dados",
  devops: "DevOps",
  mobile: "Mobile",
  soft_skill: "Soft skill",
  other: "Outro",
};

export const PROFICIENCY_LEVELS = ["basic", "intermediate", "advanced", "expert"] as const;
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

export const PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = {
  basic: "Básico",
  intermediate: "Intermediário",
  advanced: "Avançado",
  expert: "Especialista",
};

export const EVIDENCE_TYPES = [
  "github",
  "certificate",
  "article",
  "demo",
  "metric",
  "other",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  github: "GitHub",
  certificate: "Certificado",
  article: "Artigo",
  demo: "Demo",
  metric: "Métrica",
  other: "Outro",
};

/** Evidência de uma skill (SKL-04): exige `url` OU `description`. */
export interface Evidence {
  id: string;
  skill_id: string;
  type: EvidenceType;
  url?: string | null;
  description?: string | null;
}

/** Resumo de skill retornado na listagem paginada. */
export interface SkillSummary {
  id: string;
  title_pt: string;
  title_en: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  tags: string[];
}

/** Skill completa (GET /skills/{id}) — inclui código e evidências. */
export interface Skill extends SkillSummary {
  description_pt: string;
  description_en: string;
  code_example?: string | null;
  code_explanation_pt?: string | null;
  code_explanation_en?: string | null;
  evidences?: Evidence[];
}

/** Corpo de criação/edição de skill. PUT é parcial (campos omitidos preservados). */
export interface SkillInput {
  title_pt: string;
  title_en: string;
  description_pt: string;
  description_en: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  tags: string[];
  code_example?: string | null;
  code_explanation_pt?: string | null;
  code_explanation_en?: string | null;
}

/** Corpo de criação de evidência (POST /skills/{id}/evidences). */
export interface EvidenceInput {
  type: EvidenceType;
  url?: string | null;
  description?: string | null;
}

/** Filtros da listagem (todos opcionais e combináveis). */
export interface SkillFilters {
  category?: SkillCategory;
  proficiency?: ProficiencyLevel;
  tags?: string;
  search?: string;
}
