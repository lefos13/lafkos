#!/usr/bin/env tsx
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { runFullSeoAudit } from '../src/lib/seo-audit';

const distDir = resolve(process.cwd(), 'dist');

if (!existsSync(distDir)) {
  console.error(
    '\x1b[31m[SEO Quality Gate Error] Build output directory "dist/" does not exist.\x1b[0m',
  );
  console.error(
    'Execute "pnpm build" or "pnpm test:seo" to build static output before running this audit.\n',
  );
  process.exit(1);
}

const startTime = performance.now();
const result = runFullSeoAudit(distDir);
const durationMs = (performance.now() - startTime).toFixed(1);

if (!result.passed) {
  console.error(
    `\x1b[31m❌ SEO & Payload Quality Gates FAILED with ${result.violations.length} violation(s) (${durationMs}ms):\x1b[0m\n`,
  );

  const groupedByCategory = new Map<string, typeof result.violations>();
  for (const violation of result.violations) {
    const list = groupedByCategory.get(violation.category) || [];
    list.push(violation);
    groupedByCategory.set(violation.category, list);
  }

  for (const [category, violations] of groupedByCategory.entries()) {
    console.error(`\x1b[33m[${category.toUpperCase()}] (${violations.length} issues):\x1b[0m`);
    for (const v of violations) {
      const location = v.file ? ` (${v.file})` : v.url ? ` (${v.url})` : '';
      console.error(`  - ${v.message}${location}`);
    }
    console.error('');
  }

  process.exit(1);
}

console.log(`\x1b[32m✔ SEO & Payload Quality Gates PASSED (${durationMs}ms)\x1b[0m`);
console.log(
  `  - Total HTML pages checked: ${result.summary.totalPages} (${result.summary.indexablePages} indexable, ${result.summary.rootRedirectPages} root redirect, ${result.summary.errorPages} error)`,
);
console.log(
  `  - Sitemaps & URLs verified: ${result.summary.totalSitemapUrls} URLs in sitemap index (100% bidirectional coverage)`,
);
console.log(
  `  - Internal anchor links checked: ${result.summary.totalLinksChecked} links (${result.summary.uniquePageLinks} unique internal destinations)`,
);
console.log(
  `  - Homepage payload sizes: Greek ${(result.summary.greekHomepageSizeBytes / 1024).toFixed(1)} KB / English ${(result.summary.englishHomepageSizeBytes / 1024).toFixed(1)} KB (< 60 KB ceiling, 0 KB MapExplorer island)`,
);
