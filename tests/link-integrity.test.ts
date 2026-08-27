/*
 * Built-Site Link Integrity Contract:
 *
 * Verifies that every internal anchor across all emitted static HTML pages in
 * dist/ points to a normalized trailing-slash page route or a valid static
 * asset. Ensures that no links generate Astro 404 suggestion pages, double
 * redirects, or unresolvable internal destinations.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const STATIC_ASSET_EXTENSIONS: Record<string, true> = {
  '.svg': true,
  '.png': true,
  '.jpg': true,
  '.jpeg': true,
  '.webp': true,
  '.gif': true,
  '.ico': true,
  '.webmanifest': true,
  '.xml': true,
  '.json': true,
  '.css': true,
  '.js': true,
  '.map': true,
  '.txt': true,
  '.pdf': true,
  '.pmtiles': true,
  '.pbf': true,
};

function findHtmlFiles(dir: string): string[] {
  let results: string[] = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

export interface LinkViolation {
  sourceFile: string;
  href: string;
  resolvedPath: string;
  reason: 'missing-trailing-slash' | 'unresolved-route' | 'malformed-url';
}

export function auditHtmlInternalLinks(distDir: string): {
  checkedAnchorsCount: number;
  uniquePageLinks: string[];
  violations: LinkViolation[];
} {
  const htmlFiles = findHtmlFiles(distDir);
  const violations: LinkViolation[] = [];
  const uniquePageLinksSet = new Set<string>();
  let checkedAnchorsCount = 0;

  for (const file of htmlFiles) {
    const relativeFile = file.replace(distDir, '');
    const content = readFileSync(file, 'utf8');
    const aRegex = /<a\s+[^>]*href=(["'])(.*?)\1[^>]*>/gi;
    let match: RegExpExecArray | null;

    while ((match = aRegex.exec(content)) !== null) {
      const href = match[2].trim();
      if (!href) continue;
      if (href.startsWith('#')) continue;
      if (href.startsWith('mailto:')) continue;
      if (href.startsWith('tel:')) continue;
      if (href.startsWith('javascript:')) continue;
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
        continue;
      }

      let urlObj: URL;
      try {
        urlObj = new URL(href, 'https://lafkos-guide.vercel.app');
      } catch {
        violations.push({
          sourceFile: relativeFile,
          href,
          resolvedPath: href,
          reason: 'malformed-url',
        });
        continue;
      }

      const pathname = urlObj.pathname;
      const lastDotIndex = pathname.lastIndexOf('.');
      const isAsset =
        pathname.startsWith('/_astro/') ||
        pathname.startsWith('/images/') ||
        pathname.startsWith('/fonts/') ||
        (lastDotIndex !== -1 &&
          STATIC_ASSET_EXTENSIONS[pathname.slice(lastDotIndex).toLowerCase()] === true);

      if (isAsset) {
        continue;
      }

      checkedAnchorsCount += 1;
      uniquePageLinksSet.add(href);

      // Rule 1: Page pathnames must end in a trailing slash (or be root '/')
      if (pathname !== '/' && !pathname.endsWith('/')) {
        violations.push({
          sourceFile: relativeFile,
          href,
          resolvedPath: pathname,
          reason: 'missing-trailing-slash',
        });
        continue;
      }

      // Rule 2: Page pathnames must resolve to an emitted HTML file
      let expectedHtmlFile: string;
      if (pathname === '/') {
        expectedHtmlFile = join(distDir, 'index.html');
      } else if (pathname === '/404/' || pathname === '/404.html') {
        expectedHtmlFile = join(distDir, '404.html');
      } else {
        expectedHtmlFile = join(distDir, pathname.replace(/^\//, ''), 'index.html');
      }

      if (!existsSync(expectedHtmlFile)) {
        violations.push({
          sourceFile: relativeFile,
          href,
          resolvedPath: pathname,
          reason: 'unresolved-route',
        });
      }
    }
  }

  return {
    checkedAnchorsCount,
    uniquePageLinks: Array.from(uniquePageLinksSet).sort(),
    violations,
  };
}

describe('Built-Site Link Integrity & Trailing Slash Contract', () => {
  const distDir = resolve('dist');

  it('proves all internal anchors across emitted HTML files have trailing slashes and resolve to valid routes', () => {
    /*
     * The ordinary unit-test phase runs before the build on a clean checkout.
     * Task 10 invokes this same contract after `pnpm build`, where it is a gate.
     */
    if (!existsSync(distDir)) {
      return;
    }

    const { checkedAnchorsCount, uniquePageLinks, violations } = auditHtmlInternalLinks(distDir);

    expect(checkedAnchorsCount).toBeGreaterThan(100);
    expect(uniquePageLinks.length).toBeGreaterThan(20);

    if (violations.length > 0) {
      const summary = violations
        .map(
          (v) =>
            `[${v.reason}] in ${v.sourceFile}: href="${v.href}" -> resolved="${v.resolvedPath}"`,
        )
        .join('\n');
      expect.fail(
        `Found ${violations.length} link integrity violation(s) across built HTML files:\n${summary}`,
      );
    }
  });
});
