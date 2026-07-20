> Part of the `testing-guide-sc-frontend` skill (see `../SKILL.md`).

# Mapas de erro (`src/lib/<dominio>/error-messages.ts`)

## What to test
- **Cada `error.code` do FDD §6 mapeado → 1 teste nomeado pelo cenário** (regra herdada do NFR-008; gate do /code-review-task).
- Cadeia de prioridade: mapa do domínio → `COMMON_MESSAGES` → `DEFAULT_FALLBACK`.
- Entrada não-`ApiError` (Error genérico, undefined) → fallback.
- `fieldErrors`: extrai `details[].field → message`; detalhes sem `field` são ignorados.

## Layer assignment
- **Unit puro** — funções determinísticas; sem MSW, sem render. Construa `ApiError` diretamente.
- A exibição da mensagem na tela pertence ao teste do componente/página que a renderiza.

## Setup pattern
```ts
import { ApiError } from "@/lib/api";
import { skillErrorMessage } from "./error-messages";

const apiError = (code: string) =>
  new ApiError({ code, message: "raw do backend", status: 400 });

it("MISSING_TRANSLATION pede os dois idiomas", () => {
  expect(skillErrorMessage(apiError("MISSING_TRANSLATION"))).toMatch(/dois idiomas/);
});

it("código desconhecido cai no fallback genérico", () => {
  expect(skillErrorMessage(apiError("ALGO_NOVO"))).toBe(
    "Não foi possível concluir a operação. Tente novamente.",
  );
});
```
Ao mapear um código novo: adicione a entrada no mapa + o teste nomeado **no mesmo diff** (docs-guard exige teste junto do código).

## When to skip
- Não asserte o texto integral de todas as mensagens (mirror test) — asserte a parte que distingue o cenário (`toMatch`).
- Não teste `COMMON_MESSAGES` em cada domínio — a cadeia transversal já é coberta em `error-utils` (core).

## Examples from project
- `src/lib/skills/error-messages.test.ts` — 1 teste por código SKL (padrão a seguir).
- `src/lib/adaptations/error-messages.test.ts` — códigos de adaptação (inclui custo/limite).
- `src/lib/auth/error-messages.test.ts` — códigos de auth.
