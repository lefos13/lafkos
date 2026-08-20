import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { categories, places, stories, trails } from '../src/data/content';
import { copy } from '../src/lib/ui-copy';
import type { ImageAsset } from '../src/lib/content';

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
function generateNdjson() {
  const documents: Record<string, unknown>[] = [];
  const now = new Date().toISOString();

  // 1. Categories
  for (const category of categories) {
    documents.push({
      _id: `category-${category.id}`,
      _type: 'category',
      _createdAt: now,
      _updatedAt: now,
      id: category.id,
      labelEl: category.label.el,
      labelEn: category.label.en,
      descriptionEl: category.description.el,
      descriptionEn: category.description.en,
      color: category.color,
      icon: category.icon,
    });
  }

  // 2. Places (bilingual + translation metadata)
  for (const place of places) {
    const elId = `place-${place.entityKey}-el`;
    const enId = `place-${place.entityKey}-en`;

    const point =
      place.geometry.type === 'Point'
        ? {
            _type: 'geopoint',
            lng: place.geometry.coordinates[0],
            lat: place.geometry.coordinates[1],
          }
        : {
            _type: 'geopoint',
            lng: place.mapAnchor[0],
            lat: place.mapAnchor[1],
          };

    const mapAnchor = {
      _type: 'geopoint',
      lng: place.mapAnchor[0],
      lat: place.mapAnchor[1],
    };

    const sources = place.sources.map((s, index) => ({
      _key: `src-${index}`,
      label: s.label,
      url: s.url,
    }));

    const hero = toSanityImage(place.images[0]);
    const gallery = place.images.slice(1).map((img, idx) => ({
      _key: `gal-${idx}`,
      ...toSanityImage(img),
    }));

    // Greek document
    documents.push({
      _id: elId,
      _type: 'place',
      _createdAt: now,
      _updatedAt: now,
      entityKey: place.entityKey,
      language: 'el',
      title: place.title.el,
      eyebrow: place.eyebrow.el,
      slug: { _type: 'slug', current: place.slug.el },
      summary: place.summary.el,
      body: place.body.el,
      category: place.category,
      coordinate: point,
      mapAnchor,
      hero,
      gallery,
      practical: place.practical.el,
      sources,
      featured: place.featured,
      isSeed: place.isSeed,
    });

    // English document
    documents.push({
      _id: enId,
      _type: 'place',
      _createdAt: now,
      _updatedAt: now,
      entityKey: place.entityKey,
      language: 'en',
      title: place.title.en,
      eyebrow: place.eyebrow.en,
      slug: { _type: 'slug', current: place.slug.en },
      summary: place.summary.en,
      body: place.body.en,
      category: place.category,
      coordinate: point,
      mapAnchor,
      hero,
      gallery,
      practical: place.practical.en,
      sources,
      featured: place.featured,
      isSeed: place.isSeed,
    });

    // Translation metadata
    documents.push({
      _id: `translation.place-${place.entityKey}`,
      _type: 'translation.metadata',
      _createdAt: now,
      _updatedAt: now,
      schemaTypes: ['place'],
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
    });
  }

  // 3. Trails (bilingual + translation metadata)
  for (const trail of trails) {
    const elId = `trail-${trail.entityKey}-el`;
    const enId = `trail-${trail.entityKey}-en`;

    const geometry = trail.geometry.coordinates.map(([lng, lat], idx) => ({
      _key: `pt-${idx}`,
      lng,
      lat,
    }));

    const waypointsEl = trail.waypoints.map((wp, idx) => ({
      _key: `wp-${idx}`,
      title: wp.title.el,
      coordinate: { _type: 'geopoint', lng: wp.coordinate[0], lat: wp.coordinate[1] },
      image: toSanityImage(wp.image),
    }));

    const waypointsEn = trail.waypoints.map((wp, idx) => ({
      _key: `wp-${idx}`,
      title: wp.title.en,
      coordinate: { _type: 'geopoint', lng: wp.coordinate[0], lat: wp.coordinate[1] },
      image: toSanityImage(wp.image),
    }));

    const sources = trail.sources.map((s, index) => ({
      _key: `src-${index}`,
      label: s.label,
      url: s.url,
    }));

    // Greek document
    documents.push({
      _id: elId,
      _type: 'trail',
      _createdAt: now,
      _updatedAt: now,
      entityKey: trail.entityKey,
      language: 'el',
      title: trail.title.el,
      eyebrow: trail.eyebrow.el,
      slug: { _type: 'slug', current: trail.slug.el },
      summary: trail.summary.el,
      body: trail.body.el,
      geometry,
      waypoints: waypointsEl,
      distanceMeters: trail.distanceMeters,
      durationMinutes: trail.durationMinutes,
      elevationGainMeters: trail.elevationGainMeters,
      difficulty: trail.difficulty,
      surface: trail.surface.el,
      safety: trail.safety.el,
      sources,
      featured: trail.featured,
      isSeed: trail.isSeed,
    });

    // English document
    documents.push({
      _id: enId,
      _type: 'trail',
      _createdAt: now,
      _updatedAt: now,
      entityKey: trail.entityKey,
      language: 'en',
      title: trail.title.en,
      eyebrow: trail.eyebrow.en,
      slug: { _type: 'slug', current: trail.slug.en },
      summary: trail.summary.en,
      body: trail.body.en,
      geometry,
      waypoints: waypointsEn,
      distanceMeters: trail.distanceMeters,
      durationMinutes: trail.durationMinutes,
      elevationGainMeters: trail.elevationGainMeters,
      difficulty: trail.difficulty,
      surface: trail.surface.en,
      safety: trail.safety.en,
      sources,
      featured: trail.featured,
      isSeed: trail.isSeed,
    });

    // Translation metadata
    documents.push({
      _id: `translation.trail-${trail.entityKey}`,
      _type: 'translation.metadata',
      _createdAt: now,
      _updatedAt: now,
      schemaTypes: ['trail'],
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
    });
  }

  // 4. Stories (bilingual + translation metadata)
  for (const story of stories) {
    const elId = `story-${story.entityKey}-el`;
    const enId = `story-${story.entityKey}-en`;

    const hero = toSanityImage(story.image);
    const sources = story.sources.map((s, index) => ({
      _key: `src-${index}`,
      label: s.label,
      url: s.url,
    }));

    // Greek document
    documents.push({
      _id: elId,
      _type: 'story',
      _createdAt: now,
      _updatedAt: now,
      entityKey: story.entityKey,
      language: 'el',
      title: story.title.el,
      eyebrow: story.eyebrow.el,
      slug: { _type: 'slug', current: story.slug.el },
      summary: story.summary.el,
      body: story.body.el,
      hero,
      relatedKeys: story.relatedKeys,
      sources,
      featured: story.featured,
      isSeed: story.isSeed,
    });

    // English document
    documents.push({
      _id: enId,
      _type: 'story',
      _createdAt: now,
      _updatedAt: now,
      entityKey: story.entityKey,
      language: 'en',
      title: story.title.en,
      eyebrow: story.eyebrow.en,
      slug: { _type: 'slug', current: story.slug.en },
      summary: story.summary.en,
      body: story.body.en,
      hero,
      relatedKeys: story.relatedKeys,
      sources,
      featured: story.featured,
      isSeed: story.isSeed,
    });

    // Translation metadata
    documents.push({
      _id: `translation.story-${story.entityKey}`,
      _type: 'translation.metadata',
      _createdAt: now,
      _updatedAt: now,
      schemaTypes: ['story'],
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
    });
  }

  // 5. Global Site Settings
  documents.push({
    _id: 'siteSettings',
    _type: 'siteSettings',
    _createdAt: now,
    _updatedAt: now,
    siteTitleEl: 'Οδηγός Λαύκου',
    siteTitleEn: 'Lafkos Guide',
    descriptionEl: copy.el.intro,
    descriptionEn: copy.en.intro,
    introEl: copy.el.intro,
    introEn: copy.en.intro,
    introLongEl: copy.el.introLong,
    introLongEn: copy.en.introLong,
    seedNoticeEl: copy.el.seedNotice,
    seedNoticeEn: copy.en.seedNotice,
    footerEl: copy.el.footer,
    footerEn: copy.en.footer,
  });

  return documents;
}

const outputPath = resolve(process.cwd(), 'studio/data/seed-dataset.ndjson');
mkdirSync(dirname(outputPath), { recursive: true });

const docs = generateNdjson();
const ndjsonContent = docs.map((doc) => JSON.stringify(doc)).join('\n') + '\n';
writeFileSync(outputPath, ndjsonContent, 'utf-8');

console.log(`Successfully generated ${docs.length} Sanity documents to ${outputPath}`);
