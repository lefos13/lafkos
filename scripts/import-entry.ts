/*
 * Helper script to validate, format, and import bilingual entries into Sanity CMS.
 *
 * Usage:
 *   npx tsx scripts/import-entry.ts --file path/to/entry.json [--direct]
 *
 * Options:
 *   --file, -f    Path to JSON file containing a Place, Trail, or Story entry.
 *   --direct, -d  Mutate Sanity dataset directly using Sanity client (requires SANITY_AUTH_TOKEN).
 *   --append, -a  Append to studio/data/seed-dataset.ndjson (default).
 */

import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import {
  categorySchema,
  imageSchema,
  lineStringSchema,
  pointSchema,
  sourceSchema,
  type ImageAsset,
  type Place,
  type Story,
  type Trail,
} from '../src/lib/content';
import { getSanityClient, isSanityConfigured } from '../src/lib/sanity-client';

const localizedStringSchema = z.object({
  el: z.string().min(1),
  en: z.string().min(1),
});

const localizedStringArraySchema = z.object({
  el: z.array(z.string().min(1)),
  en: z.array(z.string().min(1)),
});

const placeInputSchema = z.object({
  kind: z.literal('place'),
  entityKey: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  slug: localizedStringSchema,
  title: localizedStringSchema,
  eyebrow: localizedStringSchema.optional().default({ el: '', en: '' }),
  summary: localizedStringSchema,
  body: localizedStringArraySchema,
  category: categorySchema.exclude(['trail'] as const),
  geometry: pointSchema,
  mapAnchor: z.tuple([z.number(), z.number()]).optional(),
  images: z.array(imageSchema).min(1),
  practical: localizedStringArraySchema.optional().default({ el: [], en: [] }),
  sources: z.array(sourceSchema).min(1),
  featured: z.boolean().optional().default(false),
  isSeed: z.boolean().optional().default(false),
});

const trailInputSchema = z.object({
  kind: z.literal('trail'),
  entityKey: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  slug: localizedStringSchema,
  title: localizedStringSchema,
  eyebrow: localizedStringSchema.optional().default({ el: '', en: '' }),
  summary: localizedStringSchema,
  body: localizedStringArraySchema,
  geometry: lineStringSchema,
  distanceMeters: z.number().positive(),
  durationMinutes: z.number().positive(),
  elevationGainMeters: z.number().min(0),
  difficulty: z.enum(['easy', 'moderate', 'demanding']),
  surface: localizedStringSchema,
  safety: localizedStringArraySchema.optional().default({ el: [], en: [] }),
  waypoints: z
    .array(
      z.object({
        title: localizedStringSchema,
        coordinate: z.tuple([z.number(), z.number()]),
        image: imageSchema.optional(),
      }),
    )
    .min(1),
  sources: z.array(sourceSchema).min(1),
  featured: z.boolean().optional().default(false),
  isSeed: z.boolean().optional().default(false),
});

const storyInputSchema = z.object({
  kind: z.literal('story'),
  entityKey: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  slug: localizedStringSchema,
  title: localizedStringSchema,
  eyebrow: localizedStringSchema.optional().default({ el: '', en: '' }),
  summary: localizedStringSchema,
  body: localizedStringArraySchema,
  image: imageSchema,
  relatedKeys: z.array(z.string()).optional().default([]),
  sources: z.array(sourceSchema).min(1),
  featured: z.boolean().optional().default(false),
  isSeed: z.boolean().optional().default(false),
});

const entrySchema = z.discriminatedUnion('kind', [
  placeInputSchema,
  trailInputSchema,
  storyInputSchema,
]);

function toSanityImage(image?: ImageAsset) {
  if (!image) return undefined;
  return {
    _type: 'image',
    externalUrl: image.src,
    alt: image.alt,
    credit: image.credit,
    license: image.license,
  };
}

