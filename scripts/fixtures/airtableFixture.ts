import { AirtableRecordType } from "@/shared/types/airtableRecord.type";

import { SnapshotSource } from "../snapshot/buildSnapshot";

const NATIONS: AirtableRecordType[] = [
  { id: "nat_br", fields: { Polities: "Brazil" } },
  { id: "nat_pt", fields: { Polities: "Portugal" } },
  { id: "nat_jp", fields: { Polities: "Japan" } },
  { id: "nat_ao", fields: { Polities: "Angola" } },
  { id: "nat_cv", fields: { Polities: "Cabo Verde" } },
  { id: "nat_mz", fields: { Polities: "Mozambique" } },
  { id: "nat_tl", fields: { Polities: "Timor-Leste" } },
  { id: "nat_gw", fields: { Polities: "Guinea-Bissau" } },
  { id: "nat_st", fields: { Polities: "São Tomé and Príncipe" } },
  { id: "nat_blank", fields: {} },
];

const WRITING_SYSTEMS: AirtableRecordType[] = [
  { id: "ws_latn", fields: { Name: "Latin" } },
  { id: "ws_jpan", fields: { Name: "Japanese" } },
];

const LANGUAGES: AirtableRecordType[] = [
  {
    id: "rec_por",
    fields: {
      "ISO 639-3": "por",
      "Official Name": 'Portuguese "Lusophone"',
      "Language Status": "1 - National",
      "Alternate Names": "Português",
      Genealogy: "Indo-European, Romance",
      Description: "A Romance language of the Indo-European family.",
      "Principal in": ["nat_br", "nat_pt"],
      "Writing System": ["ws_latn"],
      "Nation of Origin": ["nat_pt"],
    },
  },
  {
    id: "rec_jpn",
    fields: {
      "ISO 639-3": "jpn",
      "Official Name": "Japanese",
      "Language Status": "1 - National",
      "Principal in": ["nat_jp"],
      "Writing System": ["ws_jpan"],
      "Nation of Origin": ["nat_jp"],
    },
  },
  {
    // Minimal record: every optional detail field is absent.
    id: "rec_xtc",
    fields: {
      "ISO 639-3": "xtc",
      "Official Name": "Extinct Sample",
      "Language Status": "10 - Extinct",
    },
  },
  {
    id: "rec_xne",
    fields: {
      "ISO 639-3": "xne",
      "Official Name": "Nearly Extinct Sample",
      "Language Status": "8b - Nearly extinct",
      "Principal in": ["nat_br"],
    },
  },
  {
    id: "rec_una",
    fields: {
      "ISO 639-3": "una",
      "Official Name": "Unattested Sample",
      "Language Status": "Unattested.",
    },
  },
  {
    id: "rec_unk",
    fields: {
      // An unrecognized source label must not enter a known category by accident.
      "ISO 639-3": "unk",
      "Official Name": "Unknown Status Sample",
      "Language Status": "42 - Not a real label",
      "Principal in": ["nat_missing"],
    },
  },
  {
    id: "rec_thr",
    fields: {
      "ISO 639-3": "thr",
      "Official Name": "Threatened Sample",
      "Language Status": "6b - Threatened",
      "Writing System": ["ws_latn"],
    },
  },
  {
    // Rich record: every detail field, for the language page layout. Fictional text.
    id: "rec_ric",
    fields: {
      "ISO 639-3": "ric",
      "Official Name": "Rich Sample",
      "Alternate Names": "Rich Tongue, Sample Speech",
      "Language Status": "4 - Educational",
      "Language Status Notes": "Taught in primary and secondary schools across the fictional region.",
      Dialects: "Northern Rich, Southern Rich and the coastal variety, which are mutually intelligible.",
      Genealogy: "Synthetic Family, Coastal Branch, Rich Group",
      Demographics: "12,000 speakers (fixture census, 2020).",
      "Language Use": "Used at home, in markets and on regional radio by speakers of every age.",
      "Language Development": "A standard orthography was adopted in 1998; a dictionary and school readers exist.",
      Typology: "Subject-verb-object word order, with prepositions and no grammatical gender.",
      "Other Comments": "This record is synthetic and exists only to exercise the page layout.",
      Description: "A fictional language used to test how a record with every field reads.",
      "Principal in": ["nat_br", "nat_pt"],
      "Writing System": ["ws_latn"],
      "Nation of Origin": ["nat_br"],
    },
  },
  {
    // A very long lineage and many alternate names, for wrapping. Fictional text.
    id: "rec_lng",
    fields: {
      "ISO 639-3": "lng",
      "Official Name": "Long Lineage Sample",
      "Alternate Names":
        "Lineage One, Lineage Two, Lineage Three, Lineage Four, Lineage Five, Lineage Six, " +
        "Lineage Seven, Lineage Eight, Lineage Nine, Lineage Ten, Lineage Eleven, Lineage Twelve",
      "Language Status": "7 - Shifting",
      Genealogy:
        "Proto-Synthetic, Greater Fixture, Northern Fixture, Inner Northern, Highland, " +
        "Upper Highland, Western Upper Highland, River Group, Upper River, Lakeside, " +
        "Lakeside North, Long Lineage Cluster",
      Demographics:
        "About 800 speakers, mostly over 50 (fixture survey, 2018). Semi-speakers: about 1,200, " +
        "mostly in the lakeside villages (fixture survey, 2019).",
      // More places than the facts card and a catalogue cell hold.
      "Principal in": ["nat_jp", "nat_br", "nat_pt", "nat_ao", "nat_cv", "nat_mz", "nat_tl", "nat_gw", "nat_st"],
      "Nation of Origin": ["nat_jp"],
    },
  },
  {
    // Rejected: duplicate of rec_por's code.
    id: "rec_dup",
    fields: { "ISO 639-3": "POR", "Official Name": "Duplicate Portuguese" },
  },
  {
    // Rejected: a code that is not three letters.
    id: "rec_bad",
    fields: { "ISO 639-3": "portuguese", "Official Name": "Bad Code" },
  },
  {
    // Rejected: no usable name.
    id: "rec_noname",
    fields: { "ISO 639-3": "nnm", "Official Name": "   " },
  },
];

