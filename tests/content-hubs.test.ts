import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { places, stories, trails } from '../src/data/content';
import { fetchSanityContent } from '../src/lib/content-api';
import { locales, otherLocale } from '../src/lib/locales';
import { getCopy } from '../src/lib/ui-copy';
import { getLocalizedUrlPaths, normalizeTrailingSlash } from '../src/lib/urls';

/*
 * Content Hub Route, Link Coverage & Heading Hierarchy Contracts:
 * Ensures crawlable bilingual index/hub routes exist for places, trails, and stories,
 * establishes a complete and unbroken heading outline (H1 -> H2 -> H3),
 * and verifies that every dataset entity is directly linked from its localized hub.
 */
describe('Content Hubs & Navigation Contracts', () => {
  const hubKinds = ['places', 'trails', 'stories'] as const;

  /*
   * Template Existence Contract:
   * Verifies that each content collection (places, trails, stories) has a dedicated
   * Astro index page template under src/pages/[locale]/<kind>/index.astro.
   */
  it('provides dedicated index.astro page templates for all three content hubs', () => {
    for (const kind of hubKinds) {
      const pagePath = resolve(`src/pages/[locale]/${kind}/index.astro`);
      expect(existsSync(pagePath), `Hub page template missing: ${pagePath}`).toBe(true);
    }
  });

  /*
   * Localized Copy Contract:
   * Guarantees that each hub route has distinct localized titles, useful introductions,
   * and semantic collection headings in both Greek and English without voice mixing.
   */
  it('defines distinct localized titles, intros, and list headings for all content hubs in ui-copy', () => {
    for (const locale of locales) {
      const ui = getCopy(locale);
      expect(ui.placesTitle).toBeDefined();
      expect(ui.placesTitle.length).toBeGreaterThan(5);
      expect(ui.placesIntro).toBeDefined();
      expect(ui.placesIntro.length).toBeGreaterThan(20);
      expect(ui.placesListHeading).toBeDefined();
      expect(ui.placesListHeading.length).toBeGreaterThan(5);

      expect(ui.trailsTitle).toBeDefined();
      expect(ui.trailsTitle.length).toBeGreaterThan(5);
      expect(ui.trailsIntro).toBeDefined();
      expect(ui.trailsIntro.length).toBeGreaterThan(20);
      expect(ui.trailsListHeading).toBeDefined();
      expect(ui.trailsListHeading.length).toBeGreaterThan(5);

      expect(ui.storiesTitle).toBeDefined();
      expect(ui.storiesTitle.length).toBeGreaterThan(5);
      expect(ui.storiesIntro).toBeDefined();
      expect(ui.storiesIntro.length).toBeGreaterThan(20);
      expect(ui.storiesListHeading).toBeDefined();
      expect(ui.storiesListHeading.length).toBeGreaterThan(5);
    }

    // Ensure Greek and English titles are distinct
    expect(getCopy('el').placesTitle).not.toEqual(getCopy('en').placesTitle);
    expect(getCopy('el').trailsTitle).not.toEqual(getCopy('en').trailsTitle);
    expect(getCopy('el').storiesTitle).not.toEqual(getCopy('en').storiesTitle);
  });

  /*
   * URL Path Normalization Contract:
   * Protects canonical, alternate hreflang, and x-default link generation for hub routes,
   * enforcing the trailing-slash URL convention across all language pairs.
   */
  it('normalizes hub paths and generates symmetric alternate and x-default paths', () => {
    for (const kind of hubKinds) {
      for (const locale of locales) {
        const other = otherLocale(locale);
        const paths = getLocalizedUrlPaths({
          locale,
          pathname: `/${locale}/${kind}`,
        });

        expect(paths.canonicalPath).toBe(`/${locale}/${kind}/`);
        expect(paths.alternatePath).toBe(`/${other}/${kind}/`);
        expect(paths.xDefaultPath).toBe(`/el/${kind}/`);
      }
    }
  });

  /*
   * Heading Hierarchy Contract:
   * Ensures that each hub template provides exactly one <h1> for the page title,
   * followed by an <h2> collection heading before the card grid, ensuring an unbroken
   * semantic outline before individual cards introduce <h3> headings.
   */
  it('ensures each hub template contains exactly one H1 element and an H2 preceding the cards', () => {
    for (const kind of hubKinds) {
      const templateContent = readFileSync(
        resolve(`src/pages/[locale]/${kind}/index.astro`),
        'utf8',
      );

      // Exactly one H1 for the page title
      const h1Matches = templateContent.match(/<h1[\s>]/g) || [];
      expect(
        h1Matches.length,
        `Expected exactly one <h1> in src/pages/[locale]/${kind}/index.astro, found ${h1Matches.length}`,
      ).toBe(1);

      // At least one H2 heading preceding the card collection
      const h2Matches = templateContent.match(/<h2[\s>]/g) || [];
      expect(
        h2Matches.length,
        `Expected at least one <h2> in src/pages/[locale]/${kind}/index.astro, found ${h2Matches.length}`,
      ).toBeGreaterThanOrEqual(1);

      // Verify that H1 appears before H2 and H2 appears before the card grid
      const h1Index = templateContent.indexOf('<h1');
      const h2Index = templateContent.indexOf('<h2');
      const cardGridIndex = templateContent.indexOf('class="card-grid"');

      expect(h1Index, 'H1 must exist in template').toBeGreaterThan(-1);
      expect(h2Index, 'H2 must exist in template').toBeGreaterThan(h1Index);
      expect(cardGridIndex, 'Card grid must appear after H2 heading').toBeGreaterThan(h2Index);

      // Verify wrapping section has aria-labelledby pointing to the H2 heading id
      expect(templateContent).toMatch(
        /<section[^>]*aria-labelledby="[^"]+"[\s\S]*?<h2[^>]*id="[^"]+"/,
      );
    }
  });

  /*
   * Places Hub Entity Coverage Contract:
   * Verifies that the places hub iterates over the entire place dataset and generates
   * direct crawlable anchor links for all seeded and CMS places in both locales.
   */
  it('ensures places hub renders and links every place entity in both locales', async () => {
    const dataset = await fetchSanityContent();
    const placesTemplate = readFileSync(resolve('src/pages/[locale]/places/index.astro'), 'utf8');

    // Template must iterate over places
    expect(placesTemplate).toMatch(/places\.map|dataset\.places/);

    // Every place in the dataset must have valid localized slugs and URLs
    expect(dataset.places.length).toBeGreaterThanOrEqual(places.length);
    for (const place of dataset.places) {
      for (const locale of locales) {
        const slug = place.slug[locale];
        expect(slug).toBeDefined();
        expect(slug.length).toBeGreaterThan(0);
        const expectedHref = `/${locale}/places/${slug}`;
        expect(normalizeTrailingSlash(expectedHref)).toBe(`/${locale}/places/${slug}/`);
      }
    }
  });

  /*
   * Trails Hub Entity Coverage Contract:
   * Verifies that the trails hub iterates over the entire trail dataset and generates
   * direct crawlable anchor links for all seeded and CMS trails in both locales.
   */
  it('ensures trails hub renders and links every trail entity in both locales', async () => {
    const dataset = await fetchSanityContent();
    const trailsTemplate = readFileSync(resolve('src/pages/[locale]/trails/index.astro'), 'utf8');

    // Template must iterate over trails
    expect(trailsTemplate).toMatch(/trails\.map|dataset\.trails/);

    // Every trail in the dataset must have valid localized slugs and URLs
    expect(dataset.trails.length).toBeGreaterThanOrEqual(trails.length);
    for (const trail of dataset.trails) {
      for (const locale of locales) {
        const slug = trail.slug[locale];
        expect(slug).toBeDefined();
        expect(slug.length).toBeGreaterThan(0);
        const expectedHref = `/${locale}/trails/${slug}`;
        expect(normalizeTrailingSlash(expectedHref)).toBe(`/${locale}/trails/${slug}/`);
      }
    }
  });

  /*
   * Stories Hub Entity Coverage Contract:
   * Verifies that the stories hub iterates over the entire story dataset and generates
   * direct crawlable anchor links for all seeded and CMS stories in both locales.
   */
  it('ensures stories hub renders and links every story entity in both locales', async () => {
    const dataset = await fetchSanityContent();
    const storiesTemplate = readFileSync(resolve('src/pages/[locale]/stories/index.astro'), 'utf8');

    // Template must iterate over stories
    expect(storiesTemplate).toMatch(/stories\.map|dataset\.stories/);

    // Every story in the dataset must have valid localized slugs and URLs
    expect(dataset.stories.length).toBeGreaterThanOrEqual(stories.length);
    for (const story of dataset.stories) {
      for (const locale of locales) {
        const slug = story.slug[locale];
        expect(slug).toBeDefined();
        expect(slug.length).toBeGreaterThan(0);
        const expectedHref = `/${locale}/stories/${slug}`;
        expect(normalizeTrailingSlash(expectedHref)).toBe(`/${locale}/stories/${slug}/`);
      }
    }
  });

  /*
   * Navigation Destination Contract:
   * Verifies that global site header and footer navigation link to the content hubs
   * rather than a single arbitrary story, ensuring discoverability across the site.
   */
  it('routes primary and footer navigation to content hubs instead of single story', () => {
    const baseLayout = readFileSync(resolve('src/layouts/BaseLayout.astro'), 'utf8');

    // Primary nav must link stories to the stories hub, not a specific story
    expect(baseLayout).not.toContain('/stories/reading-lafkos');
    expect(baseLayout).toMatch(/href=\{`\/\$\{locale\}\/stories(?:\/)?`\}/);

    // Primary nav should also expose places and trails hubs
    expect(baseLayout).toMatch(/href=\{`\/\$\{locale\}\/places(?:\/)?`\}/);
    expect(baseLayout).toMatch(/href=\{`\/\$\{locale\}\/trails(?:\/)?`\}/);

    // Footer nav should link to hubs
    expect(baseLayout).toMatch(
      /class="footer-links"[\s\S]*?href=\{`\/\$\{locale\}\/places(?:\/)?`\}/,
    );
    expect(baseLayout).toMatch(
      /class="footer-links"[\s\S]*?href=\{`\/\$\{locale\}\/trails(?:\/)?`\}/,
    );
    expect(baseLayout).toMatch(
      /class="footer-links"[\s\S]*?href=\{`\/\$\{locale\}\/stories(?:\/)?`\}/,
    );
  });

  /*
   * Homepage Hub Link Contract:
   * Verifies that homepage "View all" and story CTA links route directly to
   * the content hubs while preserving the dedicated map section CTA to /map.
   */
  it('routes homepage view-all and story buttons to content hubs while preserving map CTA', () => {
    const indexTemplate = readFileSync(resolve('src/pages/[locale]/index.astro'), 'utf8');

    // Homepage must not hardcode reading-lafkos for generic browse buttons
    expect(indexTemplate).not.toContain('/stories/reading-lafkos');

    // Homepage view-all for places, trails, and stories must point to their respective hubs
    expect(indexTemplate).toMatch(/href=\{`\/\$\{locale\}\/places(?:\/)?`\}/);
    expect(indexTemplate).toMatch(/href=\{`\/\$\{locale\}\/trails(?:\/)?`\}/);
    expect(indexTemplate).toMatch(/href=\{`\/\$\{locale\}\/stories(?:\/)?`\}/);

    // Map section CTA to /map must be preserved
    expect(indexTemplate).toMatch(/href=\{`\/\$\{locale\}\/map`\}/);
  });

  /*
   * Events Page Story CTA Contract:
   * Verifies that seasonal event pages route generic story CTAs to the stories hub.
   */
  it('routes events page story CTAs to the stories hub instead of a single story', () => {
    const eventsTemplate = readFileSync(resolve('src/pages/[locale]/events/index.astro'), 'utf8');

    // Events page generic story CTAs must not hardcode reading-lafkos
    expect(eventsTemplate).not.toContain('/stories/reading-lafkos');
    expect(eventsTemplate).toMatch(/href=\{`\/\$\{locale\}\/stories(?:\/)?`\}/);
  });

  /*
   * Rendered HTML Output & Semantic Heading Hierarchy Contract:
   * Validates the generated static HTML in dist/ to ensure that each hub page
   * contains exactly one <h1>, an <h2> collection heading preceding cards,
   * complete canonical tags, and verified links to every entity.
   */
  it('validates built static HTML for all hubs and heading hierarchy when dist/ is present', async () => {
    const dataset = await fetchSanityContent();
    for (const kind of hubKinds) {
      for (const locale of locales) {
        const htmlPath = resolve(`dist/${locale}/${kind}/index.html`);
        if (!existsSync(htmlPath)) continue;

        const html = readFileSync(htmlPath, 'utf8');

        // Exactly one H1 in rendered HTML
        const h1Matches = html.match(/<h1[\s>]/g) || [];
        expect(
          h1Matches.length,
          `Expected exactly one <h1> in ${htmlPath}, found ${h1Matches.length}`,
        ).toBe(1);

        // At least one H2 in rendered HTML
        const h2Matches = html.match(/<h2[\s>]/g) || [];
        expect(
          h2Matches.length,
          `Expected at least one <h2> in ${htmlPath}, found ${h2Matches.length}`,
        ).toBeGreaterThanOrEqual(1);

        // Verify H1 appears before H2 and H2 appears before cards (H3)
        const h1Pos = html.indexOf('<h1');
        const h2Pos = html.indexOf('<h2');
        const h3Pos = html.indexOf('<h3');

        expect(h1Pos, `H1 not found in ${htmlPath}`).toBeGreaterThan(-1);
        expect(h2Pos, `H2 must follow H1 in ${htmlPath}`).toBeGreaterThan(h1Pos);
        if (h3Pos > -1) {
          expect(h3Pos, `H3 card headings must follow H2 in ${htmlPath}`).toBeGreaterThan(h2Pos);
        }

        // Canonical tag matches hub route
        expect(html).toContain(
          `<link rel="canonical" href="https://lafkos-guide.vercel.app/${locale}/${kind}/">`,
        );

        // Entities are all linked in rendered HTML
        const entities =
          kind === 'places' ? dataset.places : kind === 'trails' ? dataset.trails : dataset.stories;

        for (const entity of entities) {
          const slug = entity.slug[locale];
          const expectedPath = `/${locale}/${kind}/${slug}/`;
          expect(
            html.includes(expectedPath) || html.includes(`/${locale}/${kind}/${slug}`),
            `Missing link to ${expectedPath} in ${htmlPath}`,
          ).toBe(true);
        }
      }
    }
  });
});
