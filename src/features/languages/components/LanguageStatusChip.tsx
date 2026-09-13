"use client";

import { Box, type SxProps, type Theme } from "@mui/material";

import { LanguageStatusEnum } from "@/features/languages/types/languageStatus.enum";
import type { LanguageStatusPalette } from "@/shared/styles/theme";

interface LanguageStatusChipProps {
  status?: string;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
}

/**
 * Each status maps to a theme status token. Endangerment runs amber, deep orange, slate, so no
 * badge borrows the brand crimson or the error red that marks a failure.
 */
const MAP_STATUS_TO_TONE: Record<string, keyof LanguageStatusPalette> = {
  [LanguageStatusEnum.NATIONAL]: "healthy",
  [LanguageStatusEnum.WIDER_COMMUNICATION]: "healthy",
  [LanguageStatusEnum.VIGOROUS]: "healthy",
  [LanguageStatusEnum.PROVINCIAL]: "established",
  [LanguageStatusEnum.EDUCATIONAL]: "established",
  [LanguageStatusEnum.DEVELOPING]: "developing",
  [LanguageStatusEnum.SECOND_LANGUAGE_ONLY]: "developing",
  [LanguageStatusEnum.THREATENED]: "threatened",
  [LanguageStatusEnum.REAWAKENING]: "threatened",
  [LanguageStatusEnum.SHIFTING]: "endangered",
  [LanguageStatusEnum.MORIBUND]: "endangered",
  [LanguageStatusEnum.NEARLY_EXTINCT]: "endangered",
  [LanguageStatusEnum.EXTINCT]: "extinct",
  // Dormant and unattested keep the neutral badge: nothing is known to assert.
};

/**
 * A status badge: the word is always the label, so colour is never the only carrier. A plain
 * span rather than MUI's Chip, which brought its own module into the bundle for no behaviour.
 * Renders nothing when a language has no recognised category, rather than inventing one.
 */
export function LanguageStatusChip({ status, size = "small", sx }: LanguageStatusChipProps) {
  if (!status) return null;

  const tone = MAP_STATUS_TO_TONE[status];

  return (
    <Box
      component="span"
      sx={[
        (theme) => ({
          display: "inline-flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          borderRadius: 999,
          fontWeight: 500,
          lineHeight: 1.5,
          fontSize: size === "medium" ? "0.8125rem" : "0.75rem",
          px: size === "medium" ? 1.25 : 1,
          py: size === "medium" ? 0.375 : 0.125,
          backgroundColor: tone ? theme.palette.status[tone] : "rgba(0, 0, 0, 0.08)",
          color: tone ? "#fff" : "rgba(0, 0, 0, 0.87)",
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {status}
    </Box>
  );
}
