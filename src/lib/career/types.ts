/**
 * Tipos do domínio CAR (projetos, educação, certificações), refletindo o contrato
 * do sc-api (FDD-CAR §5 + domain-context). A UI nunca duplica regra (P-006).
 * Datas são strings ISO `YYYY-MM-DD`; `end_date`/`expires_at` null = em andamento/sem validade.
 */

export interface ProjectSkillLink {
  skill_id: string;
  relevance_weight: number; // [0,1]
}

export interface Project {
  id: string;
  title: string;
  company?: string | null;
  role?: string | null;
  start_date: string;
  end_date?: string | null;
  description_pt?: string | null;
  description_en?: string | null;
  technologies: string[];
  skills?: ProjectSkillLink[]; // presente em GET /projects/{id}
}

export interface ProjectInput {
  title: string;
  company?: string | null;
  role?: string | null;
  start_date: string;
  end_date?: string | null;
  description_pt?: string | null;
  description_en?: string | null;
  technologies: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  start_date: string;
  end_date?: string | null;
  description_pt?: string | null;
  description_en?: string | null;
}

export interface EducationInput {
  institution: string;
  degree: string;
  start_date: string;
  end_date?: string | null;
  description_pt?: string | null;
  description_en?: string | null;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issued_at: string;
  expires_at?: string | null;
  credential_url?: string | null;
}

export interface CertificationInput {
  name: string;
  issuer: string;
  issued_at: string;
  expires_at?: string | null;
  credential_url?: string | null;
}
