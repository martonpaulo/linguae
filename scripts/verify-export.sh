#!/usr/bin/env bash
# Refuses to publish an export that is empty, missing its entry points, or carrying
# configuration that must never leave the build.
set -euo pipefail

test -f out/index.html || { echo "Missing out/index.html"; exit 1; }
test -f out/404.html || { echo "Missing out/404.html"; exit 1; }
test -f out/catalogue/index.json || { echo "Missing the published catalogue index"; exit 1; }

PAGES=$(find out -name index.html | wc -l | tr -d ' ')
if [ "${PAGES}" -lt 2 ]; then
  echo "Expected generated detail pages, found ${PAGES} page(s)"
  exit 1
fi

for NEEDLE in AIRTABLE_API_KEY AIRTABLE_BASE_ID LANGUAGES_TABLE_ID NATIONS_TABLE_ID \
  WRITING_SYSTEMS_TABLE_ID api.airtable.com; do
  if grep -rqF "${NEEDLE}" out; then
    echo "Refusing to publish: the export contains ${NEEDLE}"
    exit 1
  fi
done

echo "Export verified: ${PAGES} pages, $(du -sh out | cut -f1)."
