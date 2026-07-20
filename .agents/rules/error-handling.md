---
paths:
  - "src/**"
---
# Tratamento de erros

- Todo erro da API chega como `ApiError` (`@/lib/api`), derivado do envelope `{ error: { code, message, details, request_id } }`. Não crie outros tipos de erro para respostas da API.
- A UI mapeia `error.code` → mensagem pt-BR via `error-messages.ts` do domínio, reusando `messageFromMap`/`fieldErrors` de `@/lib/error-utils`. Prioridade: mapa do domínio → `COMMON_MESSAGES` → `DEFAULT_FALLBACK`.
- Código de erro novo no FDD §6 que a UI trata ⇒ entrada no mapa do domínio + 1 teste nomeado para ele.
- Nunca exiba `message` cru do backend, stack, `request_id` ou `error.code` para o usuário — sempre a mensagem pt-BR mapeada.
- Nunca engula erro silenciosamente: toda chamada à API termina em estado de UI (`status: "error"` + mensagem) ou em fallback explícito.
- Erros de validação por campo (400 `VALIDATION_ERROR`): use `fieldErrors(error)` e exiba a mensagem junto ao campo correspondente.
- Estados explícitos e acessíveis (NFR-010): carregando com `role="status"`, erro com `role="alert"` e ação de retry quando fizer sentido:

```tsx
{status === "error" ? (
  <p role="alert">Não foi possível carregar as skills.</p>
) : null}
```

- Falha de transporte vira `ApiError` com `code: "NETWORK_ERROR"` (status 0) — trate como qualquer outro código, sem `try/catch` especial na UI.
- 401 em rota autenticada é resolvido pelo cliente (refresh single-flight); a UI não implementa retry de auth próprio.
