import { expect, test } from "@playwright/test";

import { BASE_PATH } from "../playwright.config";
import {
  applyNameFilter,
  FIXTURE_LANGUAGE_COUNT,
  LAST_PAGE_SIZE,
  NAMED_LANGUAGE,
  PAGE_SIZE,
  waitForCatalogue,
} from "./support/syntheticCatalogue";

test.describe("catalogue smoke journey", () => {
  test("lists the first page of languages", async ({ page }) => {
    await page.goto("");

    await expect(
      page.getByRole("heading", { name: "Linguae" })
    ).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1); // + header
  });

  test("applies and resets a name filter", async ({ page }) => {
    await page.goto("");
    await applyNameFilter(page, "Lusophone");

    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(page.getByRole("row").nth(1)).toContainText(
      NAMED_LANGUAGE.name
    );

    await page.getByRole("button", { name: "Reset Filters" }).click();
    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1);
  });

  test("opens the language detail route", async ({ page }) => {
    await page.goto(`${NAMED_LANGUAGE.code}/`);

    await expect(
      page.getByRole("heading", { name: NAMED_LANGUAGE.name })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "POR", exact: true })
    ).toBeVisible();
    await expect(page.getByText(NAMED_LANGUAGE.description)).toBeVisible();
  });

  test("shows the not-found page for a code the snapshot does not publish", async ({
    page,
  }) => {
    const response = await page.goto("zzz/");

    expect(response?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
  });
});

test.describe("catalogue pagination", () => {
  test("opens page 2 directly by its URL", async ({ page }) => {
    const response = await page.goto("page/2/");

    expect(response?.status()).toBe(200);
    await waitForCatalogue(page, LAST_PAGE_SIZE);
    await expect(page.getByRole("link", { name: "page 2" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("answers 404 for a page outside the catalogue", async ({ page }) => {
    for (const path of ["page/999/", "page/abc/", "page/0/", "page/1/", "page/"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
      await expect(page.getByText("Page not found").first()).toBeVisible();
    }
  });

  test("offers every page as a real link", async ({ page }) => {
    await page.goto("");
    await waitForCatalogue(page);

    const pagination = page.getByRole("navigation", {
      name: "pagination navigation",
    });
    const next = pagination.getByRole("link", { name: "Go to next page" });
    await expect(next).toHaveAttribute("href", `${BASE_PATH}/page/2/`);
    expect(await next.evaluate((element) => element.tagName)).toBe("A");
    await expect(
      pagination.getByRole("link", { name: "Go to page 2" })
    ).toHaveAttribute("href", `${BASE_PATH}/page/2/`);
    await expect(pagination.getByRole("button")).toHaveCount(0);

    await page.goto("page/2/");
    await waitForCatalogue(page, LAST_PAGE_SIZE);
    await expect(
      pagination.getByRole("link", { name: "Go to previous page" })
    ).toHaveAttribute("href", `${BASE_PATH}/`);
  });

  test("moves between pages and back through browser history", async ({
    page,
  }) => {
    await page.goto("");
    await waitForCatalogue(page);
    const firstPage = await page.getByRole("row").allInnerTexts();

    await page.getByRole("link", { name: "Go to next page" }).click();
    await expect(page).toHaveURL(/\/page\/2\/$/);
    await expect(page.getByRole("row")).toHaveCount(LAST_PAGE_SIZE + 1);
    const secondPage = await page.getByRole("row").allInnerTexts();

    // Together the two pages hold every language exactly once.
    const rows = new Set([...firstPage.slice(1), ...secondPage.slice(1)]);
    expect(rows.size).toBe(FIXTURE_LANGUAGE_COUNT);

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/$`));
    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1);
    expect(await page.getByRole("row").allInnerTexts()).toEqual(firstPage);

    await page.goForward();
    await expect(page).toHaveURL(/\/page\/2\/$/);
    await expect(page.getByRole("row")).toHaveCount(LAST_PAGE_SIZE + 1);
  });

  test("states the real extent: total and a last page of ceil(total / page size)", async ({
    page,
  }) => {
    await page.goto("");
    await waitForCatalogue(page);

    const lastPage = Math.ceil(FIXTURE_LANGUAGE_COUNT / PAGE_SIZE);
    await expect(
      page.getByText(`Page 1 of ${lastPage} · ${FIXTURE_LANGUAGE_COUNT} languages`)
    ).toBeVisible();

    const numbers = await page
      .getByRole("navigation", { name: "pagination navigation" })
      .getByRole("link", { name: /page \d+$/ })
      .allInnerTexts();
    expect(Number(numbers.at(-1))).toBe(lastPage);
  });

  test("returns to page 1 when a filter is applied on a later page", async ({
    page,
  }) => {
    await page.goto("page/2/");
    await applyNameFilter(page, "Lusophone", LAST_PAGE_SIZE);

    await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/$`));
    await expect(page.getByRole("row")).toHaveCount(2);
  });

  test("keeps the applied filters while moving between filtered pages", async ({
    page,
  }) => {
    await page.goto("");
    await applyNameFilter(page, "Synthetic");
    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1);

    const next = page.getByRole("link", { name: "Go to next page" });
    await next.click();
    await expect(page).toHaveURL(/\/page\/2\/$/);
    await expect(page.getByLabel("Language Name")).toHaveValue("Synthetic");
    // 60 synthetic names: 50 on page 1, the remaining 10 here.
    await expect(page.getByRole("row")).toHaveCount(11);
    for (const text of await page.getByRole("row").allInnerTexts()) {
      expect(text).not.toContain("Lusophone");
    }
  });
});
