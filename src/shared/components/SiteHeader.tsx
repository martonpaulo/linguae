"use client";

import { Box, Container, Link } from "@mui/material";
import NextLink from "next/link";

import { BASE_PATH } from "@/shared/config/deployment";
import { PAGE_INSET } from "@/shared/styles/theme";

/** The same small header on every page: the mark and the name, linking to the catalogue. */
export function SiteHeader() {
  return (
    <Box
      component="header"
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Container>
        <Box sx={{ px: PAGE_INSET.x, py: 1.5, display: "flex" }}>
          <Link
            component={NextLink}
            href="/"
            underline="none"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              color: "text.primary",
              fontWeight: 600,
              fontSize: "1.125rem",
              letterSpacing: "-0.01em",
              borderRadius: 1,
              "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a static export has no image optimizer */}
            <img src={`${BASE_PATH}/icon.svg`} alt="" width={28} height={28} />
            Linguae
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
