import { Box, Link, Typography } from "@mui/material";
import NextLink from "next/link";

import {
  languageLinkSx,
  visuallyHiddenSx,
} from "@/features/languages/styles/languageStyles";
import { orderValues, VALUE_LIST_LIMIT } from "@/features/languages/utils/languageValueList";

interface LanguageValueListProps {
  values?: string[];
  /** The value an active filter matched; it is listed first so the reason for the row shows. */
  matched?: string;
  /** The language page, which carries the full list. */
  languageHref: string;
  languageName: string;
  /** Lifts the "more" link above a row-wide stretched link. */
  raised?: boolean;
}

/**
 * A multi-value cell as one comma-separated line group that wraps naturally. A long list shows
 * its first values and "and N more", linking to the language page; the values past the clamp stay
 * in the text for assistive technology, hidden only from sight.
 */
export function LanguageValueList({
  values,
  matched,
  languageHref,
  languageName,
  raised = false,
}: LanguageValueListProps) {
  if (!values || values.length === 0) {
    return (
      <Typography component="span" variant="body2" color="textSecondary">
        —
      </Typography>
    );
  }

  const { shown, rest } = orderValues(values, matched, VALUE_LIST_LIMIT);

  return (
    <Typography component="span" variant="body2" sx={{ overflowWrap: "anywhere" }}>
      {shown.join(", ")}
      {rest.length > 0 && (
        <>
          <Box component="span" sx={visuallyHiddenSx}>
            , {rest.join(", ")}
          </Box>{" "}
          <Link
            component={NextLink}
            href={languageHref}
            aria-label={`and ${rest.length} more: open ${languageName}`}
            sx={{
              ...languageLinkSx,
              color: "primary.main",
              whiteSpace: "nowrap",
              ...(raised && { position: "relative", zIndex: 1 }),
            }}
          >
            and {rest.length} more
          </Link>
        </>
      )}
    </Typography>
  );
}
