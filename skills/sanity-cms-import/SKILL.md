---
name: sanity-cms-import
description: Use when adding, drafting, validating, or batch importing new cultural places, hiking trails, stories, or categories into the Lafkos Guide Sanity CMS or seed dataset.
---

# Sanity CMS Import & Content Authoring Skill

This skill guides AI agents and engineers in drafting, validating, and importing new cultural, architectural, trail, and historical content into **Lafkos Guide**.

---

## 1. Editorial & Data Invariants

Every entry authored for Lafkos Guide must satisfy these core invariants:

1. **Bilingual Completeness:** Every entry must provide complete, culturally accurate **Greek (`el`)** and **English (`en`)** translations. Never mix languages or leave placeholder translations.
2. **Stable Entity Key (`entityKey`):** Unique lowercase alphanumeric kebab-case identifier (e.g. `chatzini-bakery`, `monastery-agios-athanasios`, `trail-lafkos-milina`) shared across Greek and English document pairs.
3. **Image Attribution & License:** Every image MUST include:
   - `src` (or `externalUrl`): Valid HTTPS URL (e.g. Wikimedia Commons).
   - `alt`: Descriptive accessibility alt text in Greek/English.
   - `credit`: Photographer or archive name.
   - `license`: Public license (e.g. `CC BY-SA 4.0`, `Public Domain`, `CC BY 3.0`).
4. **Sources & Provenance:** Every place, trail, and story MUST include at least one verified citation in `sources: [{ label: string, url: string }]` (e.g. Ministry of Culture, OpenStreetMap, Local Heritage Archive, Topoguide).
5. **Geographical Bounds:** Coordinates must be inside the South Pelion bounding box `[23.08, 39.04, 23.42, 39.32]` in standard GeoJSON `[longitude, latitude]` coordinate order (e.g. `[23.24646, 39.17751]`).
6. **Mandatory Final CMS Synchronization:** **Sanity CMS is the authoritative editorial content lake.** Any content added or updated in `src/data/content.ts` MUST immediately be exported via `pnpm studio:export-seed` and synced to Sanity via `pnpm studio:import-seed` (or imported directly via `scripts/import-entry.ts --direct`). Un-exported local edits are incomplete.

---

## 2. Schema Contracts

### A. Place (`kind: "place"`)

```json
{
  "kind": "place",
  "entityKey": "example-monument",
  "slug": { "el": "paradeigma-mnimeiou", "en": "example-monument" },
  "title": { "el": "Παράδειγμα Μνημείου", "en": "Example Monument" },
  "eyebrow": { "el": "Ιστορικό αξιοθέατο", "en": "Historic landmark" },
  "summary": {
    "el": "Σύντομη περιγραφή 1-2 προτάσεων.",
    "en": "Short 1-2 sentence summary."
  },
  "body": {
    "el": ["Πρώτη παράγραφος αναλυτικού κειμένου.", "Δεύτερη παράγραφος."],
    "en": ["First paragraph of in-depth article.", "Second paragraph."]
  },
  "category": "heritage", // heritage | architecture | sacred | nature | viewpoint | community | stay
  "geometry": {
    "type": "Point",
    "coordinates": [23.24646, 39.17751]
  },
  "mapAnchor": [23.24646, 39.17751], // optional camera focus override
  "images": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/...jpg",
      "alt": "Περιγραφή εικόνας",
      "credit": "Photo by Example (Wikimedia Commons)",
      "license": "CC BY-SA 4.0"
    }
  ],
  "practical": {
    "el": ["Ελεύθερη είσοδος όλο το 24ωρο"],
    "en": ["Free 24/7 access"]
  },
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // optional; https YouTube URL only (watch / youtu.be / shorts / embed)
  "sources": [{ "label": "Υπουργείο Πολιτισμού", "url": "http://listedmonuments.culture.gr/" }],
  "featured": false,
  "isSeed": true
}
```

### B. Trail (`kind: "trail"`)

