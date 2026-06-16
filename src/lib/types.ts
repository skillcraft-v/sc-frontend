/**
 * Contratos transversais da API sc-api (API_SPEC.md).
 * A UI nunca duplica regra de negócio (P-006); estes tipos só refletem o
 * envelope de transporte: erros e paginação.
 */

/** Detalhe de erro de validação (400 VALIDATION_ERROR) — campo + mensagem, sem o input. */
export interface ApiErrorDetail {
  field?: string;
  message: string;
}

/** Envelope de erro padrão: `{ "error": { code, message, details, request_id } }`. */
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    request_id?: string;
  };
}

/** Envelope de paginação: `{ items, total, page, page_size, pages }`. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/** Par de tokens JWT emitido por register/login/refresh (access ≤ 1h, refresh ≤ 30d). */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}
