import { expect, test } from "@playwright/test";

import { BASE_PATH } from "../playwright.config";
import {
  EXTINCT_LANGUAGE,
  LONG_LINEAGE_LANGUAGE,
  RICH_LANGUAGE,
  waitForCatalogue,
} from "./support/syntheticCatalogue";

test.describe("language page", () => {
  test("offers a way back to the catalogue", async ({ page }) => {
    await page.goto(`${RICH_LANGUAGE.code}/`);

    const back = page.getByRole("link", { name: "All languages" });
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute("href", `${BASE_PATH}/`);
  });

  test("returns to the catalogue page the reader came from", async ({ page }) => {
    await page.goto("page/2/");
    await waitForCatalogue(page, 19);
    await page.getByRole("link", { name: RICH_LANGUAGE.name }).click();
    await expect(page).toHaveURL(new RegExp(`${RICH_LANGUAGE.code}/$`));

    await page.getByRole("link", { name: "All languages" }).click();
    await expect(page).toHaveURL(/\/page\/2\/$/);
  });

  test("puts the key facts first and the status in words", async ({ page }) => {
    await page.goto(`${RICH_LANGUAGE.code}/`);

    await expect(page.getByRole("heading", { level: 1, name: RICH_LANGUAGE.name })).toBeVisible();
    const facts = page.getByRole("complementary", { name: "Key facts" });
    await expect(facts.getByText("Speakers", { exact: true })).toBeVisible();
    const family = facts.getByRole("definition").filter({ hasText: "Synthetic Family" });
    await expect(family).toHaveText("Synthetic Family");
    await expect(page.getByText(/^Educational:/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Language use" })).toBeVisible();
  });

  test("draws the genealogy as one lineage ending in the language", async ({ page }) => {
    await page.goto(`${LONG_LINEAGE_LANGUAGE.code}/`);

    const levels = page.getByRole("region", { name: "Lineage" }).getByRole("listitem");
    await expect(levels).toHaveCount(13);
    await expect(levels.last()).toHaveText(LONG_LINEAGE_LANGUAGE.name);
    await expect(levels.last()).toHaveAttribute("aria-current", "true");
  });

  test("shows no empty labels for a sparse record", async ({ page }) => {
    await page.goto(`${EXTINCT_LANGUAGE.code}/`);

    await expect(page.getByRole("heading", { level: 1, name: EXTINCT_LANGUAGE.name })).toBeVisible();
    await expect(page.getByText("Speakers", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Lineage" })).toHaveCount(0);
    await expect(page.getByText("no further details")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("never scrolls sideways", async ({ page }) => {
      for (const width of [320, 375]) {
        await page.setViewportSize({ width, height: 812 });
        for (const code of [RICH_LANGUAGE.code, LONG_LINEAGE_LANGUAGE.code, EXTINCT_LANGUAGE.code]) {
          await page.goto(`${code}/`);
          await expect(page.getByRole("link", { name: "All languages" })).toBeVisible();
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
          );
          expect(overflow, `${width}px ${code}`).toBe(0);
        }
      }
    });
  });
});
