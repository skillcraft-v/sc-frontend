---
name: code-review-task
description: >
  Code review automatizado do branch atual contra development (sc-frontend).
  Valida aderência ao CLAUDE.md, executa lint, typecheck e build, verifica
  CHANGELOG e evidência, e emite veredito APROVADO/REPROVADO.
  Chamada pela Fase 6.5 do /task ou avulsa.
  Uso: /code-review-task <TICKET-ID>   ex: /code-review-task SKC-7
---

# Skill: /code-review-task (sc-frontend)

## Objetivo

Gate de qualidade antes do commit: revisar **apenas o diff do branch atual** contra `development` e emitir veredito objetivo.

## Etapa 1 — Coleta

1. `git diff development...HEAD` (+ `git status` para untracked); pré-commit: working tree.
2. Contexto: `CLAUDE.md`, `../sc-api/docs/workflow.md`, `../sc-api/API_SPEC.md` e o FDD do domínio (`../sc-api/docs/fdds/`).
3. Ticket: `task-brief.yaml` na raiz ou via MCP Atlassian.

## Etapa 2 — Checklist de styleguide

| # | Verificação |
|---|-------------|
| 1 | TypeScript strict: sem `any`/`@ts-ignore` sem justificativa em comentário |
| 2 | Chamadas à API só pelo cliente tipado; endpoints existem no `API_SPEC.md` |
| 3 | Códigos de erro do FDD (seção 6) mapeados para mensagens pt-BR; sem stack cru para o usuário |
| 4 | Nenhum token/segredo logado ou hardcoded; só `NEXT_PUBLIC_*` no client |
| 5 | Estados de loading/erro presentes nas telas alteradas; polling de adaptação com estado terminal |
| 6 | Responsividade ≥ 360 px preservada nas telas tocadas |
| 7 | Nenhuma regra de negócio duplicada no cliente |
| 8 | Estrutura/nomenclatura consistente com o código vizinho |

## Etapa 3 — Verificações executáveis (capturar resultado real)

```bash
npm run lint
npm run typecheck
npm run build
npm run test:coverage          # gate de cobertura (≥80% global; ≥90% src/lib)
npm run e2e                     # quando o diff toca fluxo crítico (auth/adaptação)
```

Erro em qualquer um = **bloqueador**. Cobertura abaixo do threshold = **bloqueador**.

## Etapa 4 — Docs-guard

Execute `scripts/docs-guard.sh` e verifique semanticamente:

| Diff contém... | Exigir | Severidade |
|----------------|--------|------------|
| Mudança em `src/`/`app/` | `CHANGELOG.md` `[Unreleased]` com `(SKC-XX)` | Bloqueador |
| `package.json` (deps) | `CHANGELOG.md` seção Dependencies | Bloqueador |
| Tela nova/alterada | Evidência screenshot/GIF referenciada no brief/PR | Bloqueador |
| Código em `src/` (exceto tipos/testes/páginas) | teste (`*.test.ts[x]`/e2e) no mesmo diff | Bloqueador |

## Etapa 4.6 — Bug-hunt no diff (correção)

Releia o diff **procurando bugs**, não estilo. Checklist mínimo (React/Next):

| # | Padrão de bug | Onde olhar |
|---|---------------|------------|
| 1 | Promise sem `await`/sem tratamento de erro em handler ou efeito | actions, handlers, `useEffect` |
| 2 | Race/stale state: efeito sem cleanup, polling sem cancelamento ao desmontar/navegar, resposta antiga sobrescrevendo nova | polling de adaptação, fetches concorrentes |
| 3 | Estado de erro/vazio não renderizado (só happy path) ou loading infinito em falha | telas alteradas |
| 4 | Dados do usuário renderizados sem escape em contexto perigoso (`dangerouslySetInnerHTML`, href dinâmico) | componentes de exibição |
| 5 | Dependências de hook erradas (closure velho) causando lógica com dado desatualizado | `useEffect`/`useCallback`/`useMemo` |
| 6 | `undefined`/`null` de resposta da API desreferenciado sem guard; non-null `!` sem garantia | cliente da API, parsing |
| 7 | Lógica sensível confiada só ao client (validação/autorização que o sc-api precisa repetir) | forms, rotas protegidas |
| 8 | Off-by-one/limites em paginação, truncamento de texto, índices de lista | listagens |

