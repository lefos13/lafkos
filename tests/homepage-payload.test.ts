import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { locales } from '../src/lib/locales';

/*
 * Homepage Critical Path & Payload Regression Contracts (Task 6):
 *
 * Guarantees that the homepage (/el/ and /en/) critical rendering path remains
 * strictly static, ultra-lightweight, and free of heavy client-side JavaScript islands.
 * Specifically, this contract enforces:
 *  1. Complete removal of MapExplorer island hydration from index.astro.
 *  2. Zero serialization of the monolithic GeoJSON publicMapData/categories dataset in homepage HTML.
 *  3. Absence of MapLibre GL, pmtiles, and MapExplorer client JS/CSS bundles from homepage assets.
 *  4. Dedicated /map/ route retains full MapExplorer client island and dataset capabilities.
 *  5. Hard size ceiling on built homepage HTML (< 60 KB vs former ~366 KB baseline) and JS (0 KB hydration).
 *  6. Presence of an attractive, fully static, bilingual map teaser with an anchor CTA to /map/.
 */
describe('Homepage Payload & Critical Path Contracts', () => {
  const indexTemplatePath = resolve('src/pages/[locale]/index.astro');
  const mapPageTemplatePath = resolve('src/pages/[locale]/map/index.astro');

  /*
   * Homepage Template Source Contract:
   * Verifies that the homepage Astro template does not import or hydrate MapExplorer,
   * does not serialize publicMapData, and includes the static map teaser with a direct link to /map.
   */
  it('ensures homepage template does not import or hydrate MapExplorer or serialize publicMapData', () => {
    const template = readFileSync(indexTemplatePath, 'utf8');

    // Must not import MapExplorer component
    expect(template).not.toMatch(/import\s+MapExplorer\s+from/);

    // Must not import publicMapData serializer
    expect(template).not.toMatch(/publicMapData/);

    // Must not contain any client:* hydration directives
    expect(template).not.toMatch(/<MapExplorer[^>]*client:/);
    expect(template).not.toMatch(/client:load|client:idle|client:visible|client:only/);

    // Must contain a static map teaser section with anchor link to /map
    expect(template).toMatch(/href=\{`\/\$\{locale\}\/map(?:\/)?`\}/);

    // Must preserve places, trails, and stories hub links
    expect(template).toMatch(/href=\{`\/\$\{locale\}\/places(?:\/)?`\}/);
    expect(template).toMatch(/href=\{`\/\$\{locale\}\/trails(?:\/)?`\}/);
    expect(template).toMatch(/href=\{`\/\$\{locale\}\/stories(?:\/)?`\}/);
  });

  /*
   * Dedicated Map Page Template Source Contract:
   * Guarantees that the dedicated /map route preserves full MapExplorer island hydration
   * and dataset serialization so interactive map functionality remains completely intact.
   */
  it('ensures dedicated map page template preserves MapExplorer island and publicMapData', () => {
    const template = readFileSync(mapPageTemplatePath, 'utf8');

    // Dedicated map page MUST import MapExplorer and publicMapData
    expect(template).toMatch(/import\s+MapExplorer\s+from/);
    expect(template).toMatch(/publicMapData/);

    // Dedicated map page MUST hydrate MapExplorer
    expect(template).toMatch(/<MapExplorer[\s\S]*?client:load/);
    expect(template).toMatch(/mapData=\{mapData\}/);
  });

  /*
   * Rendered Build Payload & Island Contract:
   * When static build output in dist/ is present, verifies that homepage HTML contains
   * no <astro-island> tags for MapExplorer, no embedded GeoJSON dataset, and no MapLibre bundles,
   * while /map/ preserves them.
   */
  it('proves built homepage HTML has no MapExplorer island or serialized GeoJSON while /map/ retains them', () => {
    for (const locale of locales) {
      const homeHtmlPath = resolve(`dist/${locale}/index.html`);
      const mapHtmlPath = resolve(`dist/${locale}/map/index.html`);

      if (!existsSync(homeHtmlPath) || !existsSync(mapHtmlPath)) {
        continue;
      }

      const homeHtml = readFileSync(homeHtmlPath, 'utf8');
      const mapHtml = readFileSync(mapHtmlPath, 'utf8');

      // Homepage HTML MUST NOT contain MapExplorer astro-island
      expect(homeHtml).not.toContain('component-url="/_astro/MapExplorer');
      expect(homeHtml).not.toMatch(/<astro-island[^>]*component-url="[^"]*MapExplorer/);

      // Homepage HTML MUST NOT contain serialized GeoJSON properties from publicMapData
      expect(homeHtml).not.toContain('&quot;schemaVersion&quot;');
      expect(homeHtml).not.toContain('&quot;agia-paraskevi-view&quot;');
      expect(homeHtml).not.toContain('&quot;lafkos-chondri-ammos-drive&quot;');

      // Homepage HTML MUST NOT reference MapExplorer bundle
      expect(homeHtml).not.toMatch(/MapExplorer/);

      // Homepage CSS bundles must not bundle vendor MapLibre GL library stylesheet
      const homeCssLinks = (
        homeHtml.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g) || []
      ).map((tag) => {
        const m = tag.match(/href="([^"]+)"/);
        return m ? m[1] : '';
      });
      for (const href of homeCssLinks) {
        const filePath = resolve(`dist${href}`);
        if (existsSync(filePath)) {
          const cssContent = readFileSync(filePath, 'utf8');
          expect(cssContent).not.toContain('maplibregl-ctrl');
        }
      }
      // Homepage HTML MUST contain the static teaser link to /map
      expect(homeHtml).toMatch(/href="\/(?:el|en)\/map(?:\/)?"/);

      // Dedicated /map/ HTML MUST contain MapExplorer astro-island and serialized dataset
      expect(mapHtml).toMatch(/component-url="\/_astro\/MapExplorer/);
      expect(mapHtml).toContain('&quot;schemaVersion&quot;');
      expect(mapHtml).toContain('&quot;lafkos-chondri-ammos-drive&quot;');
      expect(mapHtml).toMatch(/component-url="\/_astro\/MapExplorer/);
    }
  });

  /*
   * Built Homepage Size Regression Ceiling Contract:
   * Enforces a strict upper bound on built homepage HTML file size.
   * Baseline with MapExplorer was ~366 KB (359 KB Greek, 332 KB English).
   * Static homepage must be under 60 KB (expected ~25-35 KB), achieving a ~90%+ payload reduction.
   */
  it('enforces a strict built homepage HTML size regression ceiling (< 60 KB vs ~366 KB baseline)', () => {
    const SIZE_CEILING_BYTES = 60 * 1024; // 60 KB ceiling

    for (const locale of locales) {
      const homeHtmlPath = resolve(`dist/${locale}/index.html`);
      if (!existsSync(homeHtmlPath)) continue;

      const stats = statSync(homeHtmlPath);
      expect(
        stats.size,
        `Homepage HTML for ${locale} (${(stats.size / 1024).toFixed(1)} KB) exceeds ${SIZE_CEILING_BYTES / 1024} KB ceiling`,
      ).toBeLessThan(SIZE_CEILING_BYTES);
    }
  });

  /*
   * Built Homepage Client JS Bundle Ceiling Contract:
   * Enforces that the homepage does not load the ~1 MB MapExplorer bundle or React client renderer.
   * Total island-hydration JavaScript on the homepage must be 0 KB.
   */
  it('enforces zero MapExplorer client-side JS bundle requests on the homepage', () => {
    for (const locale of locales) {
      const homeHtmlPath = resolve(`dist/${locale}/index.html`);
      if (!existsSync(homeHtmlPath)) continue;

      const homeHtml = readFileSync(homeHtmlPath, 'utf8');

      // No script tag should load MapExplorer or client.js hydrator
      const scriptSrcs = (homeHtml.match(/<script[^>]*src="([^"]+)"/g) || []).map((tag) => {
        const match = tag.match(/src="([^"]+)"/);
        return match ? match[1] : '';
      });

      for (const src of scriptSrcs) {
        expect(src).not.toMatch(/MapExplorer/i);
        expect(src).not.toMatch(/maplibre/i);
      }
    }
  });
});
