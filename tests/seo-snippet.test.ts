import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { places, stories, trails } from '../src/data/content';
import {
  buildPlaceJsonLd,
  buildStoryJsonLd,
  buildTrailJsonLd,
  DEFAULT_SEO_DESCRIPTION_MAX_LENGTH,
  formatSeoSnippet,
} from '../src/lib/structured-data';
import type { LocalizedEditorialMetadata } from '../src/lib/content-api';
import { locales } from '../src/lib/locales';
import { getCopy } from '../src/lib/ui-copy';

/*
 * SEO Snippet Helper & Metadata Tuning Contracts (Task 9):
 * Verifies whitespace normalization, word-boundary truncation, punctuation safety,
 * non-positive maxLength handling, long unbroken token handling, editorial override preservation,
 * code-owned bilingual descriptions, and built HTML audit contracts.
 */
describe('SEO Snippet Helper & Metadata Tuning Contracts', () => {
  /*
   * Whitespace Normalization Contract:
   * Replaces multi-spaces, newlines, tabs, and trims start/end.
   */
  it('normalizes whitespace across tabs, newlines, and multi-spaces', () => {
    const input = '   Lafkos   is a \n\n mountain village \t in South Pelion.   ';
    const result = formatSeoSnippet(input, 160);
    expect(result).toBe('Lafkos is a mountain village in South Pelion.');
  });

  /*
   * Under-Limit Preservation Contract:
   * Strings within budget must not be modified or truncated.
   */
  it('preserves text within the character limit without altering content or punctuation', () => {
    const input = 'An 1861 mansion whose rooms host rotating exhibitions of art.';
    const result = formatSeoSnippet(input, 160);
    expect(result).toBe(input);
  });

  /*
   * Word-Boundary Truncation Contract:
   * Long strings are truncated at a word boundary with an ellipsis and must not exceed maxLength.
   */
  it('truncates at a word boundary without cutting words in half', () => {
    const input =
      'The largest settlement and historic administrative capital of South Pelion, set on a fertile plateau featuring grand stone mansions, a renowned 1913 neoclassical marble belfry, and a bustling central square.';
    const result = formatSeoSnippet(input, 160);

    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith('…')).toBe(true);
    expect(result).not.toMatch(/[a-zA-Z]neoclassical…/);
    expect(result).toBe(
      'The largest settlement and historic administrative capital of South Pelion, set on a fertile plateau featuring grand stone mansions, a renowned 1913…',
    );
  });

  /*
   * Punctuation Safety Contract:
   * Strips dangling punctuation before the ellipsis to prevent malformed endings like ",…" or ":…".
   */
  it('removes trailing punctuation before the ellipsis', () => {
    const inputWithComma =
      'First part of the description, second part of the description, and more text here.';
    const result = formatSeoSnippet(inputWithComma, 35);

    expect(result.length).toBeLessThanOrEqual(35);
    expect(result).not.toContain(',…');
    expect(result).not.toContain(':…');
    expect(result).not.toContain(';…');
    expect(result).not.toContain('-…');
    expect(result).not.toContain('!…');
    expect(result).not.toContain('?…');
  });

  /*
   * Delimiter Balance Contract:
   * Strips unclosed opening parentheses or brackets when cut occurs inside a parenthetical clause.
   */
  it('cleans unclosed opening parentheses when truncation happens inside a parenthetical', () => {
    const input =
      'Αμφιθεατρικά χτισμένο ιστορικό κεφαλοχώρι του Νοτίου Πηλίου με γνήσια πηλιορείτικη αρχιτεκτονική, τον μεγαλοπρεπή ναό της Κοιμήσεως της Θεοτόκου (1760), πλακόστρωτη πλατεία με πλατάνια και κομβικό σταυροδρόμι μονοπατιών προς τις αιγαιοπελαγίτικες ακτές.';
    const result = formatSeoSnippet(input, 160);

    expect(result.length).toBeLessThanOrEqual(160);
    expect(result).not.toContain('(1760…');
    expect(result).not.toContain('(…');
    expect(result.endsWith('…')).toBe(true);
  });

  /*
   * Long Unbroken Token Safety Contract:
   * Safely truncates single unbroken strings longer than maxLength without crashing or exceeding limit.
   */
  it('safely handles long unbroken tokens exceeding maxLength', () => {
    const unbroken = 'A'.repeat(200);
    const result = formatSeoSnippet(unbroken, 50);

    expect(result.length).toBe(50);
    expect(result).toBe(`${'A'.repeat(49)}…`);
  });

  /*
   * Non-Positive MaxLength Contract:
   * Returns empty string when maxLength <= 0, avoiding negative String.slice behavior.
   */
  it('returns an empty string when maxLength is less than or equal to zero', () => {
    expect(formatSeoSnippet('Any text string', 0)).toBe('');
    expect(formatSeoSnippet('Any text string', -5)).toBe('');
    expect(formatSeoSnippet('Any text string', -100)).toBe('');
  });

  /*
   * Empty & Falsy Input Contract:
   * Gracefully returns empty string for empty or nullish values.
   */
  it('returns empty string for null, undefined, or empty inputs', () => {
    expect(formatSeoSnippet('')).toBe('');
    expect(formatSeoSnippet(null)).toBe('');
    expect(formatSeoSnippet(undefined)).toBe('');
    expect(formatSeoSnippet('   ')).toBe('');
  });

  /*
   * Default Maximum Constant Contract:
   * Confirms DEFAULT_SEO_DESCRIPTION_MAX_LENGTH is 160.
   */
  it('exports a defensible default maximum snippet length constant of 160', () => {
    expect(DEFAULT_SEO_DESCRIPTION_MAX_LENGTH).toBe(160);
  });

  /*
   * Code-Owned Bilingual Metadata Contract:
   * Confirms privacy, accessibility, events, and timeline have distinct, factual,
   * non-title-only descriptions in ui-copy between 100 and 160 characters.
   */
  it('provides distinct, factual bilingual meta descriptions for privacy, accessibility, events, and timeline', () => {
    for (const locale of locales) {
      const ui = getCopy(locale);

      // Privacy: factual parity with on-page commitments (no advertising cookies, on-device GPS, account-free)
      expect(ui.privacyTitle).toBeDefined();
      expect(ui.privacyDescription).toBeDefined();
      expect(ui.privacyDescription).not.toBe(ui.privacyTitle);
      expect(ui.privacyDescription.length).toBeGreaterThanOrEqual(100);
      expect(ui.privacyDescription.length).toBeLessThanOrEqual(160);
      expect(ui.privacyDescription).not.toContain('tracking cookies');

      // Accessibility
      expect(ui.accessibilityTitle).toBeDefined();
      expect(ui.accessibilityDescription).toBeDefined();
      expect(ui.accessibilityDescription).not.toBe(ui.accessibilityTitle);
      expect(ui.accessibilityDescription.length).toBeGreaterThanOrEqual(100);
      expect(ui.accessibilityDescription.length).toBeLessThanOrEqual(160);

      // Events
      expect(ui.eventsTitle).toBeDefined();
      expect(ui.eventsDescription).toBeDefined();
      expect(ui.eventsDescription.length).toBeGreaterThanOrEqual(100);
      expect(ui.eventsDescription.length).toBeLessThanOrEqual(160);

      // Timeline
      expect(ui.timelineTitle).toBeDefined();
      expect(ui.timelineDescription).toBeDefined();
      expect(ui.timelineDescription.length).toBeGreaterThanOrEqual(100);
      expect(ui.timelineDescription.length).toBeLessThanOrEqual(160);
    }

    // Greek and English descriptions must differ
    expect(getCopy('el').privacyDescription).not.toBe(getCopy('en').privacyDescription);
    expect(getCopy('el').accessibilityDescription).not.toBe(getCopy('en').accessibilityDescription);
    expect(getCopy('el').eventsDescription).not.toBe(getCopy('en').eventsDescription);
    expect(getCopy('el').timelineDescription).not.toBe(getCopy('en').timelineDescription);
  });

  /*
   * Template Integration Contract:
   * Verifies that privacy and accessibility templates use their dedicated meta descriptions,
   * events and timeline templates split concise meta descriptions from rich visible ledes,
   * and detail templates format fallback summaries while allowing editorial overrides.
   */
  it('integrates snippet and copy contracts into privacy, accessibility, events, timeline, and detail templates', () => {
    const privacyContent = readFileSync(resolve('src/pages/[locale]/privacy/index.astro'), 'utf8');
    expect(privacyContent).toContain('ui.privacyDescription');
    expect(privacyContent).not.toMatch(/description=\{ui\.privacyTitle\}/);

    const accessibilityContent = readFileSync(
      resolve('src/pages/[locale]/accessibility/index.astro'),
      'utf8',
    );
    expect(accessibilityContent).toContain('ui.accessibilityDescription');
    expect(accessibilityContent).not.toMatch(/description=\{ui\.accessibilityTitle\}/);

    const eventsContent = readFileSync(resolve('src/pages/[locale]/events/index.astro'), 'utf8');
    expect(eventsContent).toContain('ui.eventsDescription');
    expect(eventsContent).toContain('heroLede');
    expect(eventsContent).toContain('<p class="lede">{heroLede}</p>');

    const timelineContent = readFileSync(resolve('src/pages/[locale]/timeline.astro'), 'utf8');
    expect(timelineContent).toContain('ui.timelineDescription');
    expect(timelineContent).toContain('heroLede');
    expect(timelineContent).toContain('<p class="lede">{heroLede}</p>');

    const detailTemplates = [
      resolve('src/pages/[locale]/places/[slug].astro'),
      resolve('src/pages/[locale]/trails/[slug].astro'),
      resolve('src/pages/[locale]/stories/[slug].astro'),
    ];

    for (const templatePath of detailTemplates) {
      const content = readFileSync(templatePath, 'utf8');
      expect(content).toContain('formatSeoSnippet');
      expect(content).toContain('getLocalizedEditorialMetadata');
    }
  });

  /*
   * Editorial Override Preservation Contract:
   * Explicit localized editorial SEO descriptions (up to the 320-char schema maximum)
   * must be preserved verbatim without truncation in both helper consumers and structured data graphs.
   */
  it('preserves explicit editorial SEO descriptions verbatim without truncation up to domain schema max (320 chars)', () => {
    const longEditorialDescription =
      'This is an explicit, intentionally long editorial description authored by CMS editors that exceeds standard snippet thresholds (around 220 characters long) to convey specialized historical nuance and local significance without being truncated by automated fallback helpers.';

    const mockEditorial: LocalizedEditorialMetadata = {
      description: longEditorialDescription,
      title: 'Editorial Override Title',
    };

    const place = places[0];
    const placeJsonLd = buildPlaceJsonLd({
      place,
      locale: 'en',
      editorial: mockEditorial,
    });

    const attraction = placeJsonLd['@graph'][1];
    expect(attraction.description).toBe(longEditorialDescription);

    const trail = trails[0];
    const trailJsonLd = buildTrailJsonLd({
      trail,
      locale: 'en',
      editorial: mockEditorial,
    });
    const trip = trailJsonLd['@graph'][1];
    expect(trip.description).toBe(longEditorialDescription);

    const story = stories[0];
    const storyJsonLd = buildStoryJsonLd({
      story,
      locale: 'en',
      editorial: mockEditorial,
    });
    const article = storyJsonLd['@graph'][1];
    expect(article.description).toBe(longEditorialDescription);
  });

  /*
   * Fallback Truncation in Structured Data Contract:
   * When editorial overrides are absent, structured data graphs receive the clean truncated snippet.
   */
  it('applies formatSeoSnippet to fallback summaries in structured data graphs when editorial is absent', () => {
    const longPlace = places.find((p) => p.summary.el.length > 160);
    expect(longPlace).toBeDefined();
    if (!longPlace) return;

    const placeJsonLd = buildPlaceJsonLd({
      place: longPlace,
      locale: 'el',
    });

    const attraction = placeJsonLd['@graph'][1];
    expect(attraction.description.length).toBeLessThanOrEqual(160);
    expect(attraction.description).toBe(formatSeoSnippet(longPlace.summary.el, 160));
  });

  /*
   * Built HTML Metadata Audit Contract:
   * Enforces global domain schema max (<=320 chars) across all built indexable HTML pages,
   * enforces standard <=160 chars on code-owned routes and fallback seed entity pages,
   * excludes non-indexable routes (root redirect and 404), and verifies OG / JSON-LD description parity.
   */
  it('audits all built HTML pages for meta description presence, max-length, and graph alignment', () => {
    const distDir = resolve('dist');
    if (!existsSync(distDir)) return;

    function getAllHtmlFiles(dir: string): string[] {
      const files: string[] = [];
      for (const item of readdirSync(dir)) {
        const fullPath = resolve(dir, item);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...getAllHtmlFiles(fullPath));
        } else if (item.endsWith('.html')) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const htmlFiles = getAllHtmlFiles(distDir);
    expect(htmlFiles.length).toBeGreaterThan(0);

    const codeOwnedPathPatterns = [
      /\/(?:el|en)\/$/,
      /\/(?:el|en)\/about\/$/,
      /\/(?:el|en)\/accessibility\/$/,
      /\/(?:el|en)\/events\/$/,
      /\/(?:el|en)\/map\/$/,
      /\/(?:el|en)\/places\/$/,
      /\/(?:el|en)\/privacy\/$/,
      /\/(?:el|en)\/stories\/$/,
      /\/(?:el|en)\/timeline\/$/,
      /\/(?:el|en)\/trails\/$/,
      /\/(?:el|en)\/visit\/$/,
    ];

    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf8');
      const isRootRedirect = file.endsWith('dist/index.html');
      const is404 = file.includes('404.html') || file.includes('404/index.html');
      const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
      const isNoindex = robotsMatch ? robotsMatch[1].includes('noindex') : false;

      // Root redirect and 404 are non-indexable
      if (isRootRedirect || is404 || isNoindex) {
        continue;
      }

      // 1. Meta description exists and is non-empty
      const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
      expect(descMatch, `Indexable page ${file} must have a meta description`).not.toBeNull();
      const desc = descMatch![1].trim();
      expect(desc.length, `Meta description for ${file} must not be empty`).toBeGreaterThan(0);

      // 2. Global domain schema maximum: all descriptions must not exceed 320 characters
      expect(
        desc.length,
        `Meta description for ${file} exceeds global schema maximum of 320 characters (actual: ${desc.length})`,
      ).toBeLessThanOrEqual(320);

      // 3. Code-owned routes and seed fallback detail pages (current fixtures) must be <= 160 characters
      const relativeRoute = file.replace(distDir, '').replace(/index\.html$/, '');
      const isCodeOwned = codeOwnedPathPatterns.some((pattern) => pattern.test(relativeRoute));
      if (isCodeOwned) {
        expect(
          desc.length,
          `Code-owned page ${file} description must be <= 160 characters (actual: ${desc.length})`,
        ).toBeLessThanOrEqual(160);
      } else {
        // For current seed entity detail pages without editorial overrides, verify fallback cap
        expect(
          desc.length,
          `Seed fallback entity page ${file} description must be <= 160 characters (actual: ${desc.length})`,
        ).toBeLessThanOrEqual(160);
      }

      // 4. Open Graph description matches meta description
      const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
      if (ogDescMatch) {
        expect(ogDescMatch[1].trim(), `OG description must match meta description in ${file}`).toBe(
          desc,
        );
      }

      // 5. Twitter description matches meta description
      const twitterDescMatch = html.match(
        /<meta\s+name="twitter:description"\s+content="([^"]*)"/i,
      );
      if (twitterDescMatch) {
        expect(
          twitterDescMatch[1].trim(),
          `Twitter description must match meta description in ${file}`,
        ).toBe(desc);
      }

      // 6. If page has JSON-LD with description, it matches meta description
      const jsonLdMatch = html.match(
        /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i,
      );
      if (jsonLdMatch) {
        try {
          const parsed = JSON.parse(jsonLdMatch[1]);
          const graph = parsed['@graph'];
          if (Array.isArray(graph)) {
            const entity = graph.find(
              (node: Record<string, unknown>) =>
                node['@type'] === 'TouristAttraction' ||
                node['@type'] === 'TouristTrip' ||
                node['@type'] === 'Article',
            );
            if (entity && typeof entity.description === 'string') {
              expect(
                entity.description,
                `JSON-LD description must match meta description in ${file}`,
              ).toBe(desc);
            }
          }
        } catch {
          // JSON-LD parsing handled by structured-data test suite
        }
      }
    }
  });
});
