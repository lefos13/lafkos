import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/*
 * These contract tests guarantee that production caching headers adhere to
 * safe SEO and performance invariants:
 *
 * 1. Content-hashed build assets (_astro/*) receive long immutable caching.
 * 2. Static generated HTML pages allow revalidation (max-age=0, must-revalidate)
 *    so browsers and crawlers can leverage 304 Not Modified while avoiding
 *    stale content across CMS webhook deployments.
 * 3. The service worker (sw.js) is always immediately revalidated.
 * 4. Sitemaps, robots.txt, and web manifests are revalidated without stale delay.
 * 5. Static unhashed icons (favicon.svg, icons/*) are cached with revalidation
 *    without dangerous year-long immutable locks.
 * 6. Every security and Content-Security-Policy header is preserved.
 * 7. Vercel trailingSlash and root redirect rules remain intact.
 */

interface VercelHeaderRule {
  source: string;
  headers: Array<{ key: string; value: string }>;
}

interface VercelConfig {
  trailingSlash?: boolean;
  redirects?: Array<{ source: string; destination: string; permanent?: boolean }>;
  headers?: VercelHeaderRule[];
}

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vercelConfig = JSON.parse(
  readFileSync(resolve(rootDir, 'vercel.json'), 'utf-8'),
) as VercelConfig;
const headersContent = readFileSync(resolve(rootDir, 'public/_headers'), 'utf-8');
function resolveVercelHeaders(path: string, config: VercelConfig): Record<string, string> {
  const result: Record<string, string> = {};
  if (!config.headers) return result;

  for (const rule of config.headers) {
    const regex = new RegExp(`^${rule.source}$`);
    if (regex.test(path)) {
      for (const header of rule.headers) {
        result[header.key] = header.value;
      }
    }
  }

  return result;
}

describe('Production Cache Policy & Header Invariants', () => {
  it('preserves vercel trailingSlash and permanent root redirect', () => {
    expect(vercelConfig.trailingSlash).toBe(true);
    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining([
        {
          source: '/',
          destination: '/el/',
          permanent: true,
        },
      ]),
    );
  });

  it('preserves all security headers and CSP directives across routes', () => {
    const globalHeaders = resolveVercelHeaders('/el/places/lafkos-square/', vercelConfig);

    expect(globalHeaders['X-Content-Type-Options']).toBe('nosniff');
    expect(globalHeaders['X-Frame-Options']).toBe('DENY');
    expect(globalHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(globalHeaders['Permissions-Policy']).toBe('geolocation=(self)');

    const csp = globalHeaders['Content-Security-Policy'];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain('frame-src https://www.youtube-nocookie.com;');
    expect(csp).toContain('https://tiles.openfreemap.org');
    expect(csp).toContain('https://assets.lafkos.guide');
  });

  it('serves content-hashed build assets with long immutable caching', () => {
    const jsAssetHeaders = resolveVercelHeaders('/_astro/page.D6Rx8f8Z.js', vercelConfig);
    const cssAssetHeaders = resolveVercelHeaders('/_astro/BaseLayout.BJgXWdqq.css', vercelConfig);

    expect(jsAssetHeaders['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(cssAssetHeaders['Cache-Control']).toBe('public, max-age=31536000, immutable');
  });

  it('enforces immediate revalidation on the service worker', () => {
    const swHeaders = resolveVercelHeaders('/sw.js', vercelConfig);

    expect(swHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
  });

  it('configures static generated HTML with revalidation instead of no-store', () => {
    const rootHeaders = resolveVercelHeaders('/', vercelConfig);
    const elHomeHeaders = resolveVercelHeaders('/el/', vercelConfig);
    const enHomeHeaders = resolveVercelHeaders('/en/', vercelConfig);
    const elPlaceHeaders = resolveVercelHeaders('/el/places/plateia-lafkou/', vercelConfig);
    const enTrailHeaders = resolveVercelHeaders('/en/trails/lafkos-mikro-trail/', vercelConfig);

    expect(rootHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(elHomeHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(enHomeHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(elPlaceHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(enTrailHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');

    // Confirm no-store is no longer applied to HTML routes
    expect(elPlaceHeaders['Cache-Control']).not.toContain('no-store');
  });

  it('configures sitemaps, robots.txt, and web manifests for safe revalidation', () => {
    const robotsHeaders = resolveVercelHeaders('/robots.txt', vercelConfig);
    const sitemapIndexHeaders = resolveVercelHeaders('/sitemap-index.xml', vercelConfig);
    const sitemap0Headers = resolveVercelHeaders('/sitemap-0.xml', vercelConfig);
    const manifestHeaders = resolveVercelHeaders('/manifest.webmanifest', vercelConfig);

    expect(robotsHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(sitemapIndexHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(sitemap0Headers['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(manifestHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
  });

  it('configures unhashed static icons with safe revalidatable caching', () => {
    const faviconHeaders = resolveVercelHeaders('/favicon.svg', vercelConfig);
    const icon192Headers = resolveVercelHeaders('/icons/icon-192.svg', vercelConfig);
    const icon512Headers = resolveVercelHeaders('/icons/icon-512.svg', vercelConfig);

    expect(faviconHeaders['Cache-Control']).toBe('public, max-age=86400, must-revalidate');
    expect(icon192Headers['Cache-Control']).toBe('public, max-age=86400, must-revalidate');
    expect(icon512Headers['Cache-Control']).toBe('public, max-age=86400, must-revalidate');

    // Never use immutable on unhashed icons
    expect(faviconHeaders['Cache-Control']).not.toContain('immutable');
    expect(icon192Headers['Cache-Control']).not.toContain('immutable');
  });

  it('mirrors caching policies and security headers in public/_headers reference', () => {
    expect(headersContent).toContain('X-Content-Type-Options: nosniff');
    expect(headersContent).toContain('X-Frame-Options: DENY');
    expect(headersContent).toContain('Referrer-Policy: strict-origin-when-cross-origin');
    expect(headersContent).toContain('Permissions-Policy: geolocation=(self)');
    expect(headersContent).toContain('frame-src https://www.youtube-nocookie.com;');

    expect(headersContent).toMatch(
      /\/_astro\/\*\s+Cache-Control: public, max-age=31536000, immutable/,
    );
    expect(headersContent).toMatch(/\/sw\.js\s+Cache-Control: public, max-age=0, must-revalidate/);
    expect(headersContent).toMatch(
      /\/robots\.txt\s+Cache-Control: public, max-age=0, must-revalidate/,
    );
    expect(headersContent).toMatch(
      /\/sitemap\*\.xml\s+Cache-Control: public, max-age=0, must-revalidate/,
    );
    expect(headersContent).toMatch(
      /\/manifest\.webmanifest\s+Cache-Control: public, max-age=0, must-revalidate/,
    );
    expect(headersContent).toMatch(
      /\/favicon\.svg\s+Cache-Control: public, max-age=86400, must-revalidate/,
    );
    expect(headersContent).toMatch(
      /\/icons\/\*\s+Cache-Control: public, max-age=86400, must-revalidate/,
    );
  });
});
