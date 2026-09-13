import "./globals.css";

import { Container } from "@mui/material";
import type { Metadata, Viewport } from "next";

import { readManifest } from "@/features/languages/server/snapshotSource";
import { SiteFooter } from "@/shared/components/SiteFooter";
import {
  canonicalUrl,
  HOME_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
  SOCIAL_IMAGE,
  TITLE_SEPARATOR,
} from "@/shared/config/deployment";
import { AppThemeProvider } from "@/shared/providers/AppThemeProvider";
import { ReactQueryProvider } from "@/shared/providers/ReactQueryProvider";
import { poppins } from "@/shared/styles/fonts";

export const metadata: Metadata = {
  // The origin only: the framework adds the base path to every relative metadata asset.
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    // The home page carries the tagline, because "Linguae" alone tells a search
    // engine nothing. Every other page leads with its own subject and the
    // template trails the brand.
    default: HOME_TITLE,
    template: `%s${TITLE_SEPARATOR}${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: canonicalUrl() },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    url: canonicalUrl(),
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#fbeaf0",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const manifest = await readManifest();

  // Describes what the site is, for a reader that parses rather than renders.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: canonicalUrl(),
    inLanguage: "en",
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
    creator: { "@type": "Person", name: "Marton Paulo" },
    dateModified: manifest.generatedAt,
    size: `${manifest.languageCount} languages`,
  };

  // Google names the site in its results from this node on the home page:
  // https://developers.google.com/search/docs/appearance/site-names
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: canonicalUrl(),
  };

  return (
    <html lang="en">
      <body className={poppins.variable}>
        <script
          type="application/ld+json"
          // The content is built here from the snapshot, never from user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
        />
        <AppThemeProvider>
          <ReactQueryProvider>
            <Container component="main">{children}</Container>
            <SiteFooter />
          </ReactQueryProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
