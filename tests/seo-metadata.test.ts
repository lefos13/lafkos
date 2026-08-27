import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { locales, otherLocale } from '../src/lib/locales';
import { getCopy } from '../src/lib/ui-copy';

/*
 * SEO Metadata & Social Sharing Contracts (Task 2):
 * Verifies that BaseLayout provides canonical-compatible Open Graph and Twitter
 * card metadata, article freshness signals, default 1200x630 social card assets,
 * detail page editorial overrides via getLocalizedEditorialMetadata, single-H1 map
 * hierarchy, and a bilingual noindex 404 error page.
 */
describe('SEO Metadata & Social Graph Contracts', () => {
  const baseLayoutPath = resolve('src/layouts/BaseLayout.astro');
  const defaultImagePath = resolve('public/images/og-default.png');
  const mapPagePath = resolve('src/pages/[locale]/map/index.astro');
  const page404Path = resolve('src/pages/404.astro');

  /*
   * BaseLayout Open Graph & Twitter Card Contract:
   * Ensures that BaseLayout declares full Open Graph and Twitter Card tags
   * with absolute URLs, locale alternatives, and customizable metadata.
   */
  it('defines comprehensive Open Graph and Twitter Card metadata in BaseLayout', () => {
    const layoutContent = readFileSync(baseLayoutPath, 'utf8');

    // Canonical & hreflang preservation
    expect(layoutContent).toContain('rel="canonical"');
    expect(layoutContent).toContain('rel="alternate" hreflang={locale}');
    expect(layoutContent).toContain('rel="alternate" hreflang={alternateLocale}');
    expect(layoutContent).toContain('rel="alternate" hreflang="x-default"');

    // Open Graph core tags
    expect(layoutContent).toContain('property="og:site_name"');
    expect(layoutContent).toContain('property="og:title"');
    expect(layoutContent).toContain('property="og:description"');
    expect(layoutContent).toContain('property="og:url"');
    expect(layoutContent).toContain('property="og:type"');
    expect(layoutContent).toContain('property="og:locale"');
    expect(layoutContent).toContain('property="og:locale:alternate"');

    // Open Graph image tags & dimensions
    expect(layoutContent).toContain('property="og:image"');
    expect(layoutContent).toContain('property="og:image:alt"');
    expect(layoutContent).toContain('property="og:image:width"');
    expect(layoutContent).toContain('property="og:image:height"');

    // Twitter card tags
    expect(layoutContent).toContain('name="twitter:card" content="summary_large_image"');
    expect(layoutContent).toContain('name="twitter:title"');
    expect(layoutContent).toContain('name="twitter:description"');
    expect(layoutContent).toContain('name="twitter:image"');
    expect(layoutContent).toContain('name="twitter:image:alt"');

    // Article & Author metadata
    expect(layoutContent).toContain('property="article:published_time"');
    expect(layoutContent).toContain('property="article:modified_time"');
    expect(layoutContent).toContain('property="article:author"');
    expect(layoutContent).toContain('name="author"');

    // Configurable robots meta tag
    expect(layoutContent).toContain('name="robots"');

    // Default social card reference
    expect(layoutContent).toContain('/images/og-default.png');
    expect(layoutContent).not.toContain('/icons/icon-512.svg');
  });

  /*
   * Default Social Card Asset Contract:
   * Confirms that a dedicated 1200x630 raster PNG social card asset exists
   * in public/images/og-default.png with valid PNG headers and exact dimensions.
   */
  it('provides a valid 1200x630 PNG default social card asset in public/images/', () => {
    expect(existsSync(defaultImagePath), `Default social card missing at ${defaultImagePath}`).toBe(
      true,
    );

    const imageBuffer = readFileSync(defaultImagePath);
    expect(imageBuffer.length).toBeGreaterThan(1000);

    // PNG signature check: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      imageBuffer[0] === 0x89 &&
      imageBuffer[1] === 0x50 &&
      imageBuffer[2] === 0x4e &&
      imageBuffer[3] === 0x47 &&
      imageBuffer[4] === 0x0d &&
      imageBuffer[5] === 0x0a &&
      imageBuffer[6] === 0x1a &&
      imageBuffer[7] === 0x0a;
    expect(isPng, 'Default social card must be a valid PNG file').toBe(true);

    // Read IHDR chunk width and height
    const width = imageBuffer.readUInt32BE(16);
    const height = imageBuffer.readUInt32BE(20);
    expect(width, 'Default social card width must be 1200px').toBe(1200);
    expect(height, 'Default social card height must be 630px').toBe(630);
  });

  /*
   * Detail Pages Editorial Metadata Helper Contract:
   * Verifies that place, trail, and story detail pages invoke getLocalizedEditorialMetadata
   * to allow optional CMS overrides while falling back to primary content images and summaries.
   */
  it('consumes getLocalizedEditorialMetadata across place, trail, and story detail templates', () => {
    const detailTemplates = [
      resolve('src/pages/[locale]/places/[slug].astro'),
      resolve('src/pages/[locale]/trails/[slug].astro'),
      resolve('src/pages/[locale]/stories/[slug].astro'),
    ];

    for (const templatePath of detailTemplates) {
      const templateContent = readFileSync(templatePath, 'utf8');

      expect(
        templateContent,
        `${templatePath} must import getLocalizedEditorialMetadata`,
      ).toContain('getLocalizedEditorialMetadata');

      expect(templateContent, `${templatePath} must invoke getLocalizedEditorialMetadata`).toMatch(
        /getLocalizedEditorialMetadata\s*\(/,
      );

      // Verify article type is passed
      expect(templateContent, `${templatePath} must pass type="article" to BaseLayout`).toContain(
        'type="article"',
      );

      // Verify author or date bindings are present
      expect(templateContent).toMatch(/author=\{/);
      expect(templateContent).toMatch(/publishedAt=\{/);
      expect(templateContent).toMatch(/modifiedAt=\{/);
    }
  });

  /*
   * Map Search Title, Description & Single DOM H1 Contract:
   * Guarantees that the map has distinct localized search titles and intros in ui-copy
   * and renders exactly one DOM H1 element without duplicate hidden/visible H1s.
   */
  it('gives the map distinct localized search copy and exactly one DOM H1 across breakpoints', () => {
    for (const locale of locales) {
      const ui = getCopy(locale);
      expect(ui.mapTitle).toBeDefined();
      expect(ui.mapTitle.length).toBeGreaterThan(5);
      expect(ui.mapIntro).toBeDefined();
      expect(ui.mapIntro.length).toBeGreaterThan(20);

      // Distinct from homepage title/intro
      expect(ui.mapTitle).not.toEqual(ui.explore);
      expect(ui.mapIntro).not.toEqual(ui.introLong);
    }

    // Ensure Greek and English map titles are distinct
    expect(getCopy('el').mapTitle).not.toEqual(getCopy('en').mapTitle);

    const mapTemplate = readFileSync(mapPagePath, 'utf8');

    // Exactly one H1 in the map template
    const h1Matches = mapTemplate.match(/<h1[\s>]/g) || [];
    expect(
      h1Matches.length,
      `Expected exactly one <h1> in map template, found ${h1Matches.length}`,
    ).toBe(1);

    // No duplicate .sr-only-non-mobile H1
    expect(mapTemplate).not.toContain('sr-only-non-mobile');

    // Uses distinct mapTitle and mapIntro
    expect(mapTemplate).toContain('ui.mapTitle');
    expect(mapTemplate).toContain('ui.mapIntro');
  });

  /*
   * Bilingual 404 Page Contract:
   * Ensures src/pages/404.astro exists, declares robots="noindex, follow",
   * contains clear bilingual copy in Greek and English, and links to both
   * language homes and content hubs.
   */
  it('provides a bilingual 404 page with noindex robots and hub navigation links', () => {
    expect(existsSync(page404Path), `404 page missing at ${page404Path}`).toBe(true);

    const pageContent = readFileSync(page404Path, 'utf8');

    // Noindex robots tag
    expect(pageContent).toMatch(/robots=["']noindex,\s*follow["']/);

    // Bilingual content in Greek and English
    expect(pageContent).toContain('/el/');
    expect(pageContent).toContain('/en/');
    expect(pageContent).toContain('/el/map');
    expect(pageContent).toContain('/en/map');
    expect(pageContent).toContain('/el/places/');
    expect(pageContent).toContain('/en/places/');
    expect(pageContent).toContain('/el/trails/');
    expect(pageContent).toContain('/en/trails/');
    expect(pageContent).toContain('/el/stories/');
    expect(pageContent).toContain('/en/stories/');
  });

  /*
   * Built HTML Output Verification Contract:
   * When static assets are built in dist/, verifies that generated HTML pages
   * contain all expected meta tags, canonicals, Open Graph, Twitter cards,
   * single map H1, and 404 noindex tags.
   */
  it('verifies built HTML files for complete Open Graph, Twitter, single-H1 map, and 404 noindex', () => {
    const distDir = resolve('dist');
    if (!existsSync(distDir)) return;

    // 1. Homepage built HTML
    for (const locale of locales) {
      const homeHtmlPath = resolve(`dist/${locale}/index.html`);
      if (!existsSync(homeHtmlPath)) continue;

      const html = readFileSync(homeHtmlPath, 'utf8');
      expect(html).toContain('property="og:site_name" content="Lafkos Guide"');
      expect(html).toContain(
        `property="og:url" content="https://lafkos-guide.vercel.app/${locale}/"`,
      );
      expect(html).toContain('property="og:type" content="website"');
      expect(html).toContain(
        `property="og:locale" content="${locale === 'el' ? 'el_GR' : 'en_US'}"`,
      );
      expect(html).toContain(
        `property="og:locale:alternate" content="${locale === 'el' ? 'en_US' : 'el_GR'}"`,
      );
      expect(html).toContain(
        'property="og:image" content="https://lafkos-guide.vercel.app/images/og-default.png"',
      );
      expect(html).toContain('property="og:image:width" content="1200"');
      expect(html).toContain('property="og:image:height" content="630"');
      expect(html).toContain('name="twitter:card" content="summary_large_image"');
      expect(html).toContain(
        'name="twitter:image" content="https://lafkos-guide.vercel.app/images/og-default.png"',
      );
      expect(html).toContain(`rel="canonical" href="https://lafkos-guide.vercel.app/${locale}/"`);
      expect(html).toContain(
        `rel="alternate" hreflang="${locale}" href="https://lafkos-guide.vercel.app/${locale}/"`,
      );
      expect(html).toContain(
        `rel="alternate" hreflang="${otherLocale(locale)}" href="https://lafkos-guide.vercel.app/${otherLocale(locale)}/"`,
      );
      expect(html).toContain(
        'rel="alternate" hreflang="x-default" href="https://lafkos-guide.vercel.app/el/"',
      );
    }

    // 2. Map page built HTML
    for (const locale of locales) {
      const mapHtmlPath = resolve(`dist/${locale}/map/index.html`);
      if (!existsSync(mapHtmlPath)) continue;

      const html = readFileSync(mapHtmlPath, 'utf8');
      const h1Count = (html.match(/<h1[\s>]/g) || []).length;
      expect(h1Count, `Map HTML for ${locale} must contain exactly one <h1>`).toBe(1);

      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      expect(titleMatch, 'Map page must have a <title> tag').not.toBeNull();
      expect(titleMatch![1]).not.toBe('Explore Lafkos · Lafkos Guide');
      expect(titleMatch![1]).not.toBe('Εξερεύνησε τον Λαύκο · Lafkos Guide');
    }

    // 3. Place detail page built HTML (e.g. plateia-lafkou)
    const placeHtmlPath = resolve('dist/el/places/plateia-lafkou/index.html');
    if (existsSync(placeHtmlPath)) {
      const html = readFileSync(placeHtmlPath, 'utf8');
      expect(html).toContain('property="og:type" content="article"');
      expect(html).toMatch(/property="og:image" content="https?:\/\/[^"]+"/);
      expect(html).toMatch(/name="twitter:image" content="https?:\/\/[^"]+"/);
    }

    // 4. 404 page built HTML
    const html404Path = existsSync(resolve('dist/404.html'))
      ? resolve('dist/404.html')
      : resolve('dist/404/index.html');
    if (existsSync(html404Path)) {
      const html = readFileSync(html404Path, 'utf8');
      expect(html).toContain('name="robots" content="noindex, follow"');
      expect(html).toContain('/el/');
      expect(html).toContain('/en/');
      expect(html).toContain('/el/map');
      expect(html).toContain('/en/map');
      expect(html).toContain('/el/places/');
      expect(html).toContain('/en/places/');
      expect(html).toContain('/el/trails/');
      expect(html).toContain('/en/trails/');
      expect(html).toContain('/el/stories/');
      expect(html).toContain('/en/stories/');
    }
  });
});
