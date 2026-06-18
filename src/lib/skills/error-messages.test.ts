import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { skillErrorMessage, fieldErrors } from "@/lib/skills/error-messages";

const make = (code: string, opts: Partial<ConstructorParameters<typeof ApiError>[0]> = {}) =>
  new ApiError({ code, message: "raw", status: 400, ...opts });

describe("skillErrorMessage — matriz FDD-SKL §6", () => {
  it.each([
    ["MISSING_TRANSLATION", /dois idiomas/i],
    ["EXPLANATION_WITHOUT_CODE", /exemplo de código/i],
    ["SKILL_NOT_FOUND", /skill não encontrada/i],
    ["EMPTY_EVIDENCE", /url ou uma descrição/i],
    ["EVIDENCE_NOT_FOUND", /evidência não encontrada/i],
    ["VALIDATION_ERROR", /campos destacados/i], // transversal
  ])("traduz %s para pt-BR", (code, expected) => {
    expect(skillErrorMessage(make(code))).toMatch(expected);
  });

  it("não vaza a mensagem crua da API", () => {
    expect(skillErrorMessage(make("SKILL_NOT_FOUND"))).not.toContain("raw");
  });

  it("usa fallback genérico para code desconhecido e não-ApiError", () => {
    expect(skillErrorMessage(make("WAT"))).toMatch(/não foi possível/i);
    expect(skillErrorMessage(new Error("x"))).toMatch(/não foi possível/i);
  });
});

describe("fieldErrors (reuso genérico)", () => {
  it("extrai erros por campo do VALIDATION_ERROR", () => {
    const err = make("VALIDATION_ERROR", {
      details: [{ field: "title_en", message: "Obrigatório" }],
    });
    expect(fieldErrors(err)).toEqual({ title_en: "Obrigatório" });
  });
});
