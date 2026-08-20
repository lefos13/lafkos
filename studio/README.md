# Lafkos Content Studio (`@lafkos/studio`)

The editorial content studio for **Lafkos Guide**, built with Sanity Studio v3 and `@sanity/document-internationalization`.

## Features

- **Bilingual Internationalization:** Native Greek (`el`) and English (`en`) side-by-side editing.
- **Custom Desk Structure:** Organized by content types, categories, difficulty levels, and editorial verification queues.
- **Editorial Audit Views:** Quick access to unverified seed items, featured content, and singleton site settings.
- **Geopoint & Map Tools:** Point, anchor, and line coordinates for cultural landmarks and hiking routes.
- **Attribution & Rights Management:** Mandatory photo credit, license, and historical source links.

## Quick Start

1. Set your Sanity project credentials in `.env` (or pass as environment variables):

   ```bash
   PUBLIC_SANITY_PROJECT_ID=your-project-id
   PUBLIC_SANITY_DATASET=production
   ```

2. Start the local studio development server:

   ```bash
   pnpm dev
   # or from project root:
   pnpm studio:dev
   ```

3. Open `http://localhost:3333` in your browser.

## Seeding & Exporting Dataset

The studio includes a pre-generated dataset containing all 98 curated bilingual documents:

```bash
# Export the latest local content archive to NDJSON
pnpm export-seed

# Import the dataset into your Sanity project
pnpm import-seed
```

## Build and Deploy

```bash
# Build the Studio production bundle
pnpm build

# Deploy to Sanity-hosted Studio domain (e.g. https://lafkos.sanity.studio)
pnpm deploy
```
