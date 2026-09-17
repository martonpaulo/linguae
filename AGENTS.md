# Project Working Agreements

## Project identity and policy

- Display name: `Linguae`
- Code name: `Linguae`
- Slug: `linguae`
- Identifier name: `linguae`
- Branding: preserve the existing globe branding.
- Benefit-first description: Interactive table featuring all documented languages from the Wikitongues database, providing an easy way to explore global linguistic diversity 🌎
- Repository: `martonpaulo/linguae` (public).
- Public identifiers: npm package `linguae`, private/non-publishable package.
- Landing page: the application itself, published at `https://linguae.martonpaulo.com/` through GitHub Pages on its own subdomain (no sub-path). The About homepage and `package.json` `homepage` point there. Vercel is retired from this repository; see the release and secret-storage policy below.
- License: `MIT`.
- Copyright: 2025 Marton Paulo. Preserve the existing license and Wikitongues attribution.
- Development language: English.
- Product copy: English only; English is the source and fallback. Preserve names in their source language. No localization framework or additional locale is currently selected.
- Branch policy: work directly on `main`; do not create task branches or pull requests.
- Commit policy: automatically commit task-owned changes when the requested task is complete, relevant checks have passed, and the publication payload has been reviewed. Do not include unrelated work or hide failed checks.
- Push policy: automatically push those completed, validated commits to `origin/main`; verify the published commit. No force push. Stop and reconcile concurrent remote changes safely before publishing.
- Product versioning: no user-visible versions or public releases. Preserve `package.json`'s internal `0.1.0`; no automatic version bump, changelog, tag or release.
- Merge policy: not part of normal main-only delivery. An exceptional branch/merge requires an explicit owner request; preserve all commits and do not squash that branch. Existing GitHub merge settings are unchanged because no branch delivery is selected.
- Commit subject: a commit made for an issue ends with `(#<issue number>)`.
- Default-branch protection: no required PR review/status gate for main-only delivery; local validation remains mandatory before automatic commit/push. Preserve the current unprotected branch and do not enable auto-merge.
- Delete branches after merge: disabled; preserve the existing setting for this main-only project.
- Release, signing, and secret-storage policy: hosted web application, no signed binary or release artifacts. Publication uses a static public snapshot refreshed on each successful deployment, with manual refresh available; no periodic schedule. Airtable access is build-only, with credentials in GitHub Actions secrets. Vercel is fully retired as of 2026-09-09: the project was deleted by the owner, and `VERCEL_TOKEN` is removed from the repository secrets. Do not reintroduce a second deployment target without an explicit owner decision.
- Browser acceptance targets: Chromium, Gecko and WebKit. Browser tooling owns compatible binaries; do not introduce another browser manager.
- Remote-data persistence: only filter preferences are application-persisted. Fetched catalogue data uses in-memory query state and normal browser HTTP caching after the approved corrections. No localStorage copies of lists, details, reference tables or query caches; existing copies are tracked for removal, not silently treated as already removed.
- Status classification: offer only categories with verified source mappings. Hide Dormant until a mapping is verified; unknown values are not asserted to belong to a known category.
- GitHub public metadata: existing description, topics and homepage are preserved unless an exact replacement is approved. Secret scanning and push protection are enabled; preserve them.
- Skills baseline revision: `7cfc324fcded57145c36cc678977c070ed800692`
- Skills baseline applied: `2026-09-09`

The product definition is [docs/product.md](docs/product.md). These owner decisions are stable; ask again only when explicitly reopened or genuinely missing. Desired migration behavior is not evidence that the current code implements it.

## Instruction hierarchy and sources of truth

- Follow the direct task, the most specific scoped instructions, this root file, and personal working agreements in that order.
- Code proves current behavior; this file owns process and stable policy; accepted GitHub issue contracts own desired changes. Surface contradictions rather than silently selecting the convenient source.
- Keep one canonical owner for each rule. `CLAUDE.md` is an adapter to this file, never a second policy document.
- Preserve unrelated work. Inspect Git status, relevant guidance, source, callers and contracts before editing; use targeted searches.
- Do not turn planning or read-only review into product implementation. Use the current task's authorized workflow and keep independent issue contracts separate.

