"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
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
} from "@/features/languages/utils/languageFilters";

interface CatalogueState {
  filters: LanguageFilterFormValues;
  setFilters: (filters: LanguageFilterFormValues) => void;
  /** False until the stored filters are restored after hydration. */
  restored: boolean;
  /** True when any filter narrows the catalogue, so the pages show the local result. */
  filtering: boolean;
  result: LanguagesResult;
}

const CatalogueContext = createContext<CatalogueState | null>(null);

/**
 * Owns the filters and their derived result for every catalogue page. It lives in the shared
 * layout, so moving between pages keeps the applied filters and never re-derives the snapshot.
 */
export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<LanguageFilterFormValues>(
    DEFAULT_LANGUAGE_FILTERS
  );
  const [restored, setRestored] = useState(false);

  // Restored once, after hydration: the exported HTML is the unfiltered page, and reading
  // storage during the first render would make the hydrated markup disagree with it.
  useEffect(() => {
    setFilters(restoreFilters());
    setRestored(true);
  }, []);

  const pathname = usePathname();
  useEffect(() => rememberCataloguePath(pathname), [pathname]);

  const filtering = Object.values(filters).some(Boolean);
  const result = useLanguages(filters, filtering);

  const value = useMemo(
    () => ({ filters, setFilters, restored, filtering, result }),
    [filters, restored, filtering, result]
  );

  return (
    <CatalogueContext.Provider value={value}>
      {children}
    </CatalogueContext.Provider>
  );
}

export function useCatalogue(): CatalogueState {
  const state = useContext(CatalogueContext);
  if (!state) throw new Error("useCatalogue needs a CatalogueProvider");
  return state;
}
