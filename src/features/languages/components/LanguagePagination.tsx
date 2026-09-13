"use client";

import { Box, Link, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import type { ReactNode } from "react";

import { pageHref, pageItems } from "@/features/languages/utils/languagePagination";

interface LanguagePaginationProps {
  page: number;
  pageCount: number;
}

/**
 * Previous, next and numbered pages as real links: each page has its own exported URL, so a
 * crawler can follow them and the browser's history works without any script. The first and
 * last pages always show, with the current page's neighbours and an ellipsis between. Plain
 * links rather than MUI's Pagination, which shipped buttons, ripples and icons for this.
 */
export function LanguagePagination({ page, pageCount }: LanguagePaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <Stack spacing={1} alignItems="center">
      <Typography variant="body2" color="textSecondary">
        Page {page.toLocaleString("en-US")} of {pageCount.toLocaleString("en-US")}
      </Typography>
      <Box component="nav" aria-label="pagination navigation">
        <Box
          component="ul"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            display: "flex",
            alignItems: "center",
            gap: { mobile: "2px", tablet: "4px" },
          }}
        >
          {page > 1 && (
            <li>
              <PageLink href={pageHref(page - 1)} label="Go to previous page">
                <Chevron direction="previous" />
              </PageLink>
            </li>
          )}
          {pageItems(page, pageCount).map((item) =>
            typeof item === "number" ? (
              <li key={item}>
                <PageLink
                  href={pageHref(item)}
                  label={item === page ? `page ${item}` : `Go to page ${item}`}
                  current={item === page}
                >
                  {item}
                </PageLink>
              </li>
            ) : (
              <Box
                component="li"
                key={item}
                aria-hidden
                sx={{ minWidth: { mobile: 20, tablet: 28 }, textAlign: "center", color: "text.secondary" }}
              >
                …
              </Box>
            )
          )}
          {page < pageCount && (
            <li>
              <PageLink href={pageHref(page + 1)} label="Go to next page">
                <Chevron direction="next" />
              </PageLink>
            </li>
          )}
        </Box>
      </Box>
    </Stack>
  );
}

function PageLink({
  href,
  label,
  current = false,
  children,
}: {
  href: string;
  label: string;
  current?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      component={NextLink}
      href={href}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      underline="none"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        // Tighter on a phone, so `‹ 1 … 75 76 77 … 152 ›` stays on one line at 320px.
        minWidth: { mobile: 26, tablet: 34 },
        height: { mobile: 30, tablet: 34 },
        px: { mobile: "3px", tablet: "8px" },
        borderRadius: 999,
        fontSize: { mobile: "0.8125rem", tablet: "0.875rem" },
        fontWeight: current ? 600 : 400,
        fontVariantNumeric: "tabular-nums",
        color: current ? "primary.contrastText" : "text.primary",
        bgcolor: current ? "primary.main" : "transparent",
        transition: "background-color 120ms ease",
        "&:hover": { bgcolor: current ? "primary.dark" : "brandTint.main" },
        "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
      }}
    >
      {children}
    </Link>
  );
}

function Chevron({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false">
      <path
        d={direction === "next" ? "M6 3.5 10.5 8 6 12.5" : "M10 3.5 5.5 8 10 12.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
