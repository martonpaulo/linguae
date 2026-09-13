import { expect, test } from "@playwright/test";

const HEADING_FILL = "rgb(251, 234, 240)";

test("every table heading cell carries the same fill", async ({ page }) => {
  await page.goto("");

  const headings = page.getByRole("columnheader");
  await expect(headings).toHaveCount(6);

  const fills = await headings.evaluateAll((cells) =>
    cells.map((cell) => getComputedStyle(cell).backgroundColor)
  );

  expect(fills).toEqual(Array(6).fill(HEADING_FILL));
});

test("a heading cell added later inherits the fill without its own declaration", async ({
  page,
}) => {
  await page.goto("");
  await expect(page.getByRole("columnheader").first()).toBeVisible();

  const addedFill = await page.evaluate(() => {
    const headRow = document.querySelector("thead tr");
    if (!headRow) throw new Error("missing head row");

    const cell = document.createElement("th");
    cell.className = "MuiTableCell-root MuiTableCell-head";
    cell.textContent = "Added";
    headRow.append(cell);

    return getComputedStyle(cell).backgroundColor;
  });

  expect(addedFill).toBe(HEADING_FILL);
});

test("the language code renders with the same typography in list and detail", async ({
  page,
}) => {
  await page.goto("");
  const listCodeFont = await page
    .getByRole("row")
    .nth(1)
    .getByRole("cell")
    .first()
    .evaluate((cell) => getComputedStyle(cell).fontFamily);

  await page.goto("por/");
  const detailCodeFont = await page
    .getByRole("heading", { name: "POR", exact: true })
    .evaluate((heading) => getComputedStyle(heading).fontFamily);

  expect(listCodeFont).toMatch(/^monospace$/i);
  expect(detailCodeFont).toBe(listCodeFont);
});
