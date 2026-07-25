/**
 * Tipos do domínio JOB (vagas), refletindo o contrato do sc-api (FDD-JOB §5 + domain-context).
 * A UI nunca duplica regra (P-006): o grafo do funil aqui é apenas cosmético (habilita/desabilita
 * botões); a máquina de estados é validada no backend. Datas são strings ISO.
 */

/** Estados do funil de candidatura (enum `job_status`, FDD-JOB). */
export const JOB_STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "accepted",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

/** Rótulos pt-BR de cada status (NFR-010). */
export const STATUS_LABELS: Record<JobStatus, string> = {
  saved: "Salva",
  applied: "Candidatada",
  interviewing: "Em entrevista",
  offer: "Proposta",
  rejected: "Rejeitada",
  accepted: "Aceita",
};

/** Rótulos pt-BR no plural, usados nos chips do funil (handoff §Vagas). */
export const STATUS_PLURAL_LABELS: Record<JobStatus, string> = {
  saved: "Salvas",
  applied: "Aplicadas",
  interviewing: "Entrevistando",
  offer: "Propostas",
  rejected: "Recusadas",
  accepted: "Aceitas",
};

/**
 * Grafo de transições do funil (JOB-01) — só avança no MVP. Usado apenas para habilitar
 * os botões de transição; a validação real é do sc-api (transição inválida → 409).
 */
export const NEXT_STATUSES: Record<JobStatus, readonly JobStatus[]> = {
  saved: ["applied"],
  applied: ["interviewing", "rejected"],
  interviewing: ["offer", "rejected"],
  offer: ["accepted", "rejected"],
  rejected: [],
  accepted: [],
};

/** Item resumido da listagem de vagas (`GET /jobs`). */
export interface JobSummary {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  is_remote: boolean;
  location?: string | null;
  created_at: string;
  applied_at?: string | null;
}

/** Vaga completa (`GET /jobs/{id}`). */
export interface Job extends JobSummary {
  description: string;
  requirements?: string | null;
  url?: string | null;
  salary_range?: string | null;
}

/** Corpo de criação/edição de vaga (`POST`/`PUT /jobs`). */
export interface JobInput {
  title: string;
  company: string;
  description: string;
  requirements?: string | null;
  url?: string | null;
  salary_range?: string | null;
  location?: string | null;
  is_remote: boolean;
}

/** Filtros da listagem (combináveis com paginação). */
export interface JobFilters {
  status?: JobStatus;
  company?: string;
  is_remote?: boolean;
}

/** Item resumido do histórico de adaptações de uma vaga (`GET /jobs/{id}/adaptations`). */
export interface JobAdaptationSummary {
  id: string;
  status: string;
  created_at: string;
  match_score?: number | null;
}

/** Mínimo de caracteres exigido na descrição (JOB-03). Validação de UX é cortesia (P-006). */
export const MIN_DESCRIPTION_LENGTH = 100;

/**
 * Payload pré-preenchido de `POST /jobs/import` (SKC-53) — extração heurística, sem IA.
 * Não persiste: todos os campos são opcionais exceto `is_remote`/`url` (FDD-JOB §5).
 */
export interface JobImportPayload {
  title?: string | null;
  company?: string | null;
  description?: string | null;
  location?: string | null;
  is_remote: boolean;
  salary_range?: string | null;
  url: string;
}
