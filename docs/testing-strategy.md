# Frontend Testing Workflow — Audit & Strategy (sc-frontend)

> Status: **proposta** (não aplicada). Autor: auditoria assistida por IA · Data: 2026-06-17.
> Escopo: testing, qualidade e gates do **sc-frontend**. Fonte de verdade de processo: [sc-api/docs/workflow.md](../../sc-api/docs/workflow.md); NFRs: [sc-api/docs/prd/requisitos-nao-funcionais.md](../../sc-api/docs/prd/requisitos-nao-funcionais.md).

---

## Phase 1 — Audit Report (estado atual)

### O que existe hoje

| Área | Evidência | Estado |
|------|-----------|--------|
| Runner unitário/componente | `vitest` + `@testing-library/react` + `jsdom` em `package.json`; `vitest.config.ts` | ✅ instalado e configurado |
| Setup de testes | `vitest.setup.ts`, `include: src/**/*.{test,spec}` | ✅ |
| Execução no CI | `.github/workflows/ci.yml` step `npm test` | ⚠️ roda, mas **no-op** |
| Gate de revisão de testes | `/code-review-task` Etapa 4.7 ("Suficiência de testes") | ✅ forte, mas com texto desatualizado |
| Documentação Viva | `scripts/docs-guard.sh` + docs-guard no CI | ✅ (só CHANGELOG, não testes) |
| Coverage mandate (backend) | NFR-008: ≥80% use cases, teste nomeado por linha de matriz de erro | ✅ — **mas escopo sc-api** |

### Buracos confirmados por inspeção

1. **`passWithNoTests: true`** em `vitest.config.ts` → `npm test` passa com **zero testes**. Hoje há **0 arquivos de teste** em `src/`. O step de CI é cosmético.
2. **Sem tooling de coverage** — nenhum `@vitest/coverage-v8`, nenhum `thresholds`. Coverage não é medida nem aplicada.
3. **Nenhuma meta de cobertura para o frontend.** NFR-008 fala "camada de use cases" (Python/sc-api); não há equivalente front.
4. **Sem E2E** (sem Playwright), **sem a11y** (sem axe), **sem visual regression**, **sem contract tests**, **sem mutation testing**.
5. **`/task` Fase 4 trata teste como opcional**: `npm test # quando houver testes do escopo`.
6. **`task-brief.yaml` `dod_checklist`** não tem nenhum item de teste/cobertura.
7. **PR template** não tem item de teste no checklist.
8. **Inconsistência**: `/code-review-task` Etapa 4.7 diz "enquanto o projeto não tiver runner, registre a lacuna" — **o runner já existe**; o texto induz o agente a não exigir testes.

### Respostas às 7 perguntas da auditoria

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Requisitos de teste front existem? | **Parcial.** Só via `/code-review-task` 4.7 (gate de revisão), não como política/DoD. |
| 2 | Tipos exigidos hoje | Apenas unit/component (implícito), e mesmo assim não obrigatórios. E2E/a11y/visual/contract: **nenhum**. |
| 3 | Obrigatório ou opcional? | **Opcional na prática** (`passWithNoTests`, "quando houver testes"). |
| 4 | Metas de cobertura? | **Não** para o front. |
| 5 | Agentes IA instruídos a criar testes? | **Fracamente.** `/code-review-task` cobra na revisão; `/task` não exige na implementação. |
| 6 | CI aplica execução? | Roda, mas **não falha** sem testes; sem coverage gate. |
| 7 | Quality gates antes da aprovação? | Sim para lint/type/build/docs; **não** para teste/coverage. |

---

## Phase 2 — Gap Analysis

| Camada de teste | Regra existente | Lacuna | Risco |
|-----------------|-----------------|--------|-------|
| Unit (utils/hooks/services) | runner pronto | sem testes, sem meta | regressão silenciosa em `api.ts`, `auth-tokens.ts` (refresh de token!) |
| Component (RTL) | runner pronto | sem testes; estados loading/erro/vazio não verificados | NFR-010 (estados explícitos) não verificável |
| Integration | — | inexistente | mapeamento `error.code`→pt-BR (FDD §6) não testado |
| E2E (Playwright) | — | inexistente | fluxos críticos (auth, adaptação→polling→PDF) sem proteção |
| Accessibility (axe) | — | inexistente | sem garantia de teclado/ARIA/contraste |
| Visual regression | — | inexistente | regressão responsiva ≥360px (NFR-010) não detectada |
| Contract (vs API_SPEC) | docs-guard só CHANGELOG | inexistente | drift silencioso front↔sc-api; cliente tipado pode divergir do envelope real |
| Mutation (Stryker) | — | inexistente | coverage pode ser inflada sem asserção real |

