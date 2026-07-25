/**
 * Mapeia os códigos de erro do envelope (FDD-JOB §6) para mensagens pt-BR.
 * Reusa os helpers genéricos de `@/lib/error-utils`. Nunca expõe stack/request_id.
 */
import { messageFromMap, fieldErrors } from "@/lib/error-utils";

/** Mensagens específicas do domínio JOB (FDD-JOB §6). */
const JOB_MESSAGES: Record<string, string> = {
  DESCRIPTION_TOO_SHORT: "A descrição da vaga precisa ter ao menos 100 caracteres.",
  INVALID_STATUS_TRANSITION: "Transição de status não permitida para esta vaga.",
  JOB_NOT_FOUND: "Vaga não encontrada.",
  FETCH_FAILED: "Não foi possível acessar essa URL. Verifique o link e tente novamente.",
  CONTENT_NOT_RECOGNIZED:
    "Não encontramos título ou descrição nessa página. Preencha a vaga manualmente.",
};

/** Mensagem pt-BR para um erro do domínio JOB. */
export function jobErrorMessage(error: unknown): string {
  return messageFromMap(error, JOB_MESSAGES);
}

export { fieldErrors };
