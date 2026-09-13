"use client";

import { createTheme } from "@mui/material";

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: false;
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true;
    tablet: true;
    desktop: true;
  }

  interface Palette {
    /** Light crimson tints for large surfaces; full crimson is for small marks only. */
    brandTint: { main: string; hover: string };
    /** Language status fills. White text on each meets WCAG AA; none reuses the brand or error red. */
    status: LanguageStatusPalette;
  }

  interface PaletteOptions {
    brandTint?: { main: string; hover: string };
    status?: LanguageStatusPalette;
  }
}

export interface LanguageStatusPalette {
  /** National, vigorous, wider communication. */
  healthy: string;
  /** Provincial and educational: established in an institution. */
  established: string;
  /** Developing and second language only. */
  developing: string;
  /** Threatened and reawakening. */
  threatened: string;
  /** Shifting, moribund and nearly extinct. */
  endangered: string;
  /** Extinct: no longer spoken, which is not an error state. */
  extinct: string;
}

/**
 * The brand is the logo's crimson, `#b3214b`: the icon's globe stroke and the social card's
 * icon fill, so the site, the card and the favicon agree. Neutrals stay neutral.
 */
const BRAND = "#b3214b";

const theme = createTheme({
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 767,
      desktop: 1200,
    },
  },
  palette: {
    primary: { main: BRAND, dark: "#86193d", light: "#c64b72", contrastText: "#fff" },
    // The secondary action (Reset) is neutral, so only one action carries the brand.
    secondary: { main: "#4b5563", dark: "#374151", light: "#6b7280", contrastText: "#fff" },
    brandTint: { main: "#fbeaf0", hover: "#f6d5e0" },
    status: {
      healthy: "#2e7d32",
      established: "#00695c",
      developing: "#1e5f99",
      threatened: "#a15c07",
      endangered: "#bf360c",
      extinct: "#455a64",
    },
  },
  components: {
    // MUI's default outline (black at 23%) is 1.7:1 on white; a field's boundary needs 3:1.
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: "#767676" },
      },
    },
  },
  typography: {
    fontFamily: "var(--font-poppins)",
    h1: {
      fontSize: "2rem",
      fontWeight: 400,
    },
    h2: {
      fontSize: "1.2rem",
      fontWeight: 300,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 300,
    },
  },
});

export default theme;
