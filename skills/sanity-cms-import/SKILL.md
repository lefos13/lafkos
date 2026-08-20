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
  "isSeed": false
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
  "isSeed": false
}
```

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
  "isSeed": false
}
```

---

## 3. How to Import Entries

### Method 1: Via Import Helper CLI (Recommended for automated/batch addition)

1. Save your entry JSON to a temporary file, e.g. `entry.json`.
2. Run the import tool:
   ```bash
   # Validate and append to studio/data/seed-dataset.ndjson
   npx tsx scripts/import-entry.ts --file entry.json

   # Re-sync into live Sanity Content Lake
   pnpm studio:import-seed
   ```
3. To directly commit to Sanity over the API (when `SANITY_AUTH_TOKEN` is set):
   ```bash
   npx tsx scripts/import-entry.ts --file entry.json --direct
   ```

### Method 2: Via Local Dataset Archive (`src/data/content.ts`)

1. Add the TypeScript object directly to `places`, `trails`, or `stories` in `src/data/content.ts`.
2. Run the seed exporter:
   ```bash
   pnpm studio:export-seed
   ```
3. Import into Sanity:
   ```bash
   pnpm studio:import-seed
   ```

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
