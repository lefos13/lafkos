import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

export const DEFAULT_PRODUCTION_SITE_ORIGIN = 'https://lafkos-guide.vercel.app';
export const DEFAULT_MAX_META_DESCRIPTION_LENGTH = 320;
export const DEFAULT_HOMEPAGE_SIZE_CEILING_BYTES = 60 * 1024; // 60 KB ceiling

export const STATIC_ASSET_EXTENSIONS: Record<string, true> = {
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

const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  laquo: '«',
  raquo: '»',
};

export type SeoViolationCategory =
  | 'missing-dist'
  | 'page-structure'
  | 'title'
  | 'description'
  | 'canonical'
  | 'hreflang'
  | 'heading'
  | 'json-ld'
  | 'robots'
  | 'link-integrity'
  | 'sitemap'
  | 'payload-budget';

export interface SeoViolation {
  category: SeoViolationCategory;
  file?: string;
  url?: string;
  message: string;
}

export interface PageAuditData {
  filePath: string;
  relativePath: string;
  isRootRedirect: boolean;
  is404: boolean;
  isIndexable: boolean;
  canonicalUrl?: string;
  title?: string;
  description?: string;
  hreflangMap: Record<string, string>;
  h1Count: number;
  h1Text?: string;
  robotsDirectives: string[];
  jsonLdBlocks: Array<{ valid: boolean; type?: string | string[]; error?: string }>;
  links: string[];
  fileSizeBytes: number;
}

export interface SeoAuditSummary {
  distDir: string;
  totalPages: number;
  indexablePages: number;
  rootRedirectPages: number;
  errorPages: number;
  totalLinksChecked: number;
  uniquePageLinks: number;
  totalSitemapUrls: number;
  greekHomepageSizeBytes: number;
  englishHomepageSizeBytes: number;
  violationsCount: number;
}

export interface SeoAuditResult {
  passed: boolean;
  summary: SeoAuditSummary;
  violations: SeoViolation[];
}

export interface AuditOptions {
  siteOrigin?: string;
  maxMetaDescriptionLength?: number;
  homepageSizeCeilingBytes?: number;
  skipPayloadBudget?: boolean;
}

/**
 * Decodes standard named and numeric (decimal and hex) HTML character references.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || !text.includes('&')) return text;

  return text.replace(/&(#(?:x[0-9a-fA-F]+|[0-9]+)|[a-zA-Z0-9]+);/g, (match, entity) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const codePoint = parseInt(entity.slice(2), 16);
      if (!Number.isNaN(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff) {
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return match;
        }
      }
      return match;
    }

    if (entity.startsWith('#')) {
      const codePoint = parseInt(entity.slice(1), 10);
      if (!Number.isNaN(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff) {
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return match;
        }
      }
      return match;
    }

    const lower = entity.toLowerCase();
    if (NAMED_HTML_ENTITIES[lower] !== undefined) {
      return NAMED_HTML_ENTITIES[lower];
    }

    return match;
  });
}

/**
 * Recursively scans a directory for all .html files.
 */
export function findHtmlFiles(dir: string): string[] {
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

/**
 * Parses key-value attributes from an HTML tag string.
 */
export function parseHtmlTagAttributes(tagHtml: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9_-]+)(?:=(["'])(.*?)\2|=([^\s>]+))?/gi;
  for (const match of tagHtml.matchAll(attrRegex)) {
    const name = match[1].toLowerCase();
    const val = match[3] !== undefined ? match[3] : match[4] !== undefined ? match[4] : '';
    attrs[name] = val;
  }
  return attrs;
}

/**
 * Checks whether a URL pathname corresponds to a static asset.
 */
export function isStaticAssetPath(pathname: string): boolean {
  if (
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/icons/')
  ) {
    return true;
  }

  const lastDotIndex = pathname.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    const ext = pathname.slice(lastDotIndex).toLowerCase();
    if (STATIC_ASSET_EXTENSIONS[ext] === true) {
      return true;
    }
  }

  return false;
}

/**
 * Validates the schema.org structure of a parsed JSON-LD object.
 */
export function validateJsonLdStructure(parsed: unknown): {
  valid: boolean;
  type?: string | string[];
  error?: string;
} {
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'JSON-LD parsed to a non-object value' };
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return { valid: false, error: 'JSON-LD array is empty' };
    }
    const types: string[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') {
        return { valid: false, error: 'JSON-LD array item is not an object' };
      }
      if (!item['@type']) {
        return { valid: false, error: 'JSON-LD array item is missing "@type"' };
      }
      types.push(String(item['@type']));
    }
    return { valid: true, type: types };
  }

  const obj = parsed as Record<string, unknown>;

  if (obj['@graph'] && Array.isArray(obj['@graph'])) {
    if (!obj['@context']) {
      return { valid: false, error: 'JSON-LD @graph root is missing "@context"' };
    }
    if (obj['@graph'].length === 0) {
      return { valid: false, error: 'JSON-LD @graph array is empty' };
    }
    const types: string[] = [];
    for (const item of obj['@graph']) {
      if (!item || typeof item !== 'object') {
        return { valid: false, error: 'JSON-LD @graph item is not an object' };
      }
      if (!item['@type']) {
        return { valid: false, error: 'JSON-LD @graph item is missing "@type"' };
      }
      types.push(String(item['@type']));
    }
    return { valid: true, type: types };
  }

  if (!obj['@context']) {
    return { valid: false, error: 'JSON-LD is missing "@context"' };
  }
  if (!obj['@type']) {
    return { valid: false, error: 'JSON-LD is missing "@type"' };
  }

  const primaryType = Array.isArray(obj['@type']) ? obj['@type'].map(String) : String(obj['@type']);

  return { valid: true, type: primaryType };
}

