import process from "node:process";

import {
  fixtureSource,
  scaledFixtureSource,
} from "../tests/fixtures/airtableFixture";
import { AirtableCredentials, fetchAllRecords } from "./snapshot/airtableSource";
import { buildSnapshot, SnapshotSource } from "./snapshot/buildSnapshot";

const PROJECT_ROOT = process.cwd();

async function main(): Promise<void> {
  const source = await selectSource();
  const report = await buildSnapshot(source, PROJECT_ROOT);

  console.warn(
    [
      `Snapshot ${report.version} written to public/catalogue`,
      `  languages:       ${report.languageCount}`,
      `  nations:         ${report.nationCount}`,
      `  writing systems: ${report.writingSystemCount}`,
      `  statuses:        ${report.statuses.join(", ") || "none"}`,
      `  skipped records: ${report.skipped.length}`,
      ...report.skipped.map((entry) => `    - ${entry}`),
    ].join("\n")
  );
}

async function selectSource(): Promise<SnapshotSource> {
  const scaleArgument = process.argv.find((argument) =>
    argument.startsWith("--scale=")
  );

  if (scaleArgument) {
    return scaledFixtureSource(Number(scaleArgument.split("=")[1]));
  }

  if (process.argv.includes("--fixture")) {
    return fixtureSource();
  }

  return readAirtable();
}

/**
 * Reads the supported build-only variables. Values are never printed, and a missing
 * variable is reported by name only.
 */
async function readAirtable(): Promise<SnapshotSource> {
  const credentials: AirtableCredentials = {
    apiKey: requireVariable("AIRTABLE_API_KEY"),
    baseId: requireVariable("AIRTABLE_BASE_ID"),
  };

  const [languages, nations, writingSystems] = [
    requireVariable("LANGUAGES_TABLE_ID"),
    requireVariable("NATIONS_TABLE_ID"),
    requireVariable("WRITING_SYSTEMS_TABLE_ID"),
  ];

  return {
    languages: await fetchAllRecords(credentials, languages),
    nations: await fetchAllRecords(credentials, nations),
    writingSystems: await fetchAllRecords(credentials, writingSystems),
  };
}

function requireVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Run with --fixture to generate a synthetic snapshot instead.`
    );
  }
  return value;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
