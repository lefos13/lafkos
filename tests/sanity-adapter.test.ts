import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  categories as seedCategories,
  places as seedPlaces,
  stories as seedStories,
  trails as seedTrails,
} from '../src/data/content';
import {
  fetchSanityContent,
  findPlace,
  findStory,
  findTrail,
  publicMapData,
} from '../src/lib/content-api';
import { getCopy } from '../src/lib/ui-copy';
import { isSanityConfigured } from '../src/lib/sanity-client';
import {
  transformSanityCategories,
  transformSanityPlaces,
  transformSanityStories,
  transformSanityTrails,
  type SanityCategoryDoc,
  type SanityPlaceDoc,
  type SanityStoryDoc,
  type SanityTrailDoc,
} from '../src/lib/sanity-transform';
import { lineStringSchema, pointSchema, storyEventSchema } from '../src/lib/content';
import { formatEntryDocuments } from '../scripts/import-entry';
describe('Sanity Client Config', () => {
  it('detects unconfigured or placeholder project IDs', () => {
    expect(
      isSanityConfigured({
        projectId: '',
        dataset: 'production',
        apiVersion: '2026-08-01',
        useCdn: true,
      }),
    ).toBe(false);
    expect(
      isSanityConfigured({
        projectId: 'replace-with-project-id',
        dataset: 'production',
        apiVersion: '2026-08-01',
        useCdn: true,
      }),
    ).toBe(false);
    expect(
      isSanityConfigured({
        projectId: 'abc123xyz',
        dataset: 'production',
        apiVersion: '2026-08-01',
        useCdn: true,
      }),
    ).toBe(true);
  });
});

