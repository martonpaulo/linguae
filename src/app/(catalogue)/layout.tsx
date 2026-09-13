import { Typography } from "@mui/material";
import type { ReactNode } from "react";

import { CatalogueFilterPanel } from "@/features/languages/components/CatalogueFilterPanel";
import { CatalogueProvider } from "@/features/languages/context/CatalogueContext";
import { ContentContainer } from "@/shared/components/ContentContainer";
import { BASE_PATH } from "@/shared/config/deployment";

/** The heading and filters every catalogue page shares; the pages below swap only the rows. */
export default function CatalogueLayout({ children }: { children: ReactNode }) {
  return (
    <CatalogueProvider>
      <ContentContainer>
        <Typography
          variant="h1"
          sx={{ display: "flex", alignItems: "center", gap: "0.3em" }}
        >
          {/* The site's own mark (the favicon), decorative: the heading's name is the word. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- a static export has no image optimizer */}
          <img
            src={`${BASE_PATH}/icon.svg`}
            alt=""
            width={40}
            height={40}
            style={{ width: "0.9em", height: "0.9em" }}
          />
          Linguae
        </Typography>

        <CatalogueFilterPanel />

        {children}
      </ContentContainer>
    </CatalogueProvider>
  );
}
