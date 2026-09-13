import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { LanguageFilterFormValues } from "@/features/languages/components/languageFilters.schema";
import { fetchLanguageIndex } from "@/features/languages/services/languageAPI";
import { LanguageType } from "@/features/languages/types/language.type";
import { enrichLanguagesDataSetListWithNames } from "@/features/languages/utils/languageEnrichers";
import { filterLanguages } from "@/features/languages/utils/languageFilters";
import { useNations } from "@/features/nations/hooks/useNations";
import { useWritingSystems } from "@/features/writingSystems/hooks/useWritingSystems";

/**
 * Every dependency the catalogue needs before it can show a row, so a page can tell a
 * pending dependency from a failed one, and both from a search that genuinely matched
 * nothing.
 */
export type LanguagesStatus = "pending" | "error" | "ready";

export interface LanguagesResult {
  /** Every language matching the filters; the page decides which slice it shows. */
  languages: LanguageType[];
  status: LanguagesStatus;
  /** Describes the failed dependencies and retries exactly those. */
  errorMessage: string | null;
  retry: () => void;
}

/**
 * `enabled` false skips downloading the index: the unfiltered catalogue ships its rows in each
 * exported page, so only a filtered view needs the whole snapshot.
 */
export function useLanguages(
  languageFilterParams: LanguageFilterFormValues,
  enabled = true
): LanguagesResult {
  const { nations, nationsIsError, retryNations } = useNations();
  const {
    writingSystems,
    writingSystemsIsError,
    retryWritingSystems,
  } = useWritingSystems();

  const {
    data: index,
    isError: indexIsError,
    refetch: retryIndex,
  } = useQuery({
    queryKey: ["languageIndex"],
    queryFn: fetchLanguageIndex,
    enabled,
  });

  const failed = useMemo(
    () => ({
      index: indexIsError,
      nations: nationsIsError,
      writingSystems: writingSystemsIsError,
    }),
    [indexIsError, nationsIsError, writingSystemsIsError]
  );

  const enrichedLanguages = useMemo(() => {
    if (!index || !nations || !writingSystems) return null;
    return enrichLanguagesDataSetListWithNames(
      index.languages,
      nations,
      writingSystems
    );
  }, [index, nations, writingSystems]);

  const matchingLanguages = useMemo(() => {
    if (!enrichedLanguages) return null;
    return filterLanguages(enrichedLanguages, languageFilterParams);
  }, [enrichedLanguages, languageFilterParams]);

  const retry = useCallback(() => {
    if (failed.index) void retryIndex();
    if (failed.nations) void retryNations();
    if (failed.writingSystems) void retryWritingSystems();
  }, [failed, retryIndex, retryNations, retryWritingSystems]);

  const status: LanguagesStatus = hasAnyFailure(failed)
    ? "error"
    : matchingLanguages
      ? "ready"
      : "pending";

  return {
    languages: matchingLanguages ?? EMPTY,
    status,
    errorMessage: hasAnyFailure(failed) ? describeFailure(failed) : null,
    retry,
  };
}

const EMPTY: LanguageType[] = [];

type FailedDependencies = Record<
  "index" | "nations" | "writingSystems",
  boolean
>;

function hasAnyFailure(failed: FailedDependencies): boolean {
  return failed.index || failed.nations || failed.writingSystems;
}

function describeFailure(failed: FailedDependencies): string {
  if (failed.index) return "The language catalogue could not be loaded.";

  const missing = [
    failed.nations && "nations",
    failed.writingSystems && "writing systems",
  ].filter(Boolean);

  return `The catalogue needs ${missing.join(" and ")} to show its results, and that data could not be loaded.`;
}
