/**
 * Mapeia os códigos de erro do envelope (FDD-CAR §6) para mensagens pt-BR.
 * Reusa os helpers genéricos de `@/lib/error-utils`.
 */
import { messageFromMap, fieldErrors } from "@/lib/error-utils";

/** Mensagens específicas do domínio CAR (FDD-CAR §6). */
const CAR_MESSAGES: Record<string, string> = {
  INVALID_DATE_RANGE: "A data de término não pode ser anterior à data de início.",
  INVALID_WEIGHT: "O peso de relevância deve estar entre 0 e 1.",
  PROJECT_NOT_FOUND: "Projeto não encontrado.",
  SKILL_NOT_FOUND: "Skill não encontrada.",
  EDUCATION_NOT_FOUND: "Formação não encontrada.",
  CERTIFICATION_NOT_FOUND: "Certificação não encontrada.",
};

/** Mensagem pt-BR para um erro do domínio CAR. */
export function careerErrorMessage(error: unknown): string {
  return messageFromMap(error, CAR_MESSAGES);
}

export { fieldErrors };
