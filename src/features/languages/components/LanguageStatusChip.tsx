"use client";

import { Chip, ChipProps } from "@mui/material";

import { LanguageStatusEnum } from "@/features/languages/types/languageStatus.enum";
import type { LanguageStatusPalette } from "@/shared/styles/theme";

interface LanguageStatusChipProps extends Omit<ChipProps, "label" | "icon" | "color"> {
  status?: string;
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
  // Dormant and unattested keep the neutral default chip: nothing is known to assert.
};

/** Renders nothing when a language has no recognised category, rather than inventing one. */
export function LanguageStatusChip({
  status,
  sx,
  ...props
}: LanguageStatusChipProps) {
  if (!status) return null;

  const tone = MAP_STATUS_TO_TONE[status];

  return (
    <Chip
      label={status}
      size="small"
      sx={[
        tone
          ? (theme) => ({
              backgroundColor: theme.palette.status[tone],
              color: "#fff",
            })
          : {},
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
