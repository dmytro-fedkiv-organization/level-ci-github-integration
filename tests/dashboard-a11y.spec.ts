import { levelAnalyze } from "@level-ci/a11y-playwright";
import { test } from "@playwright/test";

test("dashboard page has accessibility violations", async ({ page }) => {
  await page.goto("/dashboard.html");
  await levelAnalyze(page);
});
