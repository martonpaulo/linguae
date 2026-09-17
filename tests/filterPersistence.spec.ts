import { expect, test } from "@playwright/test";

import {
  applyNameFilter,
  PAGE_SIZE,
  waitForCatalogue,
} from "./support/syntheticCatalogue";

const FILTER_KEY = "linguae.language-filters.test";
const UNRELATED_KEY = "unrelated-origin-key";
const SAVE_WARNING = "cannot be remembered";

/** Replaces window.localStorage with one that fails the way a locked-down browser does. */
async function breakStorage(
  page: import("@playwright/test").Page,
  mode: "read" | "write" | "access"
) {
  await page.addInitScript((failure) => {
    const real = window.localStorage;
    const broken = {
      getItem(key: string) {
        if (failure === "read") {
          throw new DOMException("Denied", "SecurityError");
        }
        return real.getItem(key);
      },
      setItem(key: string, value: string) {
        if (failure === "write") {
          throw new DOMException("Quota exceeded", "QuotaExceededError");
        }
        real.setItem(key, value);
      },
      removeItem: (key: string) => real.removeItem(key),
      clear: () => real.clear(),
      key: (index: number) => real.key(index),
      get length() {
        return real.length;
      },
    };

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        if (failure === "access") {
          throw new DOMException("Denied", "SecurityError");
        }
        return broken;
      },
    });
  }, mode);
}

async function seed(
  page: import("@playwright/test").Page,
  entries: Record<string, string>
) {
  await page.addInitScript((seeded) => {
    for (const [key, value] of Object.entries(seeded)) {
      window.localStorage.setItem(key, value);
    }
  }, entries);
}

test.describe("filter persistence resilience", () => {
  test("falls back to defaults when the stored filters are malformed", async ({
    page,
  }) => {
    await seed(page, { [FILTER_KEY]: "{not json" });

    await page.goto("");

    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1);
    await expect(page.getByLabel("Language Name")).toHaveValue("");
  });

  test("falls back to defaults when a stored field has the wrong type", async ({
    page,
  }) => {
    await seed(page, {
      [FILTER_KEY]: JSON.stringify({ name: 42, code: "too long" }),
    });

    await page.goto("");

    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1);
    await expect(page.getByLabel("Language Name")).toHaveValue("");
    await expect(page.getByLabel("Language Code")).toHaveValue("");
  });

  test("renders and filters when reading storage is denied", async ({
    page,
  }) => {
    await breakStorage(page, "read");

    await page.goto("");
    await applyNameFilter(page, "Lusophone");

    await expect(page.getByRole("row")).toHaveCount(2);
  });

  test("renders and filters when localStorage itself is unreachable", async ({
    page,
  }) => {
    await breakStorage(page, "access");

    await page.goto("");
    await applyNameFilter(page, "Lusophone");

    await expect(page.getByRole("row")).toHaveCount(2);
  });

  test("applies and resets filters when saving fails, and says so", async ({
    page,
  }) => {
    await breakStorage(page, "write");

    await page.goto("");
    await applyNameFilter(page, "Lusophone");

    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(page.getByText(SAVE_WARNING)).toBeVisible();

    await page.getByRole("button", { name: "Reset Filters" }).click();
    await expect(page.getByRole("row")).toHaveCount(PAGE_SIZE + 1);
  });

  test("restores valid stored filters and leaves unrelated keys alone", async ({
    page,
  }) => {
    await seed(page, { [UNRELATED_KEY]: "keep-me" });

    await page.goto("");
    await applyNameFilter(page, "Lusophone");
    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(page.getByText(SAVE_WARNING)).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(page.getByLabel("Language Name")).toHaveValue("Lusophone");

    const keys = await page.evaluate(() =>
      Object.keys(window.localStorage).sort()
    );
    expect(keys).toEqual([UNRELATED_KEY, FILTER_KEY].sort());

    const unrelated = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      UNRELATED_KEY
    );
    expect(unrelated).toBe("keep-me");
  });

  test("reads the stored filters once per mount", async ({ page }) => {
    await page.addInitScript(() => {
      const real = window.localStorage;
      const counter = { reads: 0 };
      Object.defineProperty(window, "__filterReads", { value: counter });

      const original = real.getItem.bind(real);
      real.getItem = (key: string) => {
        if (key.includes("language-filters")) counter.reads += 1;
        return original(key);
      };
    });

    await page.goto("");
    await waitForCatalogue(page);

    const reads = await page.evaluate(
      () => (window as unknown as { __filterReads: { reads: number } }).__filterReads.reads
    );
    expect(reads).toBeLessThanOrEqual(1);
  });
});
