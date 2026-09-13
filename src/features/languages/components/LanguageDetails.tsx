import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { LanguageType } from "@/features/languages/types/language.type";

interface LanguageDetailsProps {
  language: LanguageType;
}

/** Reading measure for prose: about 65 characters a line. */
const MEASURE = "65ch";

function splitLineage(genealogy?: string): string[] {
  return (genealogy ?? "")
    .split(",")
    .map((level) => level.trim())
    .filter(Boolean);
}

/**
 * The record in order of what people come for: key facts first, then the lineage, then the
 * prose. On a wide screen the facts and lineage sit beside the prose; on a phone, above it.
 * A fact or section appears only when the record has it.
 */
export default function LanguageDetails({ language }: LanguageDetailsProps) {
  const lineage = splitLineage(language.genealogy);

  const facts: { label: string; value: ReactNode }[] = [
    language.demographics && { label: "Speakers", value: language.demographics },
    lineage.length > 0 && { label: "Family", value: lineage[0] },
    language.nationOfOrigin?.length && {
      label: "Nation of origin",
      value: language.nationOfOrigin.join(", "),
    },
    language.writingSystem?.length && {
      label: language.writingSystem.length > 1 ? "Writing systems" : "Writing system",
      value: language.writingSystem.join(", "),
    },
    language.spokenIn?.length && { label: "Spoken in", value: language.spokenIn.join(", ") },
  ].filter(Boolean) as { label: string; value: ReactNode }[];

  const sections = [
    { title: "About", text: language.description },
    { title: "Status notes", text: language.statusNotes },
    { title: "Dialects", text: language.dialects },
    { title: "Language use", text: language.use },
    { title: "Language development", text: language.development },
    { title: "Typology", text: language.typology },
    { title: "Other comments", text: language.comments },
  ].filter((section): section is { title: string; text: string } => Boolean(section.text));

  const hasAside = facts.length > 0 || lineage.length > 0;
  const hasProse = sections.length > 0;

  if (!hasAside && !hasProse) {
    return (
      <Typography variant="body1" color="textSecondary" sx={{ maxWidth: MEASURE }}>
        Wikitongues has no further details for this language yet.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: { mobile: 4, tablet: 6 },
        alignItems: "start",
        gridTemplateColumns:
          hasAside && hasProse
            ? { mobile: "minmax(0, 1fr)", tablet: "minmax(240px, 340px) minmax(0, 1fr)" }
            : "minmax(0, 1fr)",
      }}
    >
      {hasAside && (
        <Stack spacing={3} component="aside" aria-label="Key facts">
          {facts.length > 0 && (
            <Paper variant="outlined" sx={{ p: { mobile: 2, tablet: 2.5 } }}>
              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: "grid",
                  gap: 2,
                  // Standing alone, the facts spread across the width instead of a thin column.
                  gridTemplateColumns: hasProse
                    ? "minmax(0, 1fr)"
                    : "repeat(auto-fill, minmax(200px, 1fr))",
                }}
              >
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <Typography
                      component="dt"
                      variant="caption"
                      color="textSecondary"
                      sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}
                    >
                      {fact.label}
                    </Typography>
                    <Typography component="dd" variant="body1" sx={{ m: 0, fontWeight: 400 }}>
                      {fact.value}
                    </Typography>
                  </div>
                ))}
              </Box>
            </Paper>
          )}

          {lineage.length > 0 && <Lineage levels={lineage} language={language.name} />}
        </Stack>
      )}

      {hasProse && (
        <Stack spacing={4} sx={{ maxWidth: MEASURE }}>
          {sections.map((section) => (
            <Box component="section" key={section.title}>
              <Typography
                variant="h2"
                sx={{ fontSize: "1.125rem", fontWeight: 500, mb: 1 }}
              >
                {section.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{ lineHeight: 1.75, whiteSpace: "pre-line", overflowWrap: "anywhere" }}
              >
                {section.text}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

/** The genealogy as a path from the family down to this language, one level per line. */
function Lineage({ levels, language }: { levels: string[]; language: string }) {
  const nodes = [...levels, language];

  return (
    <Box component="section" aria-labelledby="lineage-title">
      <Typography
        id="lineage-title"
        variant="h2"
        sx={{ fontSize: "1.125rem", fontWeight: 500, mb: 1.5 }}
      >
        Lineage
      </Typography>
      <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {nodes.map((node, index) => {
          const isLanguage = index === nodes.length - 1;
          return (
            <Box
              component="li"
              key={`${index}-${node}`}
              aria-current={isLanguage ? "true" : undefined}
              sx={{
                position: "relative",
                pl: 3,
                pb: isLanguage ? 0 : 1.25,
                // The line joining this level to the next.
                "&::before": isLanguage
                  ? undefined
                  : {
                      content: '""',
                      position: "absolute",
                      left: "5px",
                      top: "0.9em",
                      bottom: "-0.35em",
                      borderLeft: "2px solid",
                      borderColor: "divider",
                    },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "0.45em",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  border: "2px solid",
                  borderColor: isLanguage ? "primary.main" : "text.disabled",
                  bgcolor: isLanguage ? "primary.main" : "background.paper",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isLanguage ? 500 : 300,
                  color: isLanguage ? "text.primary" : "text.secondary",
                  overflowWrap: "anywhere",
                }}
              >
                {node}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
