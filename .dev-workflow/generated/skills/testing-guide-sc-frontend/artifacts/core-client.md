> Part of the `testing-guide-sc-frontend` skill (see `../SKILL.md`).

# Núcleo (`src/lib/api.ts`, `src/lib/auth-tokens.ts`, `src/lib/error-utils.ts`)

Camada mais crítica do front (segurança de sessão) — barra de coverage **90%** (`src/lib`).

## What to test
- `api.ts`: envelope de erro → `ApiError` (com e sem envelope válido); falha de transporte → `NETWORK_ERROR` status 0; 401 em rota autenticada → refresh + retry **uma única vez**; refresh **single-flight** (N chamadas concorrentes → 1 request de refresh); refresh falho → `clearTokens`; rotas públicas sem Bearer e sem refresh; `getBlob` retorna binário mas erro continua vindo do envelope JSON; 204 → `null`.
- `auth-tokens.ts`: set/get/clear no storage; estado ausente → `null`; nunca logar token.
- `error-utils.ts`: cadeia domínio → comum → fallback; `fieldErrors` com/sem `field`.

## Layer assignment
- Tudo aqui é **unit + MSW**: o comportamento observável é "dado o que a rede responde, o que o cliente devolve/armazena". MSW simula a rede real (incluindo `/auth/refresh`); nunca mocke `fetch`.
- Concorrência (single-flight): dispare as chamadas em paralelo e conte requests recebidos pelo handler — aqui contar requests é legítimo, pois o número de chamadas de refresh É o contrato.

## Setup pattern
```ts
import { server } from "@/test/msw/server";
import { http, HttpResponse, url, errorEnvelope } from "@/test/msw/handlers";
import { api } from "./api";
import { setTokens, getAccessToken } from "./auth-tokens";

it("401 dispara um único refresh para chamadas concorrentes", async () => {
  let refreshes = 0;
  setTokens({ access_token: "velho", refresh_token: "r", token_type: "bearer" });
  server.use(
    http.get(url("/skills"), ({ request }) =>
      request.headers.get("authorization") === "Bearer novo"
        ? HttpResponse.json({ items: [], total: 0, page: 1, page_size: 20, pages: 0 })
        : HttpResponse.json(errorEnvelope("UNAUTHORIZED", "expired"), { status: 401 })),
    http.post(url("/auth/refresh"), () => {
      refreshes += 1;
      return HttpResponse.json({ access_token: "novo", refresh_token: "r2", token_type: "bearer" });
    }),
  );
  await Promise.all([api.get("/skills"), api.get("/skills")]);
  expect(refreshes).toBe(1);
  expect(getAccessToken()).toBe("novo");
});
```

## When to skip
- Não teste headers triviais (Content-Type) isoladamente — saem de graça nos cenários acima.
- Não asserte mensagens pt-BR aqui além das duas embutidas (`NETWORK_ERROR`/`UNKNOWN_ERROR`) — mapeamento é de `error-utils`/domínios.

## Examples from project
- `src/lib/api.test.ts` — refresh, envelope, blob (padrão a seguir).
- `src/lib/auth-tokens.test.ts` — storage e limpeza.
