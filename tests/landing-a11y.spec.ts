import { levelAnalyze } from "@level-ci/a11y-playwright";
import { test } from "@playwright/test";

test("barriers tour page has accessibility violations", async ({ page }) => {
  await page.goto("/barriers-tour.html");
  await levelAnalyze(page);
});

test("sample landing page has accessibility violations", async ({ page }) => {
  await page.goto("/");
  await levelAnalyze(page);
});

test("a11y lab page has accessibility violations", async ({ page }) => {
  await page.goto("/a11y-lab.html");
  await levelAnalyze(page);
});
