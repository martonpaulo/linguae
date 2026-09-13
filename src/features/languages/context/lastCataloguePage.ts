/**
 * The catalogue page last shown in this tab, so "All languages" returns to it. It lives in
 * memory only: it survives client navigation, and a fresh load simply falls back to page 1.
 * Filters need nothing here; they already persist on their own.
 */
let lastCataloguePath = "/";

export function rememberCataloguePath(path: string): void {
  lastCataloguePath = path;
}

export function lastCataloguePagePath(): string {
  return lastCataloguePath;
}