```json
{
  "kind": "trail",
  "entityKey": "example-kalderimi-trail",
  "slug": { "el": "monopati-paradeigma", "en": "example-trail" },
  "title": { "el": "Μονοπάτι Παράδειγμα", "en": "Example Trail" },
  "eyebrow": { "el": "Πεζοπορική διαδρομή", "en": "Hiking trail" },
  "summary": { "el": "Περιγραφή διαδρομής.", "en": "Trail summary." },
  "body": {
    "el": ["Αναλυτικές οδηγίες και περιγραφή."],
    "en": ["Detailed trail description and milestones."]
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [23.24646, 39.17751],
      [23.2471, 39.1782],
      [23.2485, 39.1795]
    ]
  },
  "routeType": "hiking", // hiking (default) | drive | mixed
  "distanceMeters": 3200,
  "durationMinutes": 60,
  "elevationGainMeters": 140,
  "difficulty": "easy", // easy | moderate | demanding
  "surface": { "el": "Καλντερίμι και χωματόδρομος", "en": "Cobblestone and dirt path" },
  "safety": {
    "el": ["Πάρτε νερό και καπέλο το καλοκαίρι"],
    "en": ["Bring water and sun protection in summer"]
  },
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // optional; same rules as places
  "waypoints": [
    {
      "title": { "el": "Κρήνη στην αφετηρία", "en": "Trailhead fountain" },
      "coordinate": [23.24646, 39.17751],
      "placeKey": "lafkos-square", // optional existing Place entityKey; suppresses a duplicate map pin
      "image": {
        "src": "https://upload.wikimedia.org/...jpg",
        "alt": "Κρήνη",
        "credit": "Photographer",
        "license": "CC BY-SA 4.0"
      }
    }
  ],
  "sources": [{ "label": "Pelion Routes", "url": "https://pelionroutes.com/" }],
  "featured": false,
  "isSeed": true
}
```

#### Route type and access rules

- `routeType` accepts `hiking`, `drive`, or `mixed`. Omit it for ordinary hiking routes; an absent value defaults to `hiking` so existing entries need no backfill.
- `drive` routes are followed by car. Keep the required `difficulty`, `elevationGainMeters`, and `safety` fields, but interpret them as road/access character, elevation change, and driving hazards rather than hiking fitness. Describe asphalt, dirt, clearance, uncertain surfaces, missed turn-offs, or other practical cautions in `surface` and `safety`.
- `mixed` routes combine a drive and a walk-in in one concatenated `LineString`. Do not use `MultiLineString` or separate per-segment geometry. Add a waypoint at the handover (for example, “Τέλος ασφάλτου — στάθμευση”) and state the walk-in distance and conditions in `body` and `safety`.

#### Optional video (`videoUrl`)

Both places and trails may carry a single optional `videoUrl` (https YouTube URL in `watch`, `youtu.be`, `shorts`, or `embed` form). It is **not localized** — both language documents share the same URL, so set it on either translation and it syncs across. Detail pages render it as a privacy-enhanced `youtube-nocookie` embedded player (places: after the practical notes; trails: before the waypoint list). The production CSP allowlists only `www.youtube-nocookie.com`, so other embed hosts will not render.

### C. Story (`kind: "story"`)

```json
{
  "kind": "story",
  "entityKey": "example-tradition-story",
  "slug": { "el": "istoria-paradosis", "en": "tradition-story" },
  "title": { "el": "Ιστορία του Τόπου", "en": "Local History Story" },
  "eyebrow": { "el": "Προφορική παράδοση", "en": "Oral history" },
  "summary": { "el": "Σύνοψη της ιστορίας.", "en": "Summary of story." },
  "body": {
    "el": ["Κείμενο ιστορίας...", "Δεύτερη παράγραφος..."],
    "en": ["Story text...", "Second paragraph..."]
  },
  "event": {
    "month": 8,
    "dayStart": 14,
    "dayEnd": 16,
    "whenLabel": { "el": "14–16 Αυγούστου", "en": "14–16 August" }
  },
  "image": {
    "src": "https://upload.wikimedia.org/...jpg",
    "alt": "Ιστορική φωτογραφία",
    "credit": "Archive",
    "license": "Public Domain"
  },
  "relatedKeys": ["example-monument"],
  "sources": [{ "label": "Πολιτιστικός Σύλλογος", "url": "https://lafkos.gr/" }],
  "featured": false,
  "isSeed": true
}
```

The optional `event` object describes a story connected to a recurring or dated event. `month` is required and must be `1`–`12`; `dayStart` and `dayEnd`, when present, must be `1`–`31`, and `dayEnd` must be greater than or equal to `dayStart`. `whenLabel` is a required localized display string. Stories without `event` remain valid, so existing content requires no backfill.

### D. Optional Editorial SEO & Attribution Metadata (All Kinds)

Places, Trails, and Stories may optionally specify editorial SEO, publication dates, and author attribution:

