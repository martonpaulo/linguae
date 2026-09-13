import { Box, Link, TableCell, TableRow, Typography } from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { LanguageStatusChip } from "@/features/languages/components/LanguageStatusChip";
import {
  languageCodeSx,
  languageLinkSx,
} from "@/features/languages/styles/languageStyles";
import { LanguageType } from "@/features/languages/types/language.type";

interface LanguageTableRowProps {
  language: LanguageType;
}

function renderList(items?: string[]) {
  if (!items || items.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        —
      </Typography>
    );
  }

  return items.map((item) => <Box key={item}>{item}</Box>);
}

/** True for a click the row must leave to whoever it landed on. */
function belongsToAnotherControl(event: MouseEvent<HTMLElement>): boolean {
  if (event.defaultPrevented) return true;
  if (event.button !== 0) return true;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return true;
  }

  const target = event.target as HTMLElement | null;
  return Boolean(target?.closest("a, button, input, select, textarea, label"));
}

export function LanguageTableRow({ language }: LanguageTableRowProps) {
  const router = useRouter();
  const href = `/${language.code}`;

  // Convenience only: the anchor below owns Enter, modifier-click, middle-click and the
  // context menu, so the row must not act on those.
  const handleRowClick = (event: MouseEvent<HTMLElement>) => {
    if (belongsToAnotherControl(event)) return;
    router.push(href);
  };

  return (
    <TableRow
      onClick={handleRowClick}
      sx={{
        cursor: "pointer",
        transition: "background-color 120ms ease",
        "&:hover, &:focus-within": { bgcolor: "brandTint.main" },
        "&:active": { bgcolor: "brandTint.hover" },
      }}
    >
      <TableCell sx={{ ...languageCodeSx, width: 80 }}>
        {language.code.toUpperCase()}
      </TableCell>

      <TableCell sx={{ width: 250 }}>
        <Link
          component={NextLink}
          href={href}
          variant="body2"
          sx={{ ...languageLinkSx, fontWeight: 500 }}
        >
          {language.name}
        </Link>
      </TableCell>

      <TableCell sx={{ width: 200 }}>
        <LanguageStatusChip status={language.status} />
      </TableCell>

      <TableCell sx={{ width: 400 }}>
        {renderList(language.nationOfOrigin)}
      </TableCell>

      <TableCell sx={{ width: 200 }}>
        {renderList(language.writingSystem)}
      </TableCell>

      <TableCell sx={{ width: 350 }}>{renderList(language.spokenIn)}</TableCell>
    </TableRow>
  );
}
