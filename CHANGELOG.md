# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) · Versionamento: [SemVer](https://semver.org/lang/pt-BR/).

Regras de manutenção (verificadas pelo `/code-review-task` e pelo docs-guard do CI):
- Toda task adiciona ao menos uma entrada em **[Unreleased]**, terminada com a key do ticket (ex: `(SKC-7)`).
- Upgrade/adição/remoção de dependência **sempre** gera entrada em **Dependencies**, com versão de origem e destino.
- No merge `development` → `main` (release), a seção [Unreleased] vira uma versão datada.

## [Unreleased]

### Added
- Estrutura de workflow do projeto: CLAUDE.md, skills `/task` e `/code-review-task` (versão frontend), template de PR, docs-guard e este changelog. (kickoff 2026-06-11)
- Scaffold do frontend: Next.js (App Router) + TypeScript strict + Tailwind CSS v4, página inicial placeholder em pt-BR. (SKC-13)
- Cliente HTTP único e tipado da API (`src/lib/api.ts`): baseURL via `NEXT_PUBLIC_API_URL`, header Bearer, desempacotamento do envelope de erro em `ApiError` e refresh automático de token em 401 (`POST /auth/refresh`, single-flight). (SKC-13)
- Armazenamento de tokens no cliente (`src/lib/auth-tokens.ts`): access em memória, refresh em localStorage; tokens nunca logados. (SKC-13)
- `.env.example` com `NEXT_PUBLIC_API_URL` e CI próprio (`.github/workflows/ci.yml`): lint + typecheck + test + build + docs-guard. (SKC-13)

### Changed

### Fixed

### Dependencies
- Adicionado **next** `15.5.19`, **react**/`react-dom` `19.1.0`, **tailwindcss** `^4.1.11` (`@tailwindcss/postcss`). (SKC-13)
- Adicionado tooling de dev: **typescript** `^5.8.3`, **eslint** `^9` + `eslint-config-next` `15.5.19`, **prettier** `^3.6.2`, **vitest** `^3.2.4` + `@testing-library/react`/`jest-dom` + `jsdom`. (SKC-13)
