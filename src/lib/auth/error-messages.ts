/**
 * Mapeia os códigos de erro do envelope da API (FDD-USR §6) para mensagens pt-BR.
 * Nunca expõe stack/request_id ao usuário final. A autoridade da regra é o sc-api (P-006);
 * aqui só traduzimos o `error.code` para uma mensagem amigável.
 */
import { ApiError } from "@/lib/api";

/** Mensagens por código de erro conhecido (FDD-USR §6 + erros transversais do cliente). */
const MESSAGES: Record<string, string> = {
  // FDD-USR §6
  EMAIL_ALREADY_EXISTS: "Este e-mail já está cadastrado. Tente fazer login.",
  WEAK_PASSWORD:
    "Senha fraca. Use ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo.",
  INVALID_CREDENTIALS: "E-mail ou senha inválidos.",
  INVALID_REFRESH_TOKEN: "Sua sessão expirou. Entre novamente.",
  UNAUTHORIZED: "Sua sessão expirou. Entre novamente.",
  VALIDATION_ERROR: "Verifique os campos destacados e tente novamente.",
  RATE_LIMIT_EXCEEDED: "Muitas tentativas. Aguarde um minuto e tente novamente.",
  // Transversais do cliente (src/lib/api.ts)
  NETWORK_ERROR: "Falha de conexão com o servidor. Verifique sua internet e tente novamente.",
  UNKNOWN_ERROR: "Não foi possível concluir a operação. Tente novamente.",
};

const FALLBACK = "Não foi possível concluir a operação. Tente novamente.";

/** Mensagem pt-BR para um erro qualquer; usa o code do ApiError quando disponível. */
export function authErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? FALLBACK;
  }
  return FALLBACK;
}

/**
 * Erros de validação por campo (400 VALIDATION_ERROR) → mapa `campo → mensagem`,
 * para destacar inputs no formulário. Detalhes sem `field` são ignorados aqui
 * (a mensagem geral cobre esse caso).
 */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const result: Record<string, string> = {};
  for (const detail of error.details) {
    if (detail.field) result[detail.field] = detail.message;
  }
  return result;
}
