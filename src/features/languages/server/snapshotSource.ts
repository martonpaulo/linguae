import { readFile } from "node:fs/promises";
import path from "node:path";

import { LanguageType } from "@/features/languages/types/language.type";
import {
  enrichLanguagesDataSetListWithNames,
  enrichLanguagesDataWithNames,
} from "@/features/languages/utils/languageEnrichers";
import {
  countPages,
  pageSlice,
} from "@/features/languages/utils/languagePagination";
import {
  SNAPSHOT_BUILD_DIRECTORY,
  SNAPSHOT_DIRECTORY,
  SnapshotIndex,
  SnapshotLanguageDetail,
  SnapshotManifest,
  SnapshotNations,
  SnapshotWritingSystems,
} from "@/shared/types/snapshot.type";

const BUILD_ROOT = path.join(process.cwd(), SNAPSHOT_BUILD_DIRECTORY);
const PUBLIC_ROOT = path.join(process.cwd(), "public", SNAPSHOT_DIRECTORY);

/**
 * Build-time reader for the published snapshot. It runs while the static pages are
 * generated, so a detail page ships with its record already resolved and the browser never
 * requests it. Reads are memoized because every generated page shares the same references.
 */
export async function readManifest(): Promise<SnapshotManifest> {
  return readAsset<SnapshotManifest>(BUILD_ROOT, "manifest.json");
}

/** The enriched record for one code, or null when the snapshot does not publish it. */
export async function readEnrichedLanguage(
  code: string
): Promise<LanguageType | null> {
  const normalized = code.toLowerCase();
  const manifest = await readManifest();
  if (!manifest.codes.includes(normalized)) return null;

  const [detail, nations, writingSystems] = await Promise.all([
    readAsset<SnapshotLanguageDetail>(BUILD_ROOT, `languages/${normalized}.json`),
    readAsset<SnapshotNations>(PUBLIC_ROOT, "nations.json"),
    readAsset<SnapshotWritingSystems>(PUBLIC_ROOT, "writing-systems.json"),
  ]);

  return enrichLanguagesDataWithNames(
    detail.language,
    nations.nations,
    writingSystems.writingSystems
  );
}

export interface CataloguePage {
  /** The enriched rows of this page, in index order. */
  languages: LanguageType[];
  pageCount: number;
  /** Languages in the whole catalogue, not just this page. */
  languageCount: number;
}

/** Number of pages the unfiltered catalogue spans. */
export async function readCataloguePageCount(): Promise<number> {
  const index = await readAsset<SnapshotIndex>(PUBLIC_ROOT, "index.json");
  return countPages(index.languages.length);
}

/**
 * One page of the unfiltered catalogue, resolved at build time so its rows are in the exported
 * HTML. Null for a page outside the catalogue's range.
 */
export async function readCataloguePage(
  page: number
): Promise<CataloguePage | null> {
  const [index, nations, writingSystems] = await Promise.all([
    readAsset<SnapshotIndex>(PUBLIC_ROOT, "index.json"),
    readAsset<SnapshotNations>(PUBLIC_ROOT, "nations.json"),
    readAsset<SnapshotWritingSystems>(PUBLIC_ROOT, "writing-systems.json"),
  ]);

  const pageCount = countPages(index.languages.length);
  if (!Number.isInteger(page) || page < 1 || page > pageCount) return null;

  return {
    languages: enrichLanguagesDataSetListWithNames(
      pageSlice(index.languages, page),
      nations.nations,
      writingSystems.writingSystems
    ),
    pageCount,
    languageCount: index.languages.length,
  };
}

const cache = new Map<string, Promise<unknown>>();

function readAsset<T>(root: string, assetPath: string): Promise<T> {
  const key = path.join(root, assetPath);
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const pending = readFile(key, "utf8")
    .then((content) => JSON.parse(content) as T)
    .catch(() => {
      throw new Error(
        `Missing snapshot asset "${assetPath}". Run "pnpm snapshot" for the published ` +
          `catalogue or "pnpm snapshot:fixture" for the synthetic one.`
      );
    });

  cache.set(key, pending);
  return pending;
}
