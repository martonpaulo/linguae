import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { expect, test } from "@playwright/test";

const SCRIPT = path.join(process.cwd(), "scripts", "detect-changes.sh");

interface Repository {
  directory: string;
  commit: (files: string[]) => string;
}

/** A throwaway repository, so the gate is exercised against real diffs. */
async function repository(): Promise<Repository> {
  const directory = await mkdtemp(path.join(tmpdir(), "catalogue-gate-"));
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: directory, encoding: "utf8" }).trim();

  git("init", "--quiet");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "Test");

  const commit = (files: string[]) => {
    for (const file of files) {
      const target = path.join(directory, file);
      mkdirSync(path.dirname(target), { recursive: true });
      execFileSync("bash", ["-c", `echo change >> ${JSON.stringify(target)}`]);
    }
    git("add", "-A");
    git("commit", "--quiet", "-m", `change ${files.join(" ")}`);
    return git("rev-parse", "HEAD");
  };

  commit(["README.md"]);
  return { directory, commit };
}

async function runGate(
  repo: Repository,
  env: Record<string, string>
): Promise<{ code: string; artifact: string }> {
  const outputFile = path.join(repo.directory, "gate-output");
  await writeFile(outputFile, "");

  execFileSync("bash", [SCRIPT], {
    cwd: repo.directory,
    env: { ...process.env, ...env, GITHUB_OUTPUT: outputFile },
    encoding: "utf8",
  });

  const output = await readFile(outputFile, "utf8");
  const read = (key: string) =>
    output.match(new RegExp(`^${key}=(\\w+)$`, "m"))?.[1] ?? "";

  return { code: read("code"), artifact: read("artifact") };
}

test.describe("pipeline path gate", () => {
  test("runs everything for a manual dispatch", async () => {
    const repo = await repository();
    const head = repo.commit(["README.md"]);

    expect(
      await runGate(repo, { EVENT: "workflow_dispatch", BASE: "", HEAD: head })
    ).toEqual({ code: "true", artifact: "true" });
  });

  test("runs everything when the base revision is unknown", async () => {
    const repo = await repository();
    const head = repo.commit(["README.md"]);

    for (const base of ["", "0".repeat(40), "b".repeat(40)]) {
      expect(await runGate(repo, { EVENT: "push", BASE: base, HEAD: head })).toEqual(
        { code: "true", artifact: "true" }
      );
    }
  });

  test("skips both expensive stages for a documentation-only change", async () => {
    const repo = await repository();
    const base = repo.commit(["docs/product.md"]);
    const head = repo.commit(["README.md", "docs/product.md"]);

    expect(await runGate(repo, { EVENT: "push", BASE: base, HEAD: head })).toEqual({
      code: "false",
      artifact: "false",
    });
  });

  test("runs everything for an application change", async () => {
    const repo = await repository();
    const base = repo.commit(["README.md"]);
    const head = repo.commit(["src/app/page.tsx"]);

    expect(await runGate(repo, { EVENT: "push", BASE: base, HEAD: head })).toEqual({
      code: "true",
      artifact: "true",
    });
  });

  test("runs the suite but not publication for a test-only change", async () => {
    const repo = await repository();
    const base = repo.commit(["README.md"]);
    const head = repo.commit(["tests/example.spec.ts"]);

    expect(await runGate(repo, { EVENT: "push", BASE: base, HEAD: head })).toEqual({
      code: "true",
      artifact: "false",
    });
  });

  test("runs everything when the workflow itself changes", async () => {
    const repo = await repository();
    const base = repo.commit(["README.md"]);
    const head = repo.commit([".github/workflows/validate.yml"]);

    expect(await runGate(repo, { EVENT: "push", BASE: base, HEAD: head })).toEqual({
      code: "true",
      artifact: "true",
    });
  });
});
