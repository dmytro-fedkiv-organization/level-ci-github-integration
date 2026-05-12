import { levelAnalyze } from "@level-ci/a11y-playwright";
import { test } from "@playwright/test";

test("pricing page has accessibility violations", async ({ page }) => {
  await page.goto("/pricing.html");
  await levelAnalyze(page);
});
