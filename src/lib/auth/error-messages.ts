/**
 * Mapeia os códigos de erro do envelope da API (FDD-USR §6) para mensagens pt-BR.
 * Nunca expõe stack/request_id ao usuário final. A autoridade da regra é o sc-api (P-006).
 * Reusa os helpers genéricos de `@/lib/error-utils`.
 */
import { messageFromMap, fieldErrors } from "@/lib/error-utils";

/** Mensagens específicas do domínio USR (FDD-USR §6). */
const USR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "Este e-mail já está cadastrado. Tente fazer login.",
  WEAK_PASSWORD:
    "Senha fraca. Use ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo.",
  INVALID_CREDENTIALS: "E-mail ou senha inválidos.",
  INVALID_REFRESH_TOKEN: "Sua sessão expirou. Entre novamente.",
};

/** Mensagem pt-BR para um erro de autenticação/perfil. */
export function authErrorMessage(error: unknown): string {
  return messageFromMap(error, USR_MESSAGES);
}

export { fieldErrors };
