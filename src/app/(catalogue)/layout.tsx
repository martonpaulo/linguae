import { Typography } from "@mui/material";
import type { ReactNode } from "react";

import { CatalogueFilterPanel } from "@/features/languages/components/CatalogueFilterPanel";
import { CatalogueProvider } from "@/features/languages/context/CatalogueContext";
import { readManifest } from "@/features/languages/server/snapshotSource";
import { ContentContainer } from "@/shared/components/ContentContainer";
import { SITE_TAGLINE } from "@/shared/config/deployment";

/**
 * Every catalogue page leads with the task: the heading says what the page does and the
 * search comes straight after it. The brand lives in the site header.
 */
export default async function CatalogueLayout({ children }: { children: ReactNode }) {
  const manifest = await readManifest();

  return (
    <CatalogueProvider>
      <ContentContainer>
        <Typography
          variant="h1"
          // No width cap: one line where the row allows it, an even wrap where it does not.
          sx={{ fontSize: { mobile: "1.75rem", tablet: "2.25rem" }, textWrap: "balance" }}
        >
          {SITE_TAGLINE}
        </Typography>

        <CatalogueFilterPanel statuses={manifest.statuses} />

        {children}
      </ContentContainer>
    </CatalogueProvider>
  );
}
