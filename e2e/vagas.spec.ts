import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Tela de Vagas editorial (SKC-48): chips do funil com contagem, cards com hover lift e a11y.
 * Sessão simulada por interceptação (mesmo padrão de sidebar.spec.ts): refresh token no
 * storage + /auth/me e /jobs mockados — ainda não há harness de API de teste.
 */
const PROFILE = { id: "u1", email: "u@x.com", full_name: "Usuária" };

const TOTALS: Record<string, number> = {
  saved: 12,
  applied: 7,
  interviewing: 3,
  offer: 1,
  rejected: 4,
  accepted: 1,
};

const JOBS = [
  {
    id: "j1",
    title: "Engenheira de Software Sênior",
    company: "Nubank",
    status: "interviewing",
    is_remote: true,
    location: "São Paulo",
    created_at: "2026-06-01",
  },
  {
    id: "j2",
    title: "Staff Engineer",
    company: "Stone",
    status: "offer",
    is_remote: false,
    location: "Rio de Janeiro",
    created_at: "2026-06-02",
  },
];

async function signInAndVisitVagas(page: Page) {
  await page.addInitScript(() => window.localStorage.setItem("sc.refresh_token", "r"));
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ json: PROFILE }));
  await page.route("**/api/v1/jobs*", (route) => {
    const params = new URL(route.request().url()).searchParams;
    // page_size=1 é a consulta de contagem do funil; o resto é a listagem.
    if (params.get("page_size") === "1") {
      const total = TOTALS[params.get("status") ?? ""] ?? 0;
      return route.fulfill({ json: { items: [], total, page: 1, page_size: 1, pages: 1 } });
    }
    return route.fulfill({
      json: { items: JOBS, total: JOBS.length, page: 1, page_size: 20, pages: 1 },
    });
  });
  await page.goto("/vagas");
  await expect(page.getByRole("heading", { name: "Vagas", level: 1 })).toBeVisible();
  await settleAnimations(page);
}

/** Espera as animações de entrada (scIn) para o axe não medir contraste em cor mesclada. */
async function settleAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}

test.describe("Vagas — funil e cards", () => {
  test.beforeEach(async ({ page }) => {
    await signInAndVisitVagas(page);
  });

  test("chips do funil mostram a contagem de cada status", async ({ page }) => {
    const funnel = page.getByRole("group", { name: "Funil de vagas" });
    await expect(funnel.getByRole("button", { name: "Salvas 12" })).toBeVisible();
    await expect(funnel.getByRole("button", { name: "Aplicadas 7" })).toBeVisible();
    await expect(funnel.getByRole("button", { name: "Entrevistando 3" })).toBeVisible();
    await expect(funnel.getByRole("button", { name: "Propostas 1" })).toBeVisible();
    await expect(funnel.getByRole("button", { name: "Recusadas 4" })).toBeVisible();
    await expect(funnel.getByRole("button", { name: "Aceitas 1" })).toBeVisible();
  });

  test("selecionar um chip filtra a listagem por aquele status", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.endsWith("/jobs") && url.searchParams.get("page_size") !== "1") {
        requests.push(url.searchParams.get("status") ?? "");
      }
    });

    const chip = page.getByRole("button", { name: "Aplicadas 7" });
    await chip.click();

    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => requests).toContain("applied");
  });

  test("card de vaga ganha sombra elevada no hover (hover lift)", async ({ page }) => {
    const card = page.getByRole("link", { name: /Engenheira de Software Sênior/ });
    const article = card.locator("xpath=..");

    const rest = await article.evaluate((el) => getComputedStyle(el).boxShadow);
    await card.hover();
    await expect
      .poll(async () => article.evaluate((el) => getComputedStyle(el).boxShadow))
      .not.toBe(rest);
  });

  test("sem violações sérias de acessibilidade (axe)", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(serious).toEqual([]);
  });

  test("em 360px os cards empilham dentro da viewport", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await settleAnimations(page);

    const card = page.getByRole("link", { name: /Engenheira de Software Sênior/ });
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(360);

    const scrollsHorizontally = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(scrollsHorizontally).toBe(false);
  });
});
