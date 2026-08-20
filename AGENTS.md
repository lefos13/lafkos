# Lafkos Guide — Agent Instructions & Conventions

This document provides architectural rules, content management conventions, and skill instructions for all AI agents and engineers working on **Lafkos Guide**.

---

## 1. Project Overview & Architecture

- **Public Site:** Static-first [Astro](https://astro.build/) site (`src/`) with localized bilingual routes (`/el/` and `/en/`).
- **Interactive Map:** Progressive [MapLibre GL JS](https://maplibre.org/) island with optional PMTiles support and OpenFreeMap vector basemap fallback.
- **Editorial CMS:** [Sanity Studio v3](https://www.sanity.io/) workspace package (`studio/`) using `@sanity/document-internationalization`.
- **Default Locale:** **Greek (`el`)** is the primary default locale. English (`en`) is the secondary locale. Root `/` redirects to `/el/`.
- **Content Boundary:** Astro pages consume structured domain types from `src/lib/content-api.ts` which queries Sanity when configured, falling back to `src/data/content.ts` when offline or unconfigured.

---

## 2. Content Authoring & CMS Import Skill

When asked to add, draft, update, or batch import cultural places, hiking routes, local stories, or categories:

👉 **MUST read and follow the skill:** [`skills/sanity-cms-import/SKILL.md`](skills/sanity-cms-import/SKILL.md)

### Key Rules from the Skill:

1. **Always Bilingual:** Every entry requires full Greek (`el`) and English (`en`) translations.
2. **Stable Entity Key:** Use unique lowercase kebab-case `entityKey` (e.g. `lafkos-square`, `forlidas-cafe`) matching both language documents.
3. **Mandatory Image Attribution:** Every image must provide `src` (or `externalUrl`), `alt`, `credit`, and public `license`.
4. **Mandatory Sources:** Every cultural/trail/story item must provide at least one historical citation or mapping reference in `sources`.
5. **Bounding Box:** GeoJSON coordinates `[longitude, latitude]` must be within South Pelion `[23.08, 39.04, 23.42, 39.32]`.

### Automated CLI Tooling:

- Validate and import single/batch entries:
  ```bash
  npx tsx scripts/import-entry.ts --file path/to/entry.json
  pnpm studio:import-seed
  ```
- Export local seed dataset to NDJSON:
  ```bash
  pnpm studio:export-seed
  ```

---

## 3. Data Structure Evolution & Synchronization Contract

When modifying or adding fields to content models, you **MUST** update all 7 boundary layers in lockstep:

1. **Domain Contract:** `src/lib/content.ts` (Zod schemas and TypeScript interfaces).
2. **Sanity Studio Schemas:** `studio/schemaTypes.ts` (Sanity `defineField` / `defineType` declarations, `isUniquePerLanguage`).
3. **Studio Desk Navigation:** `studio/structure.ts` (Filters, categories, difficulty views, and audit queues).
4. **Seed Exporter:** `scripts/export-sanity-seed.ts` (NDJSON serialization).
5. **Entry Import CLI:** `scripts/import-entry.ts` (CLI validator and translator).
6. **Astro Adapter & GROQ Queries:** `src/lib/sanity-transform.ts` and `src/lib/content-api.ts` (GROQ queries, document merging, Zod parsing).
7. **Skill & Docs:** `skills/sanity-cms-import/SKILL.md` and `docs/content-management.md`.

---

## 4. Verification & Quality Gates

Before finalizing changes, run the project verification suite:

```bash
pnpm lint                    # ESLint checks
pnpm check                   # Astro & TypeScript typechecking
pnpm test                    # Vitest unit & integration tests
pnpm --filter @lafkos/studio build  # Verify Sanity Studio builds cleanly
pnpm build                   # Verify static site builds cleanly
pnpm test:e2e                # Playwright end-to-end tests
```
