/**
 * Mapeia os códigos de erro do envelope (FDD-SKL §6) para mensagens pt-BR.
 * Reusa os helpers genéricos de `@/lib/error-utils`.
 */
import { messageFromMap, fieldErrors } from "@/lib/error-utils";

/** Mensagens específicas do domínio SKL (FDD-SKL §6). */
const SKL_MESSAGES: Record<string, string> = {
  MISSING_TRANSLATION: "Preencha o título e a descrição nos dois idiomas (PT e EN).",
  EXPLANATION_WITHOUT_CODE:
    "A explicação de código exige um exemplo de código. Preencha o campo de código.",
  SKILL_NOT_FOUND: "Skill não encontrada.",
  EMPTY_EVIDENCE: "Informe ao menos uma URL ou uma descrição para a evidência.",
  EVIDENCE_NOT_FOUND: "Evidência não encontrada.",
  SUGGESTION_NOT_FOUND: "Essa sugestão não existe mais.",
  SUGGESTION_ALREADY_DECIDED: "Essa sugestão já foi decidida antes.",
};

/** Mensagem pt-BR para um erro do domínio SKL. */
export function skillErrorMessage(error: unknown): string {
  return messageFromMap(error, SKL_MESSAGES);
}

export { fieldErrors };