Classificação: bug provável com impacto real = **bloqueador**; suspeita/risco teórico = recomendação com justificativa.

## Etapa 4.7 — Suficiência de testes (além dos obrigatórios)

1. Rode `npm run test:coverage`. Cobertura abaixo do threshold (80% global / 90% em `src/lib`) é **bloqueador**.
2. Para cada **branch novo/alterado sem cobertura** (incluindo estados de erro/vazio/loading das telas):
   - comportamento que espelha regra de negócio ou código de erro do FDD → teste ausente é **bloqueador**;
   - demais bordas → **recomendação** com o caso proposto (nome + cenário).
3. Avalie a **qualidade das asserções**: teste que só renderiza sem verificar comportamento conta como ausente (ver Etapa 4.9).

## Etapa 4.9 — Qualidade de teste (anti-padrões)

Cobertura alta não prova teste bom. Rejeitar (conta como teste **ausente**, logo bloqueador quando cobre regra/erro do FDD):

| # | Anti-padrão | Sinal |
|---|-------------|-------|
| 1 | Trivial | testa constante/markup estático sem comportamento |
| 2 | Snapshot-only | único `toMatchSnapshot()` como toda a asserção |
| 3 | Sem asserção | `render`/`act` sem nenhum `expect` |
| 4 | Mock-heavy | mocka a própria unidade sob teste; só verifica que o mock foi chamado |
| 5 | Detalhe de implementação | assere classe CSS/estado interno em vez de saída visível (preferir queries por role/texto) |
| 6 | Duplicado / inflado | testes idênticos para subir %; `expect(true).toBe(true)` |

Exigir validação significativa: comportamento de negócio, resultado para o usuário, caminho negativo (cada `error.code` do FDD §6), edge (vazio, lista longa, timeout do polling).
Referência: [docs/testing-strategy.md](../../../docs/testing-strategy.md) §Phase 5.

## Etapa 4.8 — Reviews nativos do Claude Code (camada extra)

- **`/security-review` (built-in) é OBRIGATÓRIO** quando o diff toca: fluxo de autenticação/sessão/tokens, `dangerouslySetInnerHTML` ou renderização de conteúdo do usuário/LLM, upload de arquivos, variáveis `NEXT_PUBLIC_*` novas (vazamento de config), ou middleware/rotas protegidas. Achados de severidade alta = bloqueador.
- **`/code-review` (built-in) com esforço alto** é recomendado no fechamento de cada fase do roadmap (diff acumulado do epic), fora do fluxo por task.

## Etapa 5 — Veredito

```
## Code Review — <TICKET-ID>

**Veredito: APROVADO | REPROVADO**

### Bloqueadores
- [arquivo:linha] descrição + regra violada

### Recomendações
- [arquivo:linha] sugestão

### Execuções
- lint: ✅/❌ · typecheck: ✅/❌ · build: ✅/❌ · testes: ✅/—/❌

### Docs-guard
- CHANGELOG: ✅/❌ · evidência: ✅/❌

### Bug-hunt
- N achados (listados acima por severidade) ou "nenhum padrão da Etapa 4.6 encontrado"

### Suficiência de testes
- Coverage do diff: X% / sem runner (registrado) · branches/estados sem teste: [lista com caso proposto]
- /security-review nativo: executado ✅ (achados: N) / não exigido para este diff

### Checklist do PR (para a Fase 7 do /task)
- Itens verificados para pré-marcar: [lista]
```

## Restrições

- Não corrija código nesta skill; não aprove com bloqueador aberto; revise só o diff do branch.
