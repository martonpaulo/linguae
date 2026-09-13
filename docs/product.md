# Linguae

Linguae is a public reference website for exploring Wikitongues language records through search, filters and detailed language profiles.

## Audience and job

Researchers, linguistics students and interested readers use it to find a language and inspect its names, status, writing systems and geographic relationships without navigating the source Airtable dataset manually. The source dataset remains the reference; this site improves discovery rather than creating linguistic facts.

## Outcomes

- Find records using partial language names/codes and combinations of verified categorical filters.
- Browse and open individual language profiles through accessible navigation and shareable URLs.
- Distinguish a completed empty result from pending data or a failed delivery; recover without losing useful filter input.

## Non-goals

- No Airtable editing or data-authoring workflow: this product presents source records and does not own their maintenance.
- No accounts or private workspaces: the catalogue is a public reference, so user identity is unnecessary.
- No automatic translation or invented language classification: preserve source language names and only verified status mappings.
- No complete offline catalogue feature: save filter preferences only; public data may use ordinary browser caching, without an offline guarantee or another persistent database.
- No separate live API after the approved static migration: publish a snapshot instead of operating a backend for read-only data.

## Delivery and constraints

The site is published to GitHub Pages at `https://linguae.martonpaulo.com/`, served from the root of its own subdomain. The migration shipped on 2026-09-09: Airtable is read at build time only, the runtime API routes and origin middleware are gone, and the browser reads a static snapshot.

The static snapshot updates on each successful publication, with manual refresh available and no periodic schedule selected. Publish only fields already intentionally public in the catalogue; Airtable credentials remain build-only secrets. A failed or partial refresh must not replace the last valid deployment. Preserve Wikitongues attribution and the existing MIT code license without implying that the code license grants new data rights.

The catalogue is paginated, 50 languages per page, never infinitely scrolled (`a3906d7`): every page has its own static URL (`/` is page 1, then `/page/2/` onwards) with real `<a href>` links, a self-referencing canonical, and a 404 outside the range; the pager shows the full extent — first page, neighbours and last page (`7eb07a7`), with no separate "Page N of M" line, since the pager and the result count already say it (`e5dcb98`). Applying or clearing a filter returns to page 1; paging keeps the filter. The address states the applied filters (`?name`, `code`, `status`, `nation`, `writing`, `spoken`), so a filtered view can be shared or reopened: a URL that names filters applies them over the stored ones, and a language page links each fact to the catalogue filtered by it (`dae19fc`). Filtering by lineage is not offered yet: publishing the genealogy in the index was estimated at +86 to +145 KB gzip over its 211 KB, an owner decision. The Wikitongues attribution lives in the site footer rather than above the catalogue (`2269b96`).

The interface and developer documentation are English; source language names remain unchanged. Acceptance covers Chromium, Gecko and WebKit. There are no public version numbers or releases. Work is manual, directly on `main`, with automatic task commits and pushes after validation; agent automation is disabled.

## Observable success

A reader can find and open a known record, distinguish no results from failure, recover from a failed load, and use the core journey with a keyboard. Published deep links work beneath the approved prefix in all three target engine families. A trusted complete snapshot can be published without runtime credentials or changes to the personal site. No measured baseline or numeric performance target has been established; issue-level validation must supply evidence before claiming one.

Owner decisions confirmed on 2026-09-09. [AGENTS.md](../AGENTS.md) owns operational policy; canonical GitHub issues own implementation acceptance criteria.
