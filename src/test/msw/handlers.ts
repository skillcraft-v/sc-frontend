/**
 * Handlers base do MSW — contrato de transporte da sc-api (API_SPEC.md).
 *
 * Cada teste registra os handlers específicos do seu cenário via `server.use(...)`.
 * Aqui ficam apenas constantes e helpers reutilizáveis (ex.: montar o envelope de
 * erro padrão `{ error: { code, message, details, request_id } }`).
 */
import { http, HttpResponse } from "msw";
import type { ApiErrorDetail } from "@/lib/types";

/** Base usada pelo cliente quando NEXT_PUBLIC_API_URL não está definido (jsdom). */
export const TEST_API_BASE_URL = "http://localhost:8000/api/v1";

export const url = (path: string): string => `${TEST_API_BASE_URL}${path}`;

/** Monta o corpo do envelope de erro padrão da sc-api. */
export function errorEnvelope(
  code: string,
  message: string,
  opts: { details?: ApiErrorDetail[]; requestId?: string } = {},
) {
  return {
    error: {
      code,
      message,
      ...(opts.details ? { details: opts.details } : {}),
      ...(opts.requestId ? { request_id: opts.requestId } : {}),
    },
  };
}

export { http, HttpResponse };

/** Handlers default (vazio): cenários são definidos por teste com server.use(). */
export const handlers = [];
