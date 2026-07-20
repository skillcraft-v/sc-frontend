> Part of the `testing-guide-sc-frontend` skill (see `../SKILL.md`).

# Tipos futuros (ainda não presentes no projeto)

Guia proativo para artefatos comuns de Next.js App Router que o sc-frontend ainda não tem. Ao introduzir um deles, adicione o guia correspondente em `artifacts/` e a linha no §4 do `../SKILL.md`.

## Async Server Components (páginas/componentes `async` com fetch no servidor)
- **Vitest NÃO suporta** async Server Components (limitação documentada pelo Next.js). Teste **somente via Playwright E2E**, com `page.route()` para a sc-api.
- Componentes server **síncronos** podem ser renderizados no Vitest normalmente.
- Se a lógica de dados crescer, extraia-a para função pura em `src/lib` e teste unit lá.

## Middleware (`src/middleware.ts`)
- Camada de segurança (redirect de auth, headers) → comportamento observável é o efeito na navegação: **E2E** (request → redirect/status).
- Lógica pura interna (matcher, parsing de cookie) → extrair para função e testar unit.

## Route Handlers (`src/app/api/**/route.ts`)
- Hoje o front não tem API própria (tudo vai à sc-api). Se surgir um handler (ex.: proxy de download), trate como fronteira HTTP: **E2E via Playwright `request`** (status, corpo, headers) — não unit-teste o handler.
- Cuidado com P-006: regra de negócio continua proibida aqui.

## Server Actions
- Trate como função de fronteira: lógica pura extraída → unit; efeito ponta a ponta (submit → redirect/revalidate) → E2E.

## Layouts com lógica (`layout.tsx` condicional)
- Hoje `layout.tsx` é composição pura (sem teste). Se ganhar branching (ex.: exibir Header por sessão), teste o componente que contém a lógica (`Header.test.tsx` já cobre) — não o layout em si.

## Contextos/Providers adicionais
- Siga o padrão de `auth-session.md`: component test do provider com RTL, consumidor mínimo inline, mock de `next/navigation` quando houver redirect.

## Visual regression (Playwright snapshots)
- Planejado no `docs/testing-strategy.md` como pós-MVP (`e2e/visual/`). Ao adotar: snapshots por viewport (360px incluído), `maxDiffPixelRatio` explícito, e rodar em CI com o mesmo browser/OS para evitar flakiness de fontes.

## Mutation testing (Stryker)
- Alvo ≥70% em `src/lib`, job fora do PR (semanal/fechamento de fase) — decisão do testing-strategy.md Phase 5. Não bloqueia task individual.
