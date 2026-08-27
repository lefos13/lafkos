import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  auditHreflangReciprocity,
  auditHtmlDocument,
  auditHtmlInternalLinks,
  auditRobotsTxt,
  auditSitemaps,
  decodeHtmlEntities,
  DEFAULT_MAX_META_DESCRIPTION_LENGTH,
  DEFAULT_PRODUCTION_SITE_ORIGIN,
  isStaticAssetPath,
  parseHtmlTagAttributes,
  runFullSeoAudit,
  validateJsonLdStructure,
} from '../src/lib/seo-audit';

/*
 * Built-Site SEO & Payload Quality Gate Suite (Task 10):
 *
 * This test suite enforces deterministic, comprehensive build-time SEO, link integrity,
 * sitemap coverage, robots.txt conformance, and payload budgets across all emitted static assets.
 *
 * It contains two primary test layers:
 * 1. Isolated unit & contract tests for the SEO audit engine across all edge cases and violations.
 * 2. Full end-to-end audit of the built static site in dist/ when present.
 */

describe('SEO Audit Engine Unit Contracts', () => {
  const sampleValidIndexableHtml = `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="utf-8">
  <title>Πλατεία Λαύκου &amp; Καφενεία — Οδηγός Λαύκου</title>
  <meta name="description" content="Η κεντρική πλατεία του Λαύκου με τα αιωνόβια πλατάνια, &quot;ταβέρνες&quot; &amp; τα ιστορικά καφενεία.">
  <link rel="canonical" href="https://lafkos-guide.vercel.app/el/places/plateia-lafkou/">
  <link rel="alternate" hreflang="el" href="https://lafkos-guide.vercel.app/el/places/plateia-lafkou/">
  <link rel="alternate" hreflang="en" href="https://lafkos-guide.vercel.app/en/places/lafkos-square/">
  <link rel="alternate" hreflang="x-default" href="https://lafkos-guide.vercel.app/el/places/plateia-lafkou/">
  <meta name="robots" content="index, follow">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": "Πλατεία Λαύκου"
  }
  </script>
</head>
<body>
  <h1>Πλατεία Λαύκου &amp; Πλάτανος</h1>
  <a href="/el/places/">Επιστροφή στα μέρη</a>
  <a href="https://example.com" rel="external">Εξωτερικός σύνδεσμος</a>
  <a href="/images/square.webp">Εικόνα</a>
  <a href="#details">Λεπτομέρειες</a>
</body>
</html>`;

  describe('HTML Character Reference Entity Decoder', () => {
    it('decodes standard named HTML character entities', () => {
      expect(
        decodeHtmlEntities(
          '&amp; &quot; &#39; &apos; &lt; &gt; &nbsp; &mdash; &ndash; &laquo; &raquo;',
        ),
      ).toBe("& \" ' ' < >   — – « »");
    });

    it('decodes decimal numeric HTML entities', () => {
      expect(decodeHtmlEntities('&#955;&#945;&#973;&#954;&#959;&#962;')).toBe('λαύκος');
      expect(decodeHtmlEntities('&#38; &#60; &#62;')).toBe('& < >');
    });

    it('decodes hexadecimal numeric HTML entities', () => {
      expect(decodeHtmlEntities('&#x3bb;&#x3b1;&#x3cd;&#x3ba;&#x3bf;&#x3c2;')).toBe('λαύκος');
      expect(decodeHtmlEntities('&#x26; &#x3c; &#x3e;')).toBe('& < >');
    });

    it('returns unencoded text unchanged', () => {
      expect(decodeHtmlEntities('Lafkos Village Guide 2026')).toBe('Lafkos Village Guide 2026');
      expect(decodeHtmlEntities('')).toBe('');
    });

    it('decodes character references in titles, meta descriptions, and H1 tags without inflating length', () => {
      const { data, violations } = auditHtmlDocument(
        sampleValidIndexableHtml,
        '/el/places/plateia-lafkou/index.html',
      );

      expect(violations).toHaveLength(0);
      expect(data.title).toBe('Πλατεία Λαύκου & Καφενεία — Οδηγός Λαύκου');
      expect(data.h1Text).toBe('Πλατεία Λαύκου & Πλάτανος');
      expect(data.description).toContain('"ταβέρνες" & τα ιστορικά καφενεία');

      // Verify that &amp; counts as 1 character in description length calculation
      const boundaryDescription = 'A'.repeat(DEFAULT_MAX_META_DESCRIPTION_LENGTH - 1) + '&amp;';
      const htmlWithBoundaryDesc = sampleValidIndexableHtml.replace(
        /content="Η κεντρική.*?καφενεία\."/gis,
        `content="${boundaryDescription}"`,
      );
      const res = auditHtmlDocument(htmlWithBoundaryDesc, '/el/places/plateia-lafkou/index.html');
      expect(res.violations.some((v) => v.category === 'description')).toBe(false);
      expect(res.data.description?.length).toBe(DEFAULT_MAX_META_DESCRIPTION_LENGTH);
    });
  });

  describe('HTML Tag Attribute Parser & Static Asset Helper', () => {
    it('accurately parses key-value pairs from HTML tags regardless of whitespace and attribute order', () => {
      const tag =
        '<link rel="alternate" hreflang="el" href="https://lafkos-guide.vercel.app/el/" target=\'_blank\' disabled>';
      const attrs = parseHtmlTagAttributes(tag);

      expect(attrs.rel).toBe('alternate');
      expect(attrs.hreflang).toBe('el');
      expect(attrs.href).toBe('https://lafkos-guide.vercel.app/el/');
      expect(attrs.target).toBe('_blank');
      expect(attrs.disabled).toBe('');
    });

    it('correctly classifies static assets versus page routes', () => {
      expect(isStaticAssetPath('/_astro/main.hash123.js')).toBe(true);
      expect(isStaticAssetPath('/_astro/main.hash123.css')).toBe(true);
      expect(isStaticAssetPath('/images/hero.webp')).toBe(true);
      expect(isStaticAssetPath('/fonts/inter.woff2')).toBe(true);
      expect(isStaticAssetPath('/icons/icon-192.svg')).toBe(true);
      expect(isStaticAssetPath('/manifest.webmanifest')).toBe(true);
      expect(isStaticAssetPath('/map-data.pmtiles')).toBe(true);
      expect(isStaticAssetPath('/tiles.pbf')).toBe(true);
      expect(isStaticAssetPath('/document.pdf')).toBe(true);

      expect(isStaticAssetPath('/el/')).toBe(false);
      expect(isStaticAssetPath('/el/places/')).toBe(false);
      expect(isStaticAssetPath('/en/trails/lafkos-mikro/')).toBe(false);
    });
  });

  describe('JSON-LD Schema Validator', () => {
    it('accepts valid single-entity schemas', () => {
      const result = validateJsonLdStructure({
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: 'Lafkos Square',
      });
      expect(result.valid).toBe(true);
      expect(result.type).toBe('Place');
    });

    it('accepts valid @graph multi-entity schemas', () => {
      const result = validateJsonLdStructure({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'BreadcrumbList', itemListElement: [] },
          { '@type': 'TouristTrip', name: 'Trail' },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.type).toEqual(['BreadcrumbList', 'TouristTrip']);
    });

    it('accepts valid top-level schema arrays', () => {
      const result = validateJsonLdStructure([
        { '@context': 'https://schema.org', '@type': 'WebSite' },
        { '@context': 'https://schema.org', '@type': 'Organization' },
      ]);
      expect(result.valid).toBe(true);
      expect(result.type).toEqual(['WebSite', 'Organization']);
    });

    it('flags schemas missing @context or @type', () => {
      expect(validateJsonLdStructure({ name: 'No Context or Type' }).valid).toBe(false);
      expect(validateJsonLdStructure({ '@context': 'https://schema.org' }).valid).toBe(false);
      expect(validateJsonLdStructure({ '@type': 'Place' }).valid).toBe(false);
      expect(
        validateJsonLdStructure({
          '@context': 'https://schema.org',
          '@graph': [{ name: 'Missing Type in Graph' }],
        }).valid,
      ).toBe(false);
    });
  });

  describe('Document SEO Structure Validator', () => {
    it('validates compliant indexable HTML with zero violations', () => {
      const { data, violations } = auditHtmlDocument(
        sampleValidIndexableHtml,
        '/el/places/plateia-lafkou/index.html',
      );

      expect(violations).toHaveLength(0);
      expect(data.isIndexable).toBe(true);
      expect(data.title).toBe('Πλατεία Λαύκου & Καφενεία — Οδηγός Λαύκου');
      expect(data.canonicalUrl).toBe('https://lafkos-guide.vercel.app/el/places/plateia-lafkou/');
      expect(data.hreflangMap.el).toBe('https://lafkos-guide.vercel.app/el/places/plateia-lafkou/');
      expect(data.hreflangMap.en).toBe('https://lafkos-guide.vercel.app/en/places/lafkos-square/');
      expect(data.hreflangMap['x-default']).toBe(
        'https://lafkos-guide.vercel.app/el/places/plateia-lafkou/',
      );
      expect(data.h1Count).toBe(1);
    });

    it('detects missing or multiple title tags', () => {
      const noTitle = sampleValidIndexableHtml.replace(/<title[^>]*>.*?<\/title>/gis, '');
      const doubleTitle = sampleValidIndexableHtml.replace(
        '</title>',
        '</title><title>Second Title</title>',
      );

      expect(
        auditHtmlDocument(noTitle, '/el/places/plateia-lafkou/index.html').violations.some(
          (v) => v.category === 'title',
        ),
      ).toBe(true);

      expect(
        auditHtmlDocument(doubleTitle, '/el/places/plateia-lafkou/index.html').violations.some(
          (v) => v.category === 'title' && v.message.includes('2 <title> elements'),
        ),
      ).toBe(true);
    });

    it('detects missing, multiple, or overly long meta descriptions (> 320 chars)', () => {
      const noDesc = sampleValidIndexableHtml.replace(
        /<meta\s+name=["']description["'][^>]*>/gis,
        '',
      );
      const longDesc = sampleValidIndexableHtml.replace(
        /content="Η κεντρική.*?καφενεία\."/gis,
        `content="${'Α'.repeat(DEFAULT_MAX_META_DESCRIPTION_LENGTH + 10)}"`,
      );

      const noDescRes = auditHtmlDocument(noDesc, '/el/places/plateia-lafkou/index.html');
      expect(noDescRes.violations.some((v) => v.category === 'description')).toBe(true);

      const longDescRes = auditHtmlDocument(longDesc, '/el/places/plateia-lafkou/index.html');
      expect(
        longDescRes.violations.some(
          (v) => v.category === 'description' && v.message.includes('exceeds maximum ceiling'),
        ),
      ).toBe(true);
    });

    it('enforces canonical absolute URL format, trailing slashes, and emitted route alignment', () => {
      const relativeCanonical = sampleValidIndexableHtml.replace(
        'https://lafkos-guide.vercel.app/el/places/plateia-lafkou/',
        '/el/places/plateia-lafkou/',
      );
      const missingSlashCanonical = sampleValidIndexableHtml.replace(
        'https://lafkos-guide.vercel.app/el/places/plateia-lafkou/',
        'https://lafkos-guide.vercel.app/el/places/plateia-lafkou',
      );
      const mismatchedRouteCanonical = sampleValidIndexableHtml.replace(
        'https://lafkos-guide.vercel.app/el/places/plateia-lafkou/',
        'https://lafkos-guide.vercel.app/el/places/other-route/',
      );

      expect(
        auditHtmlDocument(
          relativeCanonical,
          '/el/places/plateia-lafkou/index.html',
        ).violations.some((v) => v.category === 'canonical'),
      ).toBe(true);

      expect(
        auditHtmlDocument(
          missingSlashCanonical,
          '/el/places/plateia-lafkou/index.html',
        ).violations.some((v) => v.category === 'canonical'),
      ).toBe(true);

      expect(
        auditHtmlDocument(
          mismatchedRouteCanonical,
          '/el/places/plateia-lafkou/index.html',
        ).violations.some(
          (v) => v.category === 'canonical' && v.message.includes('does not match emitted route'),
        ),
      ).toBe(true);
    });

    it('enforces required hreflang alternates (el, en, x-default) and x-default alignment with Greek target', () => {
      const missingEn = sampleValidIndexableHtml.replace(
        /<link\s+rel=["']alternate["']\s+hreflang=["']en["'][^>]*>/gis,
        '',
      );
      const mismatchedXDefault = sampleValidIndexableHtml.replace(
        '<link rel="alternate" hreflang="x-default" href="https://lafkos-guide.vercel.app/el/places/plateia-lafkou/">',
        '<link rel="alternate" hreflang="x-default" href="https://lafkos-guide.vercel.app/en/places/lafkos-square/">',
      );

      expect(
        auditHtmlDocument(missingEn, '/el/places/plateia-lafkou/index.html').violations.some(
          (v) => v.category === 'hreflang' && v.message.includes('hreflang="en"'),
        ),
      ).toBe(true);

      expect(
        auditHtmlDocument(
          mismatchedXDefault,
          '/el/places/plateia-lafkou/index.html',
        ).violations.some(
          (v) =>
            v.category === 'hreflang' &&
            v.message.includes('does not match Greek canonical equivalent'),
        ),
      ).toBe(true);
    });

    it('enforces exactly one non-empty H1 element per indexable page', () => {
      const noH1 = sampleValidIndexableHtml.replace(/<h1>.*?<\/h1>/gis, '');
      const doubleH1 = sampleValidIndexableHtml.replace('</h1>', '</h1><h1>Δεύτερος Τίτλος</h1>');
      const emptyH1 = sampleValidIndexableHtml.replace(/<h1>.*?<\/h1>/gis, '<h1>   </h1>');

      expect(
        auditHtmlDocument(noH1, '/el/places/plateia-lafkou/index.html').violations.some(
          (v) => v.category === 'heading' && v.message.includes('missing an <h1>'),
        ),
      ).toBe(true);

      expect(
        auditHtmlDocument(doubleH1, '/el/places/plateia-lafkou/index.html').violations.some(
          (v) => v.category === 'heading' && v.message.includes('contains 2 <h1> headings'),
        ),
      ).toBe(true);

      expect(
        auditHtmlDocument(emptyH1, '/el/places/plateia-lafkou/index.html').violations.some(
          (v) => v.category === 'heading' && v.message.includes('empty <h1>'),
        ),
      ).toBe(true);
    });

    it('flags contradictory noindex directives on indexable pages', () => {
      const noindexHtml = sampleValidIndexableHtml.replace(
        '<meta name="robots" content="index, follow">',
        '<meta name="robots" content="noindex, nofollow">',
      );

      expect(
        auditHtmlDocument(noindexHtml, '/el/places/plateia-lafkou/index.html').violations.some(
          (v) => v.category === 'robots' && v.message.includes('contradictory noindex'),
        ),
      ).toBe(true);
    });

    it('requires noindex on 404 and root redirect pages', () => {
      const rootWithoutNoindex = `<!DOCTYPE html>
<html lang="el">
<head>
  <title>Lafkos Guide</title>
  <link rel="canonical" href="https://lafkos-guide.vercel.app/el/">
  <meta http-equiv="refresh" content="0;url=/el/">
</head>
<body></body>
</html>`;

      const rootRes = auditHtmlDocument(rootWithoutNoindex, '/index.html');
      expect(
        rootRes.violations.some(
          (v) =>
            v.category === 'robots' &&
            v.message.includes('Root redirect page is missing required noindex'),
        ),
      ).toBe(true);
    });
  });

  describe('Cross-Page Hreflang Reciprocity Audit', () => {
    it('flags asymmetric or missing reciprocal hreflang targets', () => {
      const greekData = {
        filePath: 'dist/el/places/plateia-lafkou/index.html',
        relativePath: '/el/places/plateia-lafkou/index.html',
        isRootRedirect: false,
        is404: false,
        isIndexable: true,
        canonicalUrl: 'https://lafkos-guide.vercel.app/el/places/plateia-lafkou/',
        hreflangMap: {
          el: 'https://lafkos-guide.vercel.app/el/places/plateia-lafkou/',
          en: 'https://lafkos-guide.vercel.app/en/places/lafkos-square/',
          'x-default': 'https://lafkos-guide.vercel.app/el/places/plateia-lafkou/',
        },
        h1Count: 1,
        robotsDirectives: [],
        jsonLdBlocks: [],
        links: [],
        fileSizeBytes: 1000,
      };

      const brokenEnglishData = {
        filePath: 'dist/en/places/lafkos-square/index.html',
        relativePath: '/en/places/lafkos-square/index.html',
        isRootRedirect: false,
        is404: false,
        isIndexable: true,
        canonicalUrl: 'https://lafkos-guide.vercel.app/en/places/lafkos-square/',
        hreflangMap: {
          el: 'https://lafkos-guide.vercel.app/el/places/wrong-target/', // Broken reciprocity
          en: 'https://lafkos-guide.vercel.app/en/places/lafkos-square/',
          'x-default': 'https://lafkos-guide.vercel.app/el/places/wrong-target/',
        },
        h1Count: 1,
        robotsDirectives: [],
        jsonLdBlocks: [],
        links: [],
        fileSizeBytes: 1000,
      };

      const pagesMap = new Map([
        [greekData.canonicalUrl, greekData],
        [brokenEnglishData.canonicalUrl, brokenEnglishData],
      ]);

      const violations = auditHreflangReciprocity(pagesMap);
      expect(
        violations.some(
          (v) =>
            v.category === 'hreflang' &&
            (v.message.includes('Asymmetric hreflang') || v.message.includes('does not resolve')),
        ),
      ).toBe(true);
    });
  });

  describe('Robots.txt & Sitemap Audit Units', () => {
    it('verifies that robots.txt requires production sitemap reference and allows crawling', () => {
      const nonExistentPath = resolve(process.cwd(), 'non-existent-folder-xyz');
      const missingRobotsViolations = auditRobotsTxt(nonExistentPath, {
        siteOrigin: DEFAULT_PRODUCTION_SITE_ORIGIN,
      });
      expect(missingRobotsViolations.some((v) => v.category === 'robots')).toBe(true);
    });

    it('flags missing sitemap-index.xml files', () => {
      const nonExistentPath = resolve(process.cwd(), 'non-existent-folder-xyz');
      const { violations } = auditSitemaps(nonExistentPath, new Map());
      expect(
        violations.some(
          (v) => v.category === 'sitemap' && v.message.includes('Missing "dist/sitemap-index.xml"'),
        ),
      ).toBe(true);
    });

    it('flags sub-sitemaps with non-production origin and duplicate references', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'sitemap-audit-test-'));
      try {
        const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://evil.com/sitemap-foreign.xml</loc></sitemap>
  <sitemap><loc>https://lafkos-guide.vercel.app/sitemap-0.xml</loc></sitemap>
  <sitemap><loc>https://lafkos-guide.vercel.app/sitemap-0.xml</loc></sitemap>
</sitemapindex>`;
        writeFileSync(join(tempDir, 'sitemap-index.xml'), sitemapIndex);

        const subSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://lafkos-guide.vercel.app/el/</loc></url>
  <url><loc>https://lafkos-guide.vercel.app/el/</loc></url>
</urlset>`;
        writeFileSync(join(tempDir, 'sitemap-0.xml'), subSitemap);

        const { violations } = auditSitemaps(tempDir, new Map());
        expect(
          violations.some(
            (v) =>
              v.category === 'sitemap' &&
              v.message.includes('does not start with production origin'),
          ),
        ).toBe(true);
        expect(
          violations.some(
            (v) =>
              v.category === 'sitemap' && v.message.includes('Duplicate sub-sitemap reference'),
          ),
        ).toBe(true);
        expect(
          violations.some(
            (v) => v.category === 'sitemap' && v.message.includes('Duplicate page URL in sitemap'),
          ),
        ).toBe(true);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Link Integrity Same-Origin Absolute and External Anchors', () => {
    it('correctly audits internal links from HTML document extraction', () => {
      const htmlWithSameOriginAnchors = sampleValidIndexableHtml.replace(
        '<a href="/el/places/">Επιστροφή στα μέρη</a>',
        '<a href="https://lafkos-guide.vercel.app/el/places/">Same Origin Absolute Link</a><a href="https://example.com/external">External Link</a><a href="//other.org/resource">Protocol Relative External</a>',
      );
      const { data, violations } = auditHtmlDocument(
        htmlWithSameOriginAnchors,
        '/el/places/plateia-lafkou/index.html',
      );
      expect(violations).toHaveLength(0);
      expect(data.links).toContain('https://lafkos-guide.vercel.app/el/places/');
      expect(data.links).toContain('https://example.com/external');
      expect(data.links).toContain('//other.org/resource');
    });

    it('enforces internal routing rules on same-origin absolute anchors while skipping external origins', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'link-audit-test-'));
      try {
        // Create mock indexable destination
        const elDir = join(tempDir, 'el', 'places', 'plateia-lafkou');
        mkdirSync(elDir, { recursive: true });
        writeFileSync(join(elDir, 'index.html'), '<html><body>Target</body></html>');

        // Create page with valid same-origin, valid external, broken same-origin, and missing slash same-origin
        const sourceHtml = `<!DOCTYPE html>
<html>
<body>
  <a href="https://lafkos-guide.vercel.app/el/places/plateia-lafkou/">Valid Same Origin Absolute</a>
  <a href="https://example.com/external/resource">Valid External Absolute</a>
  <a href="//external.org/protocol-relative">Valid External Protocol Relative</a>
  <a href="https://lafkos-guide.vercel.app/el/places/missing-slash">Missing Slash Same Origin</a>
  <a href="https://lafkos-guide.vercel.app/el/places/broken-dest/">Broken Dest Same Origin</a>
</body>
</html>`;
        writeFileSync(join(tempDir, 'index.html'), sourceHtml);

        const { checkedAnchorsCount, violations } = auditHtmlInternalLinks(tempDir, {
          siteOrigin: 'https://lafkos-guide.vercel.app',
        });

        // 3 internal same-origin anchors checked (1 valid, 2 invalid)
        expect(checkedAnchorsCount).toBe(3);

        expect(
          violations.some(
            (v) =>
              v.category === 'link-integrity' &&
              v.url?.includes('missing-slash') &&
              v.message.includes('missing required trailing slash'),
          ),
        ).toBe(true);

        expect(
          violations.some(
            (v) =>
              v.category === 'link-integrity' &&
              v.url?.includes('broken-dest') &&
              v.message.includes('resolves to unrendered destination file'),
          ),
        ).toBe(true);

        // Verify no violations for external links
        expect(violations.some((v) => v.url?.includes('example.com'))).toBe(false);
        expect(violations.some((v) => v.url?.includes('external.org'))).toBe(false);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Missing Output Directory Handling', () => {
    it('returns an unambiguous missing-dist failure when given a nonexistent directory', () => {
      const nonExistentPath = resolve(process.cwd(), 'non-existent-dist-folder-12345');
      const result = runFullSeoAudit(nonExistentPath);

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0].category).toBe('missing-dist');
      expect(result.violations[0].message).toContain('does not exist');
      expect(result.violations[0].message).toContain('pnpm build');
    });
  });
});

