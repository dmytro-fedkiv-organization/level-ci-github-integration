import { levelAnalyze } from "@level-ci/a11y-playwright";
import { test } from "@playwright/test";

test("blog page has accessibility violations", async ({ page }) => {
  await page.goto("/blog.html");
  await levelAnalyze(page);
});
