import { expect, test } from "@playwright/test";

/**
 * Post-deployment verification against a published site. Skipped unless a URL is given:
 *
 *   LIVE_URL=https://linguae.martonpaulo.com/ pnpm exec playwright test liveDeployment
 *
 * It asserts only what must hold for any real snapshot, so it does not depend on the
 * fixture data the rest of the suite uses.
 */
const LIVE_URL = process.env.LIVE_URL;

test.describe("published deployment", () => {
  test.skip(!LIVE_URL, "Set LIVE_URL to verify a published site.");
  test.use({ baseURL: LIVE_URL });

  test("serves the catalogue with rows and no runtime API call", async ({
    page,
  }) => {
    const runtimeCalls: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.includes("/api/") || url.host.includes("airtable")) {
        runtimeCalls.push(request.url());
      }
    });

    await page.goto("");

    await expect(
      page.getByRole("heading", { level: 1, name: /documented languages/ })
    ).toBeVisible();
    await expect(page.getByRole("row").nth(50)).toBeVisible();
    expect(runtimeCalls).toEqual([]);
  });

  test("filters the real catalogue and opens a result", async ({ page }) => {
    await page.goto("");
    await expect(page.getByRole("row").nth(50)).toBeVisible();

    await page.getByLabel("Language Code").fill("por");
    await page.getByRole("button", { name: "Apply Filters" }).click();

    const link = page.getByRole("row").nth(1).getByRole("link");
    const name = await link.innerText();
    await link.click();

    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(page).toHaveTitle(new RegExp("Linguae"));
  });

  test("answers an unpublished code with the exported not-found page", async ({
    page,
  }) => {
    const response = await page.goto("zzz/");

    expect(response?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
  });
});
