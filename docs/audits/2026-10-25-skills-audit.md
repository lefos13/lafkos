# Skills Audit — 2026-10-25

Branch: `skills-audit/2026-10-25`
Base: `70c16ba` (`origin/main` at audit start and end; no rebase required)
Scope: public Astro site, Sanity adapter boundary, map island, SEO/structured data, agent documentation. No Sanity datasets, `.env` files, deployments, or external submissions were touched.

## Executive summary

The site was already in good technical shape: lint, typecheck, 189 Vitest tests, 198-page build, and the strict SEO/link/payload audit all passed before changes. The audit found one real HTML-injection path in the map popup, one build-breaking optional-image assumption, incomplete `Article` authorship, an oversized late-discovered hero image, per-frame marker reconciliation, overlong titles, and missing AI/agent discovery and visible breadcrumb signals.

Seven small commits fix the high-impact, low-risk items. The largest remaining gaps are editorial: seed stories have no publication dates, many drive-route meta descriptions are thin, and the sitemap lacks hreflang alternates for translated slugs (HTML hreflang is already correct).

## Findings ranked by impact

| # | Severity | Area | Finding | Status |
| --- | --- | --- | --- | --- |
| 1 | High | Map security/correctness | MapLibre popup built `innerHTML` from unescaped CMS `title`, `summary`, image URL, category color, and link. A title with `&` already relied on the browser recovering from invalid markup; a quote or `<` could break the card or inject markup. | Fixed in `827a3ce` |
| 2 | High | Build robustness | Place detail used `place.images[0].src` unconditionally, but `transformSanityPlaces()` allows a place with no hero and no gallery. Publishing such a place would crash the static build. Trail pages also fell back to an uncredited Unsplash image. | Fixed in `2b5df22` |
| 3 | High | Structured data | All 30 built story pages emitted `Article` without `author` and `datePublished`; Google's Article guidance requires both. Author fallback added; dates remain an editorial gap. | Partially fixed in `4293f20`; dates deferred |
| 4 | High | Core Web Vitals | Homepage LCP was a CSS background image at 1920px (911,386 bytes) discovered only after the stylesheet. | Fixed in `2691451`: 960px mobile / 1280px desktop preloads |
| 5 | Medium | Core Web Vitals | Google Fonts was imported at the top of `global.css`, serializing the font request behind the main stylesheet. | Fixed in `4293f20` |
| 6 | Medium | Map performance | `map.on('render', syncMarkers)` rebuilt marker/label DOM and collisions on every animation frame during pan/zoom. | Fixed in `827a3ce`: 100ms coalescing |
| 7 | Medium | On-page SEO | 14 pages had titles above 60 characters (up to 72) because the brand suffix was always appended. | Fixed in `4293f20` with `formatPageTitle()` |
| 8 | Medium | AI SEO | No `llms.txt`, so AI agents had no generated, bilingual index of the guide. | Fixed in `b054c30` |
| 9 | Medium | SEO/schema alignment | Place, trail, and story breadcrumbs were invisible or did not match the emitted `BreadcrumbList`. | Fixed in `2b5df22` |
| 10 | Medium | Touch targets | List toggle was 23px, mobile map controls 34px, popup close 24px, filter chips ~31px. | Improved in `827a3ce` / `925d16c`; marker pins remain dense |
| 11 | Low | Typography | No font smoothing, heading balancing, or pretty body wrapping; long Greek/Latin titles could overflow tightly-sized text columns. | Fixed in `925d16c` |
| 12 | Low | Motion | Map fly/fit/scroll animations ignored `prefers-reduced-motion`; a dead `max-height` transition did nothing because the list toggled `display`. | Fixed in `827a3ce` |
| 13 | Low | Paint cost | Every hidden marker label carried `backdrop-filter: blur(4px)`. | Fixed in `827a3ce` |
| 14 | Medium | International SEO | Sitemap has no `<xhtml:link>` alternates; translated slugs (`/el/places/plateia-lafkou/` vs `/en/places/lafkos-square/`) cannot be paired by the integration's path matching. HTML hreflang already covers both locales and `x-default`. | Deferred |
| 15 | Medium | Meta descriptions | Six drive-route pages and three short place pages (Metochi in both locales, Xenonas Xromaton) have 50–67 character descriptions that omit search intent (“Measured access from Lafkos to …”). | Deferred |
| 16 | Low | Titles | `/el/places/olive-bay-chorto/` and `/en/places/olive-bay-chorto/` share the same title because the Greek title is an English brand name. | Deferred |
| 17 | Low | Configuration | `.env.example` still advertises `PUBLIC_SITE_URL=https://lafkos.guide` while canonical/robots/sitemap use `https://lafkos-guide.vercel.app` and the variable is unused. | Deferred |

## What was already sound

