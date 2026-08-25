# Implementation Plan: YouTube Video Embeds on Place & Trail Pages

## Overview

Add an optional YouTube video to every Place and Trail detail page (`/[locale]/places/[slug]`, `/[locale]/trails/[slug]`). Editors set a single YouTube URL per entity in Sanity Studio (or via the import CLI); pages render it as a responsive, privacy-enhanced (`youtube-nocookie`), lazily-loaded embedded player positioned in the article prose column after the descriptive body and practical/safety notes, before waypoints/sources. Stories are explicitly out of scope.

**Resolved decisions (user-approved):**
- One optional video per entity (single `videoUrl`, not an array).
- Placement inside the `.prose-copy` column, after body + practical/safety notes.
- Demo fixture entries (1 place + 1 trail) synced by the agent via exactly 2 `--direct` imports, gated on explicit user go-ahead.

## Architecture Decisions

- **Single optional `videoUrl: string` per entity**, shared across languages (merged el-first like `geometry`/images), not localized — one video represents the entity; the iframe `title` attribute is derived from the entity title in the active locale.
- **Store the canonical URL, derive the video ID at render time** via a pure parser (`src/lib/video.ts`). Never store both URL and ID (drift risk).
- **Privacy-enhanced embed domain** `https://www.youtube-nocookie.com`; plain `<iframe loading="lazy">` rather than a click-to-load facade — the site is static-first with no hydration infrastructure, and `loading="lazy"` already defers offscreen loading.
- **CSP must change**: `public/_headers` currently allows frames only from `'self' blob:` via `child-src`. Add `frame-src https://www.youtube-nocookie.com`. Without this the embed is blocked by the browser.
- **Validation regex lives in three places by necessity** (`src/lib/content.ts` shared Zod schema, duplicated minimally in `studio/schemaTypes.ts` because Studio cannot import from `src/`), each cross-referencing the other; adapter tests pin the behavior.

## Dependency Graph

```
src/lib/content.ts (contract + URL schema)
    ├── src/lib/video.ts (ID parser) ──┐
    ├── public/_headers (CSP)          │
    ├── studio/schemaTypes.ts          │
    ├── scripts/export-sanity-seed.ts  │
    ├── scripts/import-entry.ts        │
    ├── src/lib/sanity-transform.ts ───┤
    │   (GROQ + bilingual merge)       │
    └──────────────────────────────────┴──► pages/[locale]/{places,trails}/[slug].astro
                                             + global.css + ui-copy.ts
```

Implementation order follows the AGENTS.md "7 boundary layers" lockstep rule.

## Task List

### Phase 1: Foundation

#### Task 1: Domain contract + YouTube URL parser

**Description:** Extend the content contract with an optional `videoUrl` on Place and Trail, plus a pure YouTube-ID parser used by page rendering.

**Acceptance criteria:**
- [ ] `Place` and `Trail` interfaces have `videoUrl?: string`.
- [ ] Exported `youTubeUrlSchema` accepts watch?v=, youtu.be/, shorts/, embed/, nocookie forms over https; rejects other URLs.
- [ ] `parseYouTubeVideoId()` returns the 11-char ID or `undefined`.

**Verification:**
- [ ] `pnpm test -- tests/video.test.ts`
- [ ] `pnpm check`

**Dependencies:** None.

**Files likely touched:** `src/lib/content.ts`, `src/lib/video.ts` (new), `tests/video.test.ts` (new).

**Estimated scope:** Small (3 files)

#### Task 2: CSP frame-src allowlist

**Description:** Permit the youtube-nocookie frame origin in the production Content-Security-Policy so embeds are not blocked.

**Acceptance criteria:**
- [ ] CSP directive includes `frame-src https://www.youtube-nocookie.com`.
- [ ] Guard test fails if the header loses the directive.

**Verification:**
- [ ] New guard assertion passes in `pnpm test`.
- [ ] Manual: dev-server response headers include the directive.

**Dependencies:** None (parallelizable with Task 1).

**Files likely touched:** `public/_headers`, one test file.

**Estimated scope:** XS (1–2 files)

### Checkpoint: Foundation
- [ ] `pnpm lint && pnpm check && pnpm test` green.

---

### Phase 2: CMS Pipeline (lockstep layers 2–6)

#### Task 3: Sanity Studio schemas

**Description:** Add the optional validated `videoUrl` field to place and trail documents so editors can paste a YouTube link in Studio.

**Acceptance criteria:**
- [ ] Both `place` and `trail` defineType have `videoUrl` (`type: 'url'`, optional, https + YouTube-format validation).
- [ ] Field appears in both language variants' editor forms.

**Verification:**
- [ ] `pnpm --filter @lafkos/studio build`
- [ ] Manual: `pnpm studio:dev` shows the field (optional smoke).

**Dependencies:** Task 1 (regex source of truth defined).

**Files likely touched:** `studio/schemaTypes.ts`.

**Estimated scope:** Small (1 file)

#### Task 4: Seed exporter + import CLI

**Description:** Carry `videoUrl` through both serialization directions of the sync tooling.

**Acceptance criteria:**
- [ ] `export-sanity-seed.ts` writes `videoUrl` into NDJSON place/trail docs when set, omits when absent.
- [ ] `import-entry.ts` input schemas accept optional `youTubeUrlSchema` for places and trails; `formatEntryDocuments` maps it into both language docs.

**Verification:**
- [ ] Existing CLI round-trip tests still green; new assertions cover videoUrl mapping.
- [ ] `pnpm test`

