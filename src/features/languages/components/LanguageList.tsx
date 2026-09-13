import { Box, Link, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

import { LanguageStatusChip } from "@/features/languages/components/LanguageStatusChip";
import {
  languageCodeSx,
  languageLinkSx,
} from "@/features/languages/styles/languageStyles";
import { LanguageType } from "@/features/languages/types/language.type";

interface LanguageListProps {
  languages: LanguageType[];
}

/**
 * The catalogue on a phone: a semantic list with one block per language, so nothing scrolls
 * sideways and the name, which is the link, is never clipped. The link's hit area is stretched
 * over the whole block, which keeps one tab stop per language.
 */
export function LanguageList({ languages }: LanguageListProps) {
  return (
    <Box
      component="ul"
      aria-label="Languages"
      sx={{
        listStyle: "none",
        m: 0,
        p: 0,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      {languages.map((language, index) => (
        <Box
          component="li"
          key={language.id}
          sx={{
            position: "relative",
            px: 2,
            py: 1.5,
            borderTop: index === 0 ? 0 : 1,
            borderColor: "divider",
            "&:hover, &:focus-within": { bgcolor: "brandTint.main" },
          }}
        >
          <Stack direction="row" columnGap={1} alignItems="baseline" flexWrap="wrap">
            <Link
              component={NextLink}
              href={`/${language.code}`}
              sx={{
                ...languageLinkSx,
                fontWeight: 500,
                overflowWrap: "anywhere",
                "&::after": { content: '""', position: "absolute", inset: 0 },
              }}
            >
              {language.name}
            </Link>
            <Typography variant="body2" color="textSecondary" sx={languageCodeSx}>
              {language.code.toUpperCase()}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" mt={0.75}>
            <LanguageStatusChip status={language.status} />
            <Typography variant="body2" color="textSecondary">
              {language.nationOfOrigin?.length ? language.nationOfOrigin.join(", ") : "—"}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
