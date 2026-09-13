import { expect, test } from "@playwright/test";

import { NAMED_LANGUAGE, waitForCatalogue } from "./support/syntheticCatalogue";

const CREDIT =
  "Developed by Marton Paulo · MIT licensed · © 2026 Linguae contributors.";

test.describe("site footer", () => {
  test("credits the project and states the licence and year in the HTML", async ({
    request,
  }) => {
    const html = await (await request.get("")).text();
    expect(html).toContain("© 2026 Linguae contributors.");
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
