import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getLocalizedUrlPaths, normalizeTrailingSlash } from '../src/lib/urls';

/*
 * These small contract tests protect the URL signals that search engines use
 * to select one canonical page and connect each bilingual counterpart.
 */
describe('SEO URL contracts', () => {
  it('normalizes every non-root route to one trailing-slash form', () => {
    expect(normalizeTrailingSlash('/en/places/lafkos-square')).toBe('/en/places/lafkos-square/');
    expect(normalizeTrailingSlash('/en/places/lafkos-square/')).toBe('/en/places/lafkos-square/');
    expect(normalizeTrailingSlash('/')).toBe('/');
  });

  it('derives the translated Greek fallback from a translated slug', () => {
    expect(
      getLocalizedUrlPaths({
        locale: 'en',
        pathname: '/en/places/lafkos-square',
        alternatePath: '/el/places/plateia-lafkou',
      }),
    ).toEqual({
      canonicalPath: '/en/places/lafkos-square/',
      alternatePath: '/el/places/plateia-lafkou/',
      xDefaultPath: '/el/places/plateia-lafkou/',
    });
  });

  it('derives a same-path Greek fallback when no translated slug is supplied', () => {
    expect(getLocalizedUrlPaths({ locale: 'en', pathname: '/en/about' })).toEqual({
      canonicalPath: '/en/about/',
      alternatePath: '/el/about/',
      xDefaultPath: '/el/about/',
    });
  });

  it('configures the production host, permanent root redirect, and sitemap exclusion', () => {
    const astroConfig = readFileSync(resolve('astro.config.mjs'), 'utf8');
    const vercelConfig = readFileSync(resolve('vercel.json'), 'utf8');

    expect(astroConfig).toContain("site: 'https://lafkos-guide.vercel.app'");
    expect(astroConfig).toContain("trailingSlash: 'always'");
    expect(astroConfig).toContain("pathname !== '/'");
    expect(vercelConfig).toContain('"trailingSlash": true');
    expect(vercelConfig).toContain('"destination": "/el/"');
    expect(vercelConfig).toContain('"permanent": true');
  });
});
