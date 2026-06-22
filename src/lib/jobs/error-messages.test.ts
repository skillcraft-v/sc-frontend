import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { jobErrorMessage, fieldErrors } from "@/lib/jobs/error-messages";

const make = (code: string, opts: Partial<ConstructorParameters<typeof ApiError>[0]> = {}) =>
  new ApiError({ code, message: "raw", status: 400, ...opts });

describe("jobErrorMessage — matriz FDD-JOB §6", () => {
  it.each([
    ["DESCRIPTION_TOO_SHORT", /100 caracteres/i],
    ["INVALID_STATUS_TRANSITION", /não permitida/i],
    ["JOB_NOT_FOUND", /vaga não encontrada/i],
    ["VALIDATION_ERROR", /campos destacados/i], // transversal (COMMON_MESSAGES)
  ])("traduz %s para pt-BR", (code, expected) => {
    expect(jobErrorMessage(make(code))).toMatch(expected);
  });

  it("não vaza a mensagem crua da API", () => {
    expect(jobErrorMessage(make("JOB_NOT_FOUND"))).not.toContain("raw");
  });

  it("usa fallback genérico para code desconhecido e não-ApiError", () => {
    expect(jobErrorMessage(make("WAT"))).toMatch(/não foi possível/i);
    expect(jobErrorMessage(new Error("x"))).toMatch(/não foi possível/i);
  });
});

describe("fieldErrors (reuso genérico)", () => {
  it("extrai erros por campo do VALIDATION_ERROR", () => {
    const err = make("VALIDATION_ERROR", {
      details: [{ field: "url", message: "URL inválida" }],
    });
    expect(fieldErrors(err)).toEqual({ url: "URL inválida" });
  });
});
