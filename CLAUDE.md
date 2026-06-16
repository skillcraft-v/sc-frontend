# CLAUDE.md

## Project Overview

**SkillCraft (sc-frontend)** — frontend Next.js do SkillCraft, sistema de adaptação inteligente de currículos. UI deliberadamente mínima no MVP ([ADR-007](../sc-api/docs/adr/ADR-007-nextjs-frontend-separado.md)): auth, skills bilíngues, carreira, vagas e o fluxo de adaptação (criar → polling → gaps → download de PDF).

**A fonte de verdade técnica e de negócio vive no repo irmão [sc-api](../sc-api):** PRD, domain-context (regras `DOM-NN`), HLD, ADRs, FDDs, API_SPEC e roadmap. Leia lá; não duplique aqui.

## Tech Stack

- **Next.js (App Router)** + **TypeScript strict** (sem `any` não justificado)
- **Tailwind CSS** + componentes próprios simples (sem design system no MVP)
- Cliente da API REST do sc-api (`http://localhost:8000/api/v1`) tipado a partir do [API_SPEC](../sc-api/API_SPEC.md)
- Auth: Bearer JWT (access+refresh) emitidos pelo sc-api; refresh automático no cliente
- Lint/format: ESLint + Prettier · Testes: vitest + testing-library (quando aplicável)

## Restrições não negociáveis

- Nenhuma regra de negócio no frontend — validação de UX é cortesia; a autoridade é o sc-api (P-006).
- Tokens nunca em log/console; segredos só via env (`NEXT_PUBLIC_API_URL` é a única config pública).
- Estados de carregamento e erro explícitos no fluxo de adaptação (polling até `completed`/`failed`).
- UI responsiva ≥ 360 px; interface em pt-BR (NFR-010).

## Development Workflow

- **Processo canônico:** [sc-api/docs/workflow.md](../sc-api/docs/workflow.md) — mesmo Jira (`SC`), mesmas colunas, mesma estratégia de branches (`main` ← `development` ← `feat/SKC-XX-*`).
- Este repo implementa apenas tickets com prefixo **`[frontend]`**.
- **Skill:** `/task <SKC-XX>` — versão frontend em [.claude/skills/task/SKILL.md](.claude/skills/task/SKILL.md).
- Evidência de ticket frontend: **screenshot/GIF + passos de reprodução** no PR.
- Documentação Viva local: `CHANGELOG.md` em toda task (docs-guard no CI).

## Testing & Checks

```bash
npm run lint
npm run typecheck
npm test          # quando houver testes
npm run build     # build deve passar antes de PR
```

## Long-running Processes

`npm run dev` deve rodar em background no Bash tool para não bloquear o agente.
