import type { SxProps, Theme } from "@mui/material";

/**
 * Single owner of the language-table heading fill. It is declared on the head row and
 * applied through the heading-cell slot, so a new column inherits it without repeating
 * the value.
 */
export const languageTableHeadSx: SxProps<Theme> = {
  "& .MuiTableCell-head": { backgroundColor: "brandTint.main" },
};

/**
 * Single owner of the catalogue's figures. Every cell in the table lines its digits up in a
 * column — codes, counts and years are read down the page against the rows above and below —
 * and the interface face is a geometric sans, whose proportional digits are the least alignable
 * kind. Rule 4 of the fleet typography standard
 * (skill-deck/docs/typography-standard.md): tabular figures wherever digits stack.
 *
 * This is the only part of that standard linguae takes. Its scale, leadings and weights are
 * MUI's, deliberately: see the standard's exception list.
 */
export const languageTableSx: SxProps<Theme> = {
  fontVariantNumeric: "tabular-nums",
};

/**
 * Single owner of the language-code typography, shared by the table, the phone list and the
 * detail header. The site's own face with tabular figures and a little tracking reads as a
 * code without switching to a mismatched monospace.
 */
export const languageCodeSx: SxProps<Theme> = {
  fontFamily: "inherit",
  fontWeight: 500,
  letterSpacing: "0.06em",
  fontVariantNumeric: "tabular-nums",
};

/**
 * The result link. It keeps a visible keyboard focus indication of its own so the row does
 * not have to rely on a browser default that varies between engines.
 */
export const languageLinkSx: SxProps<Theme> = {
  color: "inherit",
  textDecorationColor: (theme) => theme.palette.primary.main,
  "&:hover": { color: "primary.main" },
  "&:focus-visible": {
    outline: "2px solid",
    outlineColor: "primary.main",
    outlineOffset: 2,
    borderRadius: 1,
  },
};
