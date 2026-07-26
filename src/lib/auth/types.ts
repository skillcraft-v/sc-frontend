/**
 * Tipos do domínio de autenticação/perfil (USR), refletindo o contrato do sc-api
 * (FDD-USR §5 e evidência docs/http/usr/). A UI nunca duplica regra de negócio (P-006).
 */
import type { TokenPair } from "@/lib/types";

/** Perfil do usuário corrente (GET /auth/me e bloco `user` das respostas de auth). */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  headline?: string | null;
  linkedin_url?: string | null;
}

/** Resposta de `POST /auth/register` (201) e `POST /auth/login` (200). */
export interface AuthResponse extends TokenPair {
  user: UserProfile;
  expires_in?: number;
}

/** Corpo de `POST /auth/register`. */
export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
}

/** Corpo de `POST /auth/login`. */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Corpo de `PUT /auth/me` (atualização parcial). Campos confirmados pelo contrato;
 * campos omitidos não mudam. Outros campos de perfil (ex.: bio) não estão documentados
 * no contrato atual — pendência para o sc-api antes de expô-los na UI.
 */
export interface ProfileUpdateInput {
  full_name?: string;
  headline?: string | null;
  linkedin_url?: string | null;
}

/** Seção com mais pontos faltantes na completude do perfil (USR-06). */
export const NEXT_HINT_SECTIONS = [
  "basic_data",
  "skills",
  "projects",
  "education",
  "certifications",
] as const;
export type NextHintSection = (typeof NEXT_HINT_SECTIONS)[number];

/**
 * Dica de ação por seção — texto de exibição é responsabilidade do frontend (API_SPEC):
 * o backend só informa qual seção tem mais pontos faltantes, sem contagem de itens.
 */
export const NEXT_HINT_LABELS: Record<NextHintSection, string> = {
  basic_data: "Complete seus dados básicos (bio, localização, links) para avançar.",
  skills: "Adicione mais skills ao seu catálogo para avançar.",
  projects: "Cadastre um projeto no seu perfil para avançar.",
  education: "Adicione sua formação acadêmica para avançar.",
  certifications: "Inclua uma certificação para avançar.",
};

/** Completude do perfil (`GET /users/me/completeness`, USR-06, SKC-59). */
export interface ProfileCompleteness {
  percentage: number;
  next_hint: NextHintSection | null;
}
