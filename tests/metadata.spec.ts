import { expect, test } from "@playwright/test";

import { BASE_PATH } from "../playwright.config";
import { NAMED_LANGUAGE } from "./support/syntheticCatalogue";

const ORIGIN = "https://linguae.martonpaulo.com";
const SITE = `${ORIGIN}${BASE_PATH}/`;
const SOCIAL_IMAGE = `${ORIGIN}${BASE_PATH}/social-card.jpg`;

async function meta(
  page: import("@playwright/test").Page,
  selector: string
): Promise<string | null> {
  return page.locator(selector).first().getAttribute("content");
}

async function structuredData(page: import("@playwright/test").Page) {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return blocks.map((block) => JSON.parse(block) as Record<string, unknown>);
}

/** The page title, and the social titles that must repeat it exactly. */
async function expectTitle(
  page: import("@playwright/test").Page,
  title: string
): Promise<void> {
  await expect(page).toHaveTitle(title);
  expect(await meta(page, 'meta[property="og:title"]')).toBe(title);
  expect(await meta(page, 'meta[name="twitter:title"]')).toBe(title);
}

test.describe("published metadata", () => {
  test("the catalogue declares its canonical, social and structured data", async ({
    page,
  }) => {
    await page.goto("");

    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      SITE
    );
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await meta(page, 'meta[name="theme-color"]')).toBeTruthy();

    expect(await meta(page, 'meta[property="og:type"]')).toBe("website");
    expect(await meta(page, 'meta[property="og:url"]')).toBe(SITE);
    expect(await meta(page, 'meta[property="og:site_name"]')).toBe(
      "Linguae"
    );
    expect(await meta(page, 'meta[property="og:image"]')).toBe(SOCIAL_IMAGE);
    expect(await meta(page, 'meta[property="og:image:width"]')).toBe("1200");
    expect(await meta(page, 'meta[property="og:image:height"]')).toBe("630");
    expect(await meta(page, 'meta[property="og:image:type"]')).toBe(
      "image/jpeg"
    );
    expect(await meta(page, 'meta[name="twitter:card"]')).toBe(
      "summary_large_image"
    );
    expect(await meta(page, 'meta[name="twitter:image"]')).toBe(SOCIAL_IMAGE);
    await expectTitle(
      page,
      "Linguae · Search 7,500+ documented languages of the world"
    );

    const [catalogue] = await structuredData(page);
    expect(catalogue["@type"]).toBe("DataCatalog");
    expect(catalogue.url).toBe(SITE);
  });

  test("a language page declares its own canonical and structured data", async ({
    page,
  }) => {
    await page.goto(`${NAMED_LANGUAGE.code}/`);

    const url = `${SITE}${NAMED_LANGUAGE.code}/`;
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      url
    );
    expect(await meta(page, 'meta[property="og:url"]')).toBe(url);
    expect(await meta(page, 'meta[property="og:type"]')).toBe("article");
    expect(await meta(page, 'meta[property="og:image"]')).toBe(SOCIAL_IMAGE);
    expect(await meta(page, 'meta[name="twitter:image"]')).toBe(SOCIAL_IMAGE);
    await expectTitle(page, `${NAMED_LANGUAGE.name} language · Linguae`);

    const language = (await structuredData(page)).find(
      (block) => block["@type"] === "Language"
    );
    expect(language?.identifier).toBe(NAMED_LANGUAGE.code);
    expect(language?.name).toBe(NAMED_LANGUAGE.name);
    expect(language?.url).toBe(url);
  });

  test("a later catalogue page declares itself as canonical", async ({
    page,
  }) => {
    await page.goto("page/2/");

    const url = `${SITE}page/2/`;
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      url
    );
    expect(await meta(page, 'meta[property="og:url"]')).toBe(url);
    await expectTitle(page, "Languages, page 2 · Linguae");
  });

  test("titles the not-found page as such, not as the home page", async ({
    page,
  }) => {
    await page.goto("zzz/");

    await expectTitle(page, "Page not found · Linguae");
  });

  test("serves the social card at its declared size and type", async ({
    request,
  }) => {
    const response = await request.get(`${BASE_PATH}/social-card.jpg`);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/jpeg");
  });

  test("publishes a sitemap covering the catalogue and every language", async ({
    request,
    page,
  }) => {
    const response = await request.get(`${BASE_PATH}/sitemap.xml`);
    expect(response.status()).toBe(200);

    const sitemap = await response.text();
    expect(sitemap).toContain(`<loc>${SITE}</loc>`);
    expect(sitemap).toContain(`<loc>${SITE}${NAMED_LANGUAGE.code}/</loc>`);

    // Every listed page must exist, checked against the codes the export generated.
    const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1]
    );
    expect(listed.length).toBeGreaterThan(1);
    expect(listed.every((url) => url.startsWith(SITE))).toBe(true);

    for (const url of listed.slice(0, 5)) {
      const path = url.slice(ORIGIN.length);
      const check = await page.request.get(path);
      expect(check.status(), path).toBe(200);
    }
  });

  test("descends heading levels without skipping", async ({ page }) => {
    for (const path of ["", "page/2/", `${NAMED_LANGUAGE.code}/`, "zzz/"]) {
      await page.goto(path);

      const levels = await page
        .locator("h1, h2, h3, h4, h5, h6")
        .evaluateAll((headings) =>
          headings.map((heading) => Number(heading.tagName.slice(1)))
        );

      expect(levels[0], path).toBe(1);
      for (let index = 1; index < levels.length; index += 1) {
        expect(levels[index] - levels[index - 1], `${path} at ${index}`).toBeLessThanOrEqual(1);
      }
    }
  });
});
