import { levelAnalyze } from "@level-ci/a11y-playwright";
import { test } from "@playwright/test";

test("settings page has accessibility violations", async ({ page }) => {
  await page.goto("/settings.html");
  await levelAnalyze(page);
});
