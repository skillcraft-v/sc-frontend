> Part of the `testing-guide-sc-frontend` skill (see `../SKILL.md`).

# Sessão e proteção de rota (`src/lib/auth/session.tsx`, `src/lib/auth/require-auth.tsx`)

## What to test
- `session.tsx` (provider/context): estado inicial derivado dos tokens armazenados; login popula sessão; logout limpa tokens + estado; expiração/refresh falho derruba a sessão.
- `require-auth.tsx`: anônimo → redireciona para `/login`; autenticado → renderiza children; estado "verificando" não pisca conteúdo protegido.

## Layer assignment
- **Component test (RTL)** — o comportamento observável é render/redirect. Redirecionamento usa `next/navigation` → mocke `useRouter` com `vi.mock` e asserte `push`/`replace` (ver `../references/gotchas.md`).
- Fluxo completo login→navegação→logout no browser real pertence ao E2E (`e2e-specs.md`), com `page.route()` para a sc-api.
- Exceção à regra "não assertar chamada de mock": aqui `router.replace("/login")` É o comportamento — não há efeito visível em jsdom.

## Setup pattern
```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { setTokens, clearTokens } from "@/lib/auth-tokens";
import { RequireAuth } from "./require-auth";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/skills",
}));

it("anônimo é redirecionado para /login sem renderizar o conteúdo", async () => {
  clearTokens();
  render(<RequireAuth><p>secreto</p></RequireAuth>);
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  expect(screen.queryByText("secreto")).not.toBeInTheDocument();
});
```

## When to skip
- Não teste o mecanismo de refresh aqui — pertence ao core (`core-client.md`); a sessão só reage ao resultado.
- Não duplique o redirect em cada página protegida — 1 suíte no `RequireAuth` cobre todas.

## Examples from project
- `src/lib/auth/session.test.tsx` — ciclo login/logout do provider (padrão a seguir).
- Páginas protegidas (`skills/page.test.tsx` etc.) apenas autenticam no `beforeEach` via `setTokens` — não retestam o guard.
