import { expect, test } from "@playwright/test";

import {
  applyNameFilter,
  failSnapshotAssets,
  PAGE_SIZE,
} from "./support/syntheticCatalogue";

const CATALOGUE_ERROR = "The catalogue needs nations to show its results";
const EMPTY_RESULT = "No languages found matching the filters.";

test.describe("composed catalogue states", () => {
  test("stays pending while a lookup is still loading", async ({ page }) => {
    // The unfiltered page ships its rows; only a filter requests the index, so holding it
    // keeps the filtered result pending however long hydration took.
    await page.route("**/catalogue/index.json", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3_000));
      await route.continue();
    });

    await page.goto("");
    await applyNameFilter(page, "Lusophone");

    await expect(page.getByText("Loading languages...")).toBeVisible();
    await expect(page.getByText(EMPTY_RESULT)).toHaveCount(0);

    await expect(page.getByRole("row")).toHaveCount(2);
  });

  test("shows the exported rows even when a lookup fails", async ({ page }) => {
    await failSnapshotAssets(page, { fail: ["nations"] });

    await page.goto("");

    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1);
    await expect(page.getByText(CATALOGUE_ERROR)).toHaveCount(0);
  });

  test("reports a failed lookup as an error, not an empty catalogue", async ({
    page,
  }) => {
    await failSnapshotAssets(page, { fail: ["nations"] });

    await page.goto("");
    await applyNameFilter(page, "Lusophone");

    await expect(page.getByText(CATALOGUE_ERROR)).toBeVisible();
    await expect(page.getByText(EMPTY_RESULT)).toHaveCount(0);
    await expect(page.getByText("Loading languages...")).toHaveCount(0);
  });

  test("recovers through retry once the failed asset is available", async ({
    page,
  }) => {
    let shouldFail = true;
    await page.route("**/catalogue/nations.json", async (route) => {
      if (shouldFail) {
        await route.fulfill({ status: 503, body: "{}" });
        return;
      }
      await route.continue();
    });

    await page.goto("");
    await applyNameFilter(page, "Lusophone");
    await expect(page.getByText(CATALOGUE_ERROR)).toBeVisible();

    shouldFail = false;
    await page.getByRole("button", { name: "Try again" }).click();

    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(page.getByText(CATALOGUE_ERROR)).toHaveCount(0);
  });

  test("keeps a lookup-backed filter unusable while its data is unavailable", async ({
    page,
  }) => {
    await failSnapshotAssets(page, { fail: ["nations"] });

    await page.goto("");

    await expect(page.getByLabel("Nation of Origin")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    await expect(
      page.getByText("Nations could not be loaded.").first()
    ).toBeVisible();
  });

  test("still filters by code and name when a lookup fails", async ({
    page,
  }) => {
    await failSnapshotAssets(page, { fail: ["writing-systems"] });

    await page.goto("");
    await expect(
      page.getByText("Writing systems could not be loaded.")
    ).toBeVisible();

    await expect(page.getByLabel("Language Code")).toBeEnabled();
    await expect(page.getByLabel("Language Name")).toBeEnabled();
  });
});