## Project patterns and ownership

- Feature folders own languages, nations and writing systems; each keeps its types, services, hooks, mapping utilities and feature UI. Shared code belongs in `src/shared` only when its responsibility is actually shared.
- React Query owns fetched-data lifecycle and in-memory caching. Language hooks own composition of language and reference results; consumers must distinguish pending, error, successful empty and successful content. Existing discarded lookup states and duplicate Zustand copies are tracked defects, not approved patterns.
- React Hook Form and Zod own the filter form. Apply/Reset are explicit actions; input does not trigger requests per keystroke. The language filter contract owns text and categorical matching.
- The existing mapping utilities own external-field projection. The approved static migration moves Airtable access to the build, publishes only explicitly allowed public fields, and keeps one snapshot identity across index, references and details.
- MUI and `src/shared/styles/theme.ts` own visual foundations; reusable status presentation remains in `LanguageStatusChip`. Use existing spacing and semantic palette roles. Do not invent a parallel token system.
- A change that breaks a recorded pattern or establishes a materially new one must name the current pattern, the proposed one and the reason, then ask the owner before adopting it. An already approved issue decision need not be asked again.

## Scope and implementation

- Prefer the smallest correct, readable and reversible solution. Reuse existing components, types, helpers and platform facilities before adding another implementation.
- Keep domain logic out of presentation and transport when an existing domain owner fits. Derive state instead of synchronizing copies; model invalid states explicitly.
- Do not add dependencies, caches, timers, background work or infrastructure without a present requirement and clear owner. Measure before claiming performance gains.
- Preserve behavior outside the task. Handle errors, recovery, accessibility and focused regression coverage with the behavior being changed.
- The repository owns no local skills. Do not vendor the personal skill collection here. If a project-owned skill is added, record its procedure and boundary once; it owns project-specific steps while general workflows retain their surrounding process.

## Data and publication safety

- Distinguish public source data, build artifacts, reconstructible cache, transient state and durable filter preferences. Never publish raw private workspace records or configuration merely because a mapper accepts them.
- Validate external fields and restored preferences. Never turn a failed fetch into a successful empty catalogue. Publish a complete valid static snapshot or retain the previous deployment.
- Keep secrets and real local configuration out of code, issues, logs and artifacts. Inspect the exact staged/outgoing payload before every commit/push and the final body before a GitHub write.
- Never read or request a credential value in chat. Use provider secret storage and verify names/authorized results without exposing values.
- Resolve exact targets before destructive work. No force push, broad cleanup, user-data deletion or production changes outside explicit scope. Temporary cleanup applies only to files created by the current task.
- No relational database is configured. If one is introduced by an approved change, require deterministic versioned migrations and prohibit manual production-schema edits.

## Interface and accessibility

