# Implementation Plan: Lafkos Narrative Atlas

## Overview

Evolve Lafkos Guide from a broad point-of-interest directory into a focused,
bilingual narrative atlas of Lafkos. The first implementation slice will use the
existing Place, Trail, and Story contracts, so it can improve the visitor
experience without introducing a new CMS document type or synchronizing any
content to Sanity. The work will prioritize trustworthy editorial language,
thematic village-scale map exploration, and a clearer homepage/story structure.

**Review worktree:** `/Users/eevangelinos/Documents/lafkos-narrative-atlas`  
**Branch:** `feat/lafkos-narrative-atlas`

## Architecture decisions

- Keep Sanity and the local seed boundary unchanged during this review cycle;
  all changes remain local to the worktree.
- Reuse `Story.relatedKeys`, `Trail.waypoints`, and existing map state for the
  first thematic experience instead of adding a new CMS collection schema.
- Make village scope explicit in the map UI so regional beaches and driving
  routes remain available without competing with the village narrative.
- Treat uncertain research as editorial uncertainty: do not invent new GPS
  points, opening hours, water safety claims, or event dates.
- Preserve Greek and English parity for every new or changed editorial string.

## Dependency graph

```text
Existing content contracts and seed data
        ├── Map scope + thematic state
        │       └── MapExplorer controls and visible feature set
        ├── Curated editorial content
        │       └── Homepage cards, story index, detail-page relations
        └── Trust language and source links
                └── About / Before-you-go guidance
```

## Task list

### Phase 1: Foundation and editorial contract

#### Task 1: Editorial audit and narrative seed updates

**Description:** Correct the highest-impact local seed claims using the two
research reports, add direct provenance where available, repair broken related
keys, and add one carefully worded annual-cycle story without introducing
unverified geometry.

**Acceptance criteria:**

- [x] Forlidas café, Radio Museum, Folklore Museum, Drositis bakery, church,
      fountains, and Lafkos–Milina trail language reflects the research’s
      confidence and source conflicts.
- [x] No new coordinate is added unless the research provides a defensible
      public coordinate; uncertain facts are labelled as tradition, approximate,
      seasonal, or requiring local confirmation.
- [x] Greek and English content remain complete, source URLs are direct and
      useful, and unresolved `relatedKeys` are removed or corrected.

**Verification:** `pnpm test -- --runInBand` (or the repository’s Vitest command),
`pnpm check`, and a script-level parse of the seed dataset.

**Dependencies:** None.

**Files likely touched:** `src/data/content.ts`, possibly `tests/content.test.ts`.

**Estimated scope:** Medium.

#### Task 2: Trust and visitor guidance copy

**Description:** Align the About and Before-you-go pages with the research’s
conservative coordinate policy and add practical guidance for seasonal access,
water verification, car-free walking, and local respect.

**Acceptance criteria:**

- [x] The About page no longer claims that every point has field-verified GPS.
- [x] Fountain language avoids a blanket potable-water claim and distinguishes
      historical fountains from currently confirmed drinking water.
- [x] The pages explain how users should interpret sources and local tradition.

**Verification:** `pnpm check` and bilingual content review in the generated
Astro pages.

**Dependencies:** Task 1 for terminology consistency.

**Files likely touched:** `src/pages/[locale]/about/index.astro`,
`src/pages/[locale]/visit/index.astro`, `src/lib/ui-copy.ts`.

**Estimated scope:** Small.

### Checkpoint: Foundation

- [x] Seed parsing, type checks, and unit tests pass.
- [x] No CMS import, direct import, or Sanity webhook is triggered.
- [x] The editorial claims are reviewable in the worktree diff.

### Phase 2: Narrative map experience

#### Task 3: Village scope and thematic map controls

**Description:** Add bookmarkable Village / Village walks / South Pelion scope
controls and thematic lenses for Origins & Water, The 1887 Square, Stone &
Craft, and Sacred Ridge. Keep the existing category filters and accessible
result list working.

**Acceptance criteria:**

- [x] The default map foregrounds Lafkos and its immediate walks while regional
      content remains discoverable through an explicit scope.
