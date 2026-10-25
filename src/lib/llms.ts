import type { ContentDataset } from './content-api';
import type { Locale } from './locales';
import { DEFAULT_SITE_ORIGIN, normalizeTrailingSlash } from './urls';

/*
 * Builds the public `/llms.txt` index for AI search engines and agents.
 * The file is generated from the same content adapter as the pages, so every
 * linked title and summary stays aligned with the bilingual CMS source of truth.
 */

const languageLabels: Record<Locale, string> = {
  el: 'Greek',
  en: 'English',
};

function absoluteUrl(pathname: string): string {
  return `${DEFAULT_SITE_ORIGIN}${normalizeTrailingSlash(pathname)}`;
}

function entityLine(pathname: string, title: string, summary: string): string {
  const cleanTitle = title.replace(/\s+/g, ' ').trim() || pathname;
  const cleanSummary = summary.replace(/\s+/g, ' ').trim();
  const suffix = cleanSummary ? `: ${cleanSummary}` : '';
  return `- [${cleanTitle}](${absoluteUrl(pathname)})${suffix}`;
}

function section(
  heading: string,
  locale: Locale,
  kind: 'places' | 'trails' | 'stories',
  entries: Array<{
    slug: Record<Locale, string>;
    title: Record<Locale, string>;
    summary: Record<Locale, string>;
  }>,
): string[] {
  const lines = [`## ${heading} — ${languageLabels[locale]} (${locale})`, ''];
  for (const entry of entries) {
    lines.push(
      entityLine(
        `/${locale}/${kind}/${entry.slug[locale]}/`,
        entry.title[locale],
        entry.summary[locale],
      ),
    );
  }
  lines.push('');
  return lines;
}

export function buildLlmsTxt(dataset: ContentDataset): string {
  const lines: string[] = [
    '# Lafkos Guide',
    '',
    '> Independent bilingual cultural guide to Lafkos and South Pelion, Greece. Greek is the default locale; every page has an English counterpart.',
    '',
    `- Canonical site: ${absoluteUrl('/')}`,
    '- Languages: Greek (el, default) and English (en)',
    `- Build-time content source: ${dataset.source === 'sanity' ? 'Sanity CMS' : 'local seed archive'}`,
    '- Coverage: places and landmarks, hiking and drive routes, local history stories, events, and a historical timeline',
    '',
    '## Primary pages',
    '',
    `- [Greek home](${absoluteUrl('/el/')}): cultural guide to Lafkos and South Pelion`,
    `- [English home](${absoluteUrl('/en/')}): cultural guide to Lafkos and South Pelion`,
    `- [Interactive map](${absoluteUrl('/el/map/')}): places, trails, and points of interest across Lafkos and South Pelion`,
    `- [Places hub](${absoluteUrl('/el/places/')}): all landmarks, museums, fountains, and viewpoints`,
    `- [Trails hub](${absoluteUrl('/el/trails/')}): walking, drive, and mixed routes with distance and difficulty`,
    `- [Stories hub](${absoluteUrl('/el/stories/')}): local history, traditions, and seasonal events`,
    `- [Events](${absoluteUrl('/el/events/')}): the annual cycle of festivals and observances`,
    `- [Timeline](${absoluteUrl('/el/timeline/')}): five centuries of Lafkos history`,
    `- [Plan a visit](${absoluteUrl('/el/visit/')}): practical guidance before arriving`,
    '',
    '## Editorial notes',
    '',
    '- Pages cite their sources in a visible “Sources and documentation” section.',
    '- Seed entries are marked on the page and should be verified against local archives before citation as definitive history.',
    '- Coordinates use WGS84 longitude/latitude and stay inside the South Pelion bounds [23.08, 39.04, 23.42, 39.32].',
    '',
  ];

  for (const locale of ['el', 'en'] as const) {
    lines.push(...section('Places', locale, 'places', dataset.places));
    lines.push(...section('Trails', locale, 'trails', dataset.trails));
    lines.push(...section('Stories', locale, 'stories', dataset.stories));
  }

  lines.push('## Sitemaps', '');
  lines.push(`- [Sitemap index](${absoluteUrl('/sitemap-index.xml')})`);
  lines.push(`- [XML sitemap](${absoluteUrl('/sitemap-0.xml')})`);
  lines.push('');

  return lines.join('\n');
}
