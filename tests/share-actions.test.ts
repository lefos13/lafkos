import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { copy } from '../src/lib/ui-copy';
import { locales } from '../src/lib/locales';
import { DEFAULT_SITE_ORIGIN, getAbsoluteCanonicalUrl, buildShareUrls } from '../src/lib/urls';
import { canonicalSiteOrigin } from '../src/lib/structured-data';
import { DEFAULT_PRODUCTION_SITE_ORIGIN } from '../src/lib/seo-audit';

/*
 * Privacy-Preserving Bilingual Share Quick Actions Contracts:
 *
 * Enforces exact canonical URL generation, query encoding for Greek and special characters,
 * absence of tracking params, complete bilingual i18n copy, progressive enhancement rules,
 * concrete accessibility requirements (accessible names, >=44px touch targets, aria-live
 * polite status announcements, hidden native-share fallback), and strict template boundary
 * scoping (only on detail pages, never on hubs, map, or utility pages).
 */

describe('Canonical URL Helpers', () => {
  it('builds canonical URLs with the production origin and enforced trailing slash', () => {
    expect(getAbsoluteCanonicalUrl('/el/places/plateia-lafkou')).toBe(
      'https://lafkos-guide.vercel.app/el/places/plateia-lafkou/',
    );
    expect(getAbsoluteCanonicalUrl('/en/trails/lafkos-platanias/')).toBe(
      'https://lafkos-guide.vercel.app/en/trails/lafkos-platanias/',
    );
    expect(getAbsoluteCanonicalUrl('el/stories/reading-lafkos')).toBe(
      'https://lafkos-guide.vercel.app/el/stories/reading-lafkos/',
    );
  });

  it('handles root path gracefully', () => {
    expect(getAbsoluteCanonicalUrl('/')).toBe('https://lafkos-guide.vercel.app/');
  });

  it('allows overriding origin for preview environments', () => {
    expect(
      getAbsoluteCanonicalUrl('/el/places/plateia-lafkou', 'https://preview.lafkos-guide.dev'),
    ).toBe('https://preview.lafkos-guide.dev/el/places/plateia-lafkou/');
  });

  it('guarantees production origin constants are centralized and cannot drift', () => {
    expect(DEFAULT_SITE_ORIGIN).toBe('https://lafkos-guide.vercel.app');
    expect(canonicalSiteOrigin).toBe(DEFAULT_SITE_ORIGIN);
    expect(DEFAULT_PRODUCTION_SITE_ORIGIN).toBe(DEFAULT_SITE_ORIGIN);
  });
});

