> Part of the `testing-guide-sc-frontend` skill (see `../SKILL.md`).

# Páginas (`src/app/**/page.tsx`)

## What to test
- Composição da tela sob os 4 estados do hook: loading (`role="status"`), erro (`role="alert"` + retry), vazio (mensagem + CTA) e sucesso (itens renderizados).
- Interações que mudam estado: aplicar filtro reseta página, paginação, submit de formulário.
- Proteção de rota: conteúdo só aparece autenticado (via `RequireAuth`).
- Fluxos críticos (auth, adaptação→polling→PDF): também em E2E (`e2e-specs.md`).

## Layer assignment
- Página client com lógica de composição relevante → **RTL integration** (render da página com MSW; ex.: `skills/page.test.tsx`).
- Página em fluxo crítico → **E2E** também (Playwright); RTL cobre estados finos, E2E cobre o fluxo real no browser.
- Página puramente de composição (só monta hook + componentes já testados) → só E2E/smoke; não duplique asserções.
- `src/app/**` está **fora do coverage unit por design** — o teste RTL existe pelo comportamento, não pela métrica.

## Setup pattern
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url, errorEnvelope } from "@/test/msw/handlers";
import { setTokens } from "@/lib/auth-tokens";
import Page from "./page";

beforeEach(() => {
  // Autentica para passar pelo RequireAuth
  setTokens({ access_token: "a", refresh_token: "r", token_type: "bearer" });
});

it("exibe erro e permite tentar novamente", async () => {
  server.use(http.get(url("/skills"), () =>
    HttpResponse.json(errorEnvelope("UNKNOWN_ERROR", "boom"), { status: 500 })));
  render(<Page />);
  expect(await screen.findByRole("alert")).toBeInTheDocument();
});
```
Se a página usa `useRouter`/`useSearchParams`, mocke `next/navigation` com `vi.mock` (ver `../references/gotchas.md`).

## When to skip
- Página estática sem fetch nem interação (ex.: home institucional) → só smoke E2E.
- Não reasserte em RTL o que o spec E2E do fluxo já verifica.

## Examples from project
- `src/app/skills/page.test.tsx` — estados + filtros com MSW (padrão a seguir).
- `src/app/adaptacoes/[id]/page.test.tsx` — polling até `completed`/`failed`.
- `src/app/skills/[id]/page.tsx` — sem teste RTL próprio: composição fina; comportamento coberto pelos componentes e E2E.
