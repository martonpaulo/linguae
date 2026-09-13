import { expect, type Page, test } from "@playwright/test";

import { LAST_PAGE_SIZE, RICH_LANGUAGE, waitForCatalogue } from "./support/syntheticCatalogue";

/** The first line of text on the page, and the header logo, as boxes. */
async function firstTextAndLogo(page: Page) {
  return page.evaluate(() => {
    const main = document.querySelector("main")!;
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.textContent?.trim() && node.parentElement?.getClientRects().length
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP,
    });
    const text = walker.nextNode()!.parentElement!;
    const box = text.getBoundingClientRect();
    const logo = document.querySelector("header img")!.getBoundingClientRect();
    return { text: text.textContent, top: box.top, left: box.left, logoLeft: logo.left };
  });
}

const ROUTES = [
  { name: "catalogue", path: "", rows: 50 },
  { name: "paginated", path: "page/2/", rows: LAST_PAGE_SIZE },
  { name: "language", path: `${RICH_LANGUAGE.code}/` },
  { name: "404", path: "zzz/" },
];

for (const width of [375, 1280, 1720]) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("every page starts its first text at the same offset, on the logo's left edge", async ({
      page,
    }) => {
      const measured: { name: string; top: number; left: number; logoLeft: number }[] = [];

      for (const route of ROUTES) {
        await page.goto(route.path);
        if (route.rows) await waitForCatalogue(page, route.rows);
        else await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        measured.push({ name: route.name, ...(await firstTextAndLogo(page)) });
      }

      for (const route of measured) {
        expect(Math.abs(route.top - measured[0].top), `${route.name} top`).toBeLessThanOrEqual(1);
        expect(Math.abs(route.left - route.logoLeft), `${route.name} left`).toBeLessThanOrEqual(1);
      }
    });
  });
}
