> Part of the testing-guide-sc-frontend skill (see ../SKILL.md).

# Sistemas externos — estratégia real vs fake

O sc-frontend tem **um único sistema externo**: a API REST da sc-api (`../sc-api/API_SPEC.md`). Sem banco, fila, cache ou storage próprios.

| Camada | Estratégia | Ferramenta | Racional |
|---|---|---|---|
| Unit / component / hooks (Vitest, jsdom) | **Fake na camada de rede** | MSW 2 (`setupServer`) | Exercita o `fetch` real através de `src/lib/api.ts` (Bearer, refresh, envelope); imune a refactor do cliente |
| E2E (Playwright) | **Fake na camada do browser** | `page.route()` | App real no browser, sem depender de backend vivo; telas públicas rodam sem mock |
| E2E contra sc-api real | **Não-objetivo por ora** | — | Decisão registrada (task-brief SKC-28); reavaliar quando houver harness de API de teste |

## Setup e teardown (Vitest — já configurado, não duplicar)

`vitest.setup.ts` gerencia o ciclo global:
- `beforeAll`: `server.listen({ onUnhandledRequest: "error" })` — request sem handler = teste falha (nada escapa do contrato)
- `afterEach`: `server.resetHandlers()` — isolamento entre testes
- `afterAll`: `server.close()`

Por teste:
- Cenário via `server.use(http.<verbo>(url("/rota"), resolver))` — os defaults em `handlers.ts` são intencionalmente vazios.
- Helpers de `@/test/msw/handlers`: `url()` (prefixa o base da API), `errorEnvelope(code, message, {details, requestId})` (envelope real da sc-api).
- Estado de auth: `clearTokens()` + `localStorage.clear()` no `beforeEach`; para páginas protegidas, `setTokens({...})`.

## Regras

- Sintaxe MSW **v2**: `http` + `HttpResponse` (nunca `rest`/`ctx` de v1).
- Respostas de erro sempre com `errorEnvelope()` — manter o shape alinhado ao API_SPEC é o nosso contract test de pobre; divergência descoberta vira pendência para o sc-api.
- Latência/race: `delay()` do MSW ou `vi.useFakeTimers()`; nunca `setTimeout` real longo.
- No Playwright, `page.route()` deve casar a URL completa da API (`http://localhost:3340/api/v1/...`) — o app roda com o default de `NEXT_PUBLIC_API_URL`.
