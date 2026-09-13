import { LanguageFilterFormValues } from "@/features/languages/components/languageFilters.schema";
import { LanguageStatusEnum } from "@/features/languages/types/languageStatus.enum";
import { DEFAULT_LANGUAGE_FILTERS } from "@/features/languages/utils/languageFilters";

export type LanguageFilterField = keyof LanguageFilterFormValues;

/** The query parameter of each filter: short, readable names for a URL someone may share. */
export const FILTER_URL_KEYS: Record<LanguageFilterField, string> = {
  name: "name",
  code: "code",
  status: "status",
  nationOfOrigin: "nation",
  writingSystem: "writing",
  spokenIn: "spoken",
};

const FIELDS = Object.keys(FILTER_URL_KEYS) as LanguageFilterField[];
const STATUSES = new Set<string>(Object.values(LanguageStatusEnum));

/**
 * The filters a catalogue URL asks for, or null when it names none, so stored filters apply
 * instead. A repeated parameter uses its first non-empty value; a value the form could not hold
 * (a code over three characters, an unknown status) is dropped rather than failing the page.
 */
export function parseFilterSearch(search: string): LanguageFilterFormValues | null {
  const params = new URLSearchParams(search);
  if (!FIELDS.some((field) => params.has(FILTER_URL_KEYS[field]))) return null;

  const filters = { ...DEFAULT_LANGUAGE_FILTERS };
  for (const field of FIELDS) {
    const value = params
      .getAll(FILTER_URL_KEYS[field])
      .map((candidate) => candidate.trim())
      .find(Boolean);
    const accepted = value && acceptValue(field, value);
    if (accepted) filters[field] = accepted;
  }
  return filters;
}

function acceptValue(field: LanguageFilterField, value: string): string | undefined {
  if (field === "code") return value.length <= 3 ? value : undefined;
  if (field === "status") {
    const status = value.toLowerCase();
    return STATUSES.has(status) ? status : undefined;
  }
  return value;
}

/** The query string for a filter set, empty when nothing is filtered. */
export function filterSearch(filters: LanguageFilterFormValues): string {
  const params = new URLSearchParams();
  for (const field of FIELDS) {
    const value = filters[field];
    if (value) params.set(FILTER_URL_KEYS[field], value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** The catalogue's first page filtered by one value, for a link from a language page. */
export function catalogueFilterHref(field: LanguageFilterField, value: string): string {
  return `/${filterSearch({ ...DEFAULT_LANGUAGE_FILTERS, [field]: value })}`;
}
