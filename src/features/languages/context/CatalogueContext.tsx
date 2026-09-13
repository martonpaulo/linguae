"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { LanguageFilterFormValues } from "@/features/languages/components/languageFilters.schema";
import { rememberCataloguePath } from "@/features/languages/context/lastCataloguePage";
import {
  LanguagesResult,
  useLanguages,
} from "@/features/languages/hooks/useLanguages";
import {
  DEFAULT_LANGUAGE_FILTERS,
  restoreFilters,
  saveFilters,
} from "@/features/languages/utils/languageFilters";
import {
  filterSearch,
  parseFilterSearch,
} from "@/features/languages/utils/languageFilterUrl";

interface CatalogueState {
  filters: LanguageFilterFormValues;
  setFilters: (filters: LanguageFilterFormValues) => void;
  /** False until the stored filters are restored after hydration. */
  restored: boolean;
  /** True when any filter narrows the catalogue, so the pages show the local result. */
  filtering: boolean;
  result: LanguagesResult;
  /** Removes every filter and remembers that. */
  clearFilters: () => void;
}

const CatalogueContext = createContext<CatalogueState | null>(null);

/**
 * Owns the filters and their derived result for every catalogue page. It lives in the shared
 * layout, so moving between pages keeps the applied filters and never re-derives the snapshot.
 */
export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [filters, setFilterState] = useState<LanguageFilterFormValues>(
    DEFAULT_LANGUAGE_FILTERS
  );
  const [restored, setRestored] = useState(false);

  // The address always states the applied filters, so a view can be copied or reopened. It is
  // written when the filters change, before any navigation to page 1 starts: writing it later,
  // from an effect, would replace a pending navigation with the page being left.
  const setFilters = useCallback((next: LanguageFilterFormValues) => {
    setFilterState(next);
    writeFilterSearch(next);
  }, []);

  // Restored once, after hydration: the exported HTML is the unfiltered page, and reading the
  // URL or storage during the first render would make the hydrated markup disagree with it.
  // Filters named in the URL win, so a shared or linked view opens as it was sent, and they
  // become the applied filters that later visits restore.
  useEffect(() => {
    const fromUrl = parseFilterSearch(window.location.search);
    if (fromUrl) saveFilters(fromUrl);
    setFilters(fromUrl ?? restoreFilters());
    setRestored(true);
  }, [setFilters]);

  const pathname = usePathname();
  useEffect(() => rememberCataloguePath(pathname), [pathname]);

  // A pager link carries no query, so after a page change the address gets the filters back.
  const appliedRef = useRef(filters);
  useEffect(() => {
    appliedRef.current = filters;
  }, [filters]);
  useEffect(() => {
    if (restored) writeFilterSearch(appliedRef.current);
  }, [restored, pathname]);

  const filtering = Object.values(filters).some(Boolean);
  const result = useLanguages(filters, filtering);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_LANGUAGE_FILTERS);
    saveFilters(DEFAULT_LANGUAGE_FILTERS);
  }, [setFilters]);

  const value = useMemo(
    () => ({ filters, setFilters, restored, filtering, result, clearFilters }),
    [filters, setFilters, restored, filtering, result, clearFilters]
  );

  return (
    <CatalogueContext.Provider value={value}>
      {children}
    </CatalogueContext.Provider>
  );
}

/** Replaces the query with the filters, keeping the page; Back stays for page changes. */
function writeFilterSearch(filters: LanguageFilterFormValues): void {
  const { pathname, search, hash } = window.location;
  const next = filterSearch(filters);
  if (next !== search) window.history.replaceState(null, "", `${pathname}${next}${hash}`);
}

export function useCatalogue(): CatalogueState {
  const state = useContext(CatalogueContext);
  if (!state) throw new Error("useCatalogue needs a CatalogueProvider");
  return state;
}
