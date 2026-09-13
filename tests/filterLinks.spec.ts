import { expect, type Page, test } from "@playwright/test";

import { BASE_PATH } from "../playwright.config";
import {
  BRAZIL_ORIGIN_COUNT,
  FIXTURE_LANGUAGE_COUNT,
  LONG_LINEAGE_LANGUAGE,
  NAMED_LANGUAGE,
  PAGE_SIZE,
  RICH_LANGUAGE,
} from "./support/syntheticCatalogue";

const LONG_LINEAGE_PLACES = [
  "Japan",
  "Brazil",
  "Portugal",
  "Angola",
  "Cabo Verde",
  "Mozambique",
  "Timor-Leste",
  "Guinea-Bissau",
  "São Tomé and Príncipe",
];

function activeFilters(page: Page) {
  return page.getByRole("group", { name: "Active filters" });
}

test.describe("facts that open the filtered catalogue", () => {
  test("a nation of origin opens the catalogue filtered by it", async ({ page }) => {
    await page.goto(`${RICH_LANGUAGE.code}/`);
    const link = page.getByRole("link", { name: "Show languages originating in Brazil" });
    await expect(link).toHaveAttribute("href", `${BASE_PATH}/?nation=Brazil`);

    await link.click();

    await expect(page).toHaveURL(/\/\?nation=Brazil$/);
    await expect(activeFilters(page)).toContainText("Nation of origin: Brazil");
    await expect(page.getByText(`${BRAZIL_ORIGIN_COUNT} languages match`)).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1);
  });

  test("a status opens the catalogue filtered by it", async ({ page }) => {
    await page.goto(`${NAMED_LANGUAGE.code}/`);

    await page.getByRole("link", { name: "Show national languages" }).click();

    await expect(page).toHaveURL(/\/\?status=national$/);
    await expect(activeFilters(page)).toContainText("Status: national");
    await expect(page.getByText("2 languages match")).toBeVisible();
  });

  test("a filtered URL opened directly applies its filter to the form", async ({ page }) => {
    await page.goto("?writing=Japanese");

    await expect(activeFilters(page)).toContainText("Writing system: Japanese");
    await expect(page.getByText("1 language matches")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Writing System" })).toHaveText("Japanese");
  });

  test("the URL follows the applied filters and paging keeps them", async ({ page }) => {
    await page.goto("?nation=Brazil");
    await expect(page.getByText(`${BRAZIL_ORIGIN_COUNT} languages match`)).toBeVisible();

    await page.getByRole("link", { name: "Go to next page" }).click();
    await expect(page).toHaveURL(/\/page\/2\/\?nation=Brazil$/);
    await expect(page.getByRole("row")).toHaveCount(BRAZIL_ORIGIN_COUNT - PAGE_SIZE + 1);
  });

  test("clearing the filter returns to the whole catalogue on page 1", async ({ page }) => {
    await page.goto("page/2/?nation=Brazil");
    await expect(page.getByRole("row")).toHaveCount(BRAZIL_ORIGIN_COUNT - PAGE_SIZE + 1);

    await page.getByRole("button", { name: "Remove filter Nation of origin: Brazil" }).click();

    await expect(page).toHaveURL(new RegExp(`${BASE_PATH}/$`));
    await expect(page.getByText(`${FIXTURE_LANGUAGE_COUNT} languages`, { exact: true })).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1);
    await expect(activeFilters(page)).toHaveCount(0);
  });
});

test.describe("language page content shape", () => {
  test("moves a long speakers paragraph and a long list of places into the reading column", async ({
    page,
  }) => {
    await page.goto(`${LONG_LINEAGE_LANGUAGE.code}/`);

    const facts = page.getByRole("complementary", { name: "Key facts" });
    await expect(facts.getByText("Speakers", { exact: true })).toHaveCount(0);
    await expect(facts.getByText("Spoken in", { exact: true })).toHaveCount(0);

    await expect(page.getByRole("heading", { name: "Speakers" })).toBeVisible();
    const places = page
      .getByRole("heading", { name: "Spoken in" })
      .locator("xpath=..")
      .getByRole("link");
    await expect(places).toHaveCount(LONG_LINEAGE_PLACES.length);
    await expect(places.first()).toHaveAccessibleName("Show languages spoken in Japan");
  });

  test("keeps a short speakers figure in the facts card", async ({ page }) => {
    await page.goto(`${RICH_LANGUAGE.code}/`);

    const facts = page.getByRole("complementary", { name: "Key facts" });
    await expect(facts.getByText("Speakers", { exact: true })).toBeVisible();
    await expect(facts.getByRole("link", { name: "Show languages written in Latin" })).toBeVisible();
  });

  test.describe("on a wide screen", () => {
    test.use({ viewport: { width: 1720, height: 1000 } });

    test("puts the lineage in a third column and keeps the prose at its measure", async ({
      page,
    }) => {
      await page.goto(`${RICH_LANGUAGE.code}/`);

      const facts = await page.getByRole("complementary", { name: "Key facts" }).boundingBox();
      const lineage = await page.getByRole("region", { name: "Lineage" }).boundingBox();
      const prose = await page.getByRole("heading", { name: "About" }).locator("xpath=../..").boundingBox();

      expect(prose!.x).toBeGreaterThan(facts!.x + facts!.width);
      expect(lineage!.x).toBeGreaterThan(prose!.x + prose!.width);
      expect(Math.abs(lineage!.y - facts!.y)).toBeLessThanOrEqual(1);
      expect(prose!.width).toBeLessThanOrEqual(700);
    });
  });

  test.describe("at 1280px", () => {
    test.use({ viewport: { width: 1280, height: 900 } });

    test("keeps the lineage under the facts, beside the prose", async ({ page }) => {
      await page.goto(`${RICH_LANGUAGE.code}/`);

      const facts = await page.getByRole("complementary", { name: "Key facts" }).boundingBox();
      const lineage = await page.getByRole("region", { name: "Lineage" }).boundingBox();

      expect(Math.abs(lineage!.x - facts!.x)).toBeLessThanOrEqual(1);
      expect(lineage!.y).toBeGreaterThan(facts!.y + facts!.height);
      expect(lineage!.y - (facts!.y + facts!.height)).toBeLessThanOrEqual(32);
    });
  });
});

test.describe("multi-value catalogue cells", () => {
  test("clamp a long list into one comma-separated group with the remaining count", async ({
    page,
  }) => {
    await page.goto(`?name=${encodeURIComponent("Long Lineage")}`);

    const row = page.getByRole("row").filter({ hasText: LONG_LINEAGE_LANGUAGE.name });
    const cell = row.getByRole("cell").last();
    await expect(cell).toContainText("Japan, Brazil, Portugal");
    const more = cell.getByRole("link", { name: `and 6 more: open ${LONG_LINEAGE_LANGUAGE.name}` });
    await expect(more).toHaveText("and 6 more");
    await expect(more).toHaveAttribute("href", `${BASE_PATH}/${LONG_LINEAGE_LANGUAGE.code}/`);
    // The clamp hides values from sight only: the whole list is still in the cell's text.
    for (const place of LONG_LINEAGE_PLACES) await expect(cell).toContainText(place);
  });

  test("list the value an active filter matched first", async ({ page }) => {
    await page.goto("?spoken=Portugal");

    const row = page.getByRole("row").filter({ hasText: LONG_LINEAGE_LANGUAGE.name });
    const visible = await row
      .getByRole("cell")
      .last()
      .evaluate((cell) => (cell.firstElementChild?.firstChild?.textContent ?? "").trim());
    expect(visible).toBe("Portugal, Japan, Brazil");
  });
});
