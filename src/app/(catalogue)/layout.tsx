import { Typography } from "@mui/material";
import type { ReactNode } from "react";

import { CatalogueFilterPanel } from "@/features/languages/components/CatalogueFilterPanel";
import { CatalogueProvider } from "@/features/languages/context/CatalogueContext";
import { ContentContainer } from "@/shared/components/ContentContainer";
import { SITE_TAGLINE } from "@/shared/config/deployment";

/**
 * Every catalogue page leads with the task: the heading says what the page does and the
 * search comes straight after it. The brand lives in the site header.
 */
export default function CatalogueLayout({ children }: { children: ReactNode }) {
  return (
    <CatalogueProvider>
      <ContentContainer>
        <Typography
          variant="h1"
          sx={{ fontSize: { mobile: "1.75rem", tablet: "2.25rem" }, maxWidth: "20ch" }}
        >
          {SITE_TAGLINE}
        </Typography>

        <CatalogueFilterPanel />

        {children}
      </ContentContainer>
    </CatalogueProvider>
  );
}
