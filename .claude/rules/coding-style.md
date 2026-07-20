---
paths:
  - "src/**"
---
# Estilo de código (o que o tooling não pega)

- Idioma: texto de UI, mensagens de erro, comentários, JSDoc e nomes de teste em **pt-BR** (NFR-010); identificadores de código em inglês.
- Todo módulo de `src/lib` abre com JSDoc curto de responsabilidade (o que faz e o que **não** faz), citando IDs quando houver decisão documentada (P-006, NFR-XXX, FDD §6) — siga o padrão de `src/lib/api.ts`.
- TypeScript strict de verdade: sem `any` não justificado; entrada externa entra como `unknown` e passa por type guard (ex.: `isErrorEnvelope`). Tipos do contrato ficam em `types.ts` do domínio, alinhados ao API_SPEC.
- Imports internos sempre pelo alias `@/` (`@/lib/skills/api`), nunca relativos profundos (`../../lib/...`).
- `export default` apenas em `page.tsx`/`layout.tsx` (exigência do App Router); todo o resto usa export nomeado.
- `"use client"` só no topo de arquivos que realmente usam estado/efeitos/browser APIs — não espalhe por padrão.
- Constantes de domínio com labels pt-BR vivem junto dos tipos (`CATEGORY_LABELS`, `PROFICIENCY_LABELS` em `types.ts`), não hardcoded em componentes.
- Tokens/segredos nunca em `console.*` ou mensagens de erro; a única env pública é `NEXT_PUBLIC_API_URL`.
- Estilo visual: Tailwind inline nos componentes próprios (sem design system no MVP, ADR-007); mobile-first responsivo ≥360px.
- Nomes de arquivo: hooks `use-<recurso>.ts` (kebab-case), componentes `PascalCase.tsx`, demais módulos kebab-case.
