import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * A11y do drawer mobile (SKC-62). Este é o único lugar onde `inert` pode ser provado de
 * verdade: o jsdom 26 não o implementa, então os unit tests só conseguem assertar a marcação.
 * Aqui o browser é real e o Tab respeita a inércia.
 *
 * A sessão é simulada por interceptação: refresh token no storage + /auth/me e /jobs mockados.
 * E2E contra o backend real fica para quando houver harness de API de teste.
 */
const MOBILE = { width: 390, height: 780 };

const PROFILE = { id: "u1", email: "u@x.com", full_name: "Usuária" };
const JOBS = { items: [], total: 0, page: 1, page_size: 20, pages: 0 };

async function signInAndVisitVagas(page: Page) {
  await page.addInitScript(() => window.localStorage.setItem("sc.refresh_token", "r"));
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ json: PROFILE }));
  await page.route("**/api/v1/jobs*", (route) => route.fulfill({ json: JOBS }));
  await page.goto("/vagas");
  await expect(page.getByRole("heading", { name: "Vagas", level: 1 })).toBeVisible();
  await settleAnimations(page);
}

/**
 * Espera as animações de entrada terminarem. O `scIn` do main anima `opacity: 0 → 1` em
 * 0.35s; medir contraste no meio disso faz o axe ler cores mescladas e acusar violação
 * falsa (visto com o botão "Nova vaga": bg-ink translúcido lido como #777674).
 */
async function settleAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}

const nav = (page: Page) => page.getByRole("navigation", { name: "Navegação principal" });
const hamburger = (page: Page) => page.getByRole("button", { name: "Abrir menu" });

/** Nomes acessíveis da árvore de a11y real do browser (via CDP), achatados numa lista. */
async function accessibleNames(page: Page): Promise<string[]> {
  const client = await page.context().newCDPSession(page);
  await client.send("Accessibility.enable");
  const { nodes } = await client.send("Accessibility.getFullAXTree");
  await client.detach();
  return nodes
    .filter((node) => !node.ignored)
    .map((node) => node.name?.value)
    .filter((name): name is string => typeof name === "string" && name.length > 0);
}

test.describe("Drawer mobile — a11y", () => {
  test.use({ viewport: MOBILE });

  test.beforeEach(async ({ page }) => {
    await signInAndVisitVagas(page);
  });

  test("com o drawer fechado, nenhum controle da nav é alcançável por Tab", async ({ page }) => {
    await expect(nav(page)).toHaveAttribute("inert", "");

    // Percorre a ordem de tabulação inteira e confere que o foco nunca cai dentro da nav.
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      const insideNav = await page.evaluate(
        () => !!document.activeElement?.closest("#sidebar-nav"),
      );
      expect(insideNav, `Tab #${i + 1} caiu dentro da nav inerte`).toBe(false);
    }
  });

  test("com o drawer fechado, a nav não é exposta à árvore de acessibilidade", async ({ page }) => {
    // Prova pela árvore de a11y real do Chromium (o `getByRole` do Playwright é uma
    // emulação sobre o DOM e não enxerga `inert`, então não serviria aqui).
    const namesWhileClosed = await accessibleNames(page);
    expect(namesWhileClosed).not.toContain("Carreira");

    await hamburger(page).click();
    expect(await accessibleNames(page)).toContain("Carreira");
  });

  test("abrir move o foco para dentro do painel e o Tab circula sem escapar", async ({ page }) => {
    await hamburger(page).click();
    await expect(nav(page)).not.toHaveAttribute("inert", "");
    await expect(page.getByRole("link", { name: "SkillCraft" })).toBeFocused();

    // Uma volta completa: o foco nunca sai do painel.
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      const insideNav = await page.evaluate(
        () => !!document.activeElement?.closest("#sidebar-nav"),
      );
      expect(insideNav, `Tab #${i + 1} escapou do drawer`).toBe(true);
    }
  });

  test("Shift+Tab no primeiro controle vai para o último (Sair)", async ({ page }) => {
    await hamburger(page).click();
    await expect(page.getByRole("link", { name: "SkillCraft" })).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Sair" })).toBeFocused();
  });

  test("Escape fecha e devolve o foco ao hambúrguer", async ({ page }) => {
    await hamburger(page).click();
    await page.keyboard.press("Escape");

    await expect(hamburger(page)).toHaveAttribute("aria-expanded", "false");
    await expect(hamburger(page)).toBeFocused();
    await expect(nav(page)).toHaveAttribute("inert", "");
  });

  test("sem violações sérias de acessibilidade (axe), fechado e aberto", async ({ page }) => {
    const analyze = async () => {
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      return violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    };

    expect(await analyze(), "drawer fechado").toEqual([]);
    await hamburger(page).click();
    expect(await analyze(), "drawer aberto").toEqual([]);
  });
});

test.describe("Sidebar desktop — sem regressão do SKC-47", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("a nav segue visível e focável, sem inércia", async ({ page }) => {
    await signInAndVisitVagas(page);

    await expect(nav(page)).toBeVisible();
    await expect(nav(page)).not.toHaveAttribute("inert", "");
    await expect(page.getByRole("link", { name: "Carreira" })).toBeVisible();

    // O Tab alcança a nav normalmente: ela faz parte do fluxo da página no desktop.
    await page.getByRole("link", { name: "SkillCraft" }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Vagas", exact: true })).toBeFocused();
  });
});
