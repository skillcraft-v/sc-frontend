> Part of the testing-guide-sc-frontend skill (see ../SKILL.md).

# Convenções de arquivos e cobertura

## Nomes e localização

| Camada | Padrão | Localização |
|---|---|---|
| Unit / component / integration | `<unidade>.test.ts` / `<Componente>.test.tsx` | **Colocado** ao lado da unidade |
| Infra de mock | `handlers.ts`, `server.ts` | `src/test/msw/` |
| E2E + a11y | `<fluxo>.spec.ts` | `e2e/` (fora do include do Vitest) |
| Visual (pós-MVP) | snapshots | `e2e/visual/` |

- Suítes agrupadas com `describe` por unidade/cenário; nomes de teste em pt-BR descrevendo comportamento (`it("sem filtros, envia apenas paginação")`).
- Um arquivo de teste por módulo; testes de vários componentes pequenos do mesmo domínio podem agrupar (`forms.test.tsx`, `items.test.tsx` em career).

## Configuração

- `vitest.config.ts`: jsdom, `globals: true`, setup `vitest.setup.ts` (jest-dom + ciclo MSW), include `src/**/*.{test,spec}.{ts,tsx}`.
- Alias `@/` resolvido pelo tsconfig — importe sempre via alias nos testes.
- `playwright.config.ts`: `testDir: e2e`, chromium, `webServer` (CI: `build && start`; local: `dev` com `reuseExistingServer`), `baseURL http://localhost:3000`.
- Ambiente **jsdom obrigatório** (vitest-axe não funciona em happy-dom).

## Metas de cobertura (filosofia: thorough)

Gate real (falha `npm run test:coverage` — thresholds no `vitest.config.ts`):

| Escopo | Gate |
|---|---|
| Global (`src/**`, exceto exclusões) | **80%** lines/branches/functions/statements |
| `src/lib/**` | **90%** |

Exclusões deliberadas do coverage: `src/app/**` (coberto por E2E/RTL sem métrica), `src/test/**`, `*.d.ts`, `types.ts` (só tipos), arquivos de teste.

Metas por camada (norte qualitativo, docs/testing-strategy.md Phase 4 — não são gates):
- `src/lib` utils/parsing e auth/tokens: 95% · hooks: 90% · componentes: 85% · páginas: 80% via E2E/integração
- E2E: **100% dos fluxos críticos** (auth, adaptação→PDF) — cobertura por fluxo, não por linha.

Regras qualitativas (gate de review, não de métrica):
- Cada `error.code` do FDD §6 mapeado → 1 teste nomeado.
- Todo comportamento novo → teste da camada apropriada no mesmo diff (docs-guard falha o PR sem teste).
- Coverage é piso, não suficiência: anti-padrões (snapshot-only, sem asserção, mock-heavy) contam como teste ausente no /code-review-task.
- Mutation testing (Stryker, alvo ≥70% em `src/lib`) roda fora do PR — fechamento de fase.
