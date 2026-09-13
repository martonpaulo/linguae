import { expect, test } from "@playwright/test";

import { NAMED_LANGUAGE, waitForCatalogue } from "./support/syntheticCatalogue";

const CREDIT =
  "Developed by Marton Paulo · MIT licensed · © 2026 Linguae contributors · Data: Wikitongues";

test.describe("site footer", () => {
  test("credits the project and states the licence and year in the HTML", async ({
    request,
  }) => {
    const html = await (await request.get("")).text();
    expect(html).toContain("© 2026 Linguae contributors");
    expect(html).toContain("MIT licensed");
  });

  test("links only outside the site, each with the external icon", async ({
    page,
  }) => {
    await page.goto("");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toHaveText(new RegExp(CREDIT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    const creditFont = await footer
      .getByText(CREDIT)
      .evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.fontFamily, style.fontSize, style.color];
      });
    expect(creditFont[0]).toContain("Poppins");
    const links = footer.getByRole("link");
    // The attribution lives in the footer only, not in the page body.
    await expect(page.getByRole("main").getByText("Wikitongues")).toHaveCount(0);
    await expect(links).toHaveCount(3);
    await expect(
      footer.getByRole("link", { name: "Wikitongues" })
    ).toHaveAttribute("href", "https://wikitongues.org/");
    for (const link of await links.all()) {
      const href = await link.getAttribute("href");
      expect(href, "external").toMatch(/^https:\/\/(?!linguae\.)/);
      await expect(link.locator("svg.external-icon")).toHaveCount(1);
      // One line of secondary text: the credit's family, size and colour, no fallback serif.
      expect(await link.evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.fontFamily, style.fontSize, style.color];
      })).toEqual(creditFont);
    }
  });

  test("keeps the credit, the data source and the links on one row on a wide screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("");
    const footer = page.getByRole("contentinfo");

    const tops = await footer.getByRole("link").evaluateAll((links) =>
      links.map((link) => Math.round(link.getBoundingClientRect().top))
    );
    // Wikitongues sits in the credit; Source and martonpaulo.com on the right; all one line.
    expect(new Set(tops).size).toBe(1);
  });

  for (const viewport of [
    { width: 375, height: 812 },
    { width: 1280, height: 900 },
  ]) {
    test(`sits at the bottom of a short page at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("zzz/");

      const box = await page.getByRole("contentinfo").boundingBox();
      expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(viewport.height);
    });
  }

  test("follows the content on a long page instead of floating over it", async ({
    page,
  }) => {
    for (const path of ["", `${NAMED_LANGUAGE.code}/`]) {
      await page.goto(path);
      if (!path) await waitForCatalogue(page);

      const position = await page.evaluate(() => {
        const main = document.querySelector("main")!.getBoundingClientRect();
        const footer = document.querySelector("footer")!;
        return {
          mainBottom: main.bottom,
          footerTop: footer.getBoundingClientRect().top,
          position: getComputedStyle(footer).position,
        };
      });
      expect(position.position, path).toBe("static");
      expect(position.footerTop, path).toBeGreaterThanOrEqual(position.mainBottom - 1);
    }
  });
});

test.describe("site header", () => {
  test("shows the brand linking home on every kind of page", async ({ page }) => {
    for (const path of ["", "page/2/", "por/", "zzz/"]) {
      await page.goto(path);
      const home = page.getByRole("banner").getByRole("link", { name: "Linguae" });
      await expect(home, path).toBeVisible();
      await expect(home, path).toHaveAttribute("href", "/");
    }
  });
});
