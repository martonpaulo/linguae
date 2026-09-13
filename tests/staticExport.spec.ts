import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { BASE_PATH } from "../playwright.config";
import {
  applyNameFilter,
  FIXTURE_LANGUAGE_COUNT,
  NAMED_LANGUAGE,
  PAGE_SIZE,
} from "./support/syntheticCatalogue";

const OUT_DIRECTORY = path.join(process.cwd(), "out");

test.describe("static export delivery", () => {
  test("browses the catalogue without any runtime API or Airtable request", async ({
    page,
  }) => {
    const offSiteRequests: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.includes("/api/") || url.host.includes("airtable")) {
        offSiteRequests.push(request.url());
      }
    });

    await page.goto("");
    await applyNameFilter(page, "Lusophone");
    await expect(page.getByRole("row")).toHaveCount(2);
    await page.goto(`${NAMED_LANGUAGE.code}/`);
    await expect(
      page.getByRole("heading", { name: NAMED_LANGUAGE.name })
    ).toBeVisible();

    expect(offSiteRequests).toEqual([]);
  });

  test("serves every request from under the published base path", async ({
    page,
  }) => {
    const outsideBasePath: string[] = [];
    page.on("request", (request) => {
      const { pathname } = new URL(request.url());
      if (!pathname.startsWith(`${BASE_PATH}/`)) outsideBasePath.push(pathname);
    });

    await page.goto("");
    await expect(page.getByRole("row").nth(1)).toBeVisible();

    expect(outsideBasePath).toEqual([]);
  });

  test("renders a detail page from the exported HTML alone", async ({
    browser,
  }) => {
    // With scripting disabled nothing can fetch, so anything visible came from the export.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto(
      `${BASE_PATH}/${NAMED_LANGUAGE.code}/`,
      { waitUntil: "domcontentloaded" }
    );

    await expect(
      page.getByRole("heading", { name: NAMED_LANGUAGE.name })
    ).toBeVisible();
    await expect(page.getByText(NAMED_LANGUAGE.description)).toBeVisible();

    await context.close();
  });

  test("renders a later catalogue page from the exported HTML alone", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    const response = await page.goto(`${BASE_PATH}/page/2/`, {
      waitUntil: "domcontentloaded",
    });

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("row")).toHaveCount(
      FIXTURE_LANGUAGE_COUNT - PAGE_SIZE + 1
    );
    await expect(
      page.getByRole("link", { name: "Go to previous page" })
    ).toHaveAttribute("href", `${BASE_PATH}/`);

    await context.close();
  });

  test("publishes no credential or private configuration in the artifact", async () => {
    const forbidden = [
      "AIRTABLE_API_KEY",
      "AIRTABLE_BASE_ID",
      "LANGUAGES_TABLE_ID",
      "NATIONS_TABLE_ID",
      "WRITING_SYSTEMS_TABLE_ID",
      "api.airtable.com",
      "Bearer ",
    ];

    const offenders: string[] = [];
    for await (const file of walk(OUT_DIRECTORY)) {
      if (!/\.(html|js|json|txt|css)$/.test(file)) continue;
      const content = await readFile(file, "utf8");
      for (const needle of forbidden) {
        if (content.includes(needle)) {
          offenders.push(`${path.relative(OUT_DIRECTORY, file)} contains ${needle}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

async function* walk(directory: string): AsyncGenerator<string> {
  for (const entry of await readdir(directory)) {
    const target = path.join(directory, entry);
    const info = await stat(target);
    if (info.isDirectory()) yield* walk(target);
    else yield target;
  }
}
