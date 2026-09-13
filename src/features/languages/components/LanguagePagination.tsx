"use client";

import { Pagination, PaginationItem } from "@mui/material";
import NextLink from "next/link";

import { pageHref } from "@/features/languages/utils/languagePagination";

interface LanguagePaginationProps {
  page: number;
  pageCount: number;
}

/**
 * Previous, next and numbered pages as real links: each page has its own exported URL, so a
 * crawler can follow them and the browser's history works without any script.
 */
export function LanguagePagination({ page, pageCount }: LanguagePaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <Pagination
      page={page}
      count={pageCount}
      siblingCount={1}
      boundaryCount={1}
      hidePrevButton={page === 1}
      hideNextButton={page === pageCount}
      sx={{ "& ul": { justifyContent: "center" } }}
      renderItem={(item) => {
        if (item.type !== "page" && item.type !== "previous" && item.type !== "next") {
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
  );
}
