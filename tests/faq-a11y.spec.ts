import { levelAnalyze } from "@level-ci/a11y-playwright";
import { test } from "@playwright/test";

test("faq page has accessibility violations", async ({ page }) => {
  await page.goto("/faq.html");
  await levelAnalyze(page);
});
