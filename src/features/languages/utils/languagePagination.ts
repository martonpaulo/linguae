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

/** Path of a page for `canonicalUrl`, matching `pageHref`. */
export function pagePath(page: number): string {
  return page <= 1 ? "" : `page/${page}`;
}
