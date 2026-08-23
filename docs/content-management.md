# Lafkos Guide — Content Management & Editorial Architecture

This document outlines the content architecture, Sanity Studio setup, localization model, editorial verification lifecycle, and build integration for **Lafkos Guide**.

---

## 1. Overview & Architecture

The content pipeline separates editorial workflows from public static delivery:

```
┌─────────────────────────────────────────────────────────────┐
│                    Sanity Content Lake                      │
│ (Places, Trails, Stories, Categories, Site Settings, Media) │
└──────────────────────────────┬──────────────────────────────┘
                               │ GROQ Queries
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Astro Content API Adapter                   │
│   - Fetches from Sanity when configured                     │
│   - Falls back to local seed dataset seamlessly             │
│   - Transforms bilingual docs & validates via Zod contracts │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Public Static Site                     │
│    Bilingual pages (/el/ & /en/) + Offline-first Map Engine │
└─────────────────────────────────────────────────────────────┘
```

- **Editorial Workspace (`studio/`):** A standalone Sanity Studio (`@lafkos/studio`) with a tailored desk structure, bilingual document internationalization, image attribution fields, and editorial audit views.
- **Content Boundary (`src/lib/content-api.ts`):** Astro pages query unified domain models (`Place`, `Trail`, `Story`, `Category`) without coupling to CMS or database specifics.
- **CMS Authority:** Sanity CMS is the authoritative production content lake. `src/data/content.ts` serves as the initial offline seed and development fallback.
- **Granular Synchronization & Webhook Protection:** Local additions/updates should use granular single-document mutations (`scripts/import-entry.ts --direct`). Bulk dataset re-imports (`pnpm studio:import-seed`) trigger multiple transaction batches that fire rapid bursts of Vercel production deployment webhooks and must NEVER be performed without explicit user verification.
---

## 2. Content Schemas & Field Contracts

All Sanity schemas in `studio/schemaTypes.ts` enforce the TypeScript contracts in `src/lib/content.ts`.

### 1. Place (`place`)

Represents cultural landmarks, historic buildings, squares, cafes, museums, churches, viewpoints, and community spaces.

- **Entity Key (`entityKey`):** Unique identifier shared across language translations (e.g. `lafkos-square`, `forlidas-cafe`).
- **Language (`language`):** `'el'` or `'en'`, managed by `@sanity/document-internationalization`.
- **Title, Eyebrow, Slug, Summary, Body:** Localized editorial text.
- **Category (`category`):** Enum (`heritage`, `architecture`, `sacred`, `nature`, `viewpoint`, `community`).
- **Coordinate (`coordinate`):** `geopoint` (`lat`, `lng`) for primary map marker.
- **Map Camera Anchor (`mapAnchor`):** Optional override `geopoint` for centering camera views.
- **Hero & Gallery Images:** Supports uploaded Sanity assets or external URLs (e.g. Wikimedia Commons) with mandatory `alt`, `credit`, and `license` fields.
- **Practical notes (`practical`):** Opening hours, access details, admission fees, or seasonality.
- **Sources & Citations (`sources`):** Array of labeled URLs for historical provenance.
- **Featured (`featured`):** Boolean highlighting top spots on the home screen.
- **Seed Flag (`isSeed`):** Boolean marking entries that require on-the-ground local verification before launch.

### 2. Trail (`trail`)

Represents hiking routes, road routes, mixed access routes, cobbled kalderimi paths, and mountain trails.