describe('Sanity Document Transformers', () => {
  it('validates optional story event metadata', () => {
    expect(
      storyEventSchema.safeParse({
        month: 8,
        dayStart: 14,
        dayEnd: 16,
        whenLabel: { el: '14–16 Αυγούστου', en: '14–16 August' },
      }).success,
    ).toBe(true);
    expect(
      storyEventSchema.safeParse({
        month: 13,
        whenLabel: { el: 'Αύγουστος', en: 'August' },
      }).success,
    ).toBe(false);
    expect(
      storyEventSchema.safeParse({
        month: 8,
        dayStart: 16,
        dayEnd: 14,
        whenLabel: { el: '14–16 Αυγούστου', en: '14–16 August' },
      }).success,
    ).toBe(false);
  });

  it('transforms paired bilingual Place documents into unified Place objects', () => {
    const rawPlaces: SanityPlaceDoc[] = [
      {
        _id: 'place-test-square-el',
        _type: 'place',
        entityKey: 'test-square',
        language: 'el',
        title: 'Δοκιμαστική Πλατεία',
        eyebrow: 'Κεντρικό σημείο',
        slug: { current: 'dokimastiki-plateia' },
        summary: 'Μία δοκιμαστική πλατεία για tests',
        body: ['Παράγραφος 1'],
        category: 'community',
        coordinate: { lng: 23.246, lat: 39.177 },
        mapAnchor: { lng: 23.2465, lat: 39.1775 },
        hero: {
          externalUrl:
            'https://upload.wikimedia.org/wikipedia/commons/c/c8/Platia_in_Lafkos%2C_Pilion.jpg',
          alt: 'Πλατεία',
          credit: 'Photographer',
          license: 'CC BY-SA 4.0',
        },
        gallery: [
          {
            externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Milina%2C_Pelion.jpg',
            alt: 'Μηλίνα',
            credit: 'Photographer 2',
            license: 'CC BY-SA 4.0',
          },
        ],
        practical: ['Ανοιχτά όλο το 24ωρο'],
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        sources: [{ label: 'Source 1', url: 'https://example.com' }],
        featured: true,
        isSeed: false,
      },
      {
        _id: 'place-test-square-en',
        _type: 'place',
        entityKey: 'test-square',
        language: 'en',
        title: 'Test Square',
        eyebrow: 'Central Spot',
        slug: { current: 'test-square' },
        summary: 'A test square for unit tests',
        body: ['Paragraph 1'],
        category: 'community',
        coordinate: { lng: 23.246, lat: 39.177 },
        mapAnchor: { lng: 23.2465, lat: 39.1775 },
        hero: {
          externalUrl:
            'https://upload.wikimedia.org/wikipedia/commons/c/c8/Platia_in_Lafkos%2C_Pilion.jpg',
          alt: 'Square',
          credit: 'Photographer',
          license: 'CC BY-SA 4.0',
        },
        practical: ['Open 24/7'],
        sources: [{ label: 'Source 1', url: 'https://example.com' }],
        featured: true,
        isSeed: false,
      },
      {
        _id: 'place-test-cafe-el',
        _type: 'place',
        entityKey: 'test-cafe',
        language: 'el',
        title: 'Δοκιμαστικό Καφέ',
        category: 'community',
        coordinate: { lng: 23.245, lat: 39.176 },
      },
      {
        _id: 'place-test-cafe-en',
        _type: 'place',
        entityKey: 'test-cafe',
        language: 'en',
        title: 'Test Cafe',
        category: 'community',
        coordinate: { lng: 23.245, lat: 39.176 },
      },
    ];

    const places = transformSanityPlaces(rawPlaces);
    expect(places).toHaveLength(2);

    const place = places[0];
    expect(place.entityKey).toBe('test-square');
    expect(place.title.el).toBe('Δοκιμαστική Πλατεία');
    expect(place.title.en).toBe('Test Square');
    expect(place.slug.el).toBe('dokimastiki-plateia');
    expect(place.slug.en).toBe('test-square');
    expect(place.category).toBe('community');
    expect(place.featured).toBe(true);
    expect(place.isSeed).toBe(false);
    expect(place.images).toHaveLength(2);

    expect(pointSchema.parse(place.geometry).coordinates).toEqual([23.246, 39.177]);
    expect(place.mapAnchor).toEqual([23.2465, 39.1775]);
    /* The el doc carries the video; the en doc omits it, so the merged
     * value must come from el (el-first fallback, like geometry). */
    expect(place.videoUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    expect(places[1].entityKey).toBe('test-cafe');
    expect(places[1].videoUrl).toBeUndefined();
  });

  it('transforms paired bilingual Trail documents with LineString geometry and waypoints', () => {
    const rawTrails: SanityTrailDoc[] = [
      {
        _id: 'trail-test-path-el',
        _type: 'trail',
        entityKey: 'test-path',
        language: 'el',
        title: 'Μονοπάτι Δοκιμής',
        eyebrow: 'Πεζοπορική διαδρομή',
        slug: { current: 'monopati-dokimis' },
        summary: 'Δοκιμαστική περιγραφή',
        body: ['Περιγραφή διαδρομής'],
        geometry: [
          { lng: 23.246, lat: 39.177 },
          { lng: 23.248, lat: 39.179 },
          { lng: 23.25, lat: 39.181 },
        ],
        waypoints: [
          {
            title: 'Κρήνη',
            coordinate: { lng: 23.247, lat: 39.178 },
            image: {
              externalUrl:
                'https://upload.wikimedia.org/wikipedia/commons/b/b4/Milina%2C_Pelion.jpg',
              alt: 'Κρήνη',
              credit: 'Photo',
              license: 'CC BY-SA 4.0',
            },
          },
        ],
        distanceMeters: 2500,
        durationMinutes: 45,
        elevationGainMeters: 120,
        difficulty: 'moderate',
        surface: 'Καλντερίμι',
        safety: ['Νερό και καλά παπούτσια'],
        videoUrl: 'https://youtu.be/jNQXAC9IVRw',
        sources: [{ label: 'Topoguide', url: 'https://example.com' }],
        featured: true,
        isSeed: false,
      },
      {
        _id: 'trail-test-path-en',
        _type: 'trail',
        entityKey: 'test-path',
        language: 'en',
        title: 'Test Path',
        eyebrow: 'Hiking route',
        slug: { current: 'test-path' },
        summary: 'Test summary',
        body: ['Trail description'],
        geometry: [
          { lng: 23.246, lat: 39.177 },
          { lng: 23.248, lat: 39.179 },
          { lng: 23.25, lat: 39.181 },
        ],
        waypoints: [
          {
            title: 'Spring',
            coordinate: { lng: 23.247, lat: 39.178 },
            image: {
              externalUrl:
                'https://upload.wikimedia.org/wikipedia/commons/b/b4/Milina%2C_Pelion.jpg',
              alt: 'Spring',
              credit: 'Photo',
              license: 'CC BY-SA 4.0',
            },
          },
        ],
        distanceMeters: 2500,
        durationMinutes: 45,
        elevationGainMeters: 120,
        difficulty: 'moderate',
        surface: 'Cobblestone',
        safety: ['Water and hiking shoes'],
        videoUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
        sources: [{ label: 'Topoguide', url: 'https://example.com' }],
        featured: true,
        isSeed: false,
      },
    ];

    const trails = transformSanityTrails(rawTrails);
    expect(trails).toHaveLength(1);

    const trail = trails[0];
    expect(trail.entityKey).toBe('test-path');
    expect(trail.title.el).toBe('Μονοπάτι Δοκιμής');
    expect(trail.title.en).toBe('Test Path');
    expect(trail.difficulty).toBe('moderate');
    expect(trail.distanceMeters).toBe(2500);
    expect(trail.waypoints).toHaveLength(1);
    expect(trail.waypoints[0].title.el).toBe('Κρήνη');
    expect(trail.waypoints[0].title.en).toBe('Spring');
    /* Both language docs set a videoUrl here; el must win. */
    expect(trail.videoUrl).toBe('https://youtu.be/jNQXAC9IVRw');

    const parsedGeometry = lineStringSchema.parse(trail.geometry);
    expect(parsedGeometry.coordinates).toHaveLength(3);
    expect(parsedGeometry.coordinates[0]).toEqual([23.246, 39.177]);
  });

  it('transforms paired bilingual Story documents and Categories', () => {
    const rawStories: SanityStoryDoc[] = [
      {
        _id: 'story-test-el',
        _type: 'story',
        entityKey: 'test-story',
        language: 'el',
        title: 'Ιστορία',
        eyebrow: 'Παράδοση',
        slug: { current: 'istoria' },
        summary: 'Περίληψη',
        body: ['Κείμενο'],
        hero: {
          externalUrl:
            'https://upload.wikimedia.org/wikipedia/commons/c/c8/Platia_in_Lafkos%2C_Pilion.jpg',
          alt: 'Ιστορία',
          credit: 'Photo',
          license: 'CC BY-SA 4.0',
        },
        event: {
          month: 8,
          dayStart: 14,
          dayEnd: 16,
          whenLabel: '14–16 Αυγούστου',
        },
        relatedKeys: ['lafkos-square'],
        sources: [{ label: 'Source', url: 'https://example.com' }],
        featured: true,
        isSeed: false,
      },
      {
        _id: 'story-test-en',
        _type: 'story',
        entityKey: 'test-story',
        language: 'en',
        title: 'Story',
        eyebrow: 'Tradition',
        slug: { current: 'story' },
        summary: 'Summary',
        body: ['Text'],
        hero: {
          externalUrl:
            'https://upload.wikimedia.org/wikipedia/commons/c/c8/Platia_in_Lafkos%2C_Pilion.jpg',
          alt: 'Story',
          credit: 'Photo',
          license: 'CC BY-SA 4.0',
        },
        event: {
          month: 8,
          dayStart: 14,
          dayEnd: 16,
          whenLabel: '14–16 August',
        },
        relatedKeys: ['lafkos-square'],
        sources: [{ label: 'Source', url: 'https://example.com' }],
        featured: true,
        isSeed: false,
      },
    ];

    const stories = transformSanityStories(rawStories);
    expect(stories).toHaveLength(1);
    expect(stories[0].title.el).toBe('Ιστορία');
    expect(stories[0].title.en).toBe('Story');
    expect(stories[0].relatedKeys).toContain('lafkos-square');
    expect(stories[0].event).toEqual({
      month: 8,
      dayStart: 14,
      dayEnd: 16,
      whenLabel: { el: '14–16 Αυγούστου', en: '14–16 August' },
    });

    const rawCategories: SanityCategoryDoc[] = [
      {
        _id: 'category-heritage',
        _type: 'category',
        id: 'heritage',
        labelEl: 'Ιστορία',
        labelEn: 'Heritage',
        descriptionEl: 'Μουσεία',
        descriptionEn: 'Museums',
        color: '#b66c45',
        icon: '✦',
      },
    ];

    const categories = transformSanityCategories(rawCategories);
    expect(categories).toHaveLength(1);
    expect(categories[0].id).toBe('heritage');
    expect(categories[0].label.el).toBe('Ιστορία');
    expect(categories[0].label.en).toBe('Heritage');

    const stayCategories = transformSanityCategories([
      {
        _id: 'category-stay',
        _type: 'category',
        id: 'stay',
        labelEl: 'Φιλοξενία',
        labelEn: 'Stay',
        descriptionEl: 'Καταλύματα',
        descriptionEn: 'Accommodation',
        color: '#6c7aa1',
        icon: '⌂',
      },
    ]);
    expect(stayCategories[0].id).toBe('stay');
  });
});

describe('Content API Adapter', () => {
  /* The adapter unit test exercises its local fallback without depending on
   * live Sanity latency or credentials loaded from a developer `.env` file. */
  it('uses the seed dataset when Sanity is unavailable', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('PUBLIC_SANITY_PROJECT_ID', 'replace-with-project-id');

    try {
      const dataset = await fetchSanityContent();
      expect(dataset.source).toBe('seed');
      expect(dataset.places.length).toBeGreaterThan(0);
      expect(dataset.trails.length).toBeGreaterThan(0);
      expect(dataset.stories.length).toBeGreaterThan(0);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('provides bilingual copy for data source indicators and seed warnings', () => {
    const elCopy = getCopy('el');
    const enCopy = getCopy('en');

    expect(elCopy.dataSource).toBe('Πηγή δεδομένων:');
    expect(elCopy.cmsLiveTitle).toBeTruthy();
    expect(elCopy.seedFallbackTitle).toBeTruthy();
    expect(elCopy.seedFallbackWarning).toContain('Sanity CMS');

    expect(enCopy.dataSource).toBe('Data source:');
    expect(enCopy.cmsLiveTitle).toBeTruthy();
    expect(enCopy.seedFallbackTitle).toBeTruthy();
    expect(enCopy.seedFallbackWarning).toContain('Sanity CMS');
  });

  it('resolves place, trail, and story by localized slug', () => {
    const squareEl = findPlace('el', 'plateia-lafkou');
    expect(squareEl).toBeDefined();
    expect(squareEl?.entityKey).toBe('lafkos-square');

    const squareEn = findPlace('en', 'lafkos-square');
    expect(squareEn).toBeDefined();
    expect(squareEn?.entityKey).toBe('lafkos-square');

    const milinaTrail = findTrail('el', 'kalderimi-lafkos-milina');
    expect(milinaTrail).toBeDefined();
    expect(milinaTrail?.entityKey).toBe('lafkos-milina-trail');

    const readingStory = findStory('el', 'reading-lafkos');
    expect(readingStory).toBeDefined();
    expect(readingStory?.entityKey).toBe('reading-lafkos');
  });

  it('generates compliant MapData with waypoint features', () => {
    const mapDataEl = publicMapData('el');
    expect(mapDataEl.schemaVersion).toBe(1);
    expect(mapDataEl.places.length).toBeGreaterThan(0);
    expect(mapDataEl.trails.length).toBeGreaterThan(0);
    expect(mapDataEl.waypoints.length).toBeGreaterThan(0);

    const mapDataEn = publicMapData('en');
    expect(mapDataEn.places.length).toBe(mapDataEl.places.length);
  });
});

describe('Seed NDJSON Archive Integrity & Entry Formatter', () => {
  it('verifies that studio/data/seed-dataset.ndjson is valid and contains all bilingual records', () => {
    const ndjsonPath = resolve(process.cwd(), 'studio/data/seed-dataset.ndjson');
    const content = readFileSync(ndjsonPath, 'utf-8');
    const lines = content.trim().split('\n');

    /* Each bilingual entity contributes two language documents plus one
     * translation.metadata record; categories and siteSettings add one each. */
    const expectedDocs =
      3 * (seedPlaces.length + seedTrails.length + seedStories.length) + seedCategories.length + 1;
    expect(lines.length).toBe(expectedDocs);

    const types = new Set<string>();
    for (const line of lines) {
      const doc = JSON.parse(line);
      expect(doc._id).toBeTruthy();
      expect(doc._type).toBeTruthy();
      types.add(doc._type);
    }

    expect(types.has('place')).toBe(true);
    expect(types.has('trail')).toBe(true);
    expect(types.has('story')).toBe(true);
    expect(types.has('category')).toBe(true);
    expect(types.has('siteSettings')).toBe(true);
    expect(types.has('translation.metadata')).toBe(true);
  });

  it('formats new entries into compliant Greek, English, and translation metadata documents', () => {
    const [elDoc, enDoc, metaDoc] = formatEntryDocuments({
      kind: 'place',
      entityKey: 'sample-point',
      slug: { el: 'deigma-simeiou', en: 'sample-point' },
      title: { el: 'Δείγμα Σημείου', en: 'Sample Point' },
      eyebrow: { el: 'Σημείο', en: 'Point' },
      summary: { el: 'Περίληψη', en: 'Summary' },
      body: { el: ['Κείμενο'], en: ['Text'] },
      category: 'stay',
      geometry: { type: 'Point', coordinates: [23.246, 39.177] },
      mapAnchor: [23.246, 39.177],
      images: [
        {
          src: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Platia_in_Lafkos%2C_Pilion.jpg',
          alt: 'Alt',
          credit: 'Photo',
          license: 'CC BY-SA 4.0',
        },
      ],
      practical: { el: [], en: [] },
      videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      sources: [{ label: 'Source', url: 'https://example.com' }],
      featured: false,
      isSeed: false,
    });

    expect(elDoc._id).toBe('place-sample-point-el');
    expect(enDoc._id).toBe('place-sample-point-en');
    expect(elDoc.category).toBe('stay');
    expect(enDoc.category).toBe('stay');
    expect(metaDoc._id).toBe('translation.place-sample-point');
    expect(metaDoc._type).toBe('translation.metadata');

    const translations = metaDoc.translations as Array<{ _type: string; _key: string }>;
    expect(translations[0]._type).toBe('internationalizedArrayReferenceValue');

    /* videoUrl is not localized: both language docs carry the same value. */
    expect(elDoc.videoUrl).toBe('https://www.youtube.com/watch?v=aqz-KE-bpKQ');
    expect(enDoc.videoUrl).toBe('https://www.youtube.com/watch?v=aqz-KE-bpKQ');

    const [trailElDoc, trailEnDoc] = formatEntryDocuments({
      kind: 'trail',
      entityKey: 'sample-path',
      slug: { el: 'deigma-monopatiou', en: 'sample-path' },
      title: { el: 'Δείγμα Μονοπατιού', en: 'Sample Path' },
      eyebrow: { el: 'Πεζοπορική διαδρομή', en: 'Hiking trail' },
      summary: { el: 'Περίληψη', en: 'Summary' },
      body: { el: ['Κείμενο'], en: ['Text'] },
      geometry: {
        type: 'LineString',
        coordinates: [
          [23.246, 39.177],
          [23.248, 39.179],
        ],
      },
      distanceMeters: 2500,
      durationMinutes: 45,
      elevationGainMeters: 120,
      difficulty: 'moderate',
      surface: { el: 'Καλντερίμι', en: 'Cobblestone' },
      safety: { el: ['Πάρτε νερό'], en: ['Bring water'] },
      waypoints: [
        {
          title: { el: 'Κρήνη', en: 'Spring' },
          coordinate: [23.247, 39.178],
        },
      ],
      videoUrl: 'https://youtu.be/jNQXAC9IVRw',
      sources: [{ label: 'Source', url: 'https://example.com' }],
      featured: false,
      isSeed: true,
    });

    expect(trailElDoc._id).toBe('trail-sample-path-el');
    expect(trailElDoc.videoUrl).toBe('https://youtu.be/jNQXAC9IVRw');
    expect(trailEnDoc._id).toBe('trail-sample-path-en');
    expect(trailEnDoc.videoUrl).toBe('https://youtu.be/jNQXAC9IVRw');

    const [storyElDoc, storyEnDoc] = formatEntryDocuments({
      kind: 'story',
      entityKey: 'festival-story',
      slug: { el: 'istoria-festival', en: 'festival-story' },
      title: { el: 'Ιστορία φεστιβάλ', en: 'Festival story' },
      eyebrow: { el: 'Παράδοση', en: 'Tradition' },
      summary: { el: 'Περίληψη', en: 'Summary' },
      body: { el: ['Κείμενο'], en: ['Text'] },
      image: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Platia_in_Lafkos%2C_Pilion.jpg',
        alt: 'Εικόνα',
        credit: 'Photo',
        license: 'CC BY-SA 4.0',
      },
      event: {
        month: 8,
        dayStart: 14,
        dayEnd: 16,
        whenLabel: { el: '14–16 Αυγούστου', en: '14–16 August' },
      },
      relatedKeys: [],
      sources: [{ label: 'Source', url: 'https://example.com' }],
      featured: false,
      isSeed: true,
    });

    expect(storyElDoc.event).toEqual({
      month: 8,
      dayStart: 14,
      dayEnd: 16,
      whenLabel: '14–16 Αυγούστου',
    });
    expect(storyEnDoc.event).toEqual({
      month: 8,
      dayStart: 14,
      dayEnd: 16,
      whenLabel: '14–16 August',
    });
  });
});
