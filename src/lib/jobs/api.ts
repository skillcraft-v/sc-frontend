/**
 * Chamadas tipadas do domínio JOB, todas via o cliente único (`@/lib/api`).
 * A listagem é paginada (envelope `Paginated`). Sem regra de negócio aqui (P-006).
 */
import { api } from "@/lib/api";
import type { Paginated } from "@/lib/types";
import type {
  Job,
  JobAdaptationSummary,
  JobFilters,
  JobImportPayload,
  JobInput,
  JobStatus,
  JobSummary,
} from "@/lib/jobs/types";

export const JOBS_PAGE_SIZE = 20;

/** Monta a querystring de listagem incluindo apenas filtros definidos + paginação. */
export function buildJobsQuery(filters: JobFilters, page: number, pageSize: number): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.company?.trim()) params.set("company", filters.company.trim());
  if (filters.is_remote !== undefined) params.set("is_remote", String(filters.is_remote));
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  return params.toString();
}

export function listJobs(
  filters: JobFilters,
  page: number,
  pageSize: number,
): Promise<Paginated<JobSummary>> {
  return api.get<Paginated<JobSummary>>(`/jobs?${buildJobsQuery(filters, page, pageSize)}`);
}

export const getJob = (id: string): Promise<Job> => api.get<Job>(`/jobs/${id}`);

export const createJob = (input: JobInput): Promise<Job> => api.post<Job>("/jobs", input);

export const updateJob = (id: string, input: Partial<JobInput>): Promise<Job> =>
  api.put<Job>(`/jobs/${id}`, input);

export const deleteJob = (id: string): Promise<null> => api.delete<null>(`/jobs/${id}`);

/**
 * Move a vaga no funil (`PATCH /jobs/{id}/status`). `appliedAt` é opcional — o backend
 * usa `now()` quando ausente na transição para `applied` (JOB-02). Transição inválida → 409.
 */
export const changeJobStatus = (
  id: string,
  status: JobStatus,
  appliedAt?: string,
): Promise<Job> =>
  api.patch<Job>(`/jobs/${id}/status`, {
    status,
    ...(appliedAt ? { applied_at: appliedAt } : {}),
  });

export const listJobAdaptations = (id: string): Promise<JobAdaptationSummary[]> =>
  api.get<JobAdaptationSummary[]>(`/jobs/${id}/adaptations`);

/**
 * Importa uma vaga a partir de uma URL pública (`POST /jobs/import`, SKC-53): fetch +
 * parsing heurístico no backend, sem IA. Não persiste — devolve o payload para revisão
 * no `JobForm`; a criação continua por `createJob` (P-006).
 */
export const importJob = (url: string): Promise<JobImportPayload> =>
  api.post<JobImportPayload>("/jobs/import", { url });
