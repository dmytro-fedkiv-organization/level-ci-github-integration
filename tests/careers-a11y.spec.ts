import { levelAnalyze } from "@level-ci/a11y-playwright";
import { test } from "@playwright/test";

test("careers page has accessibility violations", async ({ page }) => {
  await page.goto("/careers.html");
  await levelAnalyze(page);
});
