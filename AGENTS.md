# AGENTS.md — sc-frontend

<!-- Curto por design. Procedimentos vivem nas skills; parâmetros em .dev-workflow/workflow.config.yaml. -->

## Overview

Frontend Next.js do **SkillCraft**, sistema de adaptação inteligente de currículos, para candidatos que adaptam CV por vaga. UI mínima do MVP (ADR-007): auth JWT, skills bilíngues, carreira, vagas e fluxo de adaptação (criar → polling → gaps → download de PDF), consumindo a API REST do repo irmão `sc-api`.

## Stack

- TypeScript strict + Next.js 15 (App Router), React 19
- Tailwind CSS 4, componentes próprios (sem design system no MVP)
- Vitest + Testing Library + MSW (unit/component) · Playwright + axe (E2E/a11y)
- ESLint + Prettier · npm

## Commands

```bash
npm run lint           # lint
npm run typecheck      # typecheck
npm test               # testes unit/component
npm run test:coverage  # gate: ≥80% global, ≥90% em src/lib
npm run build          # build (deve passar antes de PR)
npm run e2e            # Playwright E2E + a11y
```

`npm run dev` sempre em background (não bloquear o agente).

## Non-negotiable constraints

- Nenhuma regra de negócio no frontend; validação de UX é cortesia — autoridade é o sc-api (P-006).
- Tokens nunca em log/console; única env pública: `NEXT_PUBLIC_API_URL`.
- Estados de carregamento e erro explícitos no fluxo de adaptação (polling até `completed`/`failed`).
- UI responsiva ≥ 360 px; interface em pt-BR (NFR-010).
- Cliente da API tipado a partir de `../sc-api/API_SPEC.md`; divergência de contrato vira pendência para o sc-api, nunca edição local.
- Este repo implementa apenas tickets `[frontend]`; `[backend]`/`[database]` pertencem ao sc-api.

## Workflow

- Planejamento canônico no sc-api: `docs/prd/` → `docs/hld.md` → `docs/fdds/` → tickets Jira (`SKC`).
- Execução: `/task <SKC-XX>` → brief → aprovação → implementação/testes → docs → DoD → `/code-review-task` → entrega.
- Branches: `development` ← `feat/SKC-XX-slug`; commits `type(SKC-XX): mensagem`.
- Evidência de PR: screenshot/GIF + passos de reprodução.
- Configuração: `.dev-workflow/workflow.config.yaml`.

## Documentation loaded on demand

- Regras de negócio (`DOM-NN`): `../sc-api/docs/domain-context.md`
- Arquitetura: `../sc-api/docs/hld.md` · ADRs: `../sc-api/docs/adr/`
- Design por domínio: `../sc-api/docs/fdds/`
- Contrato da API: `../sc-api/API_SPEC.md`
- Locais deste repo: `docs/navigation-flow.md`, `docs/testing-strategy.md`, `CHANGELOG.md`