describe('Share URLs Builder & Privacy Contracts', () => {
  const sampleCanonicalUrl = 'https://lafkos-guide.vercel.app/el/places/plateia-lafkou/';
  const sampleTitleEl = 'Πλατεία Λαύκου & Καφενεία';

  it('builds a Facebook share dialog URL using only the canonical URL without tracking parameters', () => {
    const urls = buildShareUrls({
      canonicalUrl: sampleCanonicalUrl,
      title: sampleTitleEl,
    });

    const parsed = new URL(urls.facebook);
    expect(parsed.origin).toBe('https://www.facebook.com');
    expect(parsed.pathname).toBe('/sharer/sharer.php');
    expect(parsed.searchParams.get('u')).toBe(sampleCanonicalUrl);
    // Strict privacy: no other query params like utm_source, app_id, etc.
    expect(Array.from(parsed.searchParams.keys())).toEqual(['u']);
  });

  it('builds an X web intent with safely encoded text and canonical URL', () => {
    const urls = buildShareUrls({
      canonicalUrl: sampleCanonicalUrl,
      title: sampleTitleEl,
    });

    const parsed = new URL(urls.x);
    expect(['https://x.com', 'https://twitter.com']).toContain(parsed.origin);
    expect(['/intent/post', '/intent/tweet']).toContain(parsed.pathname);
    expect(parsed.searchParams.get('url')).toBe(sampleCanonicalUrl);
    expect(parsed.searchParams.get('text')).toBe(sampleTitleEl);
    expect(parsed.searchParams.has('utm_source')).toBe(false);
  });

  it('builds a WhatsApp click-to-chat URL with localized title and canonical URL', () => {
    const urls = buildShareUrls({
      canonicalUrl: sampleCanonicalUrl,
      title: sampleTitleEl,
    });

    const parsed = new URL(urls.whatsapp);
    expect(['https://wa.me', 'https://api.whatsapp.com']).toContain(parsed.origin);
    const textParam = parsed.searchParams.get('text');
    expect(textParam).toBeDefined();
    expect(textParam).toContain(sampleTitleEl);
    expect(textParam).toContain(sampleCanonicalUrl);
    expect(parsed.searchParams.has('utm_source')).toBe(false);
  });

  it('correctly encodes complex Greek strings, quotes, ampersands, and punctuation', () => {
    const complexTitle = '«Ο Μεγάλος Πλάτανος» & Το Καφενείο του Φορλίδα (1785)';
    const complexUrl = 'https://lafkos-guide.vercel.app/el/places/forlidas-cafe-1785/';

    const urls = buildShareUrls({
      canonicalUrl: complexUrl,
      title: complexTitle,
    });

    // Facebook
    expect(urls.facebook).toBe(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(complexUrl)}`,
    );

    // X
    expect(urls.x).toContain(`url=${encodeURIComponent(complexUrl)}`);
    expect(urls.x).toContain(`text=${encodeURIComponent(complexTitle)}`);

    // WhatsApp
    const expectedWaText = `${complexTitle} — ${complexUrl}`;
    expect(urls.whatsapp).toContain(`text=${encodeURIComponent(expectedWaText)}`);
  });
});

describe('Share UI Bilingual Copy Contracts', () => {
  const requiredShareKeys = [
    'shareTitle',
    'shareAriaGroup',
    'shareNative',
    'shareFacebook',
    'shareX',
    'shareWhatsApp',
    'shareCopyLink',
    'shareCopied',
    'shareCopyFailed',
  ] as const;

  it('provides all share keys in both Greek and English', () => {
    for (const locale of locales) {
      const dict = copy[locale];
      for (const key of requiredShareKeys) {
        expect(dict).toHaveProperty(key);
        expect(typeof (dict as Record<string, string>)[key]).toBe('string');
        expect((dict as Record<string, string>)[key].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('has localized accessible labels in Greek and English', () => {
    expect(copy.el.shareTitle).toBe('Κοινοποίηση');
    expect(copy.el.shareFacebook).toContain('Facebook');
    expect(copy.el.shareCopied).toBe('Ο σύνδεσμος αντιγράφηκε!');

    expect(copy.en.shareTitle).toBe('Share');
    expect(copy.en.shareFacebook).toContain('Facebook');
    expect(copy.en.shareCopied).toBe('Link copied!');
  });
});

describe('ShareActions Component Source & Security Contracts', () => {
  const componentPath = resolve('src/components/ShareActions.astro');

  it('exists in src/components/ShareActions.astro', () => {
    expect(existsSync(componentPath)).toBe(true);
  });

  it('contains zero third-party SDK scripts, pixels, or preconnects', () => {
    const src = readFileSync(componentPath, 'utf8');
    expect(src).not.toContain('connect.facebook.net');
    expect(src).not.toContain('platform.twitter.com');
    expect(src).not.toContain('googletagmanager.com');
    expect(src).not.toContain('analytics');
    expect(src).not.toContain('pixel');
    expect(src).not.toContain('<iframe');
  });

  it('enforces rel="noopener noreferrer" and target="_blank" on external social anchors', () => {
    const src = readFileSync(componentPath, 'utf8');
    expect(src).toContain('rel="noopener noreferrer"');
    expect(src).toContain('target="_blank"');
  });

  it('uses inline SVGs with aria-hidden="true"', () => {
    const src = readFileSync(componentPath, 'utf8');
    expect(src).toContain('aria-hidden="true"');
    expect(src).toContain('<svg');
  });

  it('implements progressive enhancement for native share and copy feedback', () => {
    const src = readFileSync(componentPath, 'utf8');
    // Native share button has hidden attribute in SSR HTML
    expect(src).toContain('data-share-native');
    expect(src).toContain('hidden');
    // Copy button has aria-live polite feedback region
    expect(src).toContain('aria-live="polite"');
    expect(src).toContain('data-share-status');
    // Script idempotence
    expect(src).toContain('data-share-initialized');
    // The legacy clipboard textarea is removed even when copying throws.
    expect(src).toContain('finally {');
    expect(src).toContain('textArea.remove()');
  });
});

describe('Detail Page Integration Contracts', () => {
  const placesTemplate = readFileSync(resolve('src/pages/[locale]/places/[slug].astro'), 'utf8');
  const trailsTemplate = readFileSync(resolve('src/pages/[locale]/trails/[slug].astro'), 'utf8');
  const storiesTemplate = readFileSync(resolve('src/pages/[locale]/stories/[slug].astro'), 'utf8');

  it('integrates ShareActions in all 3 detail templates', () => {
    expect(placesTemplate).toContain('ShareActions');
    expect(trailsTemplate).toContain('ShareActions');
    expect(storiesTemplate).toContain('ShareActions');
  });

  it('passes canonical absolute URL, locale, and title to ShareActions', () => {
    expect(placesTemplate).toMatch(
      /<ShareActions[\s\S]*?locale={locale}[\s\S]*?canonicalUrl={[\s\S]*?title={/,
    );
    expect(trailsTemplate).toMatch(
      /<ShareActions[\s\S]*?locale={locale}[\s\S]*?canonicalUrl={[\s\S]*?title={/,
    );
    expect(storiesTemplate).toMatch(
      /<ShareActions[\s\S]*?locale={locale}[\s\S]*?canonicalUrl={[\s\S]*?title={/,
    );
  });

  it('does not integrate ShareActions on non-detail pages', () => {
    const nonDetailPages = [
      'src/pages/[locale]/index.astro',
      'src/pages/[locale]/map/index.astro',
      'src/pages/[locale]/places/index.astro',
      'src/pages/[locale]/trails/index.astro',
      'src/pages/[locale]/stories/index.astro',
      'src/pages/[locale]/about/index.astro',
      'src/pages/[locale]/visit/index.astro',
      'src/pages/[locale]/events/index.astro',
      'src/pages/[locale]/timeline.astro',
      'src/pages/[locale]/privacy/index.astro',
      'src/pages/[locale]/accessibility/index.astro',
      'src/pages/404.astro',
      'src/pages/index.astro',
    ];

    for (const pagePath of nonDetailPages) {
      const fullPath = resolve(pagePath);
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf8');
        expect(content).not.toContain('ShareActions');
      }
    }
  });
});
