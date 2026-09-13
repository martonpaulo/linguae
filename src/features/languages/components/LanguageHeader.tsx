import { Link, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

import { BackToCatalogueLink } from "@/features/languages/components/BackToCatalogueLink";
import { factLinkSx } from "@/features/languages/components/LanguageFactLinks";
import { LanguageStatusChip } from "@/features/languages/components/LanguageStatusChip";
import { languageCodeSx } from "@/features/languages/styles/languageStyles";
import { LanguageStatusEnum } from "@/features/languages/types/languageStatus.enum";
import { catalogueFilterHref } from "@/features/languages/utils/languageFilterUrl";
import { LANGUAGE_STATUS_DESCRIPTIONS } from "@/features/languages/utils/languageStatusDescriptions";

interface LanguageHeaderProps {
  name: string;
  code: string;
  status?: LanguageStatusEnum;
  alternateNames?: string;
}

/**
 * The way back, the name as the page's heading with its status beside it, and the code and
 * other names as a quieter subtitle. The status says what it means in words, so the colour is
 * never the only carrier.
 */
export function LanguageHeader({
  name,
  code,
  status,
  alternateNames,
}: LanguageHeaderProps) {
  return (
    <Stack component="header" spacing={2}>
      <BackToCatalogueLink />

      <Stack spacing={1}>
        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          columnGap={2}
          rowGap={1}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { mobile: "2rem", tablet: "2.75rem" },
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              overflowWrap: "anywhere",
            }}
          >
            {name}
          </Typography>
          {status && (
            <Link
              component={NextLink}
              href={catalogueFilterHref("status", status)}
              underline="none"
              aria-label={`Show ${status} languages`}
              sx={{ ...factLinkSx, display: "inline-flex", borderRadius: 999 }}
            >
              <LanguageStatusChip status={status} size="medium" />
            </Link>
          )}
        </Stack>

        <Typography variant="body1" color="textSecondary">
          ISO 639-3{" "}
          <Typography component="span" sx={{ ...languageCodeSx, color: "text.primary" }}>
            {code.toUpperCase()}
          </Typography>
        </Typography>

        {alternateNames && (
          <Typography variant="body2" color="textSecondary" sx={{ maxWidth: "65ch" }}>
            Also known as {alternateNames}
          </Typography>
        )}

        {status && (
          <Typography variant="body2" color="textSecondary" sx={{ maxWidth: "65ch" }}>
            <Typography component="span" variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
              {status.charAt(0).toUpperCase() + status.slice(1)}:
            </Typography>{" "}
            {LANGUAGE_STATUS_DESCRIPTIONS[status]}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
