"use client";

import { Box, Container } from "@mui/material";
import type { ReactNode } from "react";

import { PAGE_INSET } from "@/shared/styles/theme";

/**
 * The main region of every page. It owns the page inset, so every route's first line of text
 * sits the same distance below the header and starts on the logo's left edge; a page adds no
 * outer padding of its own.
 */
export function SiteMain({ children }: { children: ReactNode }) {
  return (
    <Container component="main">
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          px: PAGE_INSET.x,
          pt: PAGE_INSET.top,
          pb: PAGE_INSET.bottom,
        }}
      >
        {children}
      </Box>
    </Container>
  );
}
