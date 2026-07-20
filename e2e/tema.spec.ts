import { test, expect } from "@playwright/test";

/**
 * Fundação editorial (SKC-46). Protege a fiação de tema/webfonts, que é sutil:
 * os tokens --font-sans/--font-display são declarados em :root, então as variáveis
 * do next/font precisam estar no <html>. Se voltarem para o <body>, a family
 * resolve para o fallback do Tailwind sem quebrar nenhum outro teste.
 */
test.describe("Fundação editorial", () => {
  test("aplica as webfonts Newsreader (display) e Public Sans (corpo)", async ({ page }) => {
    await page.goto("/login");

    const familiaTitulo = await page
      .locator("h1")
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily);
    const familiaCorpo = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily);

    expect(familiaTitulo).toContain("Newsreader");
    expect(familiaCorpo).toContain("Public Sans");
  });

  test("aplica a paleta editorial (fundo paper, texto ink)", async ({ page }) => {
    await page.goto("/login");

    const fundo = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const texto = await page.locator("body").evaluate((el) => getComputedStyle(el).color);

    expect(fundo).toBe("rgb(245, 244, 241)"); // --paper #F5F4F1
    expect(texto).toBe("rgb(25, 24, 23)"); // --ink #191817
  });
});