**Dependencies:** Tasks 1–3.

**Files likely touched:** `scripts/export-sanity-seed.ts`, `scripts/import-entry.ts`.

**Estimated scope:** Medium (2 files)

#### Task 5: Sanity adapter & transformers

**Description:** Project and merge `videoUrl` through GROQ queries and the bilingual document merge so both adapters (Sanity and seed fallback) produce identical domain objects.

**Acceptance criteria:**
- [ ] `PLACES_QUERY`/`TRAILS_QUERY` project `videoUrl`.
- [ ] Merge follows el-first fallback like geometry; absent everywhere → `undefined`.
- [ ] Adapter tests assert round-trip transform + `formatEntryDocuments` output contains `videoUrl`.

**Verification:**
- [ ] `pnpm test -- tests/sanity-adapter.test.ts`
- [ ] `pnpm --filter @lafkos/studio build` (schema compile)
- [ ] Decision recorded: `studio/structure.ts` needs no change (filters operate on flags/categories, not media fields).

**Dependencies:** Task 4 shares fixtures.

**Files likely touched:** `src/lib/sanity-transform.ts`, `tests/sanity-adapter.test.ts`.

**Estimated scope:** Small–Medium (2 files)

### Checkpoint: CMS pipeline
- [ ] `pnpm test` green; `pnpm --filter @lafkos/studio build` clean.

---

### Phase 3: Page Rendering

#### Task 6: Render video section on detail pages

**Description:** Render the embedded player inside the prose column of both detail pages, styled to match the design system, verified against real rendered output.

**Acceptance criteria:**
- [ ] Both `[slug].astro` pages render `<figure class="video-embed">` with eyebrow heading after body + practical/safety lists, before waypoints/sources, only when `parseYouTubeVideoId(entity.videoUrl)` succeeds.
- [ ] iframe: `youtube-nocookie.com/embed/<id>`, `loading="lazy"`, localized `title`, `allowfullscreen`, 16:9 `aspect-ratio` wrapper.
- [ ] ui-copy gains localized `video` strings (el/en).
- [ ] Fixture: after `pnpm studio:pull-content`, exactly 1 seed place + 1 seed trail carry a real `videoUrl`.
- [ ] E2E asserts iframe present on fixture pages and absent elsewhere.

**Verification:**
- [ ] `pnpm build` green.
- [ ] Browser check on dev server, both locales: player visible in correct position, no console errors.
- [ ] `pnpm test:e2e`

**Dependencies:** Tasks 1, 2, 5.

**Files likely touched:** `src/pages/[locale]/places/[slug].astro`, `src/pages/[locale]/trails/[slug].astro`, `src/lib/ui-copy.ts`, `src/styles/global.css`, `tests/e2e/lafkos.spec.ts`, `src/data/content.ts` (fixtures).

**Estimated scope:** Medium (~5–6 files)

### Checkpoint: Rendering
- [ ] Visual + E2E confirmation on both locales.

---

### Phase 4: Docs & Editorial Sync

#### Task 7: Documentation

**Description:** Record the field across the authoring docs so agents and editors know the contract (layer 7).

**Acceptance criteria:**
- [ ] `docs/content-management.md` documents `videoUrl` for Place & Trail.
- [ ] SKILL.md JSON contracts include the field with authoring guidance.

**Verification:**
- [ ] Docs review against implemented schema.

**Dependencies:** Tasks 3–6 merged.

**Files likely touched:** `docs/content-management.md`, `skills/sanity-cms-import/SKILL.md`.

**Estimated scope:** Small (2 files)

#### Task 8: Sync fixture entries to Sanity — BLOCKED on explicit user go-ahead

**Description:** Publish the two fixture videos to the production Content Lake using granular direct imports only (repo Rules 2–4: pull first, ≤2 imports, each fires 1 Vercel deploy webhook).

**Acceptance criteria:**
- [ ] User explicitly approves the 2 imports.
- [ ] `pnpm studio:pull-content` run immediately before; both entries import via `--direct`; each verifies in Studio.

**Verification:**
- [ ] Sanity Vision query returns `videoUrl` on both entities.
- [ ] Production pages render players after deploy.

**Dependencies:** All previous tasks.

**Files likely touched:** None (cloud mutations only).

**Estimated scope:** XS

### Checkpoint: Complete
- [ ] Full suite: `pnpm lint && pnpm check && pnpm test && pnpm build && pnpm --filter @lafkos/studio build && pnpm test:e2e`.
- [ ] Ready for review.

## Parallelization

- Safe now: Tasks 1 and 2 (independent files).
- Safe after Phase 1: Tasks 3, 4, 5 touch disjoint files but share the regex/fixtures — sequential is safer; they are small.
- Rendering (Task 6) strictly after Phase 2.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing CSP `frame-src` silently blanks embeds | High | Task 2 lands first; guard test pins the header |
| Bulk import triggers deployment webhook storms | High | Granular imports only; exactly 2; explicit approval gate (Task 8) |
| `pull-content` clobbers uncommitted seed edits | Medium | Sequence enforced: pull → then edit fixtures |
| Validator regex drift between Studio and src | Low | Cross-reference comments; adapter tests pin CLI side |
| Third-party iframe privacy/perf concerns | Low | `youtube-nocookie` + `loading="lazy"`; facade deferred until needed |

## Open Questions

None — all three resolved by user (single video; prose-column placement; agent-run direct imports behind approval gate).
