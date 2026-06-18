/**
 * Helpers genéricos para traduzir erros do envelope da API (qualquer domínio) em
 * mensagens pt-BR. Nunca expõe stack/request_id. A autoridade da regra é o sc-api (P-006).
 */
import { ApiError } from "@/lib/api";

/** Mensagens transversais (cliente + erros comuns a todos os domínios). */
export const COMMON_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Verifique os campos destacados e tente novamente.",
  UNAUTHORIZED: "Sua sessão expirou. Entre novamente.",
  RATE_LIMIT_EXCEEDED: "Muitas tentativas. Aguarde um minuto e tente novamente.",
  NETWORK_ERROR: "Falha de conexão com o servidor. Verifique sua internet e tente novamente.",
  UNKNOWN_ERROR: "Não foi possível concluir a operação. Tente novamente.",
};

export const DEFAULT_FALLBACK = "Não foi possível concluir a operação. Tente novamente.";

/**
 * Mensagem pt-BR para um erro, dado um mapa específico do domínio. O mapa do domínio
 * tem prioridade; cai nos transversais e, por fim, no fallback.
 */
export function messageFromMap(
  error: unknown,
  domainMessages: Record<string, string> = {},
  fallback: string = DEFAULT_FALLBACK,
): string {
  if (error instanceof ApiError) {
    return domainMessages[error.code] ?? COMMON_MESSAGES[error.code] ?? fallback;
  }
  return fallback;
}

/**
 * Erros de validação por campo (400 VALIDATION_ERROR) → mapa `campo → mensagem`.
 * Detalhes sem `field` são ignorados (a mensagem geral cobre esse caso).
 */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const result: Record<string, string> = {};
  for (const detail of error.details) {
    if (detail.field) result[detail.field] = detail.message;
  }
  return result;
}