- Preserve native controls and table/link semantics, keyboard navigation, visible focus, accessible names and non-color status information.
- Cover pending/content/empty/error/retry/disabled states. Preserve filter input and successfully loaded data during recoverable failures.
- Test the approved engine families. Screen-reader passes are not run and that gap is accepted debt (martonpaulo/skill-deck#266): accessibility evidence is automated — semantics, accessible names, focus, contrast measured to AA — and reports say it is weaker than a real pass. Visual judgment that automation cannot establish stays marked human verification.
- Visual foundations, decided in the 2026-09-13 redesign: the accent is the logo's crimson `#b3214b` (`45b858e`), with light tints of it for large surfaces; language statuses never use red, so a threatened language does not read as an error — amber, dark orange and slate carry the at-risk statuses (`45b858e`). Radii, button and focus styles live as tokens in `src/shared/styles/theme.ts`; a header sits on every page (`f9ccf8b`).
- Below 767px — measured as where the filters stack and the table overflows — the catalogue renders as a `<ul>` of rows and the filters sit behind a "Filters" button with removable chips for active filters; no page scrolls horizontally at 320, 375 or 390px (`911b4a5`).
- The footer is one row — credit, data attribution and outward links — and stacks only below 960px (`494859c`). Content above the fold is visible at first paint; motion never starts from hidden.
- Every page's first line of text sits at one offset below the header and on the logo's left edge: `PAGE_INSET` in `src/shared/styles/theme.ts` is applied once, by `SiteMain`, never per page; the header and footer take the same horizontal inset. On a language page "All languages" takes that first slot and the heading follows at the standard gap; the 404 starts there too instead of centring. `tests/pageInset.spec.ts` asserts it at 375, 1280 and 1720px (`3dac292`).
- The language page's facts card holds short facts only; a speakers value over 60 characters and a "Spoken in" list over five places become sections of the reading column, thresholds measured on 206 published records. Prose keeps its 65ch measure; from 1440px (`wide`) the lineage takes a third column and the two side columns share the remaining width, each at least 220px — measured at 1440px, two columns left 303px empty, three leave none (`dae19fc`).
- A sparse language page with no lineage keeps its content left-aligned with the logo from 1440px, even though the right side stays empty (roughly 300–780px): owner decision, 2026-09-13. The emptiness reflects how little data the record has; centering would break the alignment every other page keeps, and stretching the facts card would make a wide box for a few short facts.
- Family and lineage levels stay plain text until the catalogue can filter by lineage; the design options and measurements are captured in #25.
- Facts are links to the filtered catalogue — nation of origin, writing system, spoken in and status — with discreet underlined text and accessible names that say what opens ("Show languages written in Latin") (`dae19fc`).
- Catalogue multi-value cells are comma-separated text: three values, then "and N more" linking to the language page, with the clamped values kept for assistive technology and the value an active filter matched listed first (`eb5fb28`).
- The name search submits with the filter form (Enter or Apply) like every other filter; it does not request per keystroke.
- Keep English product copy concise and consistent; preserve language names, identifiers and quotations faithfully.

## Documentation and artifact paths

- Update the smallest canonical document when behavior or policy changes. Describe the currently runnable app and label planned behavior explicitly.
- Keep code, comments, commits, file names, tests and developer docs in English. Fence code/commands with their actual language, using `text` for plain output.
- Keep existing legal notices and attribution. Do not create empty documentation, placeholder workflows or speculative artifact folders.

## Agent skill paths

- Product definition: `docs/product.md`
- Handoffs: `.scratch/handoffs/`
- Prototypes: `.scratch/prototypes/`

`.scratch/` is ignored by Git. Do not create empty artifact directories; a path becomes material only when its owning workflow writes a real artifact. Use uniquely named system temporary directories for anything not worth keeping between sessions, and remove only this task's temporary output before completion.

## Validation and completion

- The full local gate is `pnpm validate` (`pnpm lint`, `pnpm exec tsc --noEmit --incremental false`, `pnpm test`). Current commands are `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm exec tsc --noEmit --incremental false`, `pnpm snapshot:fixture`, `pnpm build:export`, `pnpm test` (or `pnpm test:chromium`), and `pnpm dev`. Airtable credentials are needed only by `pnpm snapshot`; do not claim dummy values prove live API connectivity.
- The committed test runner is Playwright (`tests/`, `playwright.config.ts`): `pnpm test` builds the static export from the fixture snapshot and drives it through Chromium, Firefox and WebKit. Reuse it instead of inventing another runner.
- Test observable behavior at stable seams, with synthetic isolated data/storage. Do not add wrapper-only, source-text, duplicated-constant or pixel-snapshot tests. Use real browser/HTTP/build checks where a mock cannot prove the contract.
- Run the smallest relevant checks, inspect failures before retrying, and run one broader relevant check once stable. Report exactly what ran, what failed and what remains unverified.
- Use bounded waits and observable progress. Communicate at least once per minute during long work; inspect state before interrupting or repeating a command. Do not mistake elapsed time alone for a stall.
- Ask consequential choices through the client's question facility, with the evidence, recommendation and tradeoff. Do not re-ask resolved choices or stop independent authorized work while one answer is pending.
- Before committing, inspect the final diff, check links and configuration changed by the task, review publication safety, and preserve unrelated changes. Apply the automatic main-only commit/push policy only after the task reaches a real validated completion point.
- Finish with files changed, actual validation, skips/risks, temporary cleanup, commit/push result, final worktree state and unrelated dirty files preserved.