**Inconsistências**: (a) `/code-review-task` assume "sem runner"; (b) `passWithNoTests:true` contradiz o gate de suficiência; (c) NFR-008 cobra 80% mas só backend — front sem paralelo.

---

## Phase 3 — Testing Architecture (recomendada)

Pirâmide pragmática para um MVP de UI mínima (ADR-007):

```
        /\        E2E (Playwright)         — poucos, fluxos críticos ponta a ponta
       /  \       Integration (RTL+MSW)    — médio, telas + API mockada por contrato
      /----\      Component (RTL)          — muitos, estados loading/erro/vazio
     /------\     Unit (Vitest)            — base, utils/hooks/services/parsing
   a11y (axe) ⟂ visual (Playwright snapshots) atravessam component+E2E
```

| Camada | Ferramenta | O que valida | Onde mora |
|--------|-----------|--------------|-----------|
| Unit | Vitest | `src/lib/*` (api client, auth-tokens, parsing, mapeamento de erro) | `*.test.ts` ao lado |
| Component | Vitest + RTL | render, interação, transições, **estados error/loading/empty** | `*.test.tsx` ao lado |
| Integration | Vitest + RTL + **MSW** | tela ↔ API mockada, submit de form, navegação | `*.test.tsx` |
| Contract | **MSW handlers gerados/validados do API_SPEC** (ou `openapi-typescript` + type-check) | envelope de erro e shapes batem com sc-api | `src/test/contract/` |
| E2E | **Playwright** | auth, adaptação (criar→polling→download PDF), erros, permissões | `e2e/` |
| a11y | **@axe-core/playwright** + `vitest-axe` | ARIA, teclado, contraste, screen reader | dentro de E2E e component |
| Visual | **Playwright snapshots** (Chromatic opcional pós-MVP) | layout, responsivo ≥360px | `e2e/visual/` |

Deps a adicionar (devDependencies): `@vitest/coverage-v8`, `msw`, `@playwright/test`, `@axe-core/playwright`, `vitest-axe`. (Chromatic só se houver Storybook — fora do MVP.)

---

## Phase 4 — Coverage Strategy

Metas por camada (alinhadas ao espírito de NFR-008, agora com paralelo front):

| Camada | Alvo | Racional |
|--------|------|----------|
| `src/lib` utils/parsing | **95%** | puro, determinístico, barato; base de tudo |
| Lógica de auth/refresh token (`auth-tokens.ts`) | **95%** | segurança (NFR-004/005); falha = sessão quebrada |
| Hooks | **90%** | lógica de estado reutilizada; caro de debugar em produção |
| Componentes | **85%** | inclui estados error/loading/empty (NFR-010); 100% é custo>valor em markup |
| Páginas/rotas | **80%** | integração de muitas peças; E2E cobre o resto |
| E2E fluxos críticos | **100% dos fluxos** | auth + adaptação→PDF não podem quebrar; cobertura por *fluxo*, não por linha |

**Threshold global de bloqueio no CI: 80% lines/branches** (Vitest `coverage.thresholds`), com `per-file` para `src/lib`. Regra herdada do sc-api: **cada código de erro do FDD §6 que a UI mapeia → 1 teste nomeado**.

> A meta não é o número: coverage é piso necessário, **não suficiente** — ver Phase 5.

---

## Phase 5 — Test Quality Validation

Coverage alta com asserção fraca é dívida disfarçada. Critérios objetivos para o agente Reviewer/QA:

