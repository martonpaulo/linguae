import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { LanguageFactLinks } from "@/features/languages/components/LanguageFactLinks";
import { LanguageType } from "@/features/languages/types/language.type";

interface LanguageDetailsProps {
  language: LanguageType;
}

/** Reading measure for prose: about 65 characters a line. */
const MEASURE = "65ch";

/**
 * The longest speakers figure the facts card holds. Measured on 206 published records: half are
 * 35 characters or fewer ("125,000 (2003)."), and past about 60 the value is a paragraph of
 * sources and totals that wraps over many lines in the card's narrow column.
 */
const SHORT_SPEAKERS_MAX = 60;

/**
 * The most places the facts card lists. 99% of published records name one or none; the few past
 * five name dozens, which belong in the reading column instead.
 */
const SHORT_SPOKEN_IN_MAX = 5;

function splitLineage(genealogy?: string): string[] {
  return (genealogy ?? "")
    .split(",")
    .map((level) => level.trim())
    .filter(Boolean);
}

type Fact = { label: string; value: ReactNode };
type Section = { title: string; body: ReactNode };

/**
 * The record in order of what people come for. The facts card holds short facts only; a value
 * long enough to be read rather than scanned — a speakers paragraph, a long list of places —
 * becomes a section of the reading column. On a phone everything is one column; from the tablet
 * breakpoint the facts and lineage sit beside the prose; on a wide screen the lineage takes a
 * third column, so the page uses its width while the prose keeps its measure.
 */
export default function LanguageDetails({ language }: LanguageDetailsProps) {
  const lineage = splitLineage(language.genealogy);
  const speakers = language.demographics?.trim();
  const shortSpeakers = speakers && speakers.length <= SHORT_SPEAKERS_MAX;
  const spokenIn = language.spokenIn ?? [];
  const shortSpokenIn = spokenIn.length <= SHORT_SPOKEN_IN_MAX;

  const facts = [
    shortSpeakers && { label: "Speakers", value: speakers },
    lineage.length > 0 && { label: "Family", value: lineage[0] },
    language.nationOfOrigin?.length && {
      label: "Nation of origin",
      value: <LanguageFactLinks field="nationOfOrigin" values={language.nationOfOrigin} />,
    },
    language.writingSystem?.length && {
      label: language.writingSystem.length > 1 ? "Writing systems" : "Writing system",
      value: <LanguageFactLinks field="writingSystem" values={language.writingSystem} />,
    },
    spokenIn.length > 0 &&
      shortSpokenIn && {
        label: "Spoken in",
        value: <LanguageFactLinks field="spokenIn" values={spokenIn} />,
      },
  ].filter(Boolean) as Fact[];

  const text = (value?: string) => value && <ProseText>{value}</ProseText>;

  const sections = ([
    { title: "About", body: text(language.description) },
    { title: "Speakers", body: !shortSpeakers && text(speakers) },
    {
      title: "Spoken in",
      body: !shortSpokenIn && (
        <ProseText>
          <LanguageFactLinks field="spokenIn" values={spokenIn} />
        </ProseText>
      ),
    },
    { title: "Status notes", body: text(language.statusNotes) },
    { title: "Dialects", body: text(language.dialects) },
    { title: "Language use", body: text(language.use) },
    { title: "Language development", body: text(language.development) },
    { title: "Typology", body: text(language.typology) },
    { title: "Other comments", body: text(language.comments) },
  ] as Section[]).filter((section) => Boolean(section.body));

  const hasFacts = facts.length > 0;
  const hasLineage = lineage.length > 0;
  const hasProse = sections.length > 0;

  if (!hasFacts && !hasLineage && !hasProse) {
    return (
      <Typography variant="body1" color="textSecondary" sx={{ maxWidth: MEASURE }}>
        Wikitongues has no further details for this language yet.
      </Typography>
    );
  }

  const asides = [hasFacts && "facts", hasLineage && "lineage"].filter(Boolean) as string[];
  const beside = hasProse && asides.length > 0;

  return (
    <Box
      sx={{
        display: "grid",
        columnGap: { mobile: 4, tablet: 6 },
        rowGap: { mobile: 4, tablet: 3 },
        alignItems: "start",
        gridTemplateColumns: {
          mobile: "minmax(0, 1fr)",
          ...(beside && {
            tablet: "minmax(240px, 340px) minmax(0, 1fr)",
            // Both side columns share what the measure leaves, so no band of the page is empty.
            ...(asides.length === 2 && {
              wide: `minmax(220px, 1fr) minmax(0, ${MEASURE}) minmax(220px, 1fr)`,
            }),
          }),
        },
        // The spanning prose must not stretch the facts row: its track is auto, the next is 1fr.
        gridTemplateRows: beside && asides.length === 2 ? { tablet: "auto 1fr", wide: "auto" } : undefined,
        gridTemplateAreas: {
          mobile: [...asides, hasProse && "prose"].filter(Boolean).map((area) => `"${area}"`).join(" "),
          ...(beside && {
            tablet: asides.map((area) => `"${area} prose"`).join(" "),
            ...(asides.length === 2 && { wide: '"facts prose lineage"' }),
          }),
        },
      }}
    >
      {hasFacts && (
        <Paper
          component="aside"
          aria-label="Key facts"
          variant="outlined"
          sx={{ gridArea: "facts", p: { mobile: 2, tablet: 2.5 } }}
        >
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
                <Typography
                  component="dd"
                  variant="body1"
                  sx={{ m: 0, fontWeight: 400, overflowWrap: "anywhere" }}
                >
                  {fact.value}
                </Typography>
              </div>
            ))}
          </Box>
        </Paper>
      )}

      {hasLineage && <Lineage levels={lineage} language={language.name} />}

      {hasProse && (
        <Stack spacing={4} sx={{ gridArea: "prose", maxWidth: MEASURE }}>
          {sections.map((section) => (
            <Box component="section" key={section.title}>
              <Typography
                variant="h2"
                sx={{ fontSize: "1.125rem", fontWeight: 500, mb: 1 }}
              >
                {section.title}
              </Typography>
              {section.body}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function ProseText({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="body1"
      sx={{ lineHeight: 1.75, whiteSpace: "pre-line", overflowWrap: "anywhere" }}
    >
      {children}
    </Typography>
  );
}

/** The genealogy as a path from the family down to this language, one level per line. */
function Lineage({ levels, language }: { levels: string[]; language: string }) {
  const nodes = [...levels, language];

  return (
    <Box component="section" aria-labelledby="lineage-title" sx={{ gridArea: "lineage" }}>
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
