import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Tela de Skills editorial (SKC-49): linhas com barra de proficiência, hover e a11y.
 * Sessão simulada por interceptação (mesmo padrão de vagas.spec.ts): refresh token no
 * storage + /auth/me e /skills mockados — ainda não há harness de API de teste.
 */
const PROFILE = { id: "u1", email: "u@x.com", full_name: "Usuária" };

const SKILLS = [
  {
    id: "s1",
    title_pt: "FastAPI",
    title_en: "FastAPI",
    category: "backend",
    proficiency: "expert",
    tags: ["python", "async"],
  },
  {
    id: "s2",
    title_pt: "Design de sistemas",
    title_en: "System design",
    category: "soft_skill",
    proficiency: "basic",
    tags: [],
  },
];

async function signInAndVisitSkills(page: Page) {
  await page.addInitScript(() => window.localStorage.setItem("sc.refresh_token", "r"));
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ json: PROFILE }));
  await page.route("**/api/v1/skills*", (route) =>
    route.fulfill({
      json: { items: SKILLS, total: SKILLS.length, page: 1, page_size: 20, pages: 1 },
    }),
  );
  await page.goto("/skills");
  await expect(page.getByRole("heading", { name: "Skills", level: 1 })).toBeVisible();
  await settleAnimations(page);
}

/** Espera as animações de entrada (scIn/scGrow) antes de medir cor ou largura. */
async function settleAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}

test.describe("Skills — linhas com barra de proficiência", () => {
  test.beforeEach(async ({ page }) => {
    await signInAndVisitSkills(page);
  });

  test("cada linha expõe o nível da skill na barra de proficiência", async ({ page }) => {
    const bars = page.getByRole("progressbar", { name: "Proficiência" });
    await expect(bars).toHaveCount(2);
    await expect(bars.first()).toHaveAttribute("aria-valuetext", "Especialista");
    await expect(bars.last()).toHaveAttribute("aria-valuetext", "Básico");
    await expect(page.getByText("Backend · python, async")).toBeVisible();
  });

  test("a barra de nível maior é mais larga que a de nível menor", async ({ page }) => {
    const widthOf = async (index: number) => {
      const bar = page.getByRole("progressbar", { name: "Proficiência" }).nth(index);
      const box = await bar.locator("span").boundingBox();
      return box?.width ?? 0;
    };

    expect(await widthOf(0)).toBeGreaterThan(await widthOf(1));
  });

  test("linha de skill ganha sombra no hover", async ({ page }) => {
    const link = page.getByRole("link", { name: /FastAPI/ });
    const row = link.locator("xpath=..");

    const rest = await row.evaluate((el) => getComputedStyle(el).boxShadow);
    await link.hover();
    await expect
      .poll(async () => row.evaluate((el) => getComputedStyle(el).boxShadow))
      .not.toBe(rest);
  });

  test("sem violações sérias de acessibilidade (axe)", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(serious).toEqual([]);
  });

  test("em 360px as linhas cabem na viewport", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await settleAnimations(page);

    const link = page.getByRole("link", { name: /FastAPI/ });
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(360);

    const scrollsHorizontally = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(scrollsHorizontally).toBe(false);
  });
});
