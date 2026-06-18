import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { authErrorMessage, fieldErrors } from "@/lib/auth/error-messages";

const make = (code: string, opts: Partial<ConstructorParameters<typeof ApiError>[0]> = {}) =>
  new ApiError({ code, message: "raw", status: 400, ...opts });

describe("authErrorMessage — matriz FDD-USR §6", () => {
  // Um caso por linha da matriz de erros (§6).
  it.each([
    ["EMAIL_ALREADY_EXISTS", /já está cadastrado/i],
    ["WEAK_PASSWORD", /senha fraca/i],
    ["INVALID_CREDENTIALS", /inválidos/i],
    ["INVALID_REFRESH_TOKEN", /sessão expirou/i],
    ["UNAUTHORIZED", /sessão expirou/i],
    ["VALIDATION_ERROR", /campos destacados/i],
    ["RATE_LIMIT_EXCEEDED", /muitas tentativas/i],
  ])("traduz %s para pt-BR", (code, expected) => {
    expect(authErrorMessage(make(code))).toMatch(expected);
  });

  it("nunca vaza a mensagem crua/stack da API", () => {
    expect(authErrorMessage(make("INVALID_CREDENTIALS"))).not.toContain("raw");
  });

  it("usa fallback genérico para code desconhecido", () => {
    expect(authErrorMessage(make("SOME_NEW_CODE"))).toMatch(/não foi possível/i);
  });

  it("usa fallback para erro que não é ApiError", () => {
    expect(authErrorMessage(new Error("boom"))).toMatch(/não foi possível/i);
  });
});

describe("fieldErrors", () => {
  it("extrai erros por campo do VALIDATION_ERROR", () => {
    const err = make("VALIDATION_ERROR", {
      details: [
        { field: "linkedin_url", message: "URL inválida" },
        { field: "full_name", message: "obrigatório" },
      ],
    });
    expect(fieldErrors(err)).toEqual({
      linkedin_url: "URL inválida",
      full_name: "obrigatório",
    });
  });

  it("ignora detalhes sem campo e retorna vazio para não-ApiError", () => {
    expect(fieldErrors(make("VALIDATION_ERROR", { details: [{ message: "geral" }] }))).toEqual({});
    expect(fieldErrors(new Error("x"))).toEqual({});
  });
});
