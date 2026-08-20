# Lafkos Guide

Lafkos Guide is a bilingual Greek/English cultural map and local archive for Lafkos and South
Pelion. It is a static-first Astro site with React only for the MapLibre island,
plus a dedicated Sanity Studio workspace for editorial content management.

## Run locally

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm lint                     # Lint codebase
pnpm check                    # Typecheck Astro and TypeScript
pnpm test                     # Run Vitest unit & integration tests
pnpm test:e2e                 # Run Playwright end-to-end tests
pnpm build                    # Build static site for production
pnpm studio:dev               # Start local Sanity Studio on localhost:3333
pnpm studio:build             # Build Sanity Studio bundle
pnpm studio:export-seed       # Export latest curated archive to Sanity NDJSON
pnpm studio:import-seed       # Import seed NDJSON into Sanity Content Lake
```

## Content & Editorial Workflow

The content pipeline connects Sanity Studio with Astro through a unified adapter boundary:

1. **Editorial Studio:** Run `pnpm studio:dev` with `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` configured. The Studio provides structured editing for Places, Trails, Stories, Categories, and Site Settings, with bilingual translation management and editorial verification queues.
2. **Seeding:** Run `pnpm studio:export-seed` and `pnpm studio:import-seed` to populate a fresh Sanity dataset with all 98 bilingual records.
3. **Public Adapter:** The site queries Sanity when credentials are present and automatically falls back to the embedded seed dataset in `src/data/content.ts` when running offline or unconfigured.

For detailed editorial contracts and schemas, see [Content Management Documentation](docs/content-management.md).

## Deployment Shape

- Build the public package with `pnpm build` and deploy `dist/` to Cloudflare Pages.
- Host the bounded South Pelion PMTiles archive on an R2 custom domain with restrictive CORS.
- Trigger Cloudflare Pages builds from a Sanity publish webhook.
- Keep OSM/Protomaps attribution visible and retain security headers in `public/_headers`.

See [ADR 0001](docs/adr/0001-architecture.md) for architectural decisions and trade-offs.
