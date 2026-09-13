"use client";

import { Pagination, PaginationItem, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

import { pageHref } from "@/features/languages/utils/languagePagination";

interface LanguagePaginationProps {
  page: number;
  pageCount: number;
  /** Languages in the whole result, so the pager states its real extent. */
  languageCount: number;
}

/**
 * Previous, next and numbered pages as real links: each page has its own exported URL, so a
 * crawler can follow them and the browser's history works without any script. The first and
 * last pages always show, with the current page's neighbours and an ellipsis between.
 */
export function LanguagePagination({
  page,
  pageCount,
  languageCount,
}: LanguagePaginationProps) {
  return (
    <Stack spacing={1} alignItems="center">
      <Typography variant="body2" color="textSecondary">
        Page {page.toLocaleString("en-US")} of {pageCount.toLocaleString("en-US")} ·{" "}
        {languageCount.toLocaleString("en-US")}{" "}
        {languageCount === 1 ? "language" : "languages"}
      </Typography>
      {pageCount > 1 && (
        <Pagination
          page={page}
          count={pageCount}
          siblingCount={1}
          boundaryCount={1}
          hidePrevButton={page === 1}
          hideNextButton={page === pageCount}
          renderItem={(item) => {
            if (
              item.type !== "page" &&
              item.type !== "previous" &&
              item.type !== "next"
            ) {
              return <PaginationItem {...item} />;
            }

            // The link navigates; the pagination's own click handler has nothing left to do.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { onClick, ...link } = item;
            return (
              <PaginationItem
                {...link}
                component={NextLink}
                href={pageHref(item.page ?? 1)}
              />
            );
          }}
        />
      )}
    </Stack>
  );
}