/**
 * A credential-free source that exercises the generator's validation branches. The padding
 * records exist so the catalogue has more languages than one reveal step, which is what the
 * incremental-loading acceptance needs.
 */
export function fixtureSource(paddingCount = 60): SnapshotSource {
  return {
    languages: [...LANGUAGES, ...paddingLanguages(paddingCount)],
    nations: NATIONS,
    writingSystems: WRITING_SYSTEMS,
  };
}

function paddingLanguages(count: number): AirtableRecordType[] {
  return scaledFixtureSource(count).languages;
}

/**
 * Grows the fixture to an arbitrary language count for feasibility measurement. Every
 * generated record is synthetic; no real dataset is reproduced here.
 */
export function scaledFixtureSource(languageCount: number): SnapshotSource {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const generated: AirtableRecordType[] = [];

  for (let index = 0; index < languageCount; index += 1) {
    const code =
      alphabet[Math.floor(index / 676) % 26] +
      alphabet[Math.floor(index / 26) % 26] +
      alphabet[index % 26];

    generated.push({
      id: `rec_pad_${code}`,
      fields: {
        "ISO 639-3": code,
        "Official Name": `Synthetic Language ${index}`,
        "Language Status": index % 2 === 0 ? "6a - Vigorous" : "7 - Shifting",
        "Alternate Names": `Alt ${index}`,
        Genealogy: "Indo-European, Romance",
        Demographics: `Approximately ${index * 100} speakers.`,
        "Principal in": ["nat_br"],
        "Writing System": ["ws_latn"],
        "Nation of Origin": ["nat_br"],
      },
    });
  }

  return {
    languages: generated,
    nations: NATIONS,
    writingSystems: WRITING_SYSTEMS,
  };
}