- Canonical URLs, `el`/`en` hreflang, `x-default`, reciprocal alternate URLs, and translated-slug switching.
- Root `/` permanent redirect is `noindex`, excluded from the sitemap, and audited.
- `robots.txt`, sitemap index/sub-sitemap coverage, internal trailing-slash link integrity, and 60KB homepage HTML budget.
- JSON-LD serialization escapes `<`, `U+2028`, and `U+2029`; `BreadcrumbList`, `TouristAttraction`, `TouristTrip`, `CollectionPage`, `WebSite`, and `Organization` graphs are structurally valid.
- Score / editorial boundaries, source citations, image credits/licenses, and bilingual content are enforced in the domain contract.
- Map remains progressively enhanced: accessible list, search, filters, keyboard cluster expansion, location opt-in, and error fallback.
- Responsive remote-image URL handling for Wikimedia, Sanity CDN, and Unsplash.

## Fixes by commit

| Commit | Change |
| --- | --- |
| `b054c30` | `feat(seo): add generated llms.txt index` — new `src/lib/llms.ts`, `src/pages/llms.txt.ts`, and coverage test. Lists every place/trail/story in both locales with absolute URLs and summaries. |
| `4293f20` | `feat(seo): tighten head metadata and article authorship` — 60-character title formatter, font stylesheet moved out of CSS import, redundant OG image aliases and stale build revision removed, Organization author fallback for stories. |
| `2691451` | `perf(home): preload responsive hero candidates` — 960px/1280px Wikimedia hero with media-specific preloads and a separate gradient overlay. |
| `2b5df22` | `fix(detail): guard optional hero images and align breadcrumbs` — place/trail hero rendered only when present, Unsplash fallback removed, visible breadcrumbs match JSON-LD. |
| `827a3ce` | `fix(map): escape popup HTML and reduce render-loop work` — `escapeHtml()` boundary, 100ms marker sync, reduced-motion durations, pressed/expanded ARIA states, singular/plural feature counts, larger controls. |
| `925d16c` | `fix(ui): polish typography, wrapping, and heading stability` — antialiasing, balanced headings, pretty body wrapping, long-token breaking. |
| `f1deaf3` | `docs(agents): add quick start, key files, and gotchas` — local workflow, duplicated origin, map worker, image-host allowlist, Studio duplication, title boundary. |

## Verification

Final verification on the branch after all changes:

| Command | Result |
| --- | --- |
| `pnpm lint` | Pass |
| `pnpm check` | 0 errors, 0 warnings, 0 hints (73 files) |
| `pnpm test` | 20 files, 189 tests passed |
| `pnpm build` | 198 pages built; `/llms.txt` emitted |
| `pnpm audit:seo` | 198 HTML pages, 196 indexable, 196 sitemap URLs, 5,219 internal links, 0 violations |
| `pnpm --filter @lafkos/studio build` | Pass |
| Browser smoke (system Chrome, 1280px and 320/390px) | No console errors; no horizontal overflow on home, long place, long story, trail, or map; popup title with `&` rendered correctly; filter `aria-pressed` toggled; list `aria-expanded` toggled; cluster expansion moved focus to a leaf marker; reduced-motion media query matched |
| Homepage payload | Greek 61,340 bytes (59.9 KiB), English 54,809 bytes; ceiling 61,440 bytes |
| Hero assets | 960px = 237,491 bytes; 1280px = 415,972 bytes; both HTTP 200 |

`pnpm test:e2e` was not run: the installed Playwright version expects browser revision 1234 while only 1248 is cached, and downloading a browser was outside the offline/no-external-submission constraint. The system-Chrome smoke above exercises the changed map, breadcrumb, image, and responsive paths.

## Deferred recommendations

1. **Backfill story publication dates and authors in Sanity.** `author` now falls back to the Organization, but `datePublished` is still absent on all 15 stories, so `Article` is not eligible for Google article rich results. Add real dates in the CMS; do not synthesize them.
2. **Add sitemap hreflang with a translation-aware mapping.** The standard integration groups by path, not by translated slug. Implement a custom sitemap endpoint or `serialize` hook that maps entity pairs; keep it consistent with the already-correct HTML hreflang.
3. **Compress and self-host the hero.** 1280px is 416KB and 960px is 237KB as Wikimedia JPEGs. Local AVIF/WebP candidates would materially improve LCP; image rights/credit must be preserved.
4. **Reduce the map payload.** `MapExplorer` is ~1.1MB and the MapLibre worker ~460KB. Profile whether PMTiles protocol setup and style sanitization can be split from the initial island chunk, or lazy-loaded after first paint.
5. **Write editorial SEO titles/descriptions for short entities and drive routes.** Village pages currently rely on name + brand; drive routes and several short place pages use terse descriptions. These need content, not templates.
6. **Unify the production origin.** Remove stale `PUBLIC_SITE_URL=https://lafkos.guide` or make it the single source for `astro.config.mjs`, `src/lib/urls.ts`, `robots.txt`, tests, and `vercel.json`. Mixing domains risks cross-host canonicals after a domain migration.
7. **Stop inventing media rights in the Sanity transform.** `transformSanityImage()` defaults missing credit to “Lafkos Guide Archive” and license to “CC BY-SA 4.0”. Require these fields in Studio or surface an explicit unknown state instead of asserting a license.
8. **Review marker hit targets.** Marker pins are 35px and waypoints ~18px. Larger transparent hit areas need anchor-aware handling to avoid overlapping neighboring markers.
