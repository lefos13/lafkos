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
- **Graceful Fallback:** If `PUBLIC_SANITY_PROJECT_ID` is unset or unavailable during development, the site runs against the vetted local seed dataset in `src/data/content.ts`.

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

Represents hiking routes, cobbled kalderimi paths, and mountain trails.

- **Entity Key & Language:** Shared key across translations.
- **Geometry (`geometry`):** Array of coordinates (`lng`, `lat`) describing the line path.
- **Waypoints (`waypoints`):** Intermediate photographed points along the path with titles, geopoints, and images.
- **Metrics:** `distanceMeters`, `durationMinutes`, `elevationGainMeters`, `difficulty` (`easy`, `moderate`, `demanding`).
- **Surface & Safety:** Localized descriptions of path condition (e.g. kalderimi, dirt road) and equipment/safety advice.
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

### Seeding Sanity from the Local Archive

To populate a fresh Sanity dataset with the full curated Lafkos archive (98 bilingual documents):

```bash
# Export the latest seed data to NDJSON
pnpm studio:export-seed

# Import the dataset into your Sanity project
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
2. **Production Deployment:**
   - Configure a webhook in Sanity (under _Project Settings -> API -> Webhooks_) to trigger a Cloudflare Pages deployment upon document publication.
   - Set environment variables `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` in Cloudflare Pages.
