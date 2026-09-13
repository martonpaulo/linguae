import { expect, test } from "@playwright/test";

import {
  languageItems,
  LAST_PAGE_SIZE,
  NAMED_LANGUAGE,
  PAGE_SIZE,
  waitForCatalogue,
} from "./support/syntheticCatalogue";

async function horizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

test.describe("catalogue on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("never scrolls sideways at 320, 375 and 390px", async ({ page }) => {
    for (const width of [320, 375, 390]) {
      await page.setViewportSize({ width, height: 812 });
      for (const path of ["", "page/2/"]) {
        await page.goto(path);
        await waitForCatalogue(page, path ? LAST_PAGE_SIZE : PAGE_SIZE);
        expect(await horizontalOverflow(page), `${width}px ${path}`).toBe(0);
      }
    }
  });

  test("shows the first language within the first screen", async ({ page }) => {
    await page.goto("");
    await waitForCatalogue(page);

    const first = await languageItems(page).first().boundingBox();
    expect(first).not.toBeNull();
    expect(first!.y + first!.height).toBeLessThanOrEqual(812);
    await expect(page.getByRole("table")).toBeHidden();
  });

  test("gives every language one block with its full name as the link", async ({
    page,
  }) => {
    await page.goto("");
    await waitForCatalogue(page);
    await page.getByLabel("Search by language name").fill("Lusophone");
    await page.getByLabel("Search by language name").press("Enter");

    await expect(languageItems(page)).toHaveCount(1);
    const item = languageItems(page).first();
    await expect(item.getByRole("link")).toHaveCount(1);
    await expect(item.getByRole("link")).toHaveText(NAMED_LANGUAGE.name);
    await expect(item).toContainText("POR");
    await expect(item).toContainText(NAMED_LANGUAGE.status);

    // The whole block is the tap target.
    const box = await item.boundingBox();
    await page.mouse.click(box!.x + box!.width - 8, box!.y + box!.height - 6);
    await expect(page).toHaveURL(new RegExp(`${NAMED_LANGUAGE.code}/$`));
  });

  test("keeps the filters behind one button and lists the active ones as removable chips", async ({
    page,
  }) => {
    await page.goto("");
    await waitForCatalogue(page);

    const filters = page.getByRole("group", { name: "Filters", exact: true });
    const toggle = page.getByRole("button", { name: "Filters", exact: true });
    await expect(filters).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(filters).toBeVisible();
    await filters.getByLabel("Language Code").fill("por");
    await filters.getByRole("button", { name: "Apply Filters" }).click();

    await expect(filters).toBeHidden();
    await expect(languageItems(page)).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Filters · 1" })).toBeVisible();

    await page.getByRole("button", { name: "Remove filter Code: por" }).click();
    await expect(languageItems(page)).toHaveCount(PAGE_SIZE);
    await expect(page.getByRole("button", { name: "Filters", exact: true })).toBeVisible();
  });

  test("keeps the pager on one line at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto("page/2/");
    await waitForCatalogue(page, LAST_PAGE_SIZE);

    const items = page
      .getByRole("navigation", { name: "pagination navigation" })
      .getByRole("listitem");
    const tops = new Set(
      (await items.evaluateAll((elements) =>
        elements.map((element) => Math.round(element.getBoundingClientRect().top))
      ))
    );
    expect(tops.size).toBe(1);
  });
});
