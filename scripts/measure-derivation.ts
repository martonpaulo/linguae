import { LanguageFilterFormValues } from "@/features/languages/components/languageFilters.schema";
import { LanguageType } from "@/features/languages/types/language.type";
import { LanguageStatusEnum } from "@/features/languages/types/languageStatus.enum";
import { enrichLanguagesDataSetListWithNames } from "@/features/languages/utils/languageEnrichers";
import { filterLanguages } from "@/features/languages/utils/languageFilters";
import {
  LANGUAGE_PAGE_SIZE,
  pageSlice,
} from "@/features/languages/utils/languagePagination";
import { NationType } from "@/features/nations/types/nation.type";
import { WritingSystemType } from "@/features/writingSystems/types/writingSystem.type";

/**
 * Measures the catalogue's derivation path: enrichment of a loaded snapshot, local
 * filtering, and the slice that shows one page of the result. It exists so a performance claim
 * about this path can cite a number rather than an impression.
 *
 * Run with `pnpm measure:derivation`.
 */
const SIZES = [50, 500, 2_000, 8_000];
const NATION_COUNT = 200;
const WRITING_SYSTEM_COUNT = 40;

function buildReferences() {
  const nations: NationType[] = Array.from(
    { length: NATION_COUNT },
    (_, index) => ({ id: `nat_${index}`, name: `Nation ${index}` })
  );
  const writingSystems: WritingSystemType[] = Array.from(
    { length: WRITING_SYSTEM_COUNT },
    (_, index) => ({ id: `ws_${index}`, name: `Writing System ${index}` })
  );
  return { nations, writingSystems };
}

function buildLanguages(count: number): LanguageType[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `rec_${index}`,
    code: `c${index}`,
    name: `Synthetic Language ${index}`,
    status:
      index % 2 === 0
        ? LanguageStatusEnum.VIGOROUS
        : LanguageStatusEnum.SHIFTING,
    // Relations point across the whole reference range, so lookups are not all cheap hits.
    spokenInId: [`nat_${index % NATION_COUNT}`, `nat_${(index + 7) % NATION_COUNT}`],
    writingSystemId: [`ws_${index % WRITING_SYSTEM_COUNT}`],
    nationOfOriginId: [`nat_${(index * 3) % NATION_COUNT}`],
  }));
}

function time(label: string, run: () => unknown): number {
  const started = performance.now();
  run();
  const elapsed = performance.now() - started;
  console.warn(`  ${label.padEnd(28)} ${elapsed.toFixed(2)} ms`);
  return elapsed;
}

const NO_FILTERS: LanguageFilterFormValues = {
  code: "",
  name: "",
  status: "",
  spokenIn: "",
  writingSystem: "",
  nationOfOrigin: "",
};

function main(): void {
  const { nations, writingSystems } = buildReferences();

  for (const size of SIZES) {
    const languages = buildLanguages(size);
    console.warn(`\n${size} languages (${NATION_COUNT} nations, ${WRITING_SYSTEM_COUNT} writing systems)`);

    let enriched: LanguageType[] = [];
    time("enrich whole snapshot", () => {
      enriched = enrichLanguagesDataSetListWithNames(
        languages,
        nations,
        writingSystems
      );
    });

    let matching: LanguageType[] = [];
    time("filter (no criteria)", () => {
      matching = filterLanguages(enriched, NO_FILTERS);
    });

    time("filter by name", () =>
      filterLanguages(enriched, { ...NO_FILTERS, name: "Language 1" })
    );

    time(`slice page 2 (${LANGUAGE_PAGE_SIZE} rows)`, () =>
      pageSlice(matching, 2)
    );
  }
}

main();
