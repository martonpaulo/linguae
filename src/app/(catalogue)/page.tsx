import { notFound } from "next/navigation";

import { LanguageCataloguePage } from "@/features/languages/components/LanguageCataloguePage";
import { readCataloguePage } from "@/features/languages/server/snapshotSource";

/** Page 1 of the catalogue. Its metadata, canonical included, is the root layout's. */
export default async function Home() {
  const catalogue = await readCataloguePage(1);
  if (!catalogue) notFound();

  return (
    <LanguageCataloguePage
      page={1}
      languages={catalogue.languages}
      pageCount={catalogue.pageCount}
      languageCount={catalogue.languageCount}
    />
  );
}
