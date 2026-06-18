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
