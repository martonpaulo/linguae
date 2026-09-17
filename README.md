<div align="center">

<img src="public/social-card.jpg" width="100%" alt="Linguae: an interactive catalogue of the world's documented languages">

# Linguae

Interactive table featuring all documented languages from the Wikitongues database, providing an easy way to explore global linguistic diversity.

[![Validate](https://github.com/martonpaulo/linguae/actions/workflows/validate.yml/badge.svg)](https://github.com/martonpaulo/linguae/actions/workflows/validate.yml)

[![Next.js 15.5](https://img.shields.io/badge/Next.js-15.5-000000)](https://nextjs.org/) [![React 19](https://img.shields.io/badge/React-19-149eca)](https://react.dev/) [![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-3178c6)](https://www.typescriptlang.org/)

</div>

**Linguae** is an interactive catalogue of every language the Wikitongues dataset documents. It is
built on the [_Every Language in the World_](https://www.airtable.com/universe/exph5qycoKpX7tPwO/every-language-in-the-world)
Airtable base, and it currently publishes **7,554 languages**, **217 nations** and **126 writing
systems** — searchable, filterable, and with a page of its own for each language.

The project was born out of a personal interest in languages and linguistics, and it stayed a
**purely static site**: there is no backend, no runtime API and no credential in the browser.
Airtable is read **at build time only**, projected onto an explicit list of public fields, and
written as one versioned snapshot that the exported HTML carries with it.

```mermaid
flowchart LR
  airtable[Airtable base] -->|build, with secrets| snapshot[(Versioned snapshot)]
  snapshot -->|next build| export[Static export]
  export --> pages[GitHub Pages]
```

---

<br />

## 🌱 Quick Start

Requires **Node.js 22 or newer** and npm.

```bash
git clone https://github.com/martonpaulo/linguae.git
cd linguae
pnpm install --frozen-lockfile
pnpm snapshot:fixture
pnpm dev
```

[http://localhost:3000](http://localhost:3000)

`pnpm snapshot:fixture` writes a small synthetic catalogue; without a snapshot the build has nothing to generate pages from and fails saying so.

Airtable credentials are not needed to run the project, only to regenerate the snapshot from the real dataset.

<br />

## 🛠 Commands

| Command | What it does |
| --- | --- |
| `pnpm validate` | Runs the full gate before a commit: lint, types, then the acceptance suite. |
| `pnpm dev` | Starts the development server. Needs a snapshot to exist. |
| `pnpm snapshot:fixture` | Generates a synthetic snapshot. Needs no credentials. |
| `pnpm build` | Builds the static export into `out/`, under the published base path. |
| `pnpm build:export` | Builds the same static export under its release alias. |
| `pnpm serve:export` | Serves `out/` the way GitHub Pages does, for checking the real artifact. |
| `pnpm lint` | Runs ESLint over the whole repository. |
| `pnpm lint:fix` | Runs the same lint and applies the fixes it can. |
| `pnpm test` | Runs the acceptance suite in Chromium, Gecko and WebKit. |
| `pnpm test:chromium` | Runs the same suite in one engine, for faster iteration. |
| `pnpm snapshot` | Generates the public snapshot from Airtable. Requires the build-only credentials. |
| `pnpm snapshot:scaled` | Generates an 8,000-language synthetic snapshot, for feasibility measurement. |
| `pnpm measure:derivation` | Benchmarks enrichment, filtering and page slicing at 50 to 8,000 languages. |
| `pnpm social-card` | Renders `design/social-card/social-card.html` into `public/social-card.jpg`. Mac only. |

<br />

## 🔐 Secrets and variables

The five Airtable variables are read only by the snapshot generator and reach no browser bundle: locally they live in `.env.local`, whose shape is `.env.example`, and in CI they are repository secrets referenced only by the publication job.

| Name | Where | What for |
| --- | --- | --- |
| `AIRTABLE_API_KEY` | `.env.local`, repository secret | Required by `pnpm snapshot`. Airtable personal access token with read access |
| `AIRTABLE_BASE_ID` | `.env.local`, repository secret | Required by `pnpm snapshot`. The base holding the dataset copy |
| `LANGUAGES_TABLE_ID` | `.env.local`, repository secret | Required by `pnpm snapshot`. Languages table |
| `WRITING_SYSTEMS_TABLE_ID` | `.env.local`, repository secret | Required by `pnpm snapshot`. Writing systems table |
| `NATIONS_TABLE_ID` | `.env.local`, repository secret | Required by `pnpm snapshot`. Nations table |
| `NEXT_PUBLIC_BASE_PATH` | `.env.local`, build environment | Optional. Sub-path the site is published under. Empty locally |
| `NEXT_PUBLIC_STORAGE_PREFIX` | `.env.local`, build environment | Optional. Namespace for the stored filter preferences |
| `NEXT_PUBLIC_STORAGE_VERSION` | `.env.local`, build environment | Optional. Version suffix for that storage key |

---

<br />

## How it works

Airtable is read at build time. A generator projects the records onto an explicit list of public
fields, validates them, and writes one versioned snapshot. The site is then exported as static
HTML and published to GitHub Pages.

That has three consequences worth knowing before reading the code:

- **The browser never talks to Airtable**, and no API key exists in the deployed artifact. The build verifies this before uploading.
- **Each language page is generated with its record already in it.** Opening a language costs no request, and a code the snapshot does not publish has no page, so the host's own 404 answers it.
- **Each catalogue page is generated with its rows already in it**, at `/` and `/page/2/` onwards. Filtering loads one snapshot index and filters locally, without a further request.

Data refreshes on each deployment, and a manual refresh is available. A failed or partial
generation never replaces the published site.

Read [the product definition](docs/product.md) for scope and non-goals, [AGENTS.md](AGENTS.md) for
the working agreements, [CONTRIBUTING.md](CONTRIBUTING.md) to report a bug or propose a change, and
[the backlog](https://github.com/martonpaulo/linguae/issues) for what is planned.

<br />

## Features

1. **Table display and pagination**

   - Presents every language the snapshot publishes, with code, name, status, nation of origin, writing system and where it is spoken.
   - Shows 50 languages per page. Every page has its own URL and canonical, and previous, next and page numbers are ordinary links.
   - Applying or resetting filters returns to page 1; moving between pages keeps the applied filters.

2. **Search and filtering**

   - Free-text matching on language code and name, and exact category matching on status, nation of origin, writing system and where a language is spoken.
   - Filters apply on **Apply**, not on every keystroke, and are remembered between visits.
   - Only status categories the snapshot actually publishes are offered.

3. **Language pages**

   - A page per language with alternate names, dialects, status notes, genealogy, demographics, use, development, typology, description, writing systems and nations.
   - Reachable by a real link, so it can be opened with the keyboard, in a new tab, or copied.

<br />

## Tech stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 15 (App Router), TypeScript** | Static export (`output: "export"`), published under a base path |
| UI | **MUI + Material Icons** | Theme and shared styles in `src/shared/styles` |
| Data loading | **TanStack Query** | Owns request state and in-memory caching for the snapshot assets |
| Forms | **React Hook Form + Zod** | Zod validates the filter form *and* the filters restored from storage |
| Build tooling | **tsx** | Runs the TypeScript build scripts, which reuse the app's own mappers |
| Tests | **Playwright** | The one test runner; drives Chromium, Gecko and WebKit |

The catalogue list is client-rendered from a snapshot asset, so it needs JavaScript. Language pages
do not: their content is in the exported HTML.

### What this project deliberately does not use

There is no HTTP client dependency — the build-time reader and the browser both use `fetch`. There
is no client state-management library: TanStack Query owns fetched data and React owns the rest.
Nothing but the filter preferences is written to browser storage.

<br />

## Validation

```bash
pnpm validate
```

That is `pnpm lint`, `pnpm exec tsc --noEmit --incremental false` and `pnpm test`, in that order — the
same set CI runs. `pnpm test:chromium` is the faster loop while iterating.

`pnpm test` builds the real static export from the synthetic fixture snapshot and drives it through
the three accepted browser engines. It deliberately does not use the development server: the
development server answers an unknown route differently from the deployed artifact, so it cannot
prove the 404 contract.

A successful run does not verify private Airtable access, screen-reader behavior, or the deployed
site. To check a published deployment, point the live suite at its origin:

```bash
LIVE_URL=<deployed origin> pnpm exec playwright test liveDeployment
```

<br />

## Architecture

Each domain owns its types, services, hooks, mapping utilities and UI. Shared code lives in
`src/shared` only when its responsibility is genuinely shared.

<br />

## The published snapshot

The generator writes two sets of files. Only the first is served.

| Path | Served | Contents |
| --- | --- | --- |
| `public/catalogue/index.json` | ✅ | Every language, with the fields the table renders |
| `public/catalogue/nations.json` | ✅ | Nation ids and names |
| `public/catalogue/writing-systems.json` | ✅ | Writing-system ids and names |
| `.snapshot/manifest.json` | — | Version, generation time, and every published code |
| `.snapshot/languages/<code>.json` | — | One record per language, embedded into its page at build time |

Every file in a generation carries the same `version`, which is a hash of the content: regenerating
unchanged data produces the same version, so a browser's cached assets are not invalidated for
nothing.

Records without a usable three-letter code or a name are rejected, as are duplicate codes. The
generator reports how many it skipped and by record id — never by content.

<br />

## Continuous integration

`.github/workflows/validate.yml` checks every change, and `.github/workflows/deploy.yml` publishes
the checked commit. The three jobs cost very different amounts:

| Job | Workflow | Runs on | Secrets |
| --- | --- | --- | --- |
| Lint and types | Validate | Every push and pull request, every path | None |
| Browser acceptance | Validate | Only when a path it can observe changed | None; builds the synthetic snapshot |
| Publish to Pages | Deploy | After Validate passes on a push to `main` or a manual dispatch, only when an artifact path changed; a manual Deploy always publishes | The five Airtable secrets, in this job only |

A pull request cannot reach publication, from this repository or a fork. When the base revision of
a push cannot be compared, every path is treated as changed rather than as no change, so nothing is
skipped on a guess. Both workflows decide with the same script, `scripts/detect-changes.sh`.

Before uploading, Deploy refuses an export that is missing its entry points, has no generated
language pages, or contains any Airtable variable name or the Airtable host
(`scripts/verify-export.sh`).

<br />

## Commit strategy

One commit per subject, directly on `main`.

| Type | Description |
| --- | --- |
| `feat` | Introduces a capability |
| `fix` | Corrects behavior |
| `refactor` | Changes structure, preserves behavior |
| `test` | Adds or changes tests |
| `docs` | Documentation |
| `build` / `chore` / `ci` | Tooling, dependencies, pipeline |

A commit made for an issue ends with `(#<issue number>)`.

<br />

## Challenges faced

1. **Airtable's SDK documentation** was incomplete, so the reader is written directly against the REST API with `fetch`, following offsets serially per table.

2. **Airtable pagination gives no total count**, which originally forced infinite scroll over remote pages. The static snapshot removed that constraint: the count is known at build time, so every page of the list is exported with its own URL.

3. **The full dataset does not fit in `localStorage`.** Persisting the catalogue was abandoned in favour of persisting only the filter preferences and letting ordinary HTTP caching handle the data.

4. **A 7,554-page static export is 341 MB.** That is comfortably inside the GitHub Pages limit, but it was measured before committing to the approach rather than assumed.

5. **The source data is inconsistent.** Sixteen records carry an unusable language code and are skipped; unrecognised status labels are deliberately mapped to no category at all, because presenting them as a known one would be a fabrication.

<br />

## Possible improvements

1. **A smaller catalogue index.** It is 1.29 MB raw and 227 KB gzipped, which is the largest thing a first visit downloads.

2. **Dedicated routes per nation or writing system**, using relations the snapshot already carries.

3. **Multi-value filters**, so several statuses or nations can be selected at once.

---

<br />

## Limitations

- The catalogue is a **build-time snapshot**, so a correction in Airtable appears only after the next deployment or a manual refresh.
- The catalogue list needs JavaScript. Language pages do not.
- Sixteen source records carry an unusable language code and are not published; unrecognised status labels are shown as no category rather than guessed.
- Filters accept **one value per category**, and there are no routes per nation or writing system.
- The catalogue index is 1.29 MB raw (227 KB gzipped) and is downloaded in full on a first visit.

<br />

## License and attribution

[MIT](LICENSE) © 2026 Marton Paulo.

The catalogue data is made available by [Wikitongues](https://wikitongues.org/).

The licence covers the code only and grants no rights over that data.
