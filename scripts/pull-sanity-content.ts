import { existsSync } from 'node:fs';
import { resolve as pathResolve } from 'node:path';

try {
  const envPath = pathResolve(process.cwd(), '.env');
  if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
  }
} catch {}

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { getSanityClient, isSanityConfigured } from '../src/lib/sanity-client';
import {
  CATEGORIES_QUERY,
  PLACES_QUERY,
  STORIES_QUERY,
  TRAILS_QUERY,
  transformSanityCategories,
  transformSanityPlaces,
  transformSanityStories,
  transformSanityTrails,
  type SanityCategoryDoc,
  type SanityPlaceDoc,
  type SanityStoryDoc,
  type SanityTrailDoc,
} from '../src/lib/sanity-transform';

async function pullContentFromSanity() {
  if (!isSanityConfigured()) {
    console.error('Error: Sanity is not configured in environment or .env file.');
    console.error('Set PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET before pulling.');
    process.exit(1);
  }

  console.log('Connecting to Sanity Content Lake...');
  const client = getSanityClient({ useCdn: false });

  const [rawPlaces, rawTrails, rawStories, rawCategories] = await Promise.all([
    client.fetch<SanityPlaceDoc[]>(PLACES_QUERY),
    client.fetch<SanityTrailDoc[]>(TRAILS_QUERY),
    client.fetch<SanityStoryDoc[]>(STORIES_QUERY),
    client.fetch<SanityCategoryDoc[]>(CATEGORIES_QUERY),
  ]);

  if (!rawPlaces?.length && !rawTrails?.length && !rawStories?.length) {
    console.warn('No documents returned from Sanity. Aborting to protect local content.');
    process.exit(1);
  }

  console.log(
    `Fetched ${rawPlaces.length} places, ${rawTrails.length} trails, ${rawStories.length} stories, and ${rawCategories.length} categories from Sanity.`,
  );

  const places = transformSanityPlaces(rawPlaces);
  const trails = transformSanityTrails(rawTrails);
  const stories = transformSanityStories(rawStories);
  const categories = transformSanityCategories(rawCategories);

  const contentFileHeader = `/*
 * Lafkos Guide dataset: Curated cultural, historical, architectural,
 * and trail archive for Lafkos and South Pelion.
 *
 * Sourced directly from Sanity Content Lake via \`pnpm studio:pull-content\`.
 */

import type { Category, Place, Story, Trail } from '../lib/content';

export const categories: Category[] = ${JSON.stringify(categories, null, 2)};

export const places: Place[] = ${JSON.stringify(places, null, 2)};

export const trails: Trail[] = ${JSON.stringify(trails, null, 2)};

export const stories: Story[] = ${JSON.stringify(stories, null, 2)};
`;

  const outputPath = resolve(process.cwd(), 'src/data/content.ts');
  writeFileSync(outputPath, contentFileHeader, 'utf-8');
  console.log(`Updated ${outputPath} with live Sanity Content Lake data.`);

  try {
    console.log('Formatting src/data/content.ts with Prettier...');
    execSync('npx prettier --write src/data/content.ts', { stdio: 'inherit' });
  } catch {
    console.warn('Prettier formatting skipped or failed.');
  }

  console.log('Updating local seed dataset (studio/data/seed-dataset.ndjson)...');
  try {
    execSync('npx tsx scripts/export-sanity-seed.ts', { stdio: 'inherit' });
  } catch (err) {
    console.warn('Failed to export seed dataset:', err);
  }

  console.log('✅ Content pull and local dataset synchronization completed successfully.');
}

pullContentFromSanity().catch((err) => {
  console.error('Failed to pull content from Sanity:', err);
  process.exit(1);
});
