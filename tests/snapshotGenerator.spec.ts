import { mkdtemp, readdir, readFile } from "node:fs/promises";
import { createServer, Server } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { fetchAllRecords } from "../scripts/snapshot/airtableSource";
import { buildSnapshot } from "../scripts/snapshot/buildSnapshot";
import type {
  SnapshotIndex,
  SnapshotManifest,
} from "../src/shared/types/snapshot.type";
import { fixtureSource } from "./fixtures/airtableFixture";

async function buildInto(source = fixtureSource(0)) {
  const root = await mkdtemp(path.join(tmpdir(), "catalogue-snapshot-"));
  const report = await buildSnapshot(source, root);
  return {
    root,
    report,
    published: path.join(root, "public", "catalogue"),
    build: path.join(root, ".snapshot"),
  };
}

async function readJson<T>(directory: string, assetPath: string): Promise<T> {
  return JSON.parse(await readFile(path.join(directory, assetPath), "utf8")) as T;
}

test.describe("snapshot generator", () => {
  test("rejects duplicate, malformed and unnamed records", async () => {
    const { report, build } = await buildInto();

    expect(report.skipped).toEqual([
      "rec_dup: duplicate code",
      "rec_bad: unusable code",
      "rec_noname: missing name",
    ]);

    const files = await readdir(path.join(build, "languages"));
    expect(files.sort()).toEqual([
      "jpn.json",
      "lng.json",
      "por.json",
      "ric.json",
      "thr.json",
      "una.json",
      "unk.json",
      "xne.json",
      "xtc.json",
    ]);
  });

  test("publishes only the allowed public fields", async () => {
    const { published } = await buildInto();

    const index = await readJson<SnapshotIndex>(published, "index.json");
    const entry = index.languages.find((language) => language.code === "por");

    expect(Object.keys(entry ?? {}).sort()).toEqual([
      "code",
      "id",
      "name",
      "nationOfOriginId",
      "spokenInId",
      "status",
      "writingSystemId",
    ]);
  });

  test("keeps one version across every asset of a generation", async () => {
    const { published, build } = await buildInto();

    const manifest = await readJson<SnapshotManifest>(build, "manifest.json");
    const assets: [string, string][] = [
      [published, "index.json"],
      [published, "nations.json"],
      [published, "writing-systems.json"],
      [build, "languages/por.json"],
    ];

    for (const [root, asset] of assets) {
      const content = await readJson<{ version: string }>(root, asset);
      expect(content.version, asset).toBe(manifest.version);
    }
  });

  test("produces the same version for the same source data", async () => {
    const first = await buildInto();
    const second = await buildInto();

    expect(second.report.version).toBe(first.report.version);
  });

  test("refuses to publish a snapshot with no languages", async () => {
    await expect(
      buildInto({ ...fixtureSource(0), languages: [] })
    ).rejects.toThrow(/no languages/);
  });

  test("leaves the previous snapshot in place when generation fails", async () => {
    const { root, build } = await buildInto();
    const before = await readJson<SnapshotManifest>(build, "manifest.json");

    await expect(
      buildSnapshot({ ...fixtureSource(0), nations: [] }, root)
    ).rejects.toThrow(/no nation records/);

    const after = await readJson<SnapshotManifest>(build, "manifest.json");
    expect(after.version).toBe(before.version);
  });

  test("follows Airtable pagination to the last page", async () => {
    const pages = [
      { records: [{ id: "a", fields: {} }], offset: "p2" },
      { records: [{ id: "b", fields: {} }], offset: "p3" },
      { records: [{ id: "c", fields: {} }] },
    ];

    let served = 0;
    const server = await listen((request, response) => {
      const requested = new URL(request.url ?? "", "http://localhost").searchParams.get(
        "offset"
      );
      const index = requested ? Number(requested.slice(1)) - 1 : 0;
      served += 1;
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(pages[index]));
    });

    try {
      const records = await fetchAllRecords(
        { apiKey: "synthetic", baseId: "appSynthetic" },
        "tblLanguages",
        server.origin
      );

      expect(records.map((record) => record.id)).toEqual(["a", "b", "c"]);
      expect(served).toBe(3);
    } finally {
      await server.close();
    }
  });

  test("reports a failing table without leaking the request", async () => {
    const server = await listen((_request, response) => {
      response.writeHead(401, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "unauthorized" }));
    });

    try {
      const failure = fetchAllRecords(
        { apiKey: "synthetic-secret", baseId: "appSynthetic" },
        "tblLanguages",
        server.origin
      );

      await expect(failure).rejects.toThrow(/tblLanguages/);
      await failure.catch((error: Error) => {
        expect(error.message).not.toContain("synthetic-secret");
        expect(error.message).not.toContain("appSynthetic");
      });
    } finally {
      await server.close();
    }
  });
});

interface TestServer {
  origin: string;
  close: () => Promise<void>;
}

function listen(
  handler: Parameters<typeof createServer>[1]
): Promise<TestServer> {
  return new Promise((resolve) => {
    const server: Server = createServer(handler);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        origin: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(() => done())),
      });
    });
  });
}