### Anti-padrões (rejeitar)
- **Trivial**: testa getter/constante/markup estático sem comportamento.
- **Snapshot-only**: único `toMatchSnapshot()` como toda a asserção.
- **Sem asserção**: render/act sem `expect`.
- **Mock-heavy**: mocka a unidade sob teste; só verifica que o mock foi chamado.
- **Detalhe de implementação**: assere classes CSS internas/nome de state em vez de saída visível ao usuário (preferir queries por role/text de RTL).
- **Duplicado / inflado**: vários testes idênticos para subir %; `expect(true).toBe(true)`.

### Validação significativa (exigir)
- Verifica **comportamento de negócio** e **resultado para o usuário** (texto/role visível), não internals.
- Exercita **caminho crítico** + **negativo** (cada `error.code` do FDD §6) + **edge** (vazio, lista longa, rede lenta/timeout do polling).
- Detecta **regressão** (falha se o comportamento mudar).

### Mutation testing — Stryker
- Ferramenta: **`@stryker-mutator/core` + runner Vitest**.
- **Mutation score alvo: ≥70%** nos módulos críticos (`src/lib`), rodado **fora do PR** (job semanal/noturno ou no fechamento de fase do roadmap — é lento).
- Uso: detectar testes que passam mesmo com o código mutado → expõe asserções fracas que a coverage esconde. Score reportado no PR de fechamento de fase, não bloqueia task individual.

---

## Phase 6 — Workflow Enhancements (mudanças concretas)

### 6.1 `vitest.config.ts` — remover no-op + coverage gate
```diff
   test: {
     environment: "jsdom",
     globals: true,
     setupFiles: ["./vitest.setup.ts"],
     include: ["src/**/*.{test,spec}.{ts,tsx}"],
-    passWithNoTests: true,
+    coverage: {
+      provider: "v8",
+      reporter: ["text", "html", "lcov"],
+      include: ["src/**/*.{ts,tsx}"],
+      exclude: ["src/**/*.{test,spec}.*", "src/app/layout.tsx"],
+      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
+    },
   },
```
> Manter `passWithNoTests` só até o primeiro teste existir; remover assim que houver suíte. Adicionar `"test:coverage": "vitest run --coverage"` e `"e2e": "playwright test"` aos scripts.

### 6.2 CI (`.github/workflows/ci.yml`)
```diff
       - name: Test
-        run: npm test
+        run: npm run test:coverage
+
+      - name: E2E (Playwright)
+        run: npx playwright install --with-deps && npm run e2e
```

### 6.3 `/task` Fase 4 — teste deixa de ser opcional
- Trocar `npm test # quando houver testes do escopo` por **"Fase 4 — Testes (obrigatório): escrever testes da camada apropriada para todo comportamento novo; `npm run test:coverage` deve passar o threshold; rodar `npm run e2e` se o fluxo for crítico."**
- Adicionar **Fase 3.5 — Test-first**: para regra/código de erro do FDD §6, escrever o teste antes/junto da implementação.

### 6.4 `task-brief.yaml` `dod_checklist` (no SKILL.md do /task)
```diff
   - "[ ] estados de loading/erro tratados (códigos de erro do FDD seção 6)"
+  - "[ ] testes da camada apropriada criados (unit/component/integration)"
+  - "[ ] cobertura ≥ 80% no diff; cada error.code mapeado tem teste nomeado"
+  - "[ ] E2E para fluxo crítico tocado (auth/adaptação) quando aplicável"
+  - "[ ] checagem de a11y (axe) nas telas novas/alteradas"
```

### 6.5 `/code-review-task` — corrigir texto stale + virar bloqueador
- Etapa 4.7: remover "enquanto o projeto não tiver runner..."; passar a **sempre** rodar `npm run test:coverage` e tratar **coverage abaixo do threshold como bloqueador**.
- Etapa 3: adicionar `npm run test:coverage` (e `npm run e2e` quando fluxo crítico).
- Nova **Etapa 4.9 — Qualidade de teste**: aplicar checklist de anti-padrões da Phase 5; teste trivial/snapshot-only/sem-asserção conta como **ausente** (já há base no 4.7 item 3).

