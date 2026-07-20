> Part of the `testing-guide-sc-frontend` skill (see `../SKILL.md`).

# Módulos de API de domínio (`src/lib/<dominio>/api.ts`)

## What to test
- **Contrato de fronteira** (mesmo sem branching): path, método, querystring, corpo em `snake_case` e desempacotamento da resposta (`Paginated<T>`, entidade, `null` em 204).
- Builders de query: só filtros definidos e não vazios, trim aplicado, paginação sempre presente.
- Propagação de erro: envelope da API vira `ApiError` (basta 1 cenário por módulo — o mapeamento fino é do core).

## Layer assignment
- Builder de query (função pura com branching) → **unit puro** (sem MSW).
- Funções de chamada → **integration com MSW**: handler assere o request recebido e devolve resposta real do contrato; o teste assere o valor retornado. É a exceção legítima de "request assertion" — aqui a request É o contrato (system boundary, fundamentals).
- Não teste via UI aqui — isso é papel de components/pages.

## Setup pattern
```ts
import { server } from "@/test/msw/server";
import { http, HttpResponse, url } from "@/test/msw/handlers";
import { listSkills } from "./api";

it("listSkills envia filtros na query e desempacota o envelope paginado", async () => {
  server.use(http.get(url("/skills"), ({ request }) => {
    expect(new URL(request.url).searchParams.get("category")).toBe("backend");
    return HttpResponse.json({ items: [], total: 0, page: 1, page_size: 20, pages: 0 });
  }));
  const res = await listSkills({ category: "backend" }, 1, 20);
  expect(res.pages).toBe(0);
});
```
`beforeEach`: `clearTokens()` + `localStorage.clear()` (rotas autenticadas não devem depender de token vazado de outro teste).

## When to skip
- Uma função por operação basta — não repita variantes de dados que percorrem o mesmo caminho.
- Divergência encontrada contra o `API_SPEC.md` não se "conserta" no teste: registre pendência para o sc-api.

## Examples from project
- `src/lib/skills/api.test.ts` — `buildSkillsQuery` (unit puro) + chamadas com MSW (padrão a seguir).
- `src/lib/adaptations/api.test.ts` — inclui download de PDF via `getBlob`.
- `src/lib/career/api.test.ts`, `src/lib/jobs/api.test.ts` — CRUD por recurso.
