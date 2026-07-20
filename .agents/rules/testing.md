---
paths:
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
  - "src/test/**"
  - "e2e/**"
---
# Testes

- Testes colocados ao lado da unidade (`api.test.ts`, `SkillForm.test.tsx`); infra de mock em `src/test/msw/`; E2E + a11y em `e2e/`.
- O que testar por camada (docs/testing-strategy.md): unit para `src/lib/*` (client, tokens, parsing, mapeamento de erro); component/integration (RTL+MSW) para formulários, interação e **estados loading/erro/vazio**; E2E para os fluxos críticos auth e adaptação→polling→PDF. `src/app/**` fica fora do coverage unit — é coberto por E2E.
- Mock de API sempre com MSW: `server.use(http.get(url("/skills"), ...))` usando `server` de `@/test/msw/server` e `http/HttpResponse/url` de `@/test/msw/handlers`. Não mocke `fetch` nem o módulo `@/lib/api`.
- Cada código de erro do FDD §6 que a UI mapeia ⇒ 1 teste nomeado pelo cenário (herdado do NFR-008). Erros simulados devolvem o envelope real: `{ error: { code, message, details } }`.
- Nome do teste descreve o comportamento em pt-BR: `it("sem filtros, envia apenas paginação")` — nunca `it("works")`.
- Queries RTL por role/label/text visível ao usuário; não assertar classes CSS nem estado interno.
- Anti-padrões rejeitados em review: teste sem `expect`; snapshot-only; mockar a própria unidade sob teste; testes duplicados para inflar coverage.
- Coverage é gate real: ≥80% global, ≥90% em `src/lib` (`npm run test:coverage` falha abaixo).
- Teste que toca tokens limpa o estado no `beforeEach` (`clearTokens()` + `localStorage.clear()`).
- E2E inclui verificação a11y com axe (`@axe-core/playwright`); component a11y pontual com `vitest-axe`.
