import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { adaptationErrorMessage, failureMessage, fieldErrors } from "@/lib/adaptations/error-messages";

const make = (code: string, opts: Partial<ConstructorParameters<typeof ApiError>[0]> = {}) =>
  new ApiError({ code, message: "raw", status: 400, ...opts });

describe("adaptationErrorMessage — matriz FDD-ADP §6 + FDD-PDF §6", () => {
  it.each([
    ["RATE_LIMIT_EXCEEDED", /limite de adaptações/i],
    ["EMPTY_SKILL_CATALOG", /skill ativa/i],
    ["INVALID_MANUAL_SELECTION", /seleção de skills inválida/i],
    ["JOB_NOT_FOUND", /vaga não encontrada/i],
    ["ADAPTATION_NOT_FOUND", /adaptação não encontrada/i],
    ["AI_TIMEOUT", /expirou/i],
    ["AI_PROVIDER_ERROR", /provedor de ia/i],
    ["AI_INVALID_RESPONSE", /resposta inválida/i],
    ["PDF_RENDER_ERROR", /falha ao gerar o pdf/i],
    ["ORPHANED_AFTER_RESTART", /interrompido/i],
    ["ADAPTATION_NOT_COMPLETED", /ainda não foi concluída/i],
    ["RESUME_NOT_READY", /ainda não está pronto/i],
    ["RESUME_FILE_MISSING", /arquivo do pdf não encontrado/i],
    ["SNAPSHOT_SCHEMA_MISMATCH", /formato incompatível/i],
    ["VALIDATION_ERROR", /campos destacados/i], // transversal
  ])("traduz %s para pt-BR", (code, expected) => {
    expect(adaptationErrorMessage(make(code))).toMatch(expected);
  });

  it("não vaza a mensagem crua da API", () => {
    expect(adaptationErrorMessage(make("AI_TIMEOUT"))).not.toContain("raw");
  });

  it("usa fallback genérico para code desconhecido e não-ApiError", () => {
    expect(adaptationErrorMessage(make("WAT"))).toMatch(/não foi possível/i);
    expect(adaptationErrorMessage(new Error("x"))).toMatch(/não foi possível/i);
  });
});

describe("failureMessage — código de falha terminal", () => {
  it("traduz o error.code de um status failed", () => {
    expect(failureMessage("AI_TIMEOUT")).toMatch(/expirou/i);
    expect(failureMessage("PDF_RENDER_ERROR")).toMatch(/falha ao gerar o pdf/i);
  });

  it("tem fallback quando o código está ausente", () => {
    expect(failureMessage(undefined)).toMatch(/falhou/i);
  });
});

describe("fieldErrors (reuso genérico)", () => {
  it("extrai erros por campo do VALIDATION_ERROR", () => {
    const err = make("VALIDATION_ERROR", { details: [{ field: "language", message: "Idioma inválido" }] });
    expect(fieldErrors(err)).toEqual({ language: "Idioma inválido" });
  });
});
