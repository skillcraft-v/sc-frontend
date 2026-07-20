> Part of the testing-guide-sc-frontend skill (see ../SKILL.md).

# Gotchas da stack (verificados para as versões do projeto)

## React 19 + RTL 16 + Vitest 3 (jsdom)

- **`act` sempre retorna Promise no React 19** e vem de `react` (não `react-dom/test-utils`, deprecado). Na prática: sempre `await userEvent...` e prefira `findBy*`/`waitFor` a asserções síncronas pós-interação. Warning "not wrapped in act(...)" quase sempre = interação async não aguardada.
- **Prefira `userEvent` a `fireEvent`** — `fireEvent` não percorre o pipeline de eventos real e é a fonte nº1 de act-warnings com estado async.
- **Async Server Components não rodam no Vitest** — cobertura só via Playwright (limitação documentada do Next.js). Componentes sync renderizam normalmente.
- **`next/navigation` em jsdom**: qualquer componente que use `useRouter`/`usePathname`/`useSearchParams` quebra com "invariant expected app router to be mounted". Mocke o módulo (`vi.mock("next/navigation", ...)` com `useRouter` retornando `push/replace/prefetch/back/refresh`); declare via `vi.hoisted()` o que precisar referenciar fora.
- **Fake timers**: `vi.useFakeTimers()` conflita com `userEvent` (que usa timers internos) — configure `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` ou prefira `delay()` do MSW para simular latência.

## MSW 2

- Sintaxe v2: `http` + `HttpResponse`; nada de `rest`/`ctx` (v1) em exemplos copiados da web.
- `onUnhandledRequest: "error"` (já configurado) — request sem handler falha o teste; se um teste "quebra do nada", provavelmente o componente passou a fazer uma chamada nova: declare o handler, não relaxe a opção.
- `server.resetHandlers()` no `afterEach` descarta `server.use()` — nunca dependa de handler declarado em outro teste.
- Evite request assertions como objetivo do teste (exceções documentadas em `mock-health-rules.md`).
- O corpo de erro deve usar `errorEnvelope()` — um objeto ad-hoc `{ message }` faz o cliente cair em `UNKNOWN_ERROR` e o teste passa pelo motivo errado.

## Playwright 1.61 + Next 15

- Em CI o `webServer` roda `build && start` (produção); local reusa o dev server (`reuseExistingServer: !CI`). Comportamento pode divergir (ex.: strict mode duplo render no dev) — se um E2E passa local e falha no CI, suspeite disso.
- `page.route()` precisa casar a URL completa da sc-api (`http://localhost:3340/api/v1/...`), incluindo querystring (`/skills?*`).
- `forbidOnly` está ativo no CI — `test.only` esquecido falha o pipeline.

## axe / a11y

- Playwright: interaja com a página (abrir modal, expandir menu) ANTES de `AxeBuilder.analyze()` — axe só vê o DOM atual. Use `.include()`/`.exclude()` para escopar.
- Gate do projeto: só `serious`/`critical` falham (helper `expectNoSeriousA11yViolations` em `e2e/auth.spec.ts`). Não asserte o array inteiro de violations em snapshot.
- `vitest-axe` exige jsdom; carregue os matchers no setup se for usar em component test.

## Coverage v8

- O Vitest conta **todos os arquivos do `include`** no threshold global, mesmo sem teste importando (diferente do Jest) — arquivo novo sem teste derruba a média imediatamente.
- Thresholds por glob (`"src/lib/**": { ... }`) já configurados; não adicione `autoUpdate` (baseline deve ser deliberada).
- Excluir arquivo do coverage é decisão de arquitetura (só tipos, coberto por E2E) — registre o porquê em comentário no `vitest.config.ts`, como já é feito.

## Higiene geral

- `beforeEach`: `clearTokens()` + `localStorage.clear()` em qualquer suíte que toque auth — token vazado torna testes dependentes de ordem.
- Teste de hook com fetch: sempre `waitFor` o estado terminal antes de assertar — o estado inicial `loading` transita async.
- `save-blob`/download: spy em `URL.createObjectURL` + anchor click; lembre `URL.revokeObjectURL` no teardown para não vazar entre testes.
