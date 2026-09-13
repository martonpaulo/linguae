import { expect, type Page, type Route } from "@playwright/test";

/**
 * The specs run against the synthetic fixture snapshot produced by
 * `pnpm snapshot:fixture`, so they exercise the real generation and delivery path
 * instead of a parallel mock. These constants describe that fixture.
 */
export const PAGE_SIZE = 50;
export const FIXTURE_LANGUAGE_COUNT = 69;

export const NAMED_LANGUAGE = {
  code: "por",
  name: 'Portuguese "Lusophone"',
  status: "national",
  description: "A Romance language of the Indo-European family.",
};

export const EXTINCT_LANGUAGE = { code: "xtc", name: "Extinct Sample" };
export const RICH_LANGUAGE = { code: "ric", name: "Rich Sample" };
export const LONG_LINEAGE_LANGUAGE = { code: "lng", name: "Long Lineage Sample" };
export const NEARLY_EXTINCT_LANGUAGE = {
  code: "xne",
  name: "Nearly Extinct Sample",
};

export const FIXTURE_NATIONS = ["Brazil", "Japan", "Portugal"];
export const FIXTURE_WRITING_SYSTEMS = ["Japanese", "Latin"];

export type SnapshotAsset =
  | "index"
  | "nations"
  | "writing-systems"
  | "manifest";

const ASSET_PATTERNS: Record<SnapshotAsset, string> = {
  index: "**/catalogue/index.json",
  nations: "**/catalogue/nations.json",
  "writing-systems": "**/catalogue/writing-systems.json",
  manifest: "**/catalogue/manifest.json",
};

export interface SnapshotFailureOptions {
  /** Assets that must answer with a delivery failure. */
  fail?: SnapshotAsset[];
  /** Milliseconds to hold the affected responses, to observe pending states. */
  delayMs?: number;
}

/**
 * Injects delivery failures or delays into snapshot assets. Assets that are not listed are
 * served normally by the application, so a spec only overrides what it is testing.
 */
export async function failSnapshotAssets(
  page: Page,
  options: SnapshotFailureOptions
): Promise<void> {
  const handle = async (route: Route) => {
    if (options.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Synthetic delivery failure" }),
    });
  };

  for (const asset of options.fail ?? []) {
    await page.route(ASSET_PATTERNS[asset], handle);
  }
}

/** Rows on the last page of the unfiltered fixture. */
export const LAST_PAGE_SIZE = FIXTURE_LANGUAGE_COUNT - PAGE_SIZE;

/**
 * Waits until a catalogue page shows its rows and is hydrated. The exported HTML already
 * carries the rows, so the enabled Apply button is what says the form is usable: an
 * unhydrated submit is a native form submission that reloads the page instead of filtering.
 */
export async function waitForCatalogue(
  page: Page,
  rows: number = PAGE_SIZE
): Promise<void> {
  if (isPhone(page)) {
    await expect(languageItems(page)).toHaveCount(rows);
    await expect(page.getByRole("button", { name: /^Filters/ })).toBeEnabled();
    return;
  }
  await expect(page.getByRole("row")).toHaveCount(rows + 1);
  await expect(page.getByRole("button", { name: "Apply Filters" })).toBeEnabled();
}

/** Below the tablet breakpoint (767px) the catalogue is a list and the filters collapse. */
export function isPhone(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1280) < 767;
}

/** The languages in the phone list. */
export function languageItems(page: Page) {
  return page.getByRole("list", { name: "Languages" }).getByRole("listitem");
}

/** Types a name filter into the hydrated form and applies it. */
export async function applyNameFilter(
  page: Page,
  name: string,
  rows: number = PAGE_SIZE
): Promise<void> {
  await waitForCatalogue(page, rows);
  await page.getByLabel("Language Name").fill(name);
  await page.getByRole("button", { name: "Apply Filters" }).click();
}
