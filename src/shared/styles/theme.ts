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

/** Neutral boundary for fields and secondary buttons: 4.5:1 on white, 4.2:1 on the page ground. */
const FIELD_BOUNDARY = "#767676";

const theme = createTheme({
  // One radius for every control and surface, so nothing mixes square and round corners.
  shape: { borderRadius: 10 },
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
    background: { default: "#f3f5f8", paper: "#ffffff" },
    divider: "rgba(17, 24, 39, 0.1)",
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
    // A visible focus ring on every button-like control, in the brand colour.
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": {
            outline: `2px solid ${BRAND}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          transition: "background-color 120ms ease, border-color 120ms ease, color 120ms ease",
        },
      },
      variants: [
        {
          props: { variant: "outlined", color: "secondary" },
          style: { borderColor: FIELD_BOUNDARY, color: "#374151" },
        },
      ],
    },
    // MUI's default outline (black at 23%) is 1.7:1 on white; a field's boundary needs 3:1.
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: "#ffffff" },
        notchedOutline: { borderColor: FIELD_BOUNDARY },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "rgba(0, 0, 0, 0.6)",
        },
      },
    },
  },
  typography: {
    fontFamily: "var(--font-poppins)",
    h1: {
      fontSize: "2rem",
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
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
