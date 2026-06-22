/**
 * Chamadas tipadas do domínio CAR, todas via o cliente único (`@/lib/api`).
 * Listas não são paginadas (o backend devolve os ativos do dono). Sem regra (P-006).
 */
import { api } from "@/lib/api";
import type {
  Certification,
  CertificationInput,
  Education,
  EducationInput,
  Project,
  ProjectInput,
  ProjectSkillLink,
} from "@/lib/career/types";

// ── Projects ─────────────────────────────────────────────────────────────────
export const listProjects = (): Promise<Project[]> => api.get<Project[]>("/projects");
export const getProject = (id: string): Promise<Project> => api.get<Project>(`/projects/${id}`);
export const createProject = (input: ProjectInput): Promise<Project> =>
  api.post<Project>("/projects", input);
export const updateProject = (id: string, input: Partial<ProjectInput>): Promise<Project> =>
  api.put<Project>(`/projects/${id}`, input);
export const deleteProject = (id: string): Promise<null> => api.delete<null>(`/projects/${id}`);

export const linkSkill = (
  projectId: string,
  skillId: string,
  relevanceWeight: number,
): Promise<ProjectSkillLink> =>
  api.put<ProjectSkillLink>(`/projects/${projectId}/skills/${skillId}`, {
    relevance_weight: relevanceWeight,
  });
export const unlinkSkill = (projectId: string, skillId: string): Promise<null> =>
  api.delete<null>(`/projects/${projectId}/skills/${skillId}`);

// ── Education ────────────────────────────────────────────────────────────────
export const listEducation = (): Promise<Education[]> => api.get<Education[]>("/education");
export const createEducation = (input: EducationInput): Promise<Education> =>
  api.post<Education>("/education", input);
export const updateEducation = (id: string, input: Partial<EducationInput>): Promise<Education> =>
  api.put<Education>(`/education/${id}`, input);
export const deleteEducation = (id: string): Promise<null> => api.delete<null>(`/education/${id}`);

// ── Certifications ───────────────────────────────────────────────────────────
export const listCertifications = (): Promise<Certification[]> =>
  api.get<Certification[]>("/certifications");
export const createCertification = (input: CertificationInput): Promise<Certification> =>
  api.post<Certification>("/certifications", input);
export const updateCertification = (
  id: string,
  input: Partial<CertificationInput>,
): Promise<Certification> => api.put<Certification>(`/certifications/${id}`, input);
export const deleteCertification = (id: string): Promise<null> =>
  api.delete<null>(`/certifications/${id}`);
