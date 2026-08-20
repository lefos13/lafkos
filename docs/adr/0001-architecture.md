# ADR 0001: Static-first bilingual cultural guide

## Status

Accepted

## Decision

Use Astro with static output for the public Lafkos Guide, React islands only for
interactive map behavior, MapLibre GL JS for rendering, and PMTiles for a
bounded South Pelion vector archive. Keep Sanity Studio in a separate workspace
package and expose a versioned, sanitized public content contract to the site.

Greek and English are first-class routes (`/el/` and `/en/`) with localized
slugs and metadata. The public site has no visitor accounts, tracking cookies,
public submissions, or application database in v1. Geolocation is opt-in and
used only for a local map camera move.

## Context

The guide needs rich editorial pages and an interactive map while remaining
fast, inexpensive to host, accessible without WebGL, and safe for a small team
of trusted editors. A community basemap service is not an appropriate
production dependency for a packaged regional map, and content needs stronger
editorial provenance than an ad-hoc JSON API.

## Consequences

- Static pages are cacheable and resilient; detail pages do not require a live
  database or visitor authentication.
- The map remains progressively enhanced: the synchronized accessible list is
  useful when WebGL, tiles, or network access fail.
- PMTiles keeps the regional basemap bounded and self-hostable, but the archive
  must be refreshed when material OSM changes occur.
- Sanity provides editorial validation, localization, media rights, sources,
  and preview workflows, while the current seed adapter keeps development
  credential-free.
- Search and map state are intentionally limited to curated content; turn-by-
  turn navigation and fully offline basemaps remain future work.
