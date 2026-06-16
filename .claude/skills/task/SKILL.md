---
name: task
description: >
  Workflow completo de implementação frontend a partir de um ticket Jira
  [frontend]. Lê o ticket via Atlassian MCP, carrega contexto (docs canônicos
  no repo sc-api), gera task-brief.yaml para aprovação (checkpoint 1), cria o
  branch de development e move o card para In Progress, implementa, testa,
  atualiza CHANGELOG, valida o DoD (checkpoint 2), executa /code-review-task,
  commita, faz push e move o card para In Review. PR aberto manualmente.
  Uso: /task <TICKET-ID>   ex: /task SKC-7
---

# Skill: /task (sc-frontend)

## Objetivo

Executar o ciclo completo de desenvolvimento de um ticket **`[frontend]`** com dois checkpoints humanos e gate de code review. Processo canônico: [sc-api/docs/workflow.md](../sc-api/docs/workflow.md).

Projeto Jira: `SC` — https://goncalvesmarques.atlassian.net (cloudId `a5d8b89b-37c5-4fd9-b536-5c5f662822fe`).
Colunas: `To Do → In Progress (Fase 3.0) → In Review (Fase 8) → Done (manual, no merge)`.

> Se o ticket NÃO for `[frontend]`, avise o usuário que ele pertence ao sc-api e pare.

---

## Fase 1 — Carregamento de contexto

1. Leia o ticket via Atlassian MCP (título, descrição, critérios de aceite, comentários).
2. Leia sempre: `CLAUDE.md` (este repo), `../sc-api/API_SPEC.md`, `../sc-api/docs/workflow.md`.
3. Conforme o domínio do ticket, leia o FDD correspondente em `../sc-api/docs/fdds/` (contratos da seção 5 e erros da seção 6 — a UI deve tratar os códigos de erro do envelope).

---

## Fase 2 — task-brief.yaml

Gere `task-brief.yaml` na raiz (não versionado):

```yaml
ticket: {id: "", title: "", type: ""}
understanding: {problem: "", proposed_solution: ""}
scope:
  domains: []              # USR | SKL | CAR | JOB | ADP | PDF (telas relacionadas)
  affected_files: []       # páginas/componentes/hooks
  api_endpoints: []        # endpoints consumidos (do API_SPEC)
  new_routes: []           # rotas Next.js novas
risks: {ambiguities: []}
implementation_plan: {steps: []}
dod_checklist:
  - "[ ] critérios de aceite do ticket satisfeitos"
  - "[ ] lint, typecheck e build verdes"
  - "[ ] estados de loading/erro tratados (códigos de erro do FDD seção 6)"
  - "[ ] tokens nunca logados; sem segredo no bundle"
  - "[ ] responsivo ≥ 360 px; textos em pt-BR"
  - "[ ] CHANGELOG.md atualizado ([Unreleased], (SKC-XX))"
  - "[ ] evidência: screenshot/GIF + passos de reprodução para o PR"
```

### CHECKPOINT 1 — Aprovação do brief
Apresente problema, solução, escopo (telas, endpoints, rotas), ambiguidades e plano numerado. **Aguarde aprovação antes de continuar.**

---

## Fase 3.0 — Branch + Jira In Progress

1. `git checkout development && git pull --ff-only` (pull só se houver remote) → `git checkout -b feat/SKC-XX-descricao-curta`. Se `development` não existir, crie de `main` e avise. Nunca trabalhe em `main`/`development`.
2. Jira → **In Progress** via `getTransitionsForJiraIssue` + `transitionJiraIssue`.

---

## Fase 3 — Implementação

- TypeScript strict; sem `any` não justificado; componentes pequenos e consistentes com o código vizinho.
- Toda chamada à API passa pelo cliente tipado (sem `fetch` solto em componente).
- Erros da API: mapear `error.code` (FDD seção 6) para mensagens pt-BR; nunca exibir stack/`request_id` cru ao usuário final (logar no console somente em dev).
- Fluxo de adaptação: polling de `GET /adaptations/{id}` com backoff até `completed`/`failed`.
- Nenhuma regra de negócio duplicada no cliente.

---

## Fase 4 — Testes e verificação

```bash
npm run lint && npm run typecheck && npm run build
npm test   # quando houver testes do escopo
```

Capture **screenshot/GIF** do comportamento implementado + passos de reprodução (evidência do PR).

---

## Fase 5 — Documentação

Atualize `CHANGELOG.md` (`[Unreleased]`, sufixo `(SKC-XX)`; dependências em **Dependencies**). Se o ticket revelou divergência de contrato com o `API_SPEC.md`, registre como pendência para o sc-api no comentário do ticket — não edite docs do sc-api a partir daqui.

---

## Fase 6 — DoD (CHECKPOINT 2)

Verifique cada item do `dod_checklist` e apresente o status PRONTO/PENDENTE. **Aguarde aprovação.**

## Fase 6.5 — Code Review (gate)

Invoque `/code-review-task <SKC-XX>`. REPROVADO → corrija e repita. Só prossiga APROVADO.

## Fase 7 — PR Description

Preencha o body sobre `.github/pull_request_template.md` (não edite o template): Jira Issue, o que foi feito, como testar, screenshot/evidência, veredito do review; pré-marque o que o review verificou.

## Fase 8 — Entrega

1. Commit `type(SKC-XX): mensagem`; `task-brief.yaml` fora do commit.
2. `git push -u origin feat/SKC-XX-...` (sem remote: avise e pare).
3. Jira → **In Review** + comentário com resumo, branch e PR description.
4. PR e merge são manuais (base `development`); **Done** é manual no merge.

---

## Restrições

- Nada de código antes do CHECKPOINT 1; nada de commit antes do review APROVADO.
- Nunca commit direto em `main`/`development`; PR/merge são do usuário.
- Ambiguidade sem resposta: pare e pergunte.
