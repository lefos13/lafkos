import { describe, expect, it } from 'vitest';
import { categories, places, stories, trails } from '../src/data/content';
import type { ContentDataset } from '../src/lib/content-api';
import { buildLlmsTxt } from '../src/lib/llms';

/*
 * The public llms.txt index is a machine-readable surface: a missing locale or
 * entity silently removes the guide from AI citations, so assert coverage rather
 * than a snapshot of prose.
 */
describe('llms.txt index', () => {
  const dataset: ContentDataset = {
    places,
    trails,
    stories,
    categories,
    source: 'seed',
  };
  const output = buildLlmsTxt(dataset);

  it('declares the canonical origin, both locales, and the content source', () => {
    expect(output.startsWith('# Lafkos Guide\n')).toBe(true);
    expect(output).toContain('https://lafkos-guide.vercel.app/');
    expect(output).toContain('Greek (el, default) and English (en)');
    expect(output).toContain('Build-time content source: local seed archive');
    expect(output).toContain('https://lafkos-guide.vercel.app/sitemap-index.xml');
  });

  it('lists every published entity in both languages with an absolute URL', () => {
    for (const locale of ['el', 'en'] as const) {
      for (const place of places) {
        expect(output).toContain(
          `[${place.title[locale]}](https://lafkos-guide.vercel.app/${locale}/places/${place.slug[locale]}/)`,
        );
      }
      for (const trail of trails) {
        expect(output).toContain(
          `[${trail.title[locale]}](https://lafkos-guide.vercel.app/${locale}/trails/${trail.slug[locale]}/)`,
        );
      }
      for (const story of stories) {
        expect(output).toContain(
          `[${story.title[locale]}](https://lafkos-guide.vercel.app/${locale}/stories/${story.slug[locale]}/)`,
        );
      }
    }
  });

  it('normalizes summaries to one line and emits no undefined values', () => {
    expect(output).not.toContain('undefined');
    expect(output).not.toContain('\n\n\n');
    expect(output).not.toMatch(/\]\([^)]*\s[^)]*\)/);
  });
});
