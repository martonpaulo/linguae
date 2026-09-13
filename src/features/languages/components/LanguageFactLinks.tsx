import { Link } from "@mui/material";
import NextLink from "next/link";
import { Fragment } from "react";

import {
  catalogueFilterHref,
  type LanguageFilterField,
} from "@/features/languages/utils/languageFilterUrl";

/** What following each kind of fact does, as the start of the link's accessible name. */
const LINK_NAMES: Partial<Record<LanguageFilterField, (value: string) => string>> = {
  nationOfOrigin: (value) => `Show languages originating in ${value}`,
  writingSystem: (value) => `Show languages written in ${value}`,
  spokenIn: (value) => `Show languages spoken in ${value}`,
  status: (value) => `Show ${value} languages`,
};

/**
 * Discreet, underlined link for a fact: the text keeps its colour, the crimson underline says it
 * can be followed, and focus gets the brand ring.
 */
export const factLinkSx = {
  color: "inherit",
  textDecorationColor: "rgba(179, 33, 75, 0.45)",
  textUnderlineOffset: "0.2em",
  "&:hover": { color: "primary.main", textDecorationColor: "currentColor" },
  "&:focus-visible": {
    outline: "2px solid",
    outlineColor: "primary.main",
    outlineOffset: 2,
    borderRadius: "2px",
  },
} as const;

interface LanguageFactLinksProps {
  field: LanguageFilterField;
  values: string[];
}

/** Comma-separated values, each a real link to the catalogue filtered by it. */
export function LanguageFactLinks({ field, values }: LanguageFactLinksProps) {
  const name = LINK_NAMES[field];

  return values.map((value, index) => (
    <Fragment key={value}>
      {index > 0 && ", "}
      <Link
        component={NextLink}
        href={catalogueFilterHref(field, value)}
        underline="always"
        aria-label={name ? name(value) : undefined}
        sx={factLinkSx}
      >
        {value}
      </Link>
    </Fragment>
  ));
}
