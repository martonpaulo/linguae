import { expect, test } from "@playwright/test";

import { BASE_PATH } from "../playwright.config";
import {
  applyNameFilter,
  NAMED_LANGUAGE,
} from "./support/syntheticCatalogue";

async function showOnlyNamedLanguage(page: import("@playwright/test").Page) {
  await page.goto("");
  await applyNameFilter(page, "Lusophone");
  await expect(page.getByRole("row")).toHaveCount(2);
}

test.describe("language detail navigation", () => {
  test("exposes each result as a link to its detail page", async ({ page }) => {
    await showOnlyNamedLanguage(page);

    const link = page.getByRole("link", { name: NAMED_LANGUAGE.name });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      `${BASE_PATH}/${NAMED_LANGUAGE.code}/`
    );
  });

  test("reaches the link by keyboard and opens it with Enter", async ({
    page,
  }) => {
    await showOnlyNamedLanguage(page);

    const link = page.getByRole("link", { name: NAMED_LANGUAGE.name });
    await link.focus();
    await expect(link).toBeFocused();

    const outline = await link.evaluate(
      (element) => getComputedStyle(element).outlineWidth
    );
    expect(parseFloat(outline)).toBeGreaterThan(0);

    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(new RegExp(`${NAMED_LANGUAGE.code}/$`));
    await expect(
      page.getByRole("heading", { name: NAMED_LANGUAGE.name })
    ).toBeVisible();
  });

  test("keeps the current page when the link is opened in a new tab", async ({
    page,
    context,
  }) => {
    await showOnlyNamedLanguage(page);

    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      page
        .getByRole("link", { name: NAMED_LANGUAGE.name })
        .click({ modifiers: [process.platform === "darwin" ? "Meta" : "Control"] }),
    ]);

    await popup.waitForLoadState();
    expect(popup.url()).toContain(`${BASE_PATH}/${NAMED_LANGUAGE.code}/`);

    await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/\\?name=Lusophone$`));
    await expect(page.getByRole("row")).toHaveCount(2);
    await popup.close();
  });

  test("still navigates on an ordinary click anywhere in the row", async ({
    page,
  }) => {
    await showOnlyNamedLanguage(page);

    await page.getByRole("row").nth(1).getByRole("cell").last().click();

    await expect(page).toHaveURL(new RegExp(`${NAMED_LANGUAGE.code}/$`));
  });

  test("keeps native table semantics around the link", async ({ page }) => {
    await showOnlyNamedLanguage(page);

    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("columnheader")).toHaveCount(6);

    const inCell = await page
      .getByRole("link", { name: NAMED_LANGUAGE.name })
      .evaluate((element) => element.closest("td") !== null);
    expect(inCell).toBe(true);
  });

  test("offers one tab stop per row", async ({ page }) => {
    await showOnlyNamedLanguage(page);

    const linkCount = await page
      .getByRole("row")
      .nth(1)
      .getByRole("link")
      .count();
    expect(linkCount).toBe(1);
  });
});