describe('Built Static Site SEO & Payload Quality Gates (dist/)', () => {
  const distDir = resolve(process.cwd(), 'dist');
  const distExists = existsSync(distDir);

  it('proves zero SEO, hreflang, link integrity, sitemap, robots, and payload violations across all built static output', () => {
    /*
     * Ordinary unit tests running on a fresh clone before `pnpm build` skip this
     * static output gate. In `pnpm test:seo` and CI, `pnpm build` runs prior to this
     * gate and STRICT_SEO_AUDIT=true ensures dist/ is mandatory.
     */
    if (!distExists) {
      if (process.env.STRICT_SEO_AUDIT === 'true') {
        expect.fail(
          'Build output directory dist/ is missing under strict SEO audit mode. Execute "pnpm build" first.',
        );
      }
      return;
    }

    const result = runFullSeoAudit(distDir);

    if (!result.passed) {
      const violationSummary = result.violations
        .slice(0, 20)
        .map((v) => `[${v.category}] ${v.file ? `${v.file}: ` : ''}${v.message}`)
        .join('\n');

      expect.fail(
        `Found ${result.violations.length} SEO/payload violation(s) across built site in dist/:\n${violationSummary}`,
      );
    }

    expect(result.passed).toBe(true);
    expect(result.summary.totalPages).toBeGreaterThan(100);
    expect(result.summary.indexablePages).toBeGreaterThan(100);
    expect(result.summary.rootRedirectPages).toBe(1);
    expect(result.summary.errorPages).toBe(1);
    expect(result.summary.totalLinksChecked).toBeGreaterThan(500);
    expect(result.summary.totalSitemapUrls).toBe(result.summary.indexablePages);
    expect(result.summary.greekHomepageSizeBytes).toBeLessThan(60 * 1024);
    expect(result.summary.englishHomepageSizeBytes).toBeLessThan(60 * 1024);
  });
});
