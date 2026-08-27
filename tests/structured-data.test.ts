import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { places, stories, trails } from '../src/data/content';
import { getLocalizedEditorialMetadata } from '../src/lib/content-api';
import type { Story } from '../src/lib/content';
import { locales } from '../src/lib/locales';
import {
  buildHomeJsonLd,
  buildHubJsonLd,
  buildPlaceJsonLd,
  buildStoryJsonLd,
  buildTrailJsonLd,
  canonicalSiteOrigin,
  formatSeoSnippet,
  serializeJsonLd,
} from '../src/lib/structured-data';
import { getCopy } from '../src/lib/ui-copy';

/*
 * Structured Data & Safe JSON-LD Contracts (Task 4):
 * Verifies safe script serialization, canonical URL trailing slashes,
 * fact-grounded schemas (no invented addresses/hours/ratings/duration on TouristTrip),
 * bilingual coverage, stable site-wide WebSite identity, and built HTML JSON-LD validity
 * across Home, Places, Trails, Stories, Hubs, and 404.
 */
describe('Structured Data & Safe JSON-LD Contracts', () => {
  const disallowedInventedProperties = [
    'telephone',
    'openingHours',
    'openingHoursSpecification',
    'aggregateRating',
    'priceRange',
    'address',
    'postalCode',
    'streetAddress',
    'founder',
    'foundingDate',
    'review',
    'potentialAction', // SearchAction must not be present
    'duration', // Schema.org TouristTrip does not list duration
  ];

  /*
   * Safe Serialization Contract:
   * Verifies that serializeJsonLd converts '<' to '\\u003c', preventing script tag
   * termination like '</script>' or HTML comment injections '<!--', while round-tripping
   * cleanly through standard JSON.parse without content loss.
   */
  describe('Safe JSON-LD Serialization', () => {
    it('escapes < and dangerous characters without altering parsed values', () => {
      const hostilePayload = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test </script><script>alert("xss")</script>',
        description: 'Story with HTML tags <b>bold</b> & <tag> and <!-- comment -->',
        unicodeText: 'Line \u2028 and paragraph \u2029 separators',
      };

      const serialized = serializeJsonLd(hostilePayload);

      // Must not contain unescaped '<', '</script>', '<script', or '<!--'
      expect(serialized).not.toContain('<');
      expect(serialized).not.toContain('</script>');
      expect(serialized).not.toContain('<script');
      expect(serialized).not.toContain('<!--');

      // Must contain escaped unicode representations
      expect(serialized).toContain('\\u003c');

      // Must parse back with exact value fidelity
      const parsed: unknown = JSON.parse(serialized);
      expect(parsed).toEqual(hostilePayload);
    });
  });

  /*
   * Homepage Schema Contract:
   * Emits a stable, site-wide WebSite and Organization identity identical across
   * /el/ and /en/. Excludes SearchAction (no search endpoint exists).
   * Verifies canonical root URL, root @id, inLanguage ['el', 'en'], and logo/image.
   */
  describe('Homepage Structured Data', () => {
    it('generates a stable, site-wide WebSite and Organization entity', () => {
      const schema = buildHomeJsonLd();
      const [website, organization] = schema['@graph'];

      expect(website).toBeDefined();
      expect(website['@type']).toBe('WebSite');
      expect(website['@id']).toBe(`${canonicalSiteOrigin}/#website`);
      expect(website.name).toBe('Lafkos Guide');
      expect(website.url).toBe(`${canonicalSiteOrigin}/`);
      expect(website.inLanguage).toEqual(['el', 'en']);

      expect(organization).toBeDefined();
      expect(organization['@type']).toBe('Organization');
      expect(organization['@id']).toBe(`${canonicalSiteOrigin}/#organization`);
      expect(organization.name).toBe('Lafkos Guide');
      expect(organization.url).toBe(`${canonicalSiteOrigin}/`);
      expect(organization.logo).toBe(`${canonicalSiteOrigin}/images/og-default.png`);

      // No invented properties
      for (const disallowed of disallowedInventedProperties) {
        expect(disallowed in website).toBe(false);
        expect(disallowed in organization).toBe(false);
      }
    });
  });

  /*
   * Places Detail Schema Contract:
   * Emits BreadcrumbList and Schema.org TouristAttraction.
   * Includes localized name/description, canonical URL with trailing slash,
   * inLanguage, real coordinates (mapAnchor), real images, and no invented fields.
   */
  describe('Places Detail Structured Data', () => {
    it.each(locales)('generates valid BreadcrumbList and TouristAttraction for %s', (locale) => {
      for (const place of places) {
        const editorial = getLocalizedEditorialMetadata(place, locale);
        const schema = buildPlaceJsonLd({ place, locale, editorial });
        const [breadcrumbs, attraction] = schema['@graph'];

        // Breadcrumbs: 3 levels (Home -> Places Hub -> Place Detail)
        expect(breadcrumbs['@type']).toBe('BreadcrumbList');
        expect(breadcrumbs.itemListElement.length).toBe(3);
        expect(breadcrumbs.itemListElement[0].position).toBe(1);
        expect(breadcrumbs.itemListElement[0].item).toBe(`${canonicalSiteOrigin}/${locale}/`);
        expect(breadcrumbs.itemListElement[1].position).toBe(2);
        expect(breadcrumbs.itemListElement[1].item).toBe(
          `${canonicalSiteOrigin}/${locale}/places/`,
        );
        expect(breadcrumbs.itemListElement[2].position).toBe(3);
        expect(breadcrumbs.itemListElement[2].item).toBe(
          `${canonicalSiteOrigin}/${locale}/places/${place.slug[locale]}/`,
        );

        // Attraction: factual data
        expect(attraction['@type']).toBe('TouristAttraction');
        expect(attraction.name).toBe(editorial.title ?? place.title[locale]);
        expect(attraction.description).toBe(
          editorial.description ?? formatSeoSnippet(place.summary[locale]),
        );
        expect(attraction.url).toBe(
          `${canonicalSiteOrigin}/${locale}/places/${place.slug[locale]}/`,
        );
        expect(attraction.inLanguage).toBe(locale);

        // Real coordinates from mapAnchor: mapAnchor is [lng, lat]
        expect(attraction.geo['@type']).toBe('GeoCoordinates');
        expect(attraction.geo.latitude).toBe(place.mapAnchor[1]);
        expect(attraction.geo.longitude).toBe(place.mapAnchor[0]);

        // Real images
        expect(attraction.image).toBeDefined();

        // No invented properties
        for (const disallowed of disallowedInventedProperties) {
          expect(disallowed in attraction).toBe(false);
        }
      }
    });
  });

  /*
   * Trails Detail Schema Contract:
   * Emits BreadcrumbList and lean Schema.org TouristTrip.
   * Includes localized name/description, canonical URL, inLanguage,
   * real images, and no invented fields (no duration).
   */
  describe('Trails Detail Structured Data', () => {
    it.each(locales)('generates valid BreadcrumbList and TouristTrip for %s', (locale) => {
      for (const trail of trails) {
        const editorial = getLocalizedEditorialMetadata(trail, locale);
        const schema = buildTrailJsonLd({ trail, locale, editorial });
        const [breadcrumbs, trip] = schema['@graph'];

        // Breadcrumbs: 3 levels (Home -> Trails Hub -> Trail Detail)
        expect(breadcrumbs['@type']).toBe('BreadcrumbList');
        expect(breadcrumbs.itemListElement.length).toBe(3);
        expect(breadcrumbs.itemListElement[0].position).toBe(1);
        expect(breadcrumbs.itemListElement[0].item).toBe(`${canonicalSiteOrigin}/${locale}/`);
        expect(breadcrumbs.itemListElement[1].position).toBe(2);
        expect(breadcrumbs.itemListElement[1].item).toBe(
          `${canonicalSiteOrigin}/${locale}/trails/`,
        );
        expect(breadcrumbs.itemListElement[2].position).toBe(3);
        expect(breadcrumbs.itemListElement[2].item).toBe(
          `${canonicalSiteOrigin}/${locale}/trails/${trail.slug[locale]}/`,
        );

        // Trip: factual data
        expect(trip['@type']).toBe('TouristTrip');
        expect(trip.name).toBe(editorial.title ?? trail.title[locale]);
        expect(trip.description).toBe(
          editorial.description ?? formatSeoSnippet(trail.summary[locale]),
        );
        expect(trip.url).toBe(`${canonicalSiteOrigin}/${locale}/trails/${trail.slug[locale]}/`);
        expect(trip.inLanguage).toBe(locale);

        // Lean Schema.org TouristTrip: no duration property
        expect('duration' in trip).toBe(false);

        // No invented properties
        for (const disallowed of disallowedInventedProperties) {
          expect(disallowed in trip).toBe(false);
        }
      }
    });
  });

  /*
   * Stories Detail Schema Contract:
   * Emits BreadcrumbList and Google-compatible Article.
   * Preserves CMS editorial override semantics, only includes author and dates
   * when present, and points to canonical URL.
   */
  describe('Stories Detail Structured Data', () => {
    it.each(locales)('generates valid BreadcrumbList and Article for %s', (locale) => {
      for (const story of stories) {
        const editorial = getLocalizedEditorialMetadata(story, locale);
        const schema = buildStoryJsonLd({ story, locale, editorial });
        const [breadcrumbs, article] = schema['@graph'];

        // Breadcrumbs: 3 levels (Home -> Stories Hub -> Story Detail)
        expect(breadcrumbs['@type']).toBe('BreadcrumbList');
        expect(breadcrumbs.itemListElement.length).toBe(3);
        expect(breadcrumbs.itemListElement[0].position).toBe(1);
        expect(breadcrumbs.itemListElement[0].item).toBe(`${canonicalSiteOrigin}/${locale}/`);
        expect(breadcrumbs.itemListElement[1].position).toBe(2);
        expect(breadcrumbs.itemListElement[1].item).toBe(
          `${canonicalSiteOrigin}/${locale}/stories/`,
        );
        expect(breadcrumbs.itemListElement[2].position).toBe(3);
        expect(breadcrumbs.itemListElement[2].item).toBe(
          `${canonicalSiteOrigin}/${locale}/stories/${story.slug[locale]}/`,
        );

        // Article: headline, description, canonical url, publisher
        expect(article['@type']).toBe('Article');
        expect(article.headline).toBe(editorial.title ?? story.title[locale]);
        expect(article.description).toBe(
          editorial.description ?? formatSeoSnippet(story.summary[locale]),
        );
        expect(article.url).toBe(`${canonicalSiteOrigin}/${locale}/stories/${story.slug[locale]}/`);
        expect(article.mainEntityOfPage).toBe(
          `${canonicalSiteOrigin}/${locale}/stories/${story.slug[locale]}/`,
        );
        expect(article.inLanguage).toBe(locale);
        expect(article.image).toBeDefined();
        expect(article.publisher.name).toBe('Lafkos Guide');
        expect(article.publisher.url).toBe(`${canonicalSiteOrigin}/`);

        // Author and dates should only be defined if present in editorial metadata
        if (editorial.author) {
          expect(article.author).toEqual({
            '@type': 'Person',
            name: editorial.author,
          });
        } else {
          expect(article.author).toBeUndefined();
        }

        if (editorial.publishedAt) {
          expect(article.datePublished).toBe(editorial.publishedAt);
        } else {
          expect(article.datePublished).toBeUndefined();
        }

        if (editorial.modifiedAt) {
          expect(article.dateModified).toBe(editorial.modifiedAt);
        } else if (editorial.publishedAt) {
          expect(article.dateModified).toBe(editorial.publishedAt);
        } else {
          expect(article.dateModified).toBeUndefined();
        }

        // No invented properties
        for (const disallowed of disallowedInventedProperties) {
          expect(disallowed in article).toBe(false);
        }
      }
    });

    it('respects editorial metadata overrides on story articles', () => {
      const storyWithOverrides: Story = {
        kind: 'story',
        entityKey: 'test-story',
        slug: { el: 'dokimi', en: 'test' },
        title: { el: 'Αρχικός Τίτλος', en: 'Original Title' },
        eyebrow: { el: 'Ιστορία', en: 'Story' },
        summary: { el: 'Αρχική Σύνοψη', en: 'Original Summary' },
        body: { el: ['Κείμενο'], en: ['Body'] },
        image: {
          src: 'https://example.com/original.jpg',
          alt: 'Alt',
          credit: 'Credit',
          license: 'CC',
        },
        relatedKeys: [],
        sources: [{ label: 'Source', url: 'https://example.com' }],
        featured: false,
        isSeed: true,
        seo: {
          el: {
            title: 'Ειδικός Τίτλος SEO',
            description: 'Ειδική Περιγραφή SEO',
            socialImage: {
              src: 'https://example.com/custom.jpg',
              alt: 'Custom Alt',
              credit: 'Custom Credit',
              license: 'CC-BY',
            },
          },
          en: {
            title: 'Custom SEO Title',
            description: 'Custom SEO Description',
          },
        },
        author: {
          el: 'Μαρία Παπαδοπούλου',
          en: 'Maria Papadopoulou',
        },
        publishedAt: '2026-05-01',
        modifiedAt: '2026-05-15',
      };

      const elEditorial = getLocalizedEditorialMetadata(storyWithOverrides, 'el');
      const elSchema = buildStoryJsonLd({
        story: storyWithOverrides,
        locale: 'el',
        editorial: elEditorial,
      });
      const [, elArticle] = elSchema['@graph'];

      expect(elArticle.headline).toBe('Ειδικός Τίτλος SEO');
      expect(elArticle.description).toBe('Ειδική Περιγραφή SEO');
      expect(elArticle.image).toEqual(['https://example.com/custom.jpg']);
      expect(elArticle.author).toEqual({ '@type': 'Person', name: 'Μαρία Παπαδοπούλου' });
      expect(elArticle.datePublished).toBe('2026-05-01');
      expect(elArticle.dateModified).toBe('2026-05-15');
    });
  });

  /*
   * Hubs Schema Contract:
   * Emits BreadcrumbList and CollectionPage with an ItemList of entities.
   * Lean output, no carousel assumptions.
   */
  describe('Hubs Structured Data', () => {
    const hubConfigs = [
      { kind: 'places' as const, items: places },
      { kind: 'trails' as const, items: trails },
      { kind: 'stories' as const, items: stories },
    ];

    it.each(locales)(
      'generates valid CollectionPage and BreadcrumbList for hubs in %s',
      (locale) => {
        const ui = getCopy(locale);

        for (const { kind, items } of hubConfigs) {
          const titleKey = `${kind}Title` as keyof typeof ui;
          const introKey = `${kind}Intro` as keyof typeof ui;
          const title = ui[titleKey] as string;
          const description = ui[introKey] as string;

          const schema = buildHubJsonLd({
            kind,
            locale,
            title,
            description,
            items,
          });

          const [breadcrumbs, collection] = schema['@graph'];

          // 2-level breadcrumbs for hubs
          expect(breadcrumbs['@type']).toBe('BreadcrumbList');
          expect(breadcrumbs.itemListElement.length).toBe(2);
          expect(breadcrumbs.itemListElement[0].item).toBe(`${canonicalSiteOrigin}/${locale}/`);
          expect(breadcrumbs.itemListElement[1].item).toBe(
            `${canonicalSiteOrigin}/${locale}/${kind}/`,
          );

          // CollectionPage
          expect(collection['@type']).toBe('CollectionPage');
          expect(collection.name).toBe(title);
          expect(collection.description).toBe(description);
          expect(collection.url).toBe(`${canonicalSiteOrigin}/${locale}/${kind}/`);
          expect(collection.inLanguage).toBe(locale);

          // ItemList
          expect(collection.mainEntity['@type']).toBe('ItemList');
          expect(collection.mainEntity.itemListElement.length).toBe(items.length);
          expect(collection.mainEntity.itemListElement[0].position).toBe(1);
          expect(collection.mainEntity.itemListElement[0].url).toBe(
            `${canonicalSiteOrigin}/${locale}/${kind}/${items[0].slug[locale]}/`,
          );
          expect(collection.mainEntity.itemListElement[0].name).toBe(items[0].title[locale]);
        }
      },
    );
  });

  /*
   * Built HTML Validation Contract:
   * When dist/ exists, inspects generated HTML files to ensure:
   * 1. Every JSON-LD script contains valid parseable JSON.
   * 2. 404 page contains NO application/ld+json script.
   * 3. Home, detail, and hub pages have correct schema structures and canonical URLs.
   * 4. Comprehensive scan across all generated static HTML files.
   */
  describe('Built HTML JSON-LD Validation', () => {
    // Collect all html files recursively
    function getAllHtmlFiles(dir: string): string[] {
      const entries = readdirSync(dir);
      const files: string[] = [];
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...getAllHtmlFiles(fullPath));
        } else if (entry.endsWith('.html')) {
          files.push(fullPath);
        }
      }
      return files;
    }

    it('scans all built HTML files in dist/ and validates JSON-LD compliance', () => {
      const distDir = resolve('dist');
      if (!existsSync(distDir)) return;

      const htmlFiles = getAllHtmlFiles(distDir);
      expect(htmlFiles.length).toBeGreaterThan(50);

      // Helper to extract and parse JSON-LD from HTML
      function parseJsonLdFromHtml(
        html: string,
      ): Array<{ '@context'?: string; '@graph'?: Array<Record<string, unknown>> }> {
        const matches = html.matchAll(
          /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
        );
        const results: Array<{ '@context'?: string; '@graph'?: Array<Record<string, unknown>> }> =
          [];
        for (const match of matches) {
          const raw = match[1].trim();
          expect(raw.length).toBeGreaterThan(0);
          const parsed = JSON.parse(raw) as {
            '@context'?: string;
            '@graph'?: Array<Record<string, unknown>>;
          };
          results.push(parsed);
        }
        return results;
      }

      for (const filePath of htmlFiles) {
        const relativePath = filePath.replace(distDir, '');
        const html = readFileSync(filePath, 'utf8');
        const schemas = parseJsonLdFromHtml(html);

        // 1. Pages that must NOT emit JSON-LD: 404, root redirect, informational/map pages
        const is404 = relativePath.includes('404');
        const isRoot = relativePath === '/index.html';
        const isInfoOrMap =
          relativePath.includes('/map/') ||
          relativePath.includes('/about/') ||
          relativePath.includes('/visit/') ||
          relativePath.includes('/events/') ||
          relativePath.includes('/timeline/') ||
          relativePath.includes('/privacy/') ||
          relativePath.includes('/accessibility/');

        if (is404 || isRoot || isInfoOrMap) {
          expect(
            schemas.length,
            `Expected 0 JSON-LD scripts on ${relativePath}, found ${schemas.length}`,
          ).toBe(0);
          continue;
        }

        // 2. Expected pages (home, places hub/detail, trails hub/detail, stories hub/detail)
        expect(
          schemas.length,
          `Expected exactly 1 JSON-LD script on ${relativePath}, found ${schemas.length}`,
        ).toBe(1);

        const schema = schemas[0];
        expect(schema['@context']).toBe('https://schema.org');
        expect(schema['@graph']).toBeDefined();
        const graph = schema['@graph']!;
        expect(graph.length).toBeGreaterThanOrEqual(2);

        // Verify none of the disallowed invented fields exist in the graph
        for (const item of graph) {
          for (const disallowed of disallowedInventedProperties) {
            expect(
              item[disallowed],
              `Disallowed invented property '${disallowed}' found in ${relativePath}`,
            ).toBeUndefined();
          }
        }
      }
    });

    it('validates specific page graph contents for Home, Places, Trails, Stories, and Hubs', () => {
      const distDir = resolve('dist');
      if (!existsSync(distDir)) return;

      function parseJsonLdFromHtml(
        html: string,
      ): Array<{ '@graph'?: Array<Record<string, unknown>> }> {
        const matches = html.matchAll(
          /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
        );
        const results: Array<{ '@graph'?: Array<Record<string, unknown>> }> = [];
        for (const match of matches) {
          const raw = match[1].trim();
          const parsed = JSON.parse(raw) as { '@graph'?: Array<Record<string, unknown>> };
          results.push(parsed);
        }
        return results;
      }

      // Check Homepages
      for (const locale of locales) {
        const homePath = resolve(`dist/${locale}/index.html`);
        const html = readFileSync(homePath, 'utf8');
        const schemas = parseJsonLdFromHtml(html);
        expect(schemas.length).toBe(1);

        const graph = schemas[0]['@graph'];
        expect(graph).toBeDefined();
        expect(graph?.some((item) => item['@type'] === 'WebSite')).toBe(true);
        expect(graph?.some((item) => item['@type'] === 'Organization')).toBe(true);

        const website = graph?.find((item) => item['@type'] === 'WebSite');
        expect(website?.['@id']).toBe(`${canonicalSiteOrigin}/#website`);
        expect(website?.url).toBe(`${canonicalSiteOrigin}/`);
        expect(website?.inLanguage).toEqual(['el', 'en']);
      }

      // Check Place detail pages (e.g. plateia-lafkou)
      const placeHtmlPath = resolve('dist/el/places/plateia-lafkou/index.html');
      if (existsSync(placeHtmlPath)) {
        const html = readFileSync(placeHtmlPath, 'utf8');
        const schemas = parseJsonLdFromHtml(html);
        expect(schemas.length).toBe(1);

        const graph = schemas[0]['@graph'];
        expect(graph?.some((item) => item['@type'] === 'BreadcrumbList')).toBe(true);
        expect(graph?.some((item) => item['@type'] === 'TouristAttraction')).toBe(true);

        const attraction = graph?.find((item) => item['@type'] === 'TouristAttraction');
        expect(attraction?.geo).toBeDefined();
      }

      // Check Trail detail pages (e.g. monopati-lafkos-milina or diadromi-lafkos-mikro)
      const trailHtmlPath = resolve('dist/el/trails/diadromi-lafkos-mikro/index.html');
      if (existsSync(trailHtmlPath)) {
        const html = readFileSync(trailHtmlPath, 'utf8');
        const schemas = parseJsonLdFromHtml(html);
        expect(schemas.length).toBe(1);

        const graph = schemas[0]['@graph'];
        expect(graph?.some((item) => item['@type'] === 'BreadcrumbList')).toBe(true);
        expect(graph?.some((item) => item['@type'] === 'TouristTrip')).toBe(true);
      }

      // Check Story detail pages (e.g. to-palaiotero-kafeneio-forlida)
      const storyHtmlPath = resolve('dist/el/stories/to-palaiotero-kafeneio-forlida/index.html');
      if (existsSync(storyHtmlPath)) {
        const html = readFileSync(storyHtmlPath, 'utf8');
        const schemas = parseJsonLdFromHtml(html);
        expect(schemas.length).toBe(1);

        const graph = schemas[0]['@graph'];
        expect(graph?.some((item) => item['@type'] === 'BreadcrumbList')).toBe(true);
        expect(graph?.some((item) => item['@type'] === 'Article')).toBe(true);
      }

      // Check Hub pages
      for (const kind of ['places', 'trails', 'stories'] as const) {
        for (const locale of locales) {
          const hubPath = resolve(`dist/${locale}/${kind}/index.html`);
          const html = readFileSync(hubPath, 'utf8');
          const schemas = parseJsonLdFromHtml(html);
          expect(schemas.length).toBe(1);

          const graph = schemas[0]['@graph'];
          expect(graph?.some((item) => item['@type'] === 'BreadcrumbList')).toBe(true);
          expect(graph?.some((item) => item['@type'] === 'CollectionPage')).toBe(true);
        }
      }
    });
  });
});
