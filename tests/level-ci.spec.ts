import { expect, test } from "@playwright/test";
import { setupUserway, userwayAnalysis } from "@userway/a11y-playwright";

setupUserway({
  reportPath: "./level-ci-reports",
  customTags: ["level-ci"],
});

test.afterEach(async ({ page }) => {
  await userwayAnalysis(page);
});

test("login to Level CI", async ({ page }) => {
  await page.goto("https://dev.uw.ci.levelaccess.io/");

  await page
    .locator('form input[type="email"]')
    .fill(process.env.LEVEL_CI_USERNAME!);

  await page
    .locator('form input[type="password"]')
    .fill(process.env.LEVEL_CI_PASSWORD!);

  await page.click('form button[type="submit"]');

  await page.waitForURL(
    "https://dev.uw.ci.levelaccess.io/dmytro-fedkiv-levelaccess-com-ndfns/projects"
  );

  await expect(page).toHaveTitle(/Level CI/);
});
