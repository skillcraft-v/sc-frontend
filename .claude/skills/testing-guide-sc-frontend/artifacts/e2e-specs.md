> Part of the `testing-guide-sc-frontend` skill (see `../SKILL.md`).

# E2E + a11y (`e2e/*.spec.ts` — Playwright + axe)

## What to test
- **Fluxos críticos** (cobertura por fluxo, não por linha): auth (telas, navegação login↔registro) e adaptação (disparo→polling→scores/gaps→download PDF).
- **a11y em toda tela nova/alterada**: axe com tags `wcag2a`/`wcag2aa`; violações `serious`/`critical` falham o teste.
- Navegação por teclado nos formulários principais (Tab alcança campos).
- Responsividade ≥360px quando a task tocar layout (viewport móvel via `test.use({ viewport })`).

## Layer assignment
- **Só Playwright**, contra o app do `webServer` (CI: build de produção; local: dev server reutilizado).
- **Sem backend real**: telas públicas rodam diretas; fluxo autenticado simula a sc-api com **`page.route()`** — mesma filosofia do MSW, na camada do browser. E2E contra sc-api real é não-objetivo por ora (decisão registrada).
- Asserções finas de estado (cada error.code, campos de formulário) NÃO pertencem ao E2E — já cobertas em RTL/MSW.

## Setup pattern
```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const API = "http://localhost:3340/api/v1";

test("fluxo autenticado com sc-api simulada", async ({ page }) => {
  await page.route(`${API}/auth/login`, (route) =>
    route.fulfill({ json: { access_token: "a", refresh_token: "r", token_type: "bearer" } }));
  await page.route(`${API}/skills?*`, (route) =>
    route.fulfill({ json: { items: [], total: 0, page: 1, page_size: 20, pages: 0 } }));
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("v@x.com");
  await page.getByLabel("Senha").fill("secreta1");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/skills/);
});

test("sem violações sérias de a11y", async ({ page }) => {
  await page.goto("/login");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
});
```
Para conteúdo dinâmico, interaja (Locators) ANTES de `analyze()`. Reuse o helper `expectNoSeriousA11yViolations` já existente nos specs.

## When to skip
- Não escreva E2E para tela fora de fluxo crítico sem mudança de layout — o custo de manutenção supera o valor.
- Não asserte texto de mensagens de erro por código no browser (duplicação de camada).

## Examples from project
- `e2e/auth.spec.ts` — smoke + axe + teclado (padrão a seguir; contém o helper de a11y).
- `e2e/adaptacoes.spec.ts` — fluxo de adaptação.
- `e2e/a11y.spec.ts`, `e2e/home.spec.ts` — varredura de telas públicas.
