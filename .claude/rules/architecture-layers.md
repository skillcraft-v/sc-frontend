---
paths:
  - "src/**"
---
# Camadas e direção de dependência

- Direção única: `src/app` → `src/components` → `src/lib`. `src/lib` nunca importa de `app/` ou `components/`; `components/` nunca importa de `app/`.
- Nenhuma regra de negócio no frontend — validação de UX é cortesia; a autoridade é o sc-api (P-006). Se uma decisão depende de regra `DOM-NN`, ela pertence ao backend.
- Todo domínio novo segue a anatomia de `src/lib/skills/`:

```
src/lib/<dominio>/
  api.ts             # chamadas tipadas via cliente único (@/lib/api)
  types.ts           # tipos do contrato (API_SPEC) + labels pt-BR
  error-messages.ts  # mapa error.code → mensagem pt-BR (FDD §6)
  use-<recurso>.ts   # hooks de estado ("use client")
```

- Páginas (`src/app/**/page.tsx`) apenas compõem: `RequireAuth` + hook do domínio + componentes. Lógica de estado reutilizável vive em hooks de `src/lib/<dominio>/`, não na página.
- Componentes transversais de UI (Button, Field, Alert…) vivem em `src/components/ui/`; componentes de domínio em `src/components/<dominio>/`.
- Rotas autenticadas envolvem o conteúdo em `<RequireAuth>` (`@/lib/auth/require-auth`); rotas públicas são só as de auth.
- Hooks de listagem seguem o padrão de `use-skill-list.ts`: status explícito (`"loading" | "success" | "error"`), guarda de resposta obsoleta (`let active = true` + cleanup) e `reload` por `reloadKey`.
