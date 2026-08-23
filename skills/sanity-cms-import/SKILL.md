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
  "category": "heritage", // heritage | architecture | sacred | nature | viewpoint | community
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
- `waypoints[].placeKey` is an optional reference to an existing Place `entityKey`. Use it when a stop is already represented by a Place; the map uses the reference to suppress a duplicate synthetic waypoint pin while preserving the waypoint in route content. Anonymous stops should omit it.

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

---

## 3. How to Import Entries & Safe Sync Workflow

### ⚠️ Critical Rule: Preventing Cloud Data Loss

1. **Live Sanity CMS is the authoritative master:** Manual edits in Sanity Studio take precedence over static files.
2. **Granular addition (Method 1) is safest:** Mutates only the single entry without risking other cloud documents.
3. **Pull before bulk seeding (Method 2):** Always pull live cloud content before exporting/replacing the seed dataset.

### Method 1: Granular Direct Import (Recommended for additions without risk of overwriting)

1. Save your entry JSON to a temporary file, e.g. `entry.json`.
2. To directly commit to Sanity without touching other entries:
   ```bash
   npx tsx scripts/import-entry.ts --file entry.json --direct
   ```
3. To validate and append to local NDJSON:
   ```bash
   npx tsx scripts/import-entry.ts --file entry.json
   ```

### Method 2: Via Local Dataset Archive (`src/data/content.ts`)

1. **MANDATORY: Always pull live cloud edits first:**
   ```bash
   pnpm studio:pull-content
   ```
   _(This pulls all live Sanity places, trails, stories, and categories into `src/data/content.ts`.)_
2. Add or edit the TypeScript object directly in `places`, `trails`, or `stories` in `src/data/content.ts`.
3. **Run the seed exporter to generate NDJSON:**
   ```bash
   pnpm studio:export-seed
   ```
   _(This writes the latest bilingual Sanity documents to `studio/data/seed-dataset.ndjson`.)_
4. **Import into Sanity Content Lake:**
   ```bash
   pnpm studio:import-seed
   ```
   _(Safe to run because cloud edits were pulled in step 1.)_

### Method 3: Via Sanity Studio UI

1. Run `pnpm studio:dev` and open `http://localhost:3333`.
2. Navigate to **Places**, **Trails**, or **Stories**.
3. Create a document in Greek (`el`), fill in the fields, and use the **Translations** menu to create its English (`en`) counterpart.

---

## 4. Keeping Data Structures in Sync

Whenever schemas or fields evolve, agents and developers MUST update all 6 boundary layers in lockstep:

1. **Contract Definition:** `src/lib/content.ts` (Zod schemas and TypeScript interfaces).
2. **Sanity Studio Schemas:** `studio/schemaTypes.ts` (Sanity `defineField` / `defineType` declarations and `isUniquePerLanguage`).
3. **Desk Structure:** `studio/structure.ts` (Filters, categories, and audit views).
4. **Seed Exporter:** `scripts/export-sanity-seed.ts` (NDJSON serializer).
5. **Entry Import CLI:** `scripts/import-entry.ts` (CLI validator and translator).
6. **Astro Adapter & Transformers:** `src/lib/sanity-transform.ts` and `src/lib/content-api.ts` (GROQ queries and object mergers).
7. **Documentation & Skill:** `docs/content-management.md` and this skill file (`skills/sanity-cms-import/SKILL.md`).
