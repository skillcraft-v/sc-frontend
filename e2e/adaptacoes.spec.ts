import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Smoke + a11y do guard da rota de adaptação. O fluxo autenticado completo
// (disparo → polling → resultado → download/regeneração) depende do backend ADP/PDF
// e de um harness de API de teste — E2E dedicado fica para quando existirem (mesma
// decisão registrada para auth). A a11y dos componentes de resultado é coberta em
// nível de componente pelo Vitest (vitest-axe).

test.describe("Rota /adaptacoes/[id] (protegida)", () => {
  test("sem sessão, redireciona para /login", async ({ page }) => {
    await page.goto("/adaptacoes/qualquer-id");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Entrar", level: 1 })).toBeVisible();
  });

  test("a tela do guard não tem violações sérias de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/adaptacoes/qualquer-id");
    await expect(page).toHaveURL(/\/login$/);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
