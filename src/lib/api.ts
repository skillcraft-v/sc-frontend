/**
 * Cliente HTTP único e tipado da API sc-api (API_SPEC.md).
 *
 * Responsabilidades:
 * - baseURL via NEXT_PUBLIC_API_URL.
 * - Injeta `Authorization: Bearer <access_token>` quando autenticado.
 * - Desempacota o envelope de erro `{ error: { code, message, details, request_id } }`
 *   em `ApiError` (a UI mapeia `error.code` → mensagem pt-BR; nunca exibe stack/request_id cru).
 * - Refresh automático de token em 401 via `POST /auth/refresh`, com single-flight
 *   (uma única chamada de refresh concorrente; demais requisições aguardam e repetem).
 *
 * Nenhuma regra de negócio vive aqui (P-006). Tokens nunca são logados.
 */
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth-tokens";
import type { ApiErrorDetail, ApiErrorEnvelope, TokenPair } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/** Rotas que não recebem Bearer nem disparam o fluxo de refresh. */
const AUTH_PUBLIC_PATHS = ["/auth/register", "/auth/login", "/auth/refresh"];

/** Erro tipado derivado do envelope da API (ou de falha de transporte). */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: ApiErrorDetail[];
  readonly requestId?: string;

  constructor(params: {
    code: string;
    message: string;
    status: number;
    details?: ApiErrorDetail[];
    requestId?: string;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code;
    this.status = params.status;
    this.details = params.details ?? [];
    this.requestId = params.requestId;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Corpo serializado como JSON automaticamente. */
  body?: unknown;
  /** Não anexar Bearer nem tentar refresh (ex.: chamadas de auth públicas). */
  skipAuth?: boolean;
  /**
   * Tipo da resposta de sucesso. `"json"` (default) desempacota o envelope; `"blob"`
   * retorna o corpo binário (ex.: download de PDF). Erros seguem sempre o envelope JSON.
   */
  responseType?: "json" | "blob";
}

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//.test(path);
}

function buildUrl(path: string): string {
  if (isAbsoluteUrl(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function isErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error: unknown }).error === "object" &&
    (value as { error: unknown }).error !== null
  );
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function toApiError(status: number, body: unknown): ApiError {
  if (isErrorEnvelope(body)) {
    const { error } = body;
    return new ApiError({
      code: error.code,
      message: error.message,
      status,
      details: error.details,
      requestId: error.request_id,
    });
  }
  return new ApiError({
    code: "UNKNOWN_ERROR",
    message: "Não foi possível concluir a operação. Tente novamente.",
    status,
  });
}

// ── Single-flight refresh ───────────────────────────────────────────────────
let refreshInFlight: Promise<boolean> | null = null;

/**
 * Renova o par de tokens usando o refresh_token. Concorrência protegida:
 * chamadas simultâneas compartilham a mesma promessa. Retorna `true` em sucesso.
 */
async function refreshTokens(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(buildUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!response.ok) {
        clearTokens();
        return false;
      }
      const tokens = (await response.json()) as TokenPair;
      setTokens(tokens);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function performRequest<T>(
  path: string,
  options: RequestOptions,
  retry: boolean,
): Promise<T> {
  const { body, skipAuth, headers, responseType, ...rest } = options;
  const isPublic = skipAuth || AUTH_PUBLIC_PATHS.some((p) => path.startsWith(p));

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (!isPublic) {
    const accessToken = getAccessToken();
    if (accessToken) finalHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "Falha de conexão com o servidor. Verifique sua internet e tente novamente.",
      status: 0,
    });
  }

  // 401 em rota autenticada → tenta refresh uma única vez e repete.
  if (response.status === 401 && !isPublic && retry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return performRequest<T>(path, options, false);
    }
    clearTokens();
  }

  if (!response.ok) {
    throw toApiError(response.status, await parseBody(response));
  }
  if (responseType === "blob") {
    return (await response.blob()) as T;
  }
  return (await parseBody(response)) as T;
}

/** Executa uma requisição tipada contra a API, com refresh automático. */
export function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return performRequest<T>(path, options, true);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions): Promise<T> =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  /** GET que retorna o corpo binário (ex.: download de PDF), com auth/refresh. */
  getBlob: (path: string, options?: RequestOptions): Promise<Blob> =>
    apiRequest<Blob>(path, { ...options, method: "GET", responseType: "blob" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions): Promise<T> =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};

export { API_BASE_URL };
