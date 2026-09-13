"use client";

import { Link, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

import { LanguagePagination } from "@/features/languages/components/LanguagePagination";
import { LanguageTable } from "@/features/languages/components/LanguageTable";
import { useCatalogue } from "@/features/languages/context/CatalogueContext";
import { LanguageType } from "@/features/languages/types/language.type";
import {
  countPages,
  pageHref,
  pageSlice,
} from "@/features/languages/utils/languagePagination";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { LoadingIndicator } from "@/shared/components/LoadingIndicator";

interface LanguageCataloguePageProps {
  page: number;
  /** This page of the unfiltered catalogue, resolved at build time. */
  languages: LanguageType[];
  pageCount: number;
  languageCount: number;
}

/**
 * One catalogue page. Unfiltered, it shows the rows exported with the page; filtered, it shows
 * the same page number of the local result.
 */
export function LanguageCataloguePage({
  page,
  languages,
  pageCount,
  languageCount,
}: LanguageCataloguePageProps) {
  const { filtering, result } = useCatalogue();

  if (!filtering) {
    return (
      <Stack spacing={2}>
        <LanguageTable languages={languages} />
        <LanguagePagination
          page={page}
          pageCount={pageCount}
          languageCount={languageCount}
        />
      </Stack>
    );
  }

  if (result.status === "error" && result.errorMessage) {
    return <ErrorMessage message={result.errorMessage} onRetry={result.retry} />;
  }

  if (result.status === "pending") {
    return <LoadingIndicator size="large" message="Loading languages..." />;
  }

  const filteredPageCount = countPages(result.languages.length);

  if (page > filteredPageCount) {
    return (
      <Typography align="center" variant="body2">
        The filtered results end before page {page}.{" "}
        <Link component={NextLink} href={pageHref(1)}>
          Go to the first page
        </Link>
        .
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <LanguageTable languages={pageSlice(result.languages, page)} />
      <LanguagePagination
        page={page}
        pageCount={filteredPageCount}
        languageCount={result.languages.length}
      />
    </Stack>
  );
}
