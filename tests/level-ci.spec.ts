import { levelAnalyze, levelSetup } from "@level-ci/a11y-playwright";
import { expect, test } from "@playwright/test";

levelSetup({
  reportPath: "./level-ci-reports",
  stableSelectorAttributes: ["data-test-id"],
});

test.afterEach(async ({ page }) => {
  await levelAnalyze(page);
});

test("login to Level CI", async ({ page }) => {
  await page.goto("http://localhost:3000");

  expect(page).not.toBeUndefined();
});