```json
{
  "seo": {
    "el": {
      "title": "Προσαρμοσμένος τίτλος SEO (έως 70 χαρακτήρες)",
      "description": "Προσαρμοσμένη περιγραφή για μηχανές αναζήτησης (έως 320 χαρακτήρες).",
      "socialImage": {
        "src": "https://upload.wikimedia.org/...jpg",
        "alt": "Περιγραφή εικόνας κοινωνικών δικτύων",
        "credit": "Φωτογράφος",
        "license": "CC BY-SA 4.0"
      }
    },
    "en": {
      "title": "Custom SEO Title (up to 70 chars)",
      "description": "Custom search snippet description (up to 320 chars)."
    }
  },
  "publishedAt": "2026-08-20", // ISO YYYY-MM-DD publication date
  "modifiedAt": "2026-08-22", // ISO YYYY-MM-DD last modified date
  "author": {
    "el": "Ομάδα Λαύκου",
    "en": "Lafkos Guide Team"
  }
}
```

All fields are backwards-compatible and optional. In Sanity Studio, `seoTitle`, `seoDescription`, `socialImage`, `publishedAt`, `modifiedAt`, and `author` live on each translated document matching the language-per-document model.

---

## 3. How to Import Entries & Safe Sync Workflow

### ⚠️ Critical Rules: Cloud Master, Webhook Safety & Deployment Limits

1. **Live Sanity CMS is the authoritative master:** Manual edits in Sanity Studio take precedence over static files.
2. **STRICT BAN on Unverified Bulk Imports:** **NEVER** run bulk dataset imports (`pnpm studio:import-seed` or `sanity dataset import`) without explicit prior user confirmation. Bulk imports stream across multiple chunks and trigger bursts of Vercel production deployment webhooks.
3. **Granular Single-Document Imports Only:** Use targeted granular imports (`scripts/import-entry.ts --direct`) for single place/trail/story additions.
4. **Multi-Import Threshold Notification:** If a task requires more than 1 or 2 direct document imports, the agent **MUST notify the user and obtain explicit acceptance before proceeding**, explaining that each direct mutation fires a deployment webhook.

### Method 1: Granular Direct Import (Default & Safest)

1. Save your entry JSON to a temporary file, e.g. `entry.json`.
2. To directly commit to Sanity (only for 1 or 2 entities, or after user confirmation):
   ```bash
   npx tsx scripts/import-entry.ts --file entry.json --direct
   ```
3. To validate and append to local NDJSON:
   ```bash
   npx tsx scripts/import-entry.ts --file entry.json
   ```

### Method 2: Via Local Dataset Archive (Bulk Re-seed REQUIRES User Approval)

1. **MANDATORY: Always pull live cloud edits first:**
   ```bash
   pnpm studio:pull-content
   ```
   _(This pulls all live Sanity places, trails, stories, and categories into `src/data/content.ts`.)_
2. Add or edit the TypeScript object in `src/data/content.ts`.
3. **Run the seed exporter to generate NDJSON:**
   ```bash
   pnpm studio:export-seed
   ```
4. **Import into Sanity Content Lake (ONLY with explicit user authorization):**
   ```bash
   pnpm studio:import-seed
   ```

### Method 3: Via Sanity Studio UI

1. Run `pnpm studio:dev` and open `http://localhost:3333`.
2. Navigate to **Places**, **Trails**, or **Stories**.
3. Create a document in Greek (`el`), fill in the fields, and use the **Translations** menu to create its English (`en`) counterpart.

---

## 4. Keeping Data Structures in Sync

Whenever schemas or fields evolve, agents and developers MUST update all 7 boundary layers in lockstep:

1. **Contract Definition:** `src/lib/content.ts` (Zod schemas and TypeScript interfaces).
2. **Sanity Studio Schemas:** `studio/schemaTypes.ts` (Sanity `defineField` / `defineType` declarations and `isUniquePerLanguage`).
3. **Desk Structure:** `studio/structure.ts` (Filters, categories, and audit views).
4. **Seed Exporter:** `scripts/export-sanity-seed.ts` (NDJSON serializer).
5. **Entry Import CLI:** `scripts/import-entry.ts` (CLI validator and translator).
6. **Astro Adapter & Transformers:** `src/lib/sanity-transform.ts` and `src/lib/content-api.ts` (GROQ queries and object mergers).
7. **Documentation & Skill:** `docs/content-management.md` and this skill file (`skills/sanity-cms-import/SKILL.md`).