- **Entity Key & Language:** Shared key across translations.
- **Route Type (`routeType`):** Optional discriminator with values `hiking`, `drive`, or `mixed`; an absent value is treated as `hiking` for backwards compatibility. `drive` describes a route followed by car, while `mixed` combines driving with a walk-in.
- **Geometry (`geometry`):** A single `LineString` represented by an array of coordinates (`lng`, `lat`) describing the complete route. Mixed routes concatenate the drive and walk-in segments into that one line; they do not use `MultiLineString` or separate per-segment geometry.
- **Waypoints (`waypoints`):** Intermediate photographed points along the path with titles, geopoints, and images. For a mixed route, include a waypoint at the handover (for example, “Τέλος ασφάλτου — στάθμευση”) and describe the walk-in distance in the body and safety notes. A waypoint may set `placeKey` to an existing Place `entityKey`; that reference suppresses a duplicate synthetic map pin while retaining the stop on the route page.
- **Metrics:** `distanceMeters`, `durationMinutes`, `elevationGainMeters`, `difficulty` (`easy`, `moderate`, `demanding`). For `drive` and `mixed` routes, `difficulty` describes road/access character rather than physical hiking fitness, and `elevationGainMeters` records the route elevation change even when it is primarily a drive.
- **Surface & Safety:** Localized descriptions of path or road condition (e.g. kalderimi, dirt road, asphalt) and equipment/safety advice. For drives, explain road character, surfaces, clearance or caution points, and any access uncertainty; for mixed routes, state the handover and walk-in conditions explicitly.
- **GPX File (`gpx`):** Optional downloadable track file.
- **Verification & Status:** `lastVerifiedAt` date, `featured`, and `isSeed`.

### 3. Story (`story`)

Represents cultural oral histories, historical background, traditions, and artisan craft articles.

- **Entity Key & Language:** Shared key across translations.
- **Title, Eyebrow, Slug, Summary, Body:** Localized article copy.
- **Hero Image:** Featured image with full attribution.
- **Related Keys (`relatedKeys`):** Links to places or trails referenced in the narrative.
- **Featured & Seed Flags:** Curation and audit controls.

### 4. Category (`category`)

Taxonomy definitions with map color coding and icons (`heritage`, `architecture`, `sacred`, `nature`, `viewpoint`, `community`, `trail`).

### 5. Site Settings (`siteSettings`)

Singleton document configuring global metadata, hero text, warning notices, and footer copy for both Greek and English.

---

## 3. Sanity Studio Desk Structure & Editorial QA

The Studio desk (`studio/structure.ts`) organizes content for editors:

1. **Places:** All Places, Places by Category (Heritage, Architecture, Sacred, etc.), Featured Places, and Pending Verification Seeds.
2. **Trails:** All Trails, Trails by Difficulty (Easy, Moderate, Demanding), Featured Trails, and Pending Verification Seeds.
3. **Stories:** All Stories, Featured Stories, and Pending Verification Seeds.
4. **Categories:** Taxonomy definitions.
5. **Editorial Audit & QA:** Dedicated review views to audit all unverified seed entries across the entire dataset.
6. **Site Settings:** Global singleton editor for site copy and advisories.

---

## 4. Quick Start & Editorial Commands

### Running Sanity Studio Locally

```bash
# 1. Provide project credentials in .env or environment
PUBLIC_SANITY_PROJECT_ID=your-project-id
PUBLIC_SANITY_DATASET=production

# 2. Launch Sanity Studio dev server
pnpm studio:dev
```

The studio runs at `http://localhost:3333`.

### Pulling Live Cloud Content & Safe Bidirectional Sync

To prevent overwriting manual edits made in Sanity Studio:

```bash
# 1. ALWAYS pull live cloud edits first before local bulk work:
pnpm studio:pull-content

# 2. Export local seed data to NDJSON:
pnpm studio:export-seed

# 3. Import the updated seed dataset into Sanity:
pnpm studio:import-seed
```

### Building & Deploying the Studio

```bash
# Build the Studio static bundle
pnpm studio:build

# Deploy to Sanity managed hosting (e.g. https://lafkos.sanity.studio)
pnpm studio:deploy
```

---

## 5. Public Website Build & Publishing Automation

1. **Local & CI Builds:** Astro automatically checks for `PUBLIC_SANITY_PROJECT_ID`. If present, it pulls live published content from Sanity; otherwise, it builds with the embedded seed archive.
2. **Production Deployment & Webhook Lifecycle:**
   - A Sanity Webhook (under _Project Settings -> API -> Webhooks_) triggers a Vercel Deploy Hook when documents are published or updated.
   - **Single Document Edits:** Publishing or updating a document in Sanity Studio or running `scripts/import-entry.ts --direct` triggers exactly 1 webhook and 1 Vercel deployment.
   - **Bulk Imports:** Running full dataset imports (`pnpm studio:import-seed`) streams documents across multiple transaction batches, triggering multiple deployments. Full dataset imports must never be triggered automatically by AI agents without prior user verification.
