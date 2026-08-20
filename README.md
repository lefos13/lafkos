# Lafkos Guide

Lafkos Guide is a bilingual Greek/English cultural map for Lafkos and South
Pelion. It is a static-first Astro site with React only for the MapLibre island,
plus a separate Sanity Studio workspace for editorial content.

## Run locally

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm lint
pnpm check
pnpm test
pnpm test:e2e
pnpm build
pnpm --filter @lafkos/studio dev
```

The public site currently uses the clearly marked local seed dataset in
`src/data/content.ts`. Seed entries are demonstrative and must be replaced or
approved before launch. The site can use a regional PMTiles archive by setting
`PUBLIC_MAP_PMTILES_URL`; otherwise it falls back to the configured vector map
style. Copy `.env.example` to `.env` when configuring a deployment.

## Content workflow

The Studio package defines bilingual Place, Trail, Story, Category, and Site
Settings contracts. Set `PUBLIC_SANITY_PROJECT_ID` and
`PUBLIC_SANITY_DATASET`, then run `pnpm --filter @lafkos/studio dev` to edit
content. The public adapter remains local until the production Sanity project,
image CDN, and generated artifact publishing job are provisioned.

## Deployment shape

- Build the public package with `pnpm build` and deploy `dist/` to Cloudflare
  Pages.
- Host the bounded South Pelion PMTiles archive on an R2 custom domain with
  restrictive CORS.
- Trigger Pages builds from the Sanity publish webhook after the public adapter
  is connected.
- Keep OSM/Protomaps attribution visible and retain the privacy/security headers
  in `public/_headers`.

See [the architecture decision record](docs/adr/0001-architecture.md) for the
trade-offs behind the static site, map renderer, content boundary, and privacy
defaults.
