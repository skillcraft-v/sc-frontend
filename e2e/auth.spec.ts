import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Smoke + a11y das telas de auth. E2E autenticado (com backend) fica para um ticket
// dedicado quando houver harness de API de teste (decisão registrada no task-brief).

async function expectNoSeriousA11yViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test.describe("Tela de login", () => {
  test("renderiza o formulário e navega para o registro", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Entrar", level: 1 })).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await page.getByRole("link", { name: "Criar conta" }).click();
    await expect(page).toHaveURL(/\/registro$/);
  });

  test("sem violações sérias de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/login");
    await expectNoSeriousA11yViolations(page);
  });

  test("é navegável por teclado (tab chega ao e-mail)", async ({ page }) => {
    await page.goto("/login");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("E-mail")).toBeFocused();
  });
});

test.describe("Tela de registro", () => {
  test("renderiza o formulário completo", async ({ page }) => {
    await page.goto("/registro");
    await expect(page.getByRole("heading", { name: "Criar conta", level: 1 })).toBeVisible();
    await expect(page.getByLabel("Nome completo")).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
  });

  test("sem violações sérias de acessibilidade (axe)", async ({ page }) => {
    await page.goto("/registro");
    await expectNoSeriousA11yViolations(page);
  });
});
