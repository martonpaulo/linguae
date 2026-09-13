"use client";

import { Box, Button, Link, Paper, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

import { LanguageList } from "@/features/languages/components/LanguageList";
import { LanguagePagination } from "@/features/languages/components/LanguagePagination";
import { LanguageTable } from "@/features/languages/components/LanguageTable";
import { useCatalogue } from "@/features/languages/context/CatalogueContext";
import { LanguageType } from "@/features/languages/types/language.type";
import {
  countPages,
  pageHref,
  pageSlice,
} from "@/features/languages/utils/languagePagination";

interface LanguageCataloguePageProps {
  page: number;
  /** This page of the unfiltered catalogue, resolved at build time. */
  languages: LanguageType[];
  pageCount: number;
  languageCount: number;
}

/** Hidden from sight, still read and still found by text. */
const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
} as const;

/**
 * One catalogue page. Unfiltered, it shows the rows exported with the page; filtered, it shows
 * the same page number of the local result. Each state is its own: loading, error, nothing
 * matched, past the end, and the result.
 */
export function LanguageCataloguePage({
  page,
  languages,
  pageCount,
  languageCount,
}: LanguageCataloguePageProps) {
  const { filtering, result, clearFilters } = useCatalogue();

  if (!filtering) {
    return (
      <Results
        count={`${languageCount.toLocaleString("en-US")} languages`}
        languages={languages}
        page={page}
        pageCount={pageCount}
      />
    );
  }

  if (result.status === "error" && result.errorMessage) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderColor: "error.main" }}>
        <Stack spacing={2} alignItems="flex-start">
          <Typography role="alert" variant="body1">
            {result.errorMessage}
          </Typography>
          <Button variant="outlined" color="secondary" onClick={result.retry}>
            Try again
          </Button>
        </Stack>
      </Paper>
    );
  }

  if (result.status === "pending") {
    return (
      <Stack spacing={1} role="status">
        <Box component="span" sx={visuallyHidden}>
          Loading languages...
        </Box>
        {Array.from({ length: 6 }, (_, index) => (
          <Box
            key={index}
            aria-hidden
            sx={{
              height: 52,
              borderRadius: 1,
              bgcolor: "rgba(17, 24, 39, 0.06)",
              // A slow pulse; the reduced-motion rule in globals.css stills it.
              animation: "catalogue-pulse 1.6s ease-in-out infinite",
              "@keyframes catalogue-pulse": { "50%": { opacity: 0.5 } },
            }}
          />
        ))}
      </Stack>
    );
  }

  const matched = result.languages.length;

  if (matched === 0) {
    return (
      <Paper variant="outlined" sx={{ p: { mobile: 3, tablet: 5 }, textAlign: "center" }}>
        <Stack spacing={2} alignItems="center">
          <Typography role="status" variant="h2" component="p" sx={{ fontWeight: 500 }}>
            No languages match these filters.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try a shorter name, or remove a filter.
          </Typography>
          <Button variant="contained" onClick={clearFilters}>
            Clear filters
          </Button>
        </Stack>
      </Paper>
    );
  }

  const filteredPageCount = countPages(matched);

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
    <Results
      count={`${matched.toLocaleString("en-US")} ${matched === 1 ? "language matches" : "languages match"}`}
      languages={pageSlice(result.languages, page)}
      page={page}
      pageCount={filteredPageCount}
    />
  );
}

function Results({
  count,
  languages,
  page,
  pageCount,
}: {
  count: string;
  languages: LanguageType[];
  page: number;
  pageCount: number;
}) {
  return (
    <Stack spacing={2}>
      <Typography role="status" variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
        {count}
      </Typography>
      {/* The table from the tablet breakpoint, where every column fits; a list below it. */}
      <Box sx={{ display: { mobile: "none", tablet: "block" } }}>
        <LanguageTable languages={languages} />
      </Box>
      <Box sx={{ display: { mobile: "block", tablet: "none" } }}>
        <LanguageList languages={languages} />
      </Box>
      <LanguagePagination page={page} pageCount={pageCount} />
    </Stack>
  );
}
