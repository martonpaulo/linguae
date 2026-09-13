import { expect, test } from "@playwright/test";

import {
  applyNameFilter,
  PAGE_SIZE,
  waitForCatalogue,
} from "./support/syntheticCatalogue";

/** Builds a snapshot payload of any size, to exercise the derivation at real scale. */
function largeSnapshot(languageCount: number, nationCount: number) {
  return {
    index: {
      version: "measured",
      languages: Array.from({ length: languageCount }, (_, index) => ({
        id: `rec_${index}`,
        code: `c${index}`,
        name: `Measured Language ${index}`,
        status: index % 2 === 0 ? "vigorous" : "shifting",
        spokenInId: [`nat_${index % nationCount}`],
        writingSystemId: [`ws_${index % 20}`],
        nationOfOriginId: [`nat_${(index * 3) % nationCount}`],
      })),
    },
    nations: {
      version: "measured",
      nations: Array.from({ length: nationCount }, (_, index) => ({
        id: `nat_${index}`,
        name: `Nation ${index}`,
      })),
    },
    writingSystems: {
      version: "measured",
      writingSystems: Array.from({ length: 20 }, (_, index) => ({
        id: `ws_${index}`,
        name: `Writing System ${index}`,
      })),
    },
  };
}

async function measurePageChange(
  page: import("@playwright/test").Page,
  languageCount: number
) {
  const snapshot = largeSnapshot(languageCount, 200);
  const assets: [string, unknown][] = [
    ["**/catalogue/index.json", snapshot.index],
    ["**/catalogue/nations.json", snapshot.nations],
    ["**/catalogue/writing-systems.json", snapshot.writingSystems],
  ];

  for (const [pattern, body] of assets) {
    await page.route(pattern, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(body),
      })
    );
  }

  // The unfiltered page ships the fixture's rows; a filter switches to the routed snapshot.
  await page.goto("");
  const startedAt = Date.now();
  await applyNameFilter(page, "Measured");
  await expect(
    page.getByRole("link", { name: "Measured Language 0", exact: true })
  ).toBeVisible();
  const initialMs = Date.now() - startedAt;

  const changeStartedAt = Date.now();
  await page.getByRole("link", { name: "Go to next page" }).click();
  await expect(
    page.getByRole("link", { name: `Measured Language ${PAGE_SIZE}`, exact: true })
  ).toBeVisible();
  const changeMs = Date.now() - changeStartedAt;

  for (const [pattern] of assets) await page.unroute(pattern);

  return { initialMs, changeMs };
}

test.describe("catalogue derivation", () => {
  test("changes the filtered page at a cost independent of the snapshot size", async ({
    page,
  }, testInfo) => {
    // If changing page re-derived the snapshot, a 16x larger catalogue would make the change
    // roughly 16x more expensive. Measuring both sizes tests that invariant directly.
    const small = await measurePageChange(page, 500);
    const large = await measurePageChange(page, 8_000);

    testInfo.annotations.push({
      type: "measurement",
      description:
        `500 languages: filter ${small.initialMs} ms, page change ${small.changeMs} ms; ` +
        `8000 languages: filter ${large.initialMs} ms, page change ${large.changeMs} ms`,
    });

    expect(large.changeMs).toBeLessThan(Math.max(small.changeMs, 50) * 4);
  });

  test("restores the same result when a filter is applied and removed", async ({
    page,
  }) => {
    await page.goto("");
    await waitForCatalogue(page);
    const before = await page.getByRole("row").allInnerTexts();

    await applyNameFilter(page, "Lusophone");
    await expect(page.getByRole("row")).toHaveCount(2);

    await page.getByRole("button", { name: "Reset Filters" }).click();
    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1);

    expect(await page.getByRole("row").allInnerTexts()).toEqual(before);
  });

  test("falls back to the raw relation id when a reference name is missing", async ({
    page,
  }) => {
    await page.goto("");
    await applyNameFilter(page, "Unknown Status Sample");

    await expect(page.getByRole("row").nth(1)).toContainText("nat_missing");
  });
});