- [x] Theme selections change the visible map/list set and are represented in
      the URL state.
- [x] Existing place, trail, waypoint selection, search, fullscreen, location,
      and deep links continue to work.
- [x] Theme groupings use stable entity keys and do not create duplicate pins.

**Verification:** map-state unit tests, `pnpm check`, and the relevant Playwright
map flow if available.

**Dependencies:** Task 1 for stable keys and editorial groupings.

**Files likely touched:** `src/lib/map-state.ts`, `src/lib/content-api.ts`,
`src/components/MapExplorer.tsx`, `tests/map-state.test.ts`, possibly a new
`src/lib/narrative-map.ts`.

**Estimated scope:** Large; keep implementation split into small helpers.

#### Task 4: Curated homepage and Stories index

**Description:** Replace the unbounded featured grid with a small set of
deliberate starting experiences, expose a proper bilingual Stories index, and
update navigation to point to the index.

**Acceptance criteria:**

- [x] The homepage presents three or four narrative starts and does not render
      all 24 currently featured cards at once.
- [x] A `/[locale]/stories/` page lists all stories with accessible headings,
      imagery, reading time, and links to related places/trails.
- [x] The primary navigation and homepage story link point to the Stories index.
- [x] The existing reading-lafkos article remains reachable and unchanged in
      slug compatibility.

**Verification:** `pnpm check`, `pnpm build`, and bilingual route smoke checks.

**Dependencies:** Task 1; can run in parallel with Task 3 after entity keys are
confirmed.

**Files likely touched:** `src/pages/[locale]/index.astro`,
`src/pages/[locale]/stories/index.astro`, `src/layouts/BaseLayout.astro`,
`src/components/StoryCard.astro`, `src/lib/ui-copy.ts`, styles as needed.

**Estimated scope:** Medium.

### Checkpoint: Narrative experience

- [x] Village map scope, themes, homepage starts, and Stories index work in both
      locales.
- [x] Search and deep links still select the same map features.
- [x] No regional content has been deleted; it is only de-emphasized by default.

### Phase 3: Review and hardening

#### Task 5: Primary-agent review and corrections

**Description:** Review all agent edits for factual overreach, bilingual parity,
accessibility, visual hierarchy, route compatibility, and project conventions.
Resolve conflicts and simplify any overbuilt implementation.

**Acceptance criteria:**

- [x] All modified large code blocks contain concise block comments where the
      project convention requires architectural context.
- [x] No CMS synchronization command appears in the implementation workflow.
- [x] No unsupported coordinate, source, opening hour, or event claim remains.
- [x] Tests and builds pass, or any unrelated baseline failure is documented.

**Verification:** `pnpm lint`, `pnpm check`, `pnpm test`,
`pnpm --filter @lafkos/studio build`, `pnpm build`, and targeted E2E tests.

**Dependencies:** Tasks 1–4.

**Files likely touched:** Any files requiring review corrections.

**Estimated scope:** Medium.

### Checkpoint: Complete

- [x] Worktree contains the complete reviewable implementation.
- [x] Main worktree and Sanity Content Lake remain untouched.
- [x] User can review the branch before any import or deployment step.

## Risks and mitigations

| Risk                                               | Impact | Mitigation                                                                       |
| -------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| Research sources disagree on coordinates and dates | High   | Use conservative copy, avoid new geometry, and keep a field-verification backlog |
| Map themes become a second, hidden taxonomy        | Medium | Use a small static thematic layer over existing categories and stable keys       |
| Homepage becomes content-heavy again               | Medium | Cap narrative starts and keep the rest behind the Stories/map index              |
| Agents edit shared files concurrently              | Medium | Assign disjoint file ownership and review the combined diff before tests         |
| Local seed changes drift from CMS                  | High   | Do not run export/import; treat this branch as an editorial review proposal      |

## Open questions for later review

- Which locations can the local community verify in the field, and who owns that
  verification process?
- Should confidence/status fields become first-class Sanity fields in a later
  schema migration?
- Which annual events have confirmed dates for the next season?
- Should the regional South Pelion layer remain in the same map or become a
  separate regional view?
