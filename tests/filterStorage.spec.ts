import { expect, test } from "@playwright/test";

import { applyNameFilter } from "./support/syntheticCatalogue";

const FILTER_KEY = "linguae.language-filters.test";
const LEGACY_QUERY_CACHE_KEY = "@linguae:react-query-cache:test";
const UNRELATED_KEY = "unrelated-origin-key";

test("writes only the filter preference to application storage", async ({
  page,
}) => {
  await page.goto("");
  await applyNameFilter(page, "Portuguese");
  await expect(page.getByRole("row")).toHaveCount(2);

  await page.goto("por/");
  await page.getByRole("heading", { name: "Portuguese" }).waitFor();

  const keys = await page.evaluate(() => Object.keys(window.localStorage).sort());
  expect(keys).toEqual([FILTER_KEY]);
});

test("ignores a legacy persisted query cache and keeps unrelated keys", async ({
  page,
}) => {
  await page.addInitScript(
    ([legacyKey, unrelatedKey]) => {
      window.localStorage.setItem(
        legacyKey,
        JSON.stringify({
          timestamp: Date.now(),
          buster: "",
          clientState: {
            mutations: [],
            queries: [
              {
                queryKey: ["nations"],
                queryHash: '["nations"]',
                state: {
                  data: [{ id: "nat_stale", name: "Stale Nation" }],
                  dataUpdatedAt: Date.now(),
                  status: "success",
                },
              },
            ],
          },
        })
      );
      window.localStorage.setItem(unrelatedKey, "keep-me");
    },
    [LEGACY_QUERY_CACHE_KEY, UNRELATED_KEY]
  );

  await page.goto("");
  await page.getByRole("row").nth(1).waitFor();

  await page.getByLabel("Nation of Origin").click();
  await expect(page.getByRole("option", { name: "Brazil" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Stale Nation" })).toHaveCount(0);
  await page.keyboard.press("Escape");

  const unrelatedValue = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    UNRELATED_KEY
  );
  expect(unrelatedValue).toBe("keep-me");
});
