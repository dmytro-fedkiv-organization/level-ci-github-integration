import { levelAnalyze } from "@level-ci/a11y-playwright";
import { test } from "@playwright/test";

test("signup page has accessibility violations", async ({ page }) => {
  await page.goto("/signup.html");
  await levelAnalyze(page);
});
