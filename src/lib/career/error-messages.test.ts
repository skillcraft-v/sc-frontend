import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { careerErrorMessage, fieldErrors } from "@/lib/career/error-messages";

const make = (code: string, opts: Partial<ConstructorParameters<typeof ApiError>[0]> = {}) =>
  new ApiError({ code, message: "raw", status: 400, ...opts });

describe("careerErrorMessage — matriz FDD-CAR §6", () => {
  it.each([
    ["INVALID_DATE_RANGE", /data de t[eé]rmino/i],
    ["INVALID_WEIGHT", /entre 0 e 1/i],
    ["PROJECT_NOT_FOUND", /projeto n[aã]o encontrado/i],
    ["SKILL_NOT_FOUND", /skill n[aã]o encontrada/i],
    ["EDUCATION_NOT_FOUND", /forma[cç][aã]o n[aã]o encontrada/i],
    ["CERTIFICATION_NOT_FOUND", /certifica[cç][aã]o n[aã]o encontrada/i],
    ["VALIDATION_ERROR", /campos destacados/i], // transversal
  ])("traduz %s para pt-BR", (code, expected) => {
    expect(careerErrorMessage(make(code))).toMatch(expected);
  });

  it("não vaza a mensagem crua e usa fallback p/ desconhecido", () => {
    expect(careerErrorMessage(make("PROJECT_NOT_FOUND"))).not.toContain("raw");
    expect(careerErrorMessage(make("WAT"))).toMatch(/não foi possível/i);
  });

  it("fieldErrors extrai erros por campo (reuso genérico)", () => {
    const err = make("VALIDATION_ERROR", { details: [{ field: "start_date", message: "Obrigatória" }] });
    expect(fieldErrors(err)).toEqual({ start_date: "Obrigatória" });
  });
});
