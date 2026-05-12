import { levelAnalyze } from "@level-ci/a11y-playwright";
import { test } from "@playwright/test";

test("contact page has accessibility violations", async ({ page }) => {
  await page.goto("/contact.html");
  await levelAnalyze(page);
});
