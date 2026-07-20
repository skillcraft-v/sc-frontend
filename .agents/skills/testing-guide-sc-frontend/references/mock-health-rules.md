> Part of the testing-guide-sc-frontend skill (see ../SKILL.md).

# Regras de saúde de mock

## Princípio de fronteira (traduzido para este projeto)

Mocke **na fronteira do sistema** (a rede, via MSW/`page.route`), não dentro do código:

- ✅ **MSW responde pela sc-api** — a única fronteira externa. Todo o caminho interno (componente → hook → api de domínio → cliente → fetch) roda de verdade.
- ✅ **`vi.mock("next/navigation")`** — fronteira com o framework; em jsdom não existe App Router montado, e o redirect É o comportamento observável.
- ❌ **Nunca** `vi.mock("@/lib/api")`, `vi.mock("@/lib/skills/api")` ou spy em `fetch` — esconde bugs de envelope, Bearer, refresh e serialização que o MSW pega de graça.
- ❌ Nunca mocke o próprio artefato sob teste nem seus módulos irmãos do mesmo domínio.

Litmus test: consegue descrever o que o teste valida sem citar o mock? "Ao receber 400 MISSING_TRANSLATION, o form mostra a mensagem pt-BR" ✅ · "chama createSkill com os args certos" ❌ (wiring).

## Request assertions — quando são legítimas

Regra geral (MSW best practice): asserte o **resultado observável**, não a request. Duas exceções documentadas:
1. `api.ts` de domínio — a request É o contrato de fronteira (path/query/body snake_case). Assertar dentro do handler é o ponto do teste (`../artifacts/domain-api.md`).
2. Single-flight de refresh — contar requests de `/auth/refresh` é o contrato de concorrência (`../artifacts/core-client.md`).

Fora disso, se o teste só verifica "foi chamado com", remova-o ou reescreva pelo efeito visível.

## Sinais de mock doente

- Muitos `vi.mock` para montar um teste → deveria ser um teste de integração (RTL+MSW) ou a unidade está grande demais.
- Mock que retorna estrutura diferente do API_SPEC → o teste passa e a produção quebra; use `errorEnvelope()`/shapes reais.
- `vi.fn()` como handler de sucesso genérico → cenário sem contrato; declare a resposta completa.
- Teste que quebra em refactor sem mudança de comportamento → acoplado a implementação; re-escreva por role/text/estado retornado.

## Ferramentas por caso

| Necessidade | Use |
|---|---|
| Respostas da sc-api (unit/component/hooks) | MSW `server.use` + helpers de `@/test/msw/handlers` |
| sc-api no browser (E2E) | `page.route()` |
| Navegação App Router em jsdom | `vi.mock("next/navigation")` (ver `gotchas.md`) |
| Tempo (polling, debounce) | `vi.useFakeTimers()` + `vi.useRealTimers()` no afterEach, ou `delay()` do MSW |
| Download de arquivo (`save-blob`) | spy em APIs do DOM (`URL.createObjectURL`, click de anchor) — fronteira do browser |