export function formatEntryDocuments(
  entry: Place | Trail | Story,
): [Record<string, unknown>, Record<string, unknown>, Record<string, unknown>] {
  const now = new Date().toISOString();
  const elId = `${entry.kind}-${entry.entityKey}-el`;
  const enId = `${entry.kind}-${entry.entityKey}-en`;
  const metaId = `translation.${entry.kind}-${entry.entityKey}`;

  let elDoc: Record<string, unknown>;
  let enDoc: Record<string, unknown>;

  if (entry.kind === 'place') {
    const point = {
      _type: 'geopoint',
      lng: entry.geometry.coordinates[0],
      lat: entry.geometry.coordinates[1],
    };
    const mapAnchor = entry.mapAnchor
      ? { _type: 'geopoint', lng: entry.mapAnchor[0], lat: entry.mapAnchor[1] }
      : point;

    const hero = toSanityImage(entry.images[0]);
    const gallery = entry.images.slice(1).map((img, idx) => ({
      _key: `gal-${idx}`,
      ...toSanityImage(img),
    }));

    const sources = entry.sources.map((s, idx) => ({
      _key: `src-${idx}`,
      label: s.label,
      url: s.url,
    }));

    elDoc = {
      _id: elId,
      _type: 'place',
      _createdAt: now,
      _updatedAt: now,
      entityKey: entry.entityKey,
      language: 'el',
      title: entry.title.el,
      eyebrow: entry.eyebrow?.el || '',
      slug: { _type: 'slug', current: entry.slug.el },
      summary: entry.summary.el,
      body: entry.body.el,
      category: entry.category,
      coordinate: point,
      mapAnchor,
      hero,
      gallery,
      practical: entry.practical?.el || [],
      sources,
      featured: entry.featured,
      isSeed: entry.isSeed,
    };

    enDoc = {
      _id: enId,
      _type: 'place',
      _createdAt: now,
      _updatedAt: now,
      entityKey: entry.entityKey,
      language: 'en',
      title: entry.title.en,
      eyebrow: entry.eyebrow?.en || '',
      slug: { _type: 'slug', current: entry.slug.en },
      summary: entry.summary.en,
      body: entry.body.en,
      category: entry.category,
      coordinate: point,
      mapAnchor,
      hero,
      gallery,
      practical: entry.practical?.en || [],
      sources,
      featured: entry.featured,
      isSeed: entry.isSeed,
    };
  } else if (entry.kind === 'trail') {
    const geometry = entry.geometry.coordinates.map(([lng, lat], idx) => ({
      _key: `pt-${idx}`,
      lng,
      lat,
    }));

    const waypointsEl = entry.waypoints.map((wp, idx) => ({
      _key: `wp-${idx}`,
      title: wp.title.el,
      coordinate: { _type: 'geopoint', lng: wp.coordinate[0], lat: wp.coordinate[1] },
      image: toSanityImage(wp.image),
    }));

    const waypointsEn = entry.waypoints.map((wp, idx) => ({
      _key: `wp-${idx}`,
      title: wp.title.en,
      coordinate: { _type: 'geopoint', lng: wp.coordinate[0], lat: wp.coordinate[1] },
      image: toSanityImage(wp.image),
    }));

    const sources = entry.sources.map((s, idx) => ({
      _key: `src-${idx}`,
      label: s.label,
      url: s.url,
    }));

    elDoc = {
      _id: elId,
      _type: 'trail',
      _createdAt: now,
      _updatedAt: now,
      entityKey: entry.entityKey,
      language: 'el',
      title: entry.title.el,
      eyebrow: entry.eyebrow?.el || '',
      slug: { _type: 'slug', current: entry.slug.el },
      summary: entry.summary.el,
      body: entry.body.el,
      geometry,
      waypoints: waypointsEl,
      distanceMeters: entry.distanceMeters,
      durationMinutes: entry.durationMinutes,
      elevationGainMeters: entry.elevationGainMeters,
      difficulty: entry.difficulty,
      surface: entry.surface.el,
      safety: entry.safety?.el || [],
      sources,
      featured: entry.featured,
      isSeed: entry.isSeed,
    };

    enDoc = {
      _id: enId,
      _type: 'trail',
      _createdAt: now,
      _updatedAt: now,
      entityKey: entry.entityKey,
      language: 'en',
      title: entry.title.en,
      eyebrow: entry.eyebrow?.en || '',
      slug: { _type: 'slug', current: entry.slug.en },
      summary: entry.summary.en,
      body: entry.body.en,
      geometry,
      waypoints: waypointsEn,
      distanceMeters: entry.distanceMeters,
      durationMinutes: entry.durationMinutes,
      elevationGainMeters: entry.elevationGainMeters,
      difficulty: entry.difficulty,
      surface: entry.surface.en,
      safety: entry.safety?.en || [],
      sources,
      featured: entry.featured,
      isSeed: entry.isSeed,
    };
  } else {
    const hero = toSanityImage(entry.image);
    const sources = entry.sources.map((s, idx) => ({
      _key: `src-${idx}`,
      label: s.label,
      url: s.url,
    }));

    elDoc = {
      _id: elId,
      _type: 'story',
      _createdAt: now,
      _updatedAt: now,
      entityKey: entry.entityKey,
      language: 'el',
      title: entry.title.el,
      eyebrow: entry.eyebrow?.el || '',
      slug: { _type: 'slug', current: entry.slug.el },
      summary: entry.summary.el,
      body: entry.body.el,
      hero,
      relatedKeys: entry.relatedKeys || [],
      sources,
      featured: entry.featured,
      isSeed: entry.isSeed,
    };

    enDoc = {
      _id: enId,
      _type: 'story',
      _createdAt: now,
      _updatedAt: now,
      entityKey: entry.entityKey,
      language: 'en',
      title: entry.title.en,
      eyebrow: entry.eyebrow?.en || '',
      slug: { _type: 'slug', current: entry.slug.en },
      summary: entry.summary.en,
      body: entry.body.en,
      hero,
      relatedKeys: entry.relatedKeys || [],
      sources,
      featured: entry.featured,
      isSeed: entry.isSeed,
    };
  }

  const metaDoc = {
    _id: metaId,
    _type: 'translation.metadata',
    _createdAt: now,
    _updatedAt: now,
    schemaTypes: [entry.kind],
    translations: [
      {
        _key: 'el',
        _type: 'internationalizedArrayReferenceValue',
        value: { _type: 'reference', _ref: elId },
      },
      {
        _key: 'en',
        _type: 'internationalizedArrayReferenceValue',
        value: { _type: 'reference', _ref: enId },
      },
    ],
  };

  return [elDoc, enDoc, metaDoc];
}

