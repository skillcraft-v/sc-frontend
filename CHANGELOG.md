# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) · Versionamento: [SemVer](https://semver.org/lang/pt-BR/).

Regras de manutenção (verificadas pelo `/code-review-task` e pelo docs-guard do CI):
- Toda task adiciona ao menos uma entrada em **[Unreleased]**, terminada com a key do ticket (ex: `(SKC-7)`).
- Upgrade/adição/remoção de dependência **sempre** gera entrada em **Dependencies**, com versão de origem e destino.
- No merge `development` → `main` (release), a seção [Unreleased] vira uma versão datada.

## [Unreleased]

### Added
- Telas de carreira (CAR): hub `/carreira` com projetos, educação e certificações (CRUD); rota `/carreira/projetos/[id]` para editar projeto e gerenciar o vínculo ponderado projeto–skill (slider de peso [0,1], upsert/remover). (SKC-25)
- Camada `src/lib/career/`: tipos, chamadas tipadas (CRUD dos 3 agregados + link/unlink skill), hook genérico de lista race-safe (`use-resource-list`) e mapa de `error.code` (FDD-CAR §6) → pt-BR. (SKC-25)
- Primitivo de UI `Checkbox` (acessível) para "em andamento" (datas null). (SKC-25)
- Testes RTL+MSW de carreira (api, hook, formulários com validação de data, vínculo de skills, hub) + a11y de componente — 35 testes novos. (SKC-25)
- Telas de skills (SKL): listagem com filtros (categoria, proficiência, tags, busca PT/EN) e paginação, formulário bilíngue (PT/EN) com editor de código (textarea monospace) e gestão de evidências (`/skills`, `/skills/nova`, `/skills/[id]`). (SKC-24)
- Camada `src/lib/skills/`: tipos+enums (com rótulos pt-BR), chamadas tipadas (`api.ts`), hook de listagem race-safe (`use-skill-list.ts`) e mapa de `error.code` (FDD-SKL §6) → pt-BR. (SKC-24)
- Primitivos de UI `Select` e `Textarea` (acessíveis); helpers genéricos de erro `src/lib/error-utils.ts` (`messageFromMap`, `fieldErrors`) reusados por auth e skills. (SKC-24)
- Testes RTL+MSW dos fluxos de skills (lista/filtros/paginação, form bilíngue, evidências) + a11y de componente (axe) — 31 testes novos. (SKC-24)
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
- Adicionado **vitest-axe** `^0.1.0` (a11y de componente nos testes). (SKC-24)
- Adicionado **@testing-library/user-event** `^14.6.1` (interações nos testes de formulário). (SKC-23)
- Adicionado tooling de teste: **@vitest/coverage-v8** `^3.2.6`, **msw** `^2.14.6`, **@playwright/test** `^1.61.0`, **@axe-core/playwright** `^4.11.3`. (SKC-28)
- Adicionado **next** `15.5.19`, **react**/`react-dom` `19.1.0`, **tailwindcss** `^4.1.11` (`@tailwindcss/postcss`). (SKC-13)
- Adicionado tooling de dev: **typescript** `^5.8.3`, **eslint** `^9` + `eslint-config-next` `15.5.19`, **prettier** `^3.6.2`, **vitest** `^3.2.4` + `@testing-library/react`/`jest-dom` + `jsdom`. (SKC-13)