/**
 * Parses and audits an individual HTML document string.
 */
export function auditHtmlDocument(
  htmlContent: string,
  relativePath: string,
  options: AuditOptions = {},
): { data: PageAuditData; violations: SeoViolation[] } {
  const siteOrigin = options.siteOrigin || DEFAULT_PRODUCTION_SITE_ORIGIN;
  const maxDescLength = options.maxMetaDescriptionLength || DEFAULT_MAX_META_DESCRIPTION_LENGTH;
  const violations: SeoViolation[] = [];

  // Normalize path separators to POSIX
  const normalizedRelativePath = relativePath.replace(/\\/g, '/');

  // Identify page category
  const isRootRedirect =
    normalizedRelativePath === '/index.html' || normalizedRelativePath === 'index.html';
  const is404 =
    normalizedRelativePath === '/404.html' ||
    normalizedRelativePath === '404.html' ||
    normalizedRelativePath === '/404/index.html' ||
    normalizedRelativePath === '404/index.html';
  const isIndexable = !isRootRedirect && !is404;

  // 1. Title tags (decode character references before evaluating text content)
  const titleMatches = [...htmlContent.matchAll(/<title[^>]*>(.*?)<\/title>/gis)];
  let title: string | undefined;
  if (titleMatches.length === 0) {
    violations.push({
      category: 'title',
      file: normalizedRelativePath,
      message: 'Page is missing a <title> element.',
    });
  } else if (titleMatches.length > 1) {
    violations.push({
      category: 'title',
      file: normalizedRelativePath,
      message: `Page contains ${titleMatches.length} <title> elements; expected exactly 1.`,
    });
  } else {
    title = decodeHtmlEntities(titleMatches[0][1]).trim();
    if (!title && isIndexable) {
      violations.push({
        category: 'title',
        file: normalizedRelativePath,
        message: 'Indexable page has an empty <title> element.',
      });
    }
  }

  // 2. Meta tags extraction (decode description character references)
  const metaTags = [...htmlContent.matchAll(/<meta\s+[^>]*>/gi)].map((m) => m[0]);
  const metaDescriptions: string[] = [];
  const robotsDirectives: string[] = [];

  for (const tag of metaTags) {
    const attrs = parseHtmlTagAttributes(tag);
    if (attrs.name === 'description' && attrs.content !== undefined) {
      metaDescriptions.push(attrs.content);
    }
    if (attrs.name === 'robots' && attrs.content !== undefined) {
      robotsDirectives.push(attrs.content);
    }
  }

  let description: string | undefined;
  if (isIndexable) {
    if (metaDescriptions.length === 0) {
      violations.push({
        category: 'description',
        file: normalizedRelativePath,
        message: 'Indexable page is missing a <meta name="description"> tag.',
      });
    } else if (metaDescriptions.length > 1) {
      violations.push({
        category: 'description',
        file: normalizedRelativePath,
        message: `Indexable page contains ${metaDescriptions.length} conflicting <meta name="description"> tags; expected exactly 1.`,
      });
    } else {
      description = decodeHtmlEntities(metaDescriptions[0]).trim();
      if (!description) {
        violations.push({
          category: 'description',
          file: normalizedRelativePath,
          message: 'Indexable page has an empty <meta name="description"> tag.',
        });
      } else if (description.length > maxDescLength) {
        violations.push({
          category: 'description',
          file: normalizedRelativePath,
          message: `Meta description length (${description.length} chars) exceeds maximum ceiling of ${maxDescLength} characters.`,
        });
      }
    }
  } else if (is404) {
    if (metaDescriptions.length > 0) {
      description = decodeHtmlEntities(metaDescriptions[0]).trim();
    }
  }

  // 3. Link tags extraction (canonical & hreflang)
  const linkTags = [...htmlContent.matchAll(/<link\s+[^>]*>/gi)].map((m) => m[0]);
  const canonicalHrefs: string[] = [];
  const hreflangMap: Record<string, string> = {};

  for (const tag of linkTags) {
    const attrs = parseHtmlTagAttributes(tag);
    if (attrs.rel === 'canonical' && attrs.href) {
      canonicalHrefs.push(attrs.href);
    }
    if (attrs.rel === 'alternate' && attrs.hreflang && attrs.href) {
      hreflangMap[attrs.hreflang.toLowerCase()] = attrs.href;
    }
  }

  let canonicalUrl: string | undefined;
  if (isIndexable) {
    if (canonicalHrefs.length === 0) {
      violations.push({
        category: 'canonical',
        file: normalizedRelativePath,
        message: 'Indexable page is missing a <link rel="canonical"> tag.',
      });
    } else if (canonicalHrefs.length > 1) {
      violations.push({
        category: 'canonical',
        file: normalizedRelativePath,
        message: `Indexable page contains ${canonicalHrefs.length} canonical link tags; expected exactly 1.`,
      });
    } else {
      canonicalUrl = canonicalHrefs[0];
      if (!canonicalUrl.startsWith(`${siteOrigin}/`)) {
        violations.push({
          category: 'canonical',
          file: normalizedRelativePath,
          url: canonicalUrl,
          message: `Canonical URL "${canonicalUrl}" does not start with production site origin "${siteOrigin}".`,
        });
      }
      if (!canonicalUrl.endsWith('/')) {
        violations.push({
          category: 'canonical',
          file: normalizedRelativePath,
          url: canonicalUrl,
          message: `Canonical URL "${canonicalUrl}" is missing mandatory trailing slash.`,
        });
      }

      // Expected route calculation
      // E.g. /el/places/plateia-lafkou/index.html -> /el/places/plateia-lafkou/
      let expectedPath = normalizedRelativePath.replace(/\/index\.html$/, '/');
      if (!expectedPath.startsWith('/')) {
        expectedPath = `/${expectedPath}`;
      }
      const expectedCanonical = `${siteOrigin}${expectedPath}`;
      if (canonicalUrl !== expectedCanonical) {
        violations.push({
          category: 'canonical',
          file: normalizedRelativePath,
          url: canonicalUrl,
          message: `Canonical URL "${canonicalUrl}" does not match emitted route "${expectedCanonical}".`,
        });
      }
    }
  } else if (isRootRedirect) {
    // Root redirect canonical must point to /el/
    if (canonicalHrefs.length > 0) {
      canonicalUrl = canonicalHrefs[0];
      const expectedRootCanonical = `${siteOrigin}/el/`;
      if (canonicalUrl !== expectedRootCanonical) {
        violations.push({
          category: 'canonical',
          file: normalizedRelativePath,
          url: canonicalUrl,
          message: `Root redirect canonical URL "${canonicalUrl}" should point to "${expectedRootCanonical}".`,
        });
      }
    }
  }

  // 4. Hreflang validation for indexable pages
  if (isIndexable) {
    const requiredHreflangs = ['el', 'en', 'x-default'];
    for (const lang of requiredHreflangs) {
      if (!hreflangMap[lang]) {
        violations.push({
          category: 'hreflang',
          file: normalizedRelativePath,
          message: `Indexable localized page is missing required hreflang="${lang}" alternate link.`,
        });
      } else {
        const targetUrl = hreflangMap[lang];
        if (!targetUrl.startsWith(`${siteOrigin}/`)) {
          violations.push({
            category: 'hreflang',
            file: normalizedRelativePath,
            url: targetUrl,
            message: `Hreflang "${lang}" target "${targetUrl}" does not start with production origin "${siteOrigin}".`,
          });
        }
        if (!targetUrl.endsWith('/')) {
          violations.push({
            category: 'hreflang',
            file: normalizedRelativePath,
            url: targetUrl,
            message: `Hreflang "${lang}" target "${targetUrl}" is missing mandatory trailing slash.`,
          });
        }
      }
    }

    // x-default must equal the Greek alternate (el)
    if (
      hreflangMap['x-default'] &&
      hreflangMap['el'] &&
      hreflangMap['x-default'] !== hreflangMap['el']
    ) {
      violations.push({
        category: 'hreflang',
        file: normalizedRelativePath,
        message: `Hreflang "x-default" ("${hreflangMap['x-default']}") does not match Greek canonical equivalent ("${hreflangMap['el']}").`,
      });
    }
  }

  // 5. Headings (Single H1 - decode character references before evaluating text)
  const h1Matches = [...htmlContent.matchAll(/<h1[^>]*>(.*?)<\/h1>/gis)];
  const h1Count = h1Matches.length;
  let h1Text: string | undefined;

  if (isIndexable) {
    if (h1Count === 0) {
      violations.push({
        category: 'heading',
        file: normalizedRelativePath,
        message: 'Indexable page is missing an <h1> heading.',
      });
    } else if (h1Count > 1) {
      violations.push({
        category: 'heading',
        file: normalizedRelativePath,
        message: `Indexable page contains ${h1Count} <h1> headings; expected exactly 1 DOM H1.`,
      });
    } else {
      h1Text = decodeHtmlEntities(h1Matches[0][1].replace(/<[^>]+>/g, '')).trim();
      if (!h1Text) {
        violations.push({
          category: 'heading',
          file: normalizedRelativePath,
          message: 'Indexable page has an empty <h1> heading element.',
        });
      }
    }
  }

  // 6. Robots meta directives & Noindex
  if (isIndexable) {
    for (const directive of robotsDirectives) {
      if (directive.toLowerCase().includes('noindex')) {
        violations.push({
          category: 'robots',
          file: normalizedRelativePath,
          message: `Indexable page contains contradictory noindex robots directive: "${directive}".`,
        });
      }
    }
  } else if (isRootRedirect || is404) {
    const hasNoindex = robotsDirectives.some((d) => d.toLowerCase().includes('noindex'));
    if (!hasNoindex) {
      violations.push({
        category: 'robots',
        file: normalizedRelativePath,
        message: `${isRootRedirect ? 'Root redirect' : '404'} page is missing required noindex robots directive.`,
      });
    }
  }

  // 7. JSON-LD structured data
  const jsonLdMatches = [
    ...htmlContent.matchAll(
      /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis,
    ),
  ];
  const jsonLdBlocks: Array<{ valid: boolean; type?: string | string[]; error?: string }> = [];

  for (const jm of jsonLdMatches) {
    const scriptBody = jm[1].trim();
    try {
      const parsed = JSON.parse(scriptBody);
      const validation = validateJsonLdStructure(parsed);
      jsonLdBlocks.push(validation);

      if (!validation.valid) {
        violations.push({
          category: 'json-ld',
          file: normalizedRelativePath,
          message: `JSON-LD schema invalid: ${validation.error}`,
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      violations.push({
        category: 'json-ld',
        file: normalizedRelativePath,
        message: `Invalid JSON-LD syntax: ${errMsg}`,
      });
      jsonLdBlocks.push({ valid: false, error: errMsg });
    }
  }

  // 8. Extract internal anchor links for link integrity
  const aRegex = /<a\s+[^>]*href=(["'])(.*?)\1[^>]*>/gi;
  const links: string[] = [];
  for (const m of htmlContent.matchAll(aRegex)) {
    const href = m[2].trim();
    if (href) links.push(href);
  }

  const data: PageAuditData = {
    filePath: '',
    relativePath: normalizedRelativePath,
    isRootRedirect,
    is404,
    isIndexable,
    canonicalUrl,
    title,
    description,
    hreflangMap,
    h1Count,
    h1Text,
    robotsDirectives,
    jsonLdBlocks,
    links,
    fileSizeBytes: Buffer.byteLength(htmlContent, 'utf8'),
  };

  return { data, violations };
}

/**
 * Audits hreflang reciprocity and target existence across all scanned indexable pages.
 */
export function auditHreflangReciprocity(
  pagesByCanonical: Map<string, PageAuditData>,
): SeoViolation[] {
  const violations: SeoViolation[] = [];

  for (const [, page] of pagesByCanonical.entries()) {
    const elUrl = page.hreflangMap['el'];
    const enUrl = page.hreflangMap['en'];

    if (elUrl && !pagesByCanonical.has(elUrl)) {
      violations.push({
        category: 'hreflang',
        file: page.relativePath,
        url: elUrl,
        message: `Hreflang "el" target "${elUrl}" does not resolve to an emitted indexable HTML page.`,
      });
    }

    if (enUrl && !pagesByCanonical.has(enUrl)) {
      violations.push({
        category: 'hreflang',
        file: page.relativePath,
        url: enUrl,
        message: `Hreflang "en" target "${enUrl}" does not resolve to an emitted indexable HTML page.`,
      });
    }

    // Symmetry check
    if (elUrl && enUrl && pagesByCanonical.has(elUrl) && pagesByCanonical.has(enUrl)) {
      const elTargetPage = pagesByCanonical.get(elUrl)!;
      if (elTargetPage.hreflangMap['en'] !== enUrl) {
        violations.push({
          category: 'hreflang',
          file: page.relativePath,
          message: `Asymmetric hreflang: Greek page "${elTargetPage.relativePath}" points "en" to "${elTargetPage.hreflangMap['en']}", expected "${enUrl}".`,
        });
      }
      if (elTargetPage.hreflangMap['el'] !== elUrl) {
        violations.push({
          category: 'hreflang',
          file: page.relativePath,
          message: `Asymmetric hreflang: Greek page "${elTargetPage.relativePath}" points "el" to "${elTargetPage.hreflangMap['el']}", expected "${elUrl}".`,
        });
      }
    }
  }

  return violations;
}

/**
 * Audits internal anchor link integrity across built HTML pages.
 * Handles both relative internal paths and absolute same-origin URLs matching siteOrigin,
 * while safely skipping genuinely external origins and protocol-relative external targets.
 */
export function auditHtmlInternalLinks(
  distDir: string,
  options: AuditOptions = {},
): {
  checkedAnchorsCount: number;
  uniquePageLinks: string[];
  violations: SeoViolation[];
} {
  const siteOrigin = options.siteOrigin || DEFAULT_PRODUCTION_SITE_ORIGIN;
  let siteOriginObj: URL;
  try {
    siteOriginObj = new URL(siteOrigin);
  } catch {
    siteOriginObj = new URL(DEFAULT_PRODUCTION_SITE_ORIGIN);
  }

  const htmlFiles = findHtmlFiles(distDir);
  const violations: SeoViolation[] = [];
  const uniquePageLinksSet = new Set<string>();
  let checkedAnchorsCount = 0;

  for (const file of htmlFiles) {
    const relativeFile = file.replace(distDir, '').replace(/\\/g, '/');
    const content = readFileSync(file, 'utf8');
    const aRegex = /<a\s+[^>]*href=(["'])(.*?)\1[^>]*>/gi;

    for (const match of content.matchAll(aRegex)) {
      const href = match[2].trim();
      if (!href) continue;
      if (href.startsWith('#')) continue;
      if (href.startsWith('mailto:')) continue;
      if (href.startsWith('tel:')) continue;
      if (href.startsWith('javascript:')) continue;

      let urlObj: URL;
      try {
        urlObj = new URL(href, siteOrigin);
      } catch {
        violations.push({
          category: 'link-integrity',
          file: relativeFile,
          url: href,
          message: `Malformed link href: "${href}".`,
        });
        continue;
      }

      // Check external origins vs same-origin absolute URLs
      if (href.startsWith('//')) {
        if (urlObj.host !== siteOriginObj.host) {
          // Protocol-relative external origin -> skip
          continue;
        }
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        if (urlObj.origin !== siteOriginObj.origin) {
          // Absolute external origin -> skip
          continue;
        }
      }

      const pathname = urlObj.pathname;
      if (isStaticAssetPath(pathname)) {
        continue;
      }

      checkedAnchorsCount += 1;
      uniquePageLinksSet.add(href);

      // Rule 1: Page pathnames must end in trailing slash (or be root '/')
      if (pathname !== '/' && !pathname.endsWith('/')) {
        violations.push({
          category: 'link-integrity',
          file: relativeFile,
          url: href,
          message: `Internal navigational link "${href}" (pathname: "${pathname}") is missing required trailing slash.`,
        });
        continue;
      }

      // Rule 2: Page pathnames must resolve to an emitted HTML file in distDir
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
          category: 'link-integrity',
          file: relativeFile,
          url: href,
          message: `Internal link "${href}" resolves to unrendered destination file "${expectedHtmlFile.replace(distDir, '')}".`,
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

/**
 * Audits sitemaps (sitemap-index.xml and sitemap-*.xml) against emitted indexable pages.
 * Validates sub-sitemap origins, flags duplicate page/sub-sitemap entries, and verifies 100% bidirectional coverage.
 */
export function auditSitemaps(
  distDir: string,
  indexablePagesByCanonical: Map<string, PageAuditData>,
  options: AuditOptions = {},
): { sitemapUrls: string[]; violations: SeoViolation[] } {
  const siteOrigin = options.siteOrigin || DEFAULT_PRODUCTION_SITE_ORIGIN;
  const violations: SeoViolation[] = [];
  const sitemapIndexFile = join(distDir, 'sitemap-index.xml');
  const sitemapUrls: string[] = [];

  if (!existsSync(sitemapIndexFile)) {
    violations.push({
      category: 'sitemap',
      file: 'sitemap-index.xml',
      message: 'Missing "dist/sitemap-index.xml" file.',
    });
    return { sitemapUrls, violations };
  }

  const sitemapIndexContent = readFileSync(sitemapIndexFile, 'utf8');
  const sitemapLocMatches = [...sitemapIndexContent.matchAll(/<loc>(.*?)<\/loc>/gis)];

  if (sitemapLocMatches.length === 0) {
    violations.push({
      category: 'sitemap',
      file: 'sitemap-index.xml',
      message: '"dist/sitemap-index.xml" contains no sub-sitemap <loc> entries.',
    });
    return { sitemapUrls, violations };
  }

  const seenSubSitemaps = new Set<string>();

  for (const sm of sitemapLocMatches) {
    const sitemapUrl = sm[1].trim();

    // Check duplicate sub-sitemaps in index
    if (seenSubSitemaps.has(sitemapUrl)) {
      violations.push({
        category: 'sitemap',
        file: 'sitemap-index.xml',
        url: sitemapUrl,
        message: `Duplicate sub-sitemap reference in sitemap index: "${sitemapUrl}".`,
      });
      continue;
    }
    seenSubSitemaps.add(sitemapUrl);

    // Validate sub-sitemap origin
    if (!sitemapUrl.startsWith(`${siteOrigin}/`)) {
      violations.push({
        category: 'sitemap',
        file: 'sitemap-index.xml',
        url: sitemapUrl,
        message: `Sub-sitemap URL "${sitemapUrl}" in sitemap index does not start with production origin "${siteOrigin}".`,
      });
    }

    let sitemapFilename: string;
    try {
      sitemapFilename = basename(new URL(sitemapUrl).pathname);
    } catch {
      violations.push({
        category: 'sitemap',
        url: sitemapUrl,
        message: `Malformed sitemap URL "${sitemapUrl}" in sitemap index.`,
      });
      continue;
    }

    const sitemapFile = join(distDir, sitemapFilename);
    if (!existsSync(sitemapFile)) {
      violations.push({
        category: 'sitemap',
        file: sitemapFilename,
        url: sitemapUrl,
        message: `Sub-sitemap file "${sitemapFilename}" referenced in index was not found in dist.`,
      });
      continue;
    }

    const sitemapContent = readFileSync(sitemapFile, 'utf8');
    const locMatches = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/gis)];
    const seenPageUrls = new Set<string>();

    for (const lm of locMatches) {
      const pageUrl = lm[1].trim();

      // Check duplicate page URL in sub-sitemap
      if (seenPageUrls.has(pageUrl)) {
        violations.push({
          category: 'sitemap',
          file: sitemapFilename,
          url: pageUrl,
          message: `Duplicate page URL in sitemap: "${pageUrl}".`,
        });
        continue;
      }
      seenPageUrls.add(pageUrl);
      sitemapUrls.push(pageUrl);

      // Check 1: Host
      if (!pageUrl.startsWith(`${siteOrigin}/`)) {
        violations.push({
          category: 'sitemap',
          file: sitemapFilename,
          url: pageUrl,
          message: `Sitemap entry "${pageUrl}" does not start with production origin "${siteOrigin}".`,
        });
      }

      // Check 2: Trailing slash
      if (!pageUrl.endsWith('/')) {
        violations.push({
          category: 'sitemap',
          file: sitemapFilename,
          url: pageUrl,
          message: `Sitemap entry "${pageUrl}" is missing mandatory trailing slash.`,
        });
      }

      // Check 3: Exclude root redirect and 404
      if (pageUrl === `${siteOrigin}/` || pageUrl === siteOrigin || pageUrl.includes('/404')) {
        violations.push({
          category: 'sitemap',
          file: sitemapFilename,
          url: pageUrl,
          message: `Sitemap incorrectly includes non-indexable destination "${pageUrl}".`,
        });
      }

      // Check 4: Must resolve to an emitted indexable HTML file
      if (!indexablePagesByCanonical.has(pageUrl)) {
        violations.push({
          category: 'sitemap',
          file: sitemapFilename,
          url: pageUrl,
          message: `Sitemap entry "${pageUrl}" does not resolve to an emitted indexable HTML file in dist.`,
        });
      }
    }
  }

  // Bidirectional Check: Every indexable page must be represented in sitemap
  const sitemapUrlSet = new Set(sitemapUrls);
  for (const [canonicalUrl, pageData] of indexablePagesByCanonical.entries()) {
    if (!sitemapUrlSet.has(canonicalUrl)) {
      violations.push({
        category: 'sitemap',
        file: pageData.relativePath,
        url: canonicalUrl,
        message: `Indexable page "${pageData.relativePath}" (canonical: "${canonicalUrl}") is missing from sitemap.`,
      });
    }
  }

  return { sitemapUrls, violations };
}

/**
 * Audits robots.txt rules and sitemap references.
 */
export function auditRobotsTxt(distDir: string, options: AuditOptions = {}): SeoViolation[] {
  const siteOrigin = options.siteOrigin || DEFAULT_PRODUCTION_SITE_ORIGIN;
  const violations: SeoViolation[] = [];
  const robotsFile = join(distDir, 'robots.txt');

  if (!existsSync(robotsFile)) {
    violations.push({
      category: 'robots',
      file: 'robots.txt',
      message: 'Missing "dist/robots.txt" file.',
    });
    return violations;
  }

  const content = readFileSync(robotsFile, 'utf8');

  // Must reference production sitemap
  const sitemapDirective = `Sitemap: ${siteOrigin}/sitemap-index.xml`;
  if (!content.includes(sitemapDirective) && !content.includes(`${siteOrigin}/sitemap-0.xml`)) {
    violations.push({
      category: 'robots',
      file: 'robots.txt',
      message: `robots.txt does not reference production sitemap ("${sitemapDirective}").`,
    });
  }

  // Must not block localized routes
  if (/Disallow:\s*\/(?:el|en|\s*$)/im.test(content)) {
    violations.push({
      category: 'robots',
      file: 'robots.txt',
      message: 'robots.txt contains Disallow rule blocking localized or root content.',
    });
  }

  return violations;
}

/**
 * Audits homepage payload budgets and client island isolation.
 */
export function auditPayloadBudgets(
  distDir: string,
  options: AuditOptions = {},
): {
  greekSizeBytes: number;
  englishSizeBytes: number;
  violations: SeoViolation[];
} {
  const ceilingBytes = options.homepageSizeCeilingBytes || DEFAULT_HOMEPAGE_SIZE_CEILING_BYTES;
  const violations: SeoViolation[] = [];
  const locales = ['el', 'en'] as const;
  let greekSizeBytes = 0;
  let englishSizeBytes = 0;

  for (const locale of locales) {
    const homeHtmlPath = join(distDir, locale, 'index.html');
    const mapHtmlPath = join(distDir, locale, 'map', 'index.html');

    if (!existsSync(homeHtmlPath)) {
      violations.push({
        category: 'payload-budget',
        file: `${locale}/index.html`,
        message: `Homepage HTML file for locale "${locale}" not found in dist.`,
      });
      continue;
    }

    const homeStat = statSync(homeHtmlPath);
    if (locale === 'el') greekSizeBytes = homeStat.size;
    if (locale === 'en') englishSizeBytes = homeStat.size;

    // 1. Homepage Size Ceiling (<60 KB)
    if (homeStat.size >= ceilingBytes) {
      violations.push({
        category: 'payload-budget',
        file: `${locale}/index.html`,
        message: `Homepage HTML for "${locale}" (${(homeStat.size / 1024).toFixed(1)} KB) exceeds strict size ceiling of ${(ceilingBytes / 1024).toFixed(0)} KB.`,
      });
    }

    const homeHtml = readFileSync(homeHtmlPath, 'utf8');

    // 2. Homepage MUST NOT contain MapExplorer island
    if (
      homeHtml.includes('component-url="/_astro/MapExplorer') ||
      /<astro-island[^>]*component-url="[^"]*MapExplorer/i.test(homeHtml)
    ) {
      violations.push({
        category: 'payload-budget',
        file: `${locale}/index.html`,
        message: `Homepage HTML for "${locale}" contains hydrated MapExplorer island.`,
      });
    }

    // 3. Homepage MUST NOT serialize GeoJSON datasets
    if (
      homeHtml.includes('&quot;schemaVersion&quot;') ||
      homeHtml.includes('&quot;agia-paraskevi-view&quot;') ||
      homeHtml.includes('&quot;lafkos-chondri-ammos-drive&quot;')
    ) {
      violations.push({
        category: 'payload-budget',
        file: `${locale}/index.html`,
        message: `Homepage HTML for "${locale}" contains serialized GeoJSON dataset properties.`,
      });
    }

    // 4. Dedicated /map/ route MUST retain MapExplorer and datasets
    if (existsSync(mapHtmlPath)) {
      const mapHtml = readFileSync(mapHtmlPath, 'utf8');
      if (
        !mapHtml.includes('component-url="/_astro/MapExplorer') &&
        !/<astro-island[^>]*component-url="[^"]*MapExplorer/i.test(mapHtml)
      ) {
        violations.push({
          category: 'payload-budget',
          file: `${locale}/map/index.html`,
          message: `Dedicated map route for "${locale}" is missing required MapExplorer island.`,
        });
      }
    }
  }

  return { greekSizeBytes, englishSizeBytes, violations };
}

/**
 * Runs the comprehensive build-output SEO, link integrity, and payload quality audit on distDir.
 */
export function runFullSeoAudit(distDir: string, options: AuditOptions = {}): SeoAuditResult {
  const violations: SeoViolation[] = [];

  // Check distDir existence
  if (!existsSync(distDir)) {
    const errorViolation: SeoViolation = {
      category: 'missing-dist',
      message: `Build output directory "${distDir}" does not exist. Run "pnpm build" before executing SEO quality gates.`,
    };
    return {
      passed: false,
      summary: {
        distDir,
        totalPages: 0,
        indexablePages: 0,
        rootRedirectPages: 0,
        errorPages: 0,
        totalLinksChecked: 0,
        uniquePageLinks: 0,
        totalSitemapUrls: 0,
        greekHomepageSizeBytes: 0,
        englishHomepageSizeBytes: 0,
        violationsCount: 1,
      },
      violations: [errorViolation],
    };
  }

  const htmlFiles = findHtmlFiles(distDir);
  if (htmlFiles.length === 0) {
    const errorViolation: SeoViolation = {
      category: 'missing-dist',
      message: `No HTML files found in build output directory "${distDir}". Build output appears empty or corrupted.`,
    };
    return {
      passed: false,
      summary: {
        distDir,
        totalPages: 0,
        indexablePages: 0,
        rootRedirectPages: 0,
        errorPages: 0,
        totalLinksChecked: 0,
        uniquePageLinks: 0,
        totalSitemapUrls: 0,
        greekHomepageSizeBytes: 0,
        englishHomepageSizeBytes: 0,
        violationsCount: 1,
      },
      violations: [errorViolation],
    };
  }

  const pagesByCanonical = new Map<string, PageAuditData>();
  let rootRedirectPages = 0;
  let errorPages = 0;
  let indexablePages = 0;

  // 1. Audit individual pages
  for (const filePath of htmlFiles) {
    const relativePath = filePath.replace(distDir, '').replace(/\\/g, '/');
    const content = readFileSync(filePath, 'utf8');
    const { data, violations: pageViolations } = auditHtmlDocument(content, relativePath, options);

    data.filePath = filePath;
    violations.push(...pageViolations);

    if (data.isRootRedirect) {
      rootRedirectPages += 1;
    } else if (data.is404) {
      errorPages += 1;
    } else if (data.isIndexable) {
      indexablePages += 1;
      if (data.canonicalUrl) {
        pagesByCanonical.set(data.canonicalUrl, data);
      }
    }
  }

  // 2. Audit hreflang reciprocity
  const hreflangViolations = auditHreflangReciprocity(pagesByCanonical);
  violations.push(...hreflangViolations);

  // 3. Audit link integrity
  const {
    checkedAnchorsCount,
    uniquePageLinks,
    violations: linkViolations,
  } = auditHtmlInternalLinks(distDir, options);
  violations.push(...linkViolations);

  // 4. Audit sitemaps
  const { sitemapUrls, violations: sitemapViolations } = auditSitemaps(
    distDir,
    pagesByCanonical,
    options,
  );
  violations.push(...sitemapViolations);

  // 5. Audit robots.txt
  const robotsViolations = auditRobotsTxt(distDir, options);
  violations.push(...robotsViolations);

  // 6. Audit payload budgets
  let greekHomepageSizeBytes = 0;
  let englishHomepageSizeBytes = 0;
  if (!options.skipPayloadBudget) {
    const {
      greekSizeBytes,
      englishSizeBytes,
      violations: budgetViolations,
    } = auditPayloadBudgets(distDir, options);
    greekHomepageSizeBytes = greekSizeBytes;
    englishHomepageSizeBytes = englishSizeBytes;
    violations.push(...budgetViolations);
  }

  return {
    passed: violations.length === 0,
    summary: {
      distDir,
      totalPages: htmlFiles.length,
      indexablePages,
      rootRedirectPages,
      errorPages,
      totalLinksChecked: checkedAnchorsCount,
      uniquePageLinks: uniquePageLinks.length,
      totalSitemapUrls: sitemapUrls.length,
      greekHomepageSizeBytes,
      englishHomepageSizeBytes,
      violationsCount: violations.length,
    },
    violations,
  };
}
