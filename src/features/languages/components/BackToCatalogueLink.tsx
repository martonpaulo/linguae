"use client";

import { Link } from "@mui/material";
import NextLink from "next/link";
import { useEffect, useState } from "react";

import { lastCataloguePagePath } from "@/features/languages/context/lastCataloguePage";

/** Back to the catalogue page the reader came from; page 1 when there is none to return to. */
export function BackToCatalogueLink() {
  const [href, setHref] = useState("/");

  // Read after hydration: the exported HTML links to page 1, which works without scripts.
  useEffect(() => setHref(lastCataloguePagePath()), []);

  return (
    <Link
      component={NextLink}
      href={href}
      underline="hover"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        alignSelf: "flex-start",
        color: "primary.main",
        fontWeight: 500,
        fontSize: "0.875rem",
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
          borderRadius: 1,
        },
      }}
    >
      {/* An inline glyph: the icon package's wrapper cost more than the arrow. */}
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false">
        <path
          d="M13 8H3.5M7.5 3.5 3 8l4.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      All languages
    </Link>
  );
}