async function main() {
  const args = process.argv.slice(2);
  let filePath: string | null = null;
  let directMutate = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' || args[i] === '-f') {
      filePath = args[++i];
    } else if (args[i] === '--direct' || args[i] === '-d') {
      directMutate = true;
    }
  }

  if (!filePath) {
    console.error(
      'Please specify an input file: npx tsx scripts/import-entry.ts --file <path-to-json>',
    );
    process.exit(1);
  }

  const absolutePath = resolve(process.cwd(), filePath);
  if (!existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const rawJson = JSON.parse(readFileSync(absolutePath, 'utf-8'));
  const validated = entrySchema.parse(rawJson) as Place | Trail | Story;

  const [elDoc, enDoc, metaDoc] = formatEntryDocuments(validated);

  if (directMutate) {
    if (!isSanityConfigured()) {
      console.error('Sanity project is not configured in .env');
      process.exit(1);
    }
    const client = getSanityClient({ useCdn: false });
    const transaction = client.transaction();
    transaction.createOrReplace(elDoc as Parameters<typeof transaction.createOrReplace>[0]);
    transaction.createOrReplace(enDoc as Parameters<typeof transaction.createOrReplace>[0]);
    transaction.createOrReplace(metaDoc as Parameters<typeof transaction.createOrReplace>[0]);
    const result = await transaction.commit();
    console.log(
      `Successfully committed ${validated.kind} '${validated.entityKey}' to Sanity:`,
      result.transactionId,
    );
  } else {
    const ndjsonPath = resolve(process.cwd(), 'studio/data/seed-dataset.ndjson');
    const lines =
      [JSON.stringify(elDoc), JSON.stringify(enDoc), JSON.stringify(metaDoc)].join('\n') + '\n';
    appendFileSync(ndjsonPath, lines, 'utf-8');
    console.log(
      `Successfully appended ${validated.kind} '${validated.entityKey}' (3 documents) to ${ndjsonPath}`,
    );
    console.log('Run `pnpm studio:import-seed` to sync into your live Sanity dataset.');
  }
}

if (process.argv[1]?.endsWith('import-entry.ts')) {
  main().catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  });
}