### 6.6 `docs-guard.sh` — código sem teste falha
```diff
 # 1. Qualquer mudança em src/ ou app/ exige entrada no CHANGELOG
 if has '^(src|app)/' && ! has '^CHANGELOG\.md$'; then
   err "código mudou sem entrada no CHANGELOG.md ([Unreleased])."
 fi
+
+# 3. Mudança em src/ (exceto só-tipos/estilos) exige um teste no mesmo diff
+if has '^src/.*\.(ts|tsx)$' && ! echo "$CHANGED" | grep -qE '\.(test|spec)\.(ts|tsx)$'; then
+  err "código em src/ mudou sem teste (*.test.ts[x]) no mesmo diff."
+fi
```

### 6.7 PR template — item de teste no checklist
```diff
 - [ ] Estados de loading/erro tratados (códigos de erro do FDD seção 6)
+- [ ] Testes adicionados/atualizados; `npm run test:coverage` verde (≥80%)
+- [ ] E2E/a11y para fluxo crítico quando aplicável
```

### 6.8 ADR + DoR/DoD
- Abrir **ADR no sc-api** (`ADR-008-estrategia-de-testes-frontend.md`) registrando esta pirâmide e thresholds (a fonte de verdade de processo é o sc-api).
- Atualizar **DoD canônico** (workflow.md) com linha equivalente a NFR-008 para o front; criar **Definition of Ready**: ticket `[frontend]` deve listar "Cenários de Teste Obrigatórios" (como o template backend já faz).

---

## AI Agent Responsibilities

| Agente | Responsabilidade de teste |
|--------|---------------------------|
| **Planner** | No `task-brief.yaml`, listar "Cenários de Teste Obrigatórios" por camada antes do CHECKPOINT 1; nenhum brief aprovado sem eles. |
| **Architect** | Decidir a camada certa por comportamento (não E2E para lógica pura); manter ADR-008; definir contrato a testar contra API_SPEC. |
| **Developer** | Test-first para regras/error codes (FDD §6); implementar todos os cenários do brief; garantir `test:coverage` verde localmente antes do review. |
| **Reviewer** (`/code-review-task`) | Rodar coverage; bloquear abaixo do threshold; aplicar checklist de anti-padrões (Phase 5); cada error.code sem teste = bloqueador. |
| **QA** | Validar E2E dos fluxos críticos, a11y (axe) e visual; mutation score nos módulos críticos no fechamento de fase. |

---

## Phase 7 — Implementation Roadmap

| Prioridade | Mudança | Impacto | Esforço |
|-----------|---------|---------|---------|
| **Alta** | Remover `passWithNoTests`; instalar `@vitest/coverage-v8`; thresholds 80%; CI `test:coverage` | Fecha o buraco nº1 (CI cosmético) | S |
| **Alta** | Corrigir texto stale do `/code-review-task` 4.7 + virar coverage bloqueador | Alinha gate à realidade | S |
| **Alta** | Testes unit de `auth-tokens.ts` e `api.ts` (refresh, mapeamento de erro) | Protege segurança/sessão | M |
| **Alta** | docs-guard exige teste no diff de `src/` | Enforcement determinístico | S |
| **Média** | MSW + integration tests das telas do fluxo de adaptação | Cobre NFR-010 e FDD §6 | M |
| **Média** | Playwright: E2E de auth e adaptação→polling→PDF | Protege fluxos críticos | M |
| **Média** | a11y com `@axe-core/playwright`/`vitest-axe` | NFR-010, acessibilidade | M |
| **Média** | ADR-008 + DoR/DoD canônicos no sc-api; atualizar `/task` e PR template | Institucionaliza | S |
| **Baixa** | Visual regression (Playwright snapshots) | Regressão responsiva | M |
| **Baixa** | Mutation testing (Stryker) noturno, score ≥70% módulos críticos | Anti coverage inflada | L |
| **Baixa** | Contract test automatizado vs API_SPEC (openapi-typescript) | Anti-drift front↔API | M |

---

## Success Criteria — como esta proposta os satisfaz

- *Toda feature testada* → docs-guard + DoD + coverage gate.
- *Fluxos críticos com E2E* → Playwright obrigatório para auth/adaptação.
- *Coverage não inflável* → mutation testing + checklist de anti-padrões no Reviewer.
- *IA valida qualidade de teste* → Phase 5 codificada na Etapa 4.9 do `/code-review-task`.
- *Docs sincronizadas* → docs-guard estendido.
- *Workflow test-first* → Fase 3.5 do `/task` + DoR com cenários obrigatórios.
