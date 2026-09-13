import { expect, test } from "@playwright/test";

import {
  applyNameFilter,
  waitForCatalogue,
} from "./support/syntheticCatalogue";

async function selectStatus(
  page: import("@playwright/test").Page,
  status: string
) {
  await waitForCatalogue(page);
  await page.getByRole("combobox", { name: /^Status/ }).click();
  await page.getByRole("option", { name: status, exact: true }).click();
  await page.getByRole("button", { name: "Apply Filters" }).click();
}

test.describe("language status filtering", () => {
  test("selecting Extinct excludes Nearly extinct", async ({ page }) => {
    await page.goto("");
    await selectStatus(page, "extinct");

    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(page.getByRole("row").nth(1)).toContainText("Extinct Sample");
    await expect(page.getByRole("row").nth(1)).not.toContainText("Nearly");
  });

  test("selecting Nearly extinct excludes Extinct", async ({ page }) => {
    await page.goto("");
    await selectStatus(page, "nearly extinct");

    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(page.getByRole("row").nth(1)).toContainText(
      "Nearly Extinct Sample"
    );
  });

  test("an unrecognised source status joins no category", async ({ page }) => {
    await page.goto("");
    await selectStatus(page, "unattested");

    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(page.getByRole("row").nth(1)).toContainText(
      "Unattested Sample"
    );
    await expect(page.getByRole("row").nth(1)).not.toContainText(
      "Unknown Status Sample"
    );
  });

  test("shows no status for a language whose source status is unrecognised", async ({
    page,
  }) => {
    await page.goto("");
    await applyNameFilter(page, "Unknown Status Sample");

    const row = page.getByRole("row").nth(1);
    await expect(row).toContainText("Unknown Status Sample");
    await expect(row.getByText("unattested")).toHaveCount(0);

    await page.goto("unk/");
    await expect(
      page.getByRole("heading", { name: "Unknown Status Sample" })
    ).toBeVisible();
    await expect(page.getByText("unattested")).toHaveCount(0);
  });

  test("offers only the categories the snapshot actually publishes", async ({
    page,
  }) => {
    await page.goto("");
    await waitForCatalogue(page);
    await page.getByRole("combobox", { name: /^Status/ }).click();

    const options = await page.getByRole("option").allInnerTexts();
    const statuses = options.map((option) => option.trim()).filter(Boolean);

    expect(statuses).toContain("extinct");
    expect(statuses).toContain("nearly extinct");
    expect(statuses).not.toContain("dormant");
    expect(statuses).not.toContain("moribund");
  });

  test("leaves the catalogue unfiltered when no status is selected", async ({
    page,
  }) => {
    await page.goto("");
    await selectStatus(page, "extinct");
    await expect(page.getByRole("row")).toHaveCount(2);

    await page.getByRole("combobox", { name: /^Status/ }).click();
    await page.getByRole("option", { name: "None", exact: true }).click();
    await page.getByRole("button", { name: "Apply Filters" }).click();

    await expect(page.getByRole("row")).toHaveCount(51);
  });

  test("flags a stored status the catalogue no longer publishes", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "@linguae:language-filters:test",
        JSON.stringify({
          code: "",
          name: "",
          status: "moribund",
          spokenIn: "",
          writingSystem: "",
          nationOfOrigin: "",
        })
      );
    });

    await page.goto("");

    await expect(
      page.getByText("This status is not in the current catalogue.")
    ).toBeVisible();

    await page.getByRole("button", { name: "Reset Filters" }).click();
    await expect(page.getByRole("row")).toHaveCount(51);
  });
});
