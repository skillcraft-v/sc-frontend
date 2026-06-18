# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) · Versionamento: [SemVer](https://semver.org/lang/pt-BR/).

Regras de manutenção (verificadas pelo `/code-review-task` e pelo docs-guard do CI):
- Toda task adiciona ao menos uma entrada em **[Unreleased]**, terminada com a key do ticket (ex: `(SKC-7)`).
- Upgrade/adição/remoção de dependência **sempre** gera entrada em **Dependencies**, com versão de origem e destino.
- No merge `development` → `main` (release), a seção [Unreleased] vira uma versão datada.

## [Unreleased]

### Added
- Telas de autenticação (USR): registro com auto-login, login e perfil (`/registro`, `/login`, `/perfil`), consumindo `/auth/*`. (SKC-23)
- Camada de sessão client-side `src/lib/auth/`: `SessionProvider`/`useSession` com hidratação automática via refresh no reload, guarda de rota `RequireAuth` e mapa de `error.code` (FDD-USR §6) → mensagens pt-BR. (SKC-23)
- Primitivos de UI acessíveis (`src/components/ui/`): `Field` (label+aria-invalid+erro), `Button` (estado de carregamento), `Alert` (`role="alert"`). (SKC-23)
- Testes dos fluxos de auth (RTL+MSW): error-messages por code, sessão (hidratação/login/register/logout), login, registro e perfil — 30 testes novos. E2E smoke + a11y (axe) de `/login` e `/registro`. (SKC-23)
- Estrutura de workflow do projeto: CLAUDE.md, skills `/task` e `/code-review-task` (versão frontend), template de PR, docs-guard e este changelog. (kickoff 2026-06-11)
- Scaffold do frontend: Next.js (App Router) + TypeScript strict + Tailwind CSS v4, página inicial placeholder em pt-BR. (SKC-13)
- Cliente HTTP único e tipado da API (`src/lib/api.ts`): baseURL via `NEXT_PUBLIC_API_URL`, header Bearer, desempacotamento do envelope de erro em `ApiError` e refresh automático de token em 401 (`POST /auth/refresh`, single-flight). (SKC-13)
- Armazenamento de tokens no cliente (`src/lib/auth-tokens.ts`): access em memória, refresh em localStorage; tokens nunca logados. (SKC-13)
- `.env.example` com `NEXT_PUBLIC_API_URL` e CI próprio (`.github/workflows/ci.yml`): lint + typecheck + test + build + docs-guard. (SKC-13)
- Fundação de testes do frontend: cobertura no Vitest com thresholds bloqueantes (80% global, 90% em `src/lib`), infra MSW (`src/test/msw/`) e E2E + a11y com Playwright/axe (`e2e/`, `playwright.config.ts`). (SKC-28)
- Testes-semente de `src/lib`: `auth-tokens` (memória/localStorage) e `api` (envelope de erro, métodos, 401→refresh single-flight, network error) — 14 testes, ~98% de cobertura. (SKC-28)
- Documento de estratégia de testes `docs/testing-strategy.md` (pirâmide, metas por camada, anti-padrões, mutation/visual como follow-up). (SKC-28)
- Smoke E2E + checagem de acessibilidade (axe) da home. (SKC-28)

### Changed
- `npm test` no CI passa a ser `npm run test:coverage` (gate real) + step de E2E (Playwright); removido `passWithNoTests`. (SKC-28)
- `docs-guard.sh` agora exige teste (`*.test.ts[x]`/e2e) no mesmo diff de mudanças em `src/`. (SKC-28)
- Skills `/task` (test-first, Fase 4 obrigatória) e `/code-review-task` (coverage bloqueador, Etapa 4.9 qualidade de teste) e PR template atualizados para refletir a política test-first. (SKC-28)

### Fixed
- Contraste de cor insuficiente (WCAG 1.4.3) nos textos auxiliares da home, detectado pelo novo teste de a11y. (SKC-28)

### Dependencies
- Adicionado **@testing-library/user-event** `^14.6.1` (interações nos testes de formulário). (SKC-23)
- Adicionado tooling de teste: **@vitest/coverage-v8** `^3.2.6`, **msw** `^2.14.6`, **@playwright/test** `^1.61.0`, **@axe-core/playwright** `^4.11.3`. (SKC-28)
- Adicionado **next** `15.5.19`, **react**/`react-dom` `19.1.0`, **tailwindcss** `^4.1.11` (`@tailwindcss/postcss`). (SKC-13)
- Adicionado tooling de dev: **typescript** `^5.8.3`, **eslint** `^9` + `eslint-config-next` `15.5.19`, **prettier** `^3.6.2`, **vitest** `^3.2.4` + `@testing-library/react`/`jest-dom` + `jsdom`. (SKC-13)
