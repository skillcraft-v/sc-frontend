/**
 * Chamadas tipadas do domínio USR além de login/registro/perfil (que vivem em `session.tsx`
 * por já usarem o cliente único ali). Sem regra de negócio aqui (P-006).
 */
import { api } from "@/lib/api";
import type { ProfileCompleteness } from "@/lib/auth/types";

/** Completude do perfil (`GET /users/me/completeness`, USR-06). */
export const getProfileCompleteness = (): Promise<ProfileCompleteness> =>
  api.get<ProfileCompleteness>("/users/me/completeness");
