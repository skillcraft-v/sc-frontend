/**
 * Mapeia os códigos de erro dos envelopes ADP (FDD-ADP §6) e PDF (FDD-PDF §6) para
 * mensagens pt-BR. Cobre tanto os erros HTTP do disparo/download quanto os códigos de
 * falha terminal (`status = failed`, `error.code`). Reusa `@/lib/error-utils`.
 */
import { ApiError } from "@/lib/api";
import { messageFromMap, fieldErrors } from "@/lib/error-utils";

/** Mensagens específicas de ADP + PDF (§6 de cada FDD). */
const ADP_PDF_MESSAGES: Record<string, string> = {
  // ── ADP ──────────────────────────────────────────────────────────────────
  JOB_NOT_FOUND: "Vaga não encontrada.",
  EMPTY_SKILL_CATALOG: "Cadastre ao menos uma skill ativa antes de adaptar.",
  INVALID_MANUAL_SELECTION: "Seleção de skills inválida.",
  RATE_LIMIT_EXCEEDED: "Você atingiu o limite de adaptações por hora. Tente mais tarde.",
  ADAPTATION_NOT_FOUND: "Adaptação não encontrada.",
  AI_TIMEOUT: "A análise por IA expirou. Tente gerar novamente.",
  AI_PROVIDER_ERROR: "O provedor de IA está indisponível no momento. Tente novamente.",
  AI_INVALID_RESPONSE: "A IA retornou uma resposta inválida. Tente gerar novamente.",
  PDF_RENDER_ERROR: "Falha ao gerar o PDF. Tente novamente.",
  ORPHANED_AFTER_RESTART: "O processamento foi interrompido. Gere a adaptação novamente.",
  // ── PDF ──────────────────────────────────────────────────────────────────
  ADAPTATION_NOT_COMPLETED: "A adaptação ainda não foi concluída.",
  RESUME_NOT_READY: "O PDF ainda não está pronto.",
  RESUME_FILE_MISSING: "Arquivo do PDF não encontrado.",
  SNAPSHOT_SCHEMA_MISMATCH: "Não foi possível gerar este PDF (formato incompatível).",
};

/** Mensagem pt-BR para um erro de transporte/HTTP dos domínios ADP/PDF. */
export function adaptationErrorMessage(error: unknown): string {
  return messageFromMap(error, ADP_PDF_MESSAGES);
}

/**
 * Mensagem pt-BR para o código de falha terminal de uma adaptação (`status = failed`).
 * Recebe o `error.code` cru e reaproveita o mesmo mapa de domínio.
 */
export function failureMessage(code: string | undefined): string {
  if (!code) return "A adaptação falhou. Tente gerar novamente.";
  return adaptationErrorMessage(new ApiError({ code, message: "", status: 0 }));
}

export { fieldErrors };
