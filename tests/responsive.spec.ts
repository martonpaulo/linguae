import { expect, test } from "@playwright/test";

import {
  isPhone,
  NAMED_LANGUAGE,
  waitForCatalogue,
} from "./support/syntheticCatalogue";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

/** The document must never scroll sideways; a wide table scrolls inside its own container. */
async function documentOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
}

for (const viewport of VIEWPORTS) {
  test.describe(`at ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("the catalogue does not scroll horizontally", async ({ page }) => {
      await page.goto("");
      await waitForCatalogue(page);

      const { scrollWidth, clientWidth } = await documentOverflow(page);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test("a language page does not scroll horizontally", async ({ page }) => {
      await page.goto(`${NAMED_LANGUAGE.code}/`);
      await expect(
        page.getByRole("heading", { name: NAMED_LANGUAGE.name })
      ).toBeVisible();

      const { scrollWidth, clientWidth } = await documentOverflow(page);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test("the wide table scrolls inside its own container", async ({ page }) => {
      await page.goto("");
      await waitForCatalogue(page);
      // A phone gets the list instead, which never scrolls sideways.
      test.skip(isPhone(page), "the table is replaced by a list below the tablet breakpoint");

      const container = page.locator(".MuiTableContainer-root");
      const overflow = await container.evaluate(
        (element) => getComputedStyle(element).overflowX
      );
      expect(["auto", "scroll"]).toContain(overflow);
    });
  });
}

test.describe("colour scheme", () => {
  test.use({ colorScheme: "dark" });

  test("stays legible when the reader prefers dark", async ({ page }) => {
    await page.goto("");
    await waitForCatalogue(page);

    // The project ships one light theme; what must not happen is light text on light.
    const { background, color } = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return { background: style.backgroundColor, color: style.color };
    });

    expect(background).not.toBe(color);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
