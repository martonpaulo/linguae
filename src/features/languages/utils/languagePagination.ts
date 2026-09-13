/**
 * Rows per catalogue page. Fifty keeps a page scannable on a phone and its exported HTML light,
 * while the published catalogue (about 7,500 languages) still fits in about 150 pages.
 */
export const LANGUAGE_PAGE_SIZE = 50;

/** Number of pages a result set spans. An empty result still has its one (empty) page. */
export function countPages(itemCount: number): number {
  return Math.max(1, Math.ceil(itemCount / LANGUAGE_PAGE_SIZE));
}

/** The rows of one page, counted from 1. */
export function pageSlice<T>(items: T[], page: number): T[] {
  const start = (page - 1) * LANGUAGE_PAGE_SIZE;
  return items.slice(start, start + LANGUAGE_PAGE_SIZE);
}

/**
 * The route of one page, relative to the base path. Page 1 is the catalogue itself, so it has
 * exactly one URL; every later page has its own statically exported route.
 */
export function pageHref(page: number): string {
  return page <= 1 ? "/" : `/page/${page}/`;
}

export type PageItem = number | "start-ellipsis" | "end-ellipsis";

/**
 * The page numbers a pager shows: the first and last page, the current page with one
 * neighbour each side, and an ellipsis where pages are skipped. The number of slots stays
 * constant as the current page moves, so the pager never jumps in width.
 */
export function pageItems(page: number, count: number, siblings = 1, boundary = 1): PageItem[] {
  const range = (start: number, end: number) =>
    Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => start + index);

  const startPages = range(1, Math.min(boundary, count));
  const endPages = range(Math.max(count - boundary + 1, boundary + 1), count);

  const siblingsStart = Math.max(
    Math.min(page - siblings, count - boundary - siblings * 2 - 1),
    boundary + 2
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblings, boundary + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1
  );

  const items: (PageItem | null)[] = [
    ...startPages,
    siblingsStart > boundary + 2
      ? "start-ellipsis"
      : boundary + 1 < count - boundary
        ? boundary + 1
        : null,
    ...range(siblingsStart, siblingsEnd),
    siblingsEnd < count - boundary - 1
      ? "end-ellipsis"
      : count - boundary > boundary
        ? count - boundary
        : null,
    ...endPages,
  ];

  return items.filter((item): item is PageItem => item !== null);
}

/** Path of a page for `canonicalUrl`, matching `pageHref`. */
export function pagePath(page: number): string {
  return page <= 1 ? "" : `page/${page}`;
}
