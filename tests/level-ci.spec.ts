import { levelAnalyze, levelSetup } from "@level-ci/a11y-playwright";
import { expect, test } from "@playwright/test";

levelSetup({
  reportPath: "./level-ci-reports",
});

test.afterEach(async ({ page }) => {
  await levelAnalyze(page);
});

test("login to Level CI", async ({ page }) => {
  await page.goto("https://nextra.site/");

  expect(page).not.toBeUndefined();
});
