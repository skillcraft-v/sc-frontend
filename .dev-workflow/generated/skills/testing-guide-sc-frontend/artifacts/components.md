> Part of the `testing-guide-sc-frontend` skill (see `../SKILL.md`).

# Componentes (`src/components/<dominio>/*.tsx` e `src/components/ui/*.tsx`)

## What to test
- Comportamento visível: o que renderiza por prop/estado, o que acontece ao interagir.
- Formulários: preenchimento + submit chama callback/API com os dados certos; erros por campo (400 `VALIDATION_ERROR` → `fieldErrors`) aparecem junto ao campo; mensagem geral pt-BR para os demais códigos.
- Componentes que chamam API diretamente (ex.: `EvidenceManager`, `AdaptTrigger`): cenário de sucesso e cada código de erro do FDD §6 tratado, via MSW.
- Estados loading/erro/vazio quando o componente busca dados (NFR-010).

## Layer assignment
- Componente com branching/interação (formulários, gerenciadores, badges condicionais) → **component test (RTL)**; adicione MSW se ele fala com a API.
- Componente `ui/` com lógica (ex.: `Header` — navegação condicional por sessão) → **component test**.
- Componente `ui/` puramente apresentacional (`Button`, `Field`, `Textarea`) → **sem teste próprio**; é exercitado pelos consumidores.
- Componente em fluxo crítico → o fluxo completo pertence ao E2E; aqui só os estados finos.

## Setup pattern
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { server } from "@/test/msw/server";
import { http, HttpResponse, url, errorEnvelope } from "@/test/msw/handlers";
import { SkillForm } from "./SkillForm";

it("exibe erro de tradução faltante mapeado do envelope", async () => {
  const user = userEvent.setup();
  server.use(http.post(url("/skills"), () =>
    HttpResponse.json(errorEnvelope("MISSING_TRANSLATION", "x"), { status: 400 })));
  render(<SkillForm onSuccess={vi.fn()} />);
  await user.type(screen.getByLabelText("Título (PT)"), "Docker");
  await user.click(screen.getByRole("button", { name: "Salvar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/dois idiomas/);
});
```
Sempre `await user...` (React 19: interações são async; sem await → warning de act). Queries por role/label/text — nunca classe CSS.

## When to skip
- Apresentacional sem branching (markup + Tailwind).
- Variações que percorrem o mesmo caminho de código (testar 1 categoria de label basta; as outras são dados).

## Examples from project
- `SkillForm.test.tsx`, `JobForm.test.tsx`, `ProjectForm.test.tsx` — formulários com MSW e erros por campo.
- `AdaptationResult.test.tsx` — renderização condicional de scores/gaps.
- `Header.test.tsx` — único `ui/` com teste (navegação por sessão).
- `Button.tsx`, `Field.tsx` — sem teste próprio (correto: apresentacionais).
