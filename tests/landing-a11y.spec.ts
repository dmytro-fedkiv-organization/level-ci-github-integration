import { levelAnalyze } from "@level-ci/a11y-playwright";
import { test } from "@playwright/test";

test("sample landing page has accessibility violations", async ({ page }) => {
  await page.goto("/");
  await levelAnalyze(page);
});
