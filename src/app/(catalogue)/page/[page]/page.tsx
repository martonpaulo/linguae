import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LanguageCataloguePage } from "@/features/languages/components/LanguageCataloguePage";
import {
  readCataloguePage,
  readCataloguePageCount,
} from "@/features/languages/server/snapshotSource";
import { pagePath } from "@/features/languages/utils/languagePagination";
import {
  canonicalUrl,
  pageTitle,
  SITE_DESCRIPTION,
  SITE_NAME,
  SOCIAL_IMAGE,
} from "@/shared/config/deployment";

/**
 * Pages 2 onwards. Page 1 is the catalogue root, so it has no second URL here. Only pages the
 * snapshot fills are exported; any other number, or anything that is not a number, has no file
 * and the host answers 404.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const pageCount = await readCataloguePageCount();
  return Array.from({ length: pageCount - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

interface CataloguePageProps {
  params: Promise<{ page: string }>;
}

async function resolvePage(params: CataloguePageProps["params"]) {
  const { page } = await params;
  const number = /^\d+$/.test(page) ? Number(page) : NaN;
  return number >= 2 ? number : null;
}

export async function generateMetadata({
  params,
}: CataloguePageProps): Promise<Metadata> {
  const page = await resolvePage(params);
  if (!page) return { title: "Page not found" };

  const subject = `Languages, page ${page}`;
  // Each page is its own document with its own rows, so its canonical is itself, not page 1.
  const url = canonicalUrl(pagePath(page));

  return {
    title: subject,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: pageTitle(subject),
      description: SITE_DESCRIPTION,
      url,
      locale: "en_US",
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle(subject),
      description: SITE_DESCRIPTION,
      images: [SOCIAL_IMAGE],
    },
  };
}

export default async function CataloguePage({ params }: CataloguePageProps) {
  const page = await resolvePage(params);
  const catalogue = page ? await readCataloguePage(page) : null;
  if (!page || !catalogue) notFound();

  return (
    <LanguageCataloguePage
      page={page}
      languages={catalogue.languages}
      pageCount={catalogue.pageCount}
    />
  );
}
