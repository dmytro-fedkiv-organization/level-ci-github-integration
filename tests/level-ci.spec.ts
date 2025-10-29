import { expect, test } from "@playwright/test";
import { setupUserway, userwayAnalysis } from "@userway/a11y-playwright";

setupUserway({
  reportPath: "./level-ci-reports",
});

test.afterEach(async ({ page }) => {
  await userwayAnalysis(page);
});

test("login to Level CI", async ({ page }) => {
  await page.goto(
    "https://nextra.site/docs/guide/syntax-highlighting#highlighting-lines"
  );

  expect(page).not.toBeUndefined();
});
