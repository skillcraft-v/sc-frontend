import { expect, test } from "@playwright/test";

test("home renderiza o produto e o estado de MVP", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "SkillCraft", level: 1 })).toBeVisible();
  await expect(page.getByText("MVP · em construção")).toBeVisible();
});
