---
paths:
  - "src/lib/**"
---
# Convenções do cliente da API

- Todo request passa pelo cliente único `api.*` de `@/lib/api` (`get/getBlob/post/put/patch/delete`). Nunca use `fetch` direto fora de `src/lib/api.ts` — é ele que injeta Bearer, faz refresh single-flight em 401 e desempacota o envelope de erro.
- O contrato é o `../sc-api/API_SPEC.md`: campos em `snake_case` (`title_pt`, `page_size`, `request_id`), sem renomear no front. Divergência encontrada ⇒ pendência registrada para o sc-api (comentário no ticket), nunca “consertada” localmente.
- Paths relativos ao `API_BASE_URL` (`/skills/${id}`); a única env pública é `NEXT_PUBLIC_API_URL`.
- Listagens retornam `Paginated<T>` (`items, total, page, page_size, pages`). Querystring via builder que inclui só filtros definidos e não vazios (trim antes; string só de espaços é omitida) + `page`/`page_size`:

```ts
if (filters.search?.trim()) params.set("search", filters.search.trim());
```

- Funções do `api.ts` de domínio são finas: montam o request e tipam a resposta — zero regra de negócio (P-006) e zero estado.
- Download binário (PDF) usa `api.getBlob` (`responseType: "blob"`); erros continuam vindo no envelope JSON.
- Rotas públicas de auth (`/auth/register`, `/auth/login`, `/auth/refresh`) não recebem Bearer nem disparam refresh (`skipAuth`/`AUTH_PUBLIC_PATHS`).
- Tokens: leia/grave apenas via `@/lib/auth-tokens` (`getAccessToken`, `setTokens`, `clearTokens`). Jamais logue token, header Authorization ou corpo de resposta de auth.
- `DELETE` bem-sucedido retorna `204` → tipar como `Promise<null>`.
