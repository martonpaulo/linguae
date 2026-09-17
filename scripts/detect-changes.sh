#!/usr/bin/env bash
# Reports which categories of path changed in this run.
#
# `code`     gates the expensive browser acceptance suite.
# `artifact` gates production publication.
#
# An unknown or unreachable base revision means the comparison failed, not that nothing
# changed, so both flags are reported as true.
set -euo pipefail

emit() {
  echo "code=$1" >> "$GITHUB_OUTPUT"
  echo "artifact=$2" >> "$GITHUB_OUTPUT"
  echo "code=$1 artifact=$2"
}

if [ "${EVENT}" = "workflow_dispatch" ]; then
  echo "Manual run: nothing is skipped."
  emit true true
  exit 0
fi

if [ -z "${BASE:-}" ] || [ "${BASE}" = "0000000000000000000000000000000000000000" ]; then
  echo "No usable base revision: treating every path as changed."
  emit true true
  exit 0
fi

if ! git cat-file -e "${BASE}^{commit}" 2>/dev/null; then
  echo "Base revision ${BASE} is not present: treating every path as changed."
  emit true true
  exit 0
fi

CHANGED=$(git diff --name-only "${BASE}" "${HEAD}")
echo "Changed paths:"
echo "${CHANGED}" | sed 's/^/  /'

# Everything the export is built from, plus the tooling that builds it.
ARTIFACT_PATHS='src/|public/|scripts/|package\.json$|pnpm-lock\.yaml$|next\.config\.ts$|tsconfig\.json$|\.github/workflows/'
# Everything the acceptance suite can observe: the artifact inputs plus the suite itself.
CODE_PATHS="${ARTIFACT_PATHS}|tests/|playwright\.config\.ts\$|eslint\.config\.mjs\$"

ARTIFACT_PATTERN="^(${ARTIFACT_PATHS})"
CODE_PATTERN="^(${CODE_PATHS})"

matches() {
  echo "${CHANGED}" | grep -Eq "$1" && echo true || echo false
}

emit "$(matches "${CODE_PATTERN}")" "$(matches "${ARTIFACT_PATTERN}")"
