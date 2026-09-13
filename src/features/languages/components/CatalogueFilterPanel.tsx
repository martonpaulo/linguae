"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";

import { LanguageFilters } from "@/features/languages/components/LanguageFilters";
import { LanguageFilterFormValues } from "@/features/languages/components/languageFilters.schema";
import { useCatalogue } from "@/features/languages/context/CatalogueContext";
import { pageHref } from "@/features/languages/utils/languagePagination";

/**
 * The filter form above every catalogue page. A new or reset filter changes the result set, so
 * it always starts from page 1 instead of keeping a page number that meant another list.
 */
export function CatalogueFilterPanel() {
  const { filters, setFilters, restored } = useCatalogue();
  const router = useRouter();
  const params = useParams<{ page?: string }>();

  const handleFiltersChange = useCallback(
    (newFilters: LanguageFilterFormValues) => {
      setFilters(newFilters);
      if (params.page) router.push(pageHref(1));
    },
    [params.page, router, setFilters]
  );

  return (
    <LanguageFilters
        // Remounted once the stored filters arrive, so the form starts from them.
      key={restored ? "restored" : "initial"}
      initialFilters={filters}
      onFiltersChange={handleFiltersChange}
      disabled={!restored}
    />
  );
}
