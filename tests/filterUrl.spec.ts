import { expect, test } from "@playwright/test";

import { DEFAULT_LANGUAGE_FILTERS } from "../src/features/languages/utils/languageFilters";
import {
  catalogueFilterHref,
  filterSearch,
  parseFilterSearch,
} from "../src/features/languages/utils/languageFilterUrl";
import { orderValues } from "../src/features/languages/utils/languageValueList";

test.describe("filters in the catalogue URL", () => {
  test("names no filter when the URL carries none", () => {
    expect(parseFilterSearch("")).toBeNull();
    expect(parseFilterSearch("?utm_source=mail&page=2")).toBeNull();
  });

  test("reads every valid filter", () => {
    expect(
      parseFilterSearch(
        "?name=port&code=por&status=national&nation=Portugal&writing=Latin&spoken=Brazil"
      )
    ).toEqual({
      name: "port",
      code: "por",
      status: "national",
      nationOfOrigin: "Portugal",
      writingSystem: "Latin",
      spokenIn: "Brazil",
    });
  });

  test("drops values the form cannot hold and keeps the rest", () => {
    expect(parseFilterSearch("?code=portuguese&status=bogus&nation=India")).toEqual({
      ...DEFAULT_LANGUAGE_FILTERS,
      nationOfOrigin: "India",
    });
    // A known key with only invalid or empty values still means "these filters": none.
    expect(parseFilterSearch("?status=bogus&name=%20")).toEqual(DEFAULT_LANGUAGE_FILTERS);
  });

  test("accepts a status in any case", () => {
    expect(parseFilterSearch("?status=Nearly%20Extinct")?.status).toBe("nearly extinct");
  });

  test("uses the first non-empty value of a repeated parameter", () => {
    expect(parseFilterSearch("?nation=&nation=India&nation=Myanmar")?.nationOfOrigin).toBe(
      "India"
    );
  });

  test("decodes and encodes names with spaces, punctuation and non-ASCII letters", () => {
    const filters = {
      ...DEFAULT_LANGUAGE_FILTERS,
      nationOfOrigin: "Bosnia & Herzegovina",
      name: 'Portuguese "Lusophone"',
      spokenIn: "Côte d'Ivoire",
      writingSystem: "Latin+Cyrillic",
    };
    const search = filterSearch(filters);

    expect(parseFilterSearch(search)).toEqual(filters);
    expect(parseFilterSearch("?spoken=C%C3%B4te+d%27Ivoire")?.spokenIn).toBe("Côte d'Ivoire");
  });

  test("writes nothing for an unfiltered catalogue and links one filter to page 1", () => {
    expect(filterSearch(DEFAULT_LANGUAGE_FILTERS)).toBe("");
    expect(catalogueFilterHref("nationOfOrigin", "India")).toBe("/?nation=India");
    expect(catalogueFilterHref("writingSystem", "Latin")).toBe("/?writing=Latin");
  });
});

test.describe("multi-value cells", () => {
  const places = ["Qatar", "Algeria", "Bahrain", "Chad", "Egypt", "Iraq"];

  test("clamps a long list and counts what it hides", () => {
    expect(orderValues(places, undefined, 3)).toEqual({
      shown: ["Qatar", "Algeria", "Bahrain"],
      rest: ["Chad", "Egypt", "Iraq"],
    });
  });

  test("never clamps a single value", () => {
    expect(orderValues(places.slice(0, 4), undefined, 3).rest).toEqual([]);
  });

  test("lists the matched value first and keeps the data order otherwise", () => {
    expect(orderValues(places, "Egypt", 3)).toEqual({
      shown: ["Egypt", "Qatar", "Algeria"],
      rest: ["Bahrain", "Chad", "Iraq"],
    });
    expect(orderValues(places, "Japan", 3).shown).toEqual(["Qatar", "Algeria", "Bahrain"]);
  });
});
