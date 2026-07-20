> Part of the `testing-guide-sc-frontend` skill (see `../SKILL.md`).

# Hooks (`src/lib/**/use-*.ts`)

## What to test
- Máquina de estados: `loading → success | error` e transições em reload/refetch.
- Guarda de race: resposta antiga chegando depois da nova não sobrescreve (troca rápida de filtro/página).
- Efeitos derivados: `applyFilters` reseta página para 1; `reload` refaz o fetch.
- Polling (`use-adaptation-poll`): para em `completed`/`failed`, respeita intervalo, limpa timer no unmount.

## Layer assignment
- Hook com lógica própria (todos os `use-*` de listagem/polling) → **unit com `renderHook` + MSW** (o fetch real passa pelo cliente; MSW responde).
- Hook que só encapsula `useState` trivial sem branching → sem teste (não existe hoje no projeto).
- O contrato HTTP em si pertence a `domain-api.md` — aqui asserte o **estado retornado pelo hook**, não a request.

## Setup pattern
```tsx
import { renderHook, waitFor, act } from "@testing-library/react";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";
import { useSkillList } from "./use-skill-list";

it("aplica filtros e volta para a página 1", async () => {
  server.use(http.get(url("/skills"), () =>
    HttpResponse.json({ items: [], total: 0, page: 1, page_size: 20, pages: 0 })));
  const { result } = renderHook(() => useSkillList());
  await waitFor(() => expect(result.current.status).toBe("success"));
  act(() => result.current.setPage(3));
  act(() => result.current.applyFilters({ category: "backend" }));
  expect(result.current.page).toBe(1);
});
```
Para testar race/polling, use `HttpResponse` com `delay()` do MSW ou `vi.useFakeTimers()` (restaure com `vi.useRealTimers()` no `afterEach`).

## When to skip
- Não asserte a ordem/quantidade de chamadas à API (request assertion) — asserte o estado final observável.
- Não duplique cenários de erro por código aqui: o hook trata "erro" genérico; o mapeamento por código vive em `error-messages.md`.

## Examples from project
- `use-skill-list.test.ts` — estados + race guard (padrão a seguir).
- `use-adaptation-poll.test.ts` — polling até estado terminal.
- `use-resource-list.test.ts` — hook genérico de carreira.
- `use-job-list.ts` — sem teste próprio hoje: reusa o padrão de `use-resource-list`; se ganhar branching próprio, ganha teste.
