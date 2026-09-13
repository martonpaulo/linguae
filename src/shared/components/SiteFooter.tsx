"use client";

import { Box, Container, Link, Typography } from "@mui/material";

const LINKS = [
  { label: "Source", href: "https://github.com/martonpaulo/linguae" },
  { label: "martonpaulo.com", href: "https://www.martonpaulo.com/" },
];

/** The catalogue's data source, credited on every page. */
const DATA_SOURCE = { label: "Wikitongues", href: "https://wikitongues.org/" };

/**
 * The fleet footer. It carries only links that leave the site; anything on the site belongs
 * in the page header. The year is written at build time so the exported HTML states it.
 */
export function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        borderTop: 1,
        borderColor: "divider",
        color: "text.secondary",
        // The site's own typeface: a link inherits its font, and the body sets none.
        fontFamily: (theme) => theme.typography.fontFamily,
      }}
    >
      <Container
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "12px 30px",
          pt: "32px",
          pb: "56px",
          fontSize: "0.875rem",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography component="p" sx={{ m: 0, font: "inherit" }}>
            Developed by Marton Paulo · MIT licensed · © 2026 Linguae contributors.
          </Typography>
          <Typography component="p" sx={{ m: 0, font: "inherit" }}>
            Data: <ExternalLink {...DATA_SOURCE} />
          </Typography>
        </Box>
        <Box
          component="nav"
          aria-label="Project links"
          sx={{ display: "flex", flexWrap: "wrap", gap: "12px 20px" }}
        >
          {LINKS.map((link) => (
            <ExternalLink key={link.href} {...link} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

/** A link that leaves the site: the footer's own text, with the fleet's arrow. */
function ExternalLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
                    href={href}
      rel="noopener"
      underline="none"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        font: "inherit",
        color: "inherit",
        "&:hover": { color: "primary.main" },
      }}
    >
      {label}
      {/* The fleet's one icon for a link that leaves the site. */}
      <Box
        component="svg"
        className="external-icon"
        viewBox="0 0 12 12"
        width={12}
        height={12}
        fill="none"
        aria-hidden="true"
        focusable="false"
        sx={{
          flex: "none",
          width: "0.7em",
          height: "0.7em",
          ml: "0.35em",
          opacity: 0.8,
        }}
      >
        <path
          d="M3.6 8.4 8.4 3.6M4.8 3.6h3.6v3.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>
    </Link>
  );
}
