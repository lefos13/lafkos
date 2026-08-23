import { describe, expect, it } from 'vitest';
import { places, stories, trails } from '../src/data/content';
import { formatEntryDocuments } from '../scripts/import-entry';
import { lineStringSchema, type Place, type Trail } from '../src/lib/content';
import { publicMapData } from '../src/lib/content-api';
import { transformSanityTrails } from '../src/lib/sanity-transform';

function haversineLength(coordinates: Array<[number, number]>) {
  const earthRadiusMeters = 6_371_000;
  const radians = Math.PI / 180;
  let length = 0;

  for (let index = 1; index < coordinates.length; index += 1) {
    const [previousLongitude, previousLatitude] = coordinates[index - 1];
    const [longitude, latitude] = coordinates[index];
    const deltaLatitude = (latitude - previousLatitude) * radians;
    const deltaLongitude = (longitude - previousLongitude) * radians;
    const a =
      Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(previousLatitude * radians) *
        Math.cos(latitude * radians) *
        Math.sin(deltaLongitude / 2) ** 2;
    length += 2 * earthRadiusMeters * Math.asin(Math.sqrt(a));
  }

  return length;
}

describe('Lafkos seed content', () => {
  it('contains a bilingual slug for every place, trail, and story', () => {
    [...places, ...trails, ...stories].forEach((entry) => {
      expect(entry.slug.el).toBeTruthy();
      expect(entry.slug.en).toBeTruthy();
    });
  });

  it('validates reading-lafkos story properties and sources', () => {
    const readingStory = stories.find((s) => s.entityKey === 'reading-lafkos');
    expect(readingStory).toBeDefined();
    expect(readingStory?.slug.el).toBe('reading-lafkos');
    expect(readingStory?.slug.en).toBe('reading-lafkos');
    expect(readingStory?.body.el.length).toBeGreaterThanOrEqual(7);
    expect(readingStory?.body.en.length).toBeGreaterThanOrEqual(7);
    expect(readingStory?.body.el.length).toBe(readingStory?.body.en.length);
    expect(readingStory?.image.src).toBeTruthy();
    expect(readingStory?.sources.length).toBeGreaterThanOrEqual(5);
    expect(readingStory?.relatedKeys.length).toBeGreaterThanOrEqual(5);
  });

  it('keeps every trail geometry valid and at least two coordinates long', () => {
    trails.forEach((trail) => {
      expect(lineStringSchema.parse(trail.geometry).coordinates.length).toBeGreaterThanOrEqual(2);
    });
  });

  /* Declared route lengths must remain honest when geometry is edited or
   * regenerated; this also guards the corrected springs heritage loop. */
  it('keeps declared trail distances within five percent of their geometry', () => {
    trails.forEach((trail) => {
      const measuredLength = haversineLength(trail.geometry.coordinates);
      const relativeError = Math.abs(trail.distanceMeters - measuredLength) / measuredLength;
      expect(relativeError, trail.entityKey).toBeLessThanOrEqual(0.05);
    });
  });

  it('requires seed content to identify itself before publication', () => {
    expect(places.every((place) => place.isSeed)).toBe(true);
    expect(trails.every((trail) => trail.isSeed)).toBe(true);
    expect(stories.every((story) => story.isSeed)).toBe(true);
  });

  it('resolves every seeded waypoint place key to a real place entity', () => {
    const placeKeys = new Set(places.map((place) => place.entityKey));
    trails.forEach((trail) => {
      trail.waypoints.forEach((waypoint) => {
        if (waypoint.placeKey) expect(placeKeys.has(waypoint.placeKey)).toBe(true);
      });
    });
  });

  /* Milina reuses the established beachfront finish of the historic kalderimi
   * so its place marker and route endpoint cannot drift apart on the map. */
  it('anchors Milina to the established Lafkos–Milina beachfront finish', () => {
    const milina = places.find((place) => place.entityKey === 'milina');
    const milinaTrail = trails.find((trail) => trail.entityKey === 'lafkos-milina-trail');
    const beachfrontFinish = milinaTrail?.waypoints.find(
      (waypoint) => waypoint.title.en === 'Milina Beachfront (Finish)',
    );

    expect(milina).toBeDefined();
    expect(beachfrontFinish).toBeDefined();
    expect(milina?.geometry.coordinates).toEqual(beachfrontFinish?.coordinate);
    expect(milina?.mapAnchor).toEqual(beachfrontFinish?.coordinate);
    expect(beachfrontFinish?.placeKey).toBe('milina');
  });

  /* The two Aegean drives keep both their itinerary and their rendered line on
   * the ordinary village-road corridor, preventing agricultural shortcuts. */
  it('routes Potistika and Paltsi through Metochi and Argalasti', () => {
    const expectedWaypoints = {
      'lafkos-potistika-drive': ['metochi', 'argalasti', 'kallithea', 'xynovrysi'],
      'lafkos-paltsi-drive': ['metochi', 'argalasti'],
    } as const;

    Object.entries(expectedWaypoints).forEach(([entityKey, expected]) => {
      const route = trails.find((trail) => trail.entityKey === entityKey);
      const waypointKeys = route?.waypoints
        .map((waypoint) => waypoint.placeKey)
        .filter((placeKey): placeKey is string => Boolean(placeKey));

      expect(waypointKeys).toEqual([
        ...expected,
        entityKey.replace('lafkos-', '').replace('-drive', ''),
      ]);
      expect(route).toBeDefined();
      expected.forEach((placeKey) => {
        const waypoint = route!.waypoints.find((candidate) => candidate.placeKey === placeKey);
        expect(waypoint, `${entityKey} ${placeKey}`).toBeDefined();

        const nearestGeometryPoint = Math.min(
          ...route!.geometry.coordinates.map((coordinate) =>
            haversineLength([coordinate, waypoint!.coordinate]),
          ),
        );
        expect(nearestGeometryPoint, `${entityKey} ${placeKey}`).toBeLessThanOrEqual(150);
      });
      const measuredLength = haversineLength(route!.geometry.coordinates);
      const relativeError = Math.abs(route!.distanceMeters - measuredLength) / measuredLength;
      expect(relativeError, entityKey).toBeLessThanOrEqual(0.05);
    });
  });

  /* The Lyri and Mourtias drive lines must use the northern regional branch at
   * Promyri; the settlement marker is intentionally not an itinerary stop. */
  it('keeps Lyri and Mourtias on the northern Promyri regional corridor', () => {
    const northernCorridor: Array<[number, number]> = [
      [23.2847424, 39.1920168],
      [23.2890696, 39.1923429],
    ];
    const expectedDistances = {
      'lafkos-lyri-drive': 14360,
      'lafkos-mourtias-drive': 14496,
    } as const;

    Object.entries(expectedDistances).forEach(([entityKey, expectedDistance]) => {
      const route = trails.find((trail) => trail.entityKey === entityKey);
      const routeText = route?.body.en.join(' ') ?? '';

      expect(route).toBeDefined();
      expect(route?.distanceMeters).toBe(expectedDistance);
      expect(route?.waypoints.some((waypoint) => waypoint.placeKey === 'promyri')).toBe(false);
      expect(routeText).toContain('northern regional road around Promyri');
      northernCorridor.forEach((coordinate) => {
        const nearestGeometryPoint = Math.min(
          ...route!.geometry.coordinates.map((candidate) => haversineLength([candidate, coordinate])),
        );
        expect(nearestGeometryPoint, `${entityKey} ${coordinate.join(',')}`).toBeLessThanOrEqual(20);
      });
    });
  });

  /* Chondri stays a mixed road-and-walk route: the shore approach must remain
   * explicit, and the unverified Mikro-side connection must not be advertised.
   */
  it('keeps Chondri Ammos access warnings explicit and rejects the Mikro shortcut', () => {
    const chondriRoute = trails.find((trail) => trail.entityKey === 'lafkos-chondri-ammos-drive');
    const safetyText = chondriRoute?.safety.en.join(' ') ?? '';

    expect(chondriRoute).toBeDefined();
    expect(chondriRoute?.routeType).toBe('mixed');
    expect(chondriRoute?.waypoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ coordinate: [23.220616, 39.132425] }),
        expect.objectContaining({ coordinate: [23.222307, 39.131886] }),
      ]),
    );
    expect(safetyText).toContain('final approximately 158 m to the shore');
    expect(safetyText).toContain('Do not treat the Mikro-side connection');
    expect(safetyText).toContain('unnamed roads as a confirmed ordinary-car route');
  });

  /* Route expansion keeps old seed trails hiking while allowing linked
   * waypoints to suppress only the place entities they actually reference. */
  it('defaults route type to hiking in public map data and resolves waypoint place keys', () => {
    const place: Place = {
      kind: 'place',
      entityKey: 'known-place',
      slug: { el: 'gnosto', en: 'known-place' },
      title: { el: 'Γνωστό', en: 'Known' },
      eyebrow: { el: 'Μέρος', en: 'Place' },
      summary: { el: 'Σύνοψη', en: 'Summary' },
      body: { el: ['Κείμενο'], en: ['Text'] },
      category: 'heritage',
      geometry: { type: 'Point', coordinates: [23.2, 39.1] },
      mapAnchor: [23.2, 39.1],
      images: [],
      practical: { el: [], en: [] },
      sources: [{ label: 'Source', url: 'https://example.com' }],
      featured: false,
      isSeed: true,
    };
    const trail: Trail = {
      kind: 'trail',
      entityKey: 'route-expansion-test',
      slug: { el: 'dokimi', en: 'route-expansion-test' },
      title: { el: 'Δοκιμή', en: 'Test' },
      eyebrow: { el: 'Διαδρομή', en: 'Route' },
      summary: { el: 'Σύνοψη', en: 'Summary' },
      body: { el: ['Κείμενο'], en: ['Text'] },
      geometry: {
        type: 'LineString',
        coordinates: [
          [23.2, 39.1],
          [23.201, 39.101],
          [23.202, 39.102],
        ],
      },
      distanceMeters: 300,
      durationMinutes: 10,
      elevationGainMeters: 10,
      difficulty: 'easy',
      surface: { el: 'Δρόμος', en: 'Road' },
      safety: { el: ['Προσοχή'], en: ['Take care'] },
      waypoints: [
        {
          title: { el: 'Συνδεδεμένο', en: 'Linked' },
          coordinate: [23.202, 39.102],
          placeKey: 'known-place',
        },
        {
          title: { el: 'Ανώνυμο', en: 'Anonymous' },
          coordinate: [23.201, 39.101],
          placeKey: 'missing-place',
        },
      ],
      sources: [{ label: 'Source', url: 'https://example.com' }],
      featured: false,
      isSeed: true,
    };

    const mapData = publicMapData('en', { places: [place], trails: [trail] });

    expect(mapData.trails[0].properties.routeType).toBe('hiking');
    expect(mapData.waypoints.map((feature) => feature.properties.title)).toEqual(['Anonymous']);
  });

  it('carries route type and waypoint place keys through Sanity transforms', () => {
    const transformed = transformSanityTrails([
      {
        _id: 'trail-drive-test-el',
        _type: 'trail',
        entityKey: 'drive-test',
        language: 'el',
        geometry: [
          { lng: 23.2, lat: 39.1 },
          { lng: 23.201, lat: 39.101 },
        ],
        routeType: 'drive',
        waypoints: [
          {
            title: 'Στάση',
            coordinate: { lng: 23.2, lat: 39.1 },
            placeKey: 'known-place',
          },
        ],
      },
      {
        _id: 'trail-drive-test-en',
        _type: 'trail',
        entityKey: 'drive-test',
        language: 'en',
        geometry: [
          { lng: 23.2, lat: 39.1 },
          { lng: 23.201, lat: 39.101 },
        ],
        waypoints: [
          {
            title: 'Stop',
            coordinate: { lng: 23.2, lat: 39.1 },
            placeKey: 'known-place',
          },
        ],
      },
    ]);

    expect(transformed[0].routeType).toBe('drive');
    expect(transformed[0].waypoints[0].placeKey).toBe('known-place');
  });

  it('formats route type and localized waypoint place references for Sanity', () => {
    const [elDoc, enDoc] = formatEntryDocuments({
      kind: 'trail',
      entityKey: 'drive-test',
      routeType: 'mixed',
      slug: { el: 'mikti-diadromi', en: 'mixed-route' },
      title: { el: 'Μικτή διαδρομή', en: 'Mixed route' },
      eyebrow: { el: 'Διαδρομή', en: 'Route' },
      summary: { el: 'Περίληψη', en: 'Summary' },
      body: { el: ['Κείμενο'], en: ['Text'] },
      geometry: {
        type: 'LineString',
        coordinates: [
          [23.2, 39.1],
          [23.201, 39.101],
        ],
      },
      distanceMeters: 300,
      durationMinutes: 10,
      elevationGainMeters: 10,
      difficulty: 'easy',
      surface: { el: 'Δρόμος', en: 'Road' },
      safety: { el: ['Προσοχή'], en: ['Take care'] },
      waypoints: [
        {
          title: { el: 'Στάση', en: 'Stop' },
          coordinate: [23.2, 39.1],
          placeKey: 'known-place',
        },
      ],
      sources: [{ label: 'Source', url: 'https://example.com' }],
      featured: false,
      isSeed: false,
    });

    expect(elDoc.routeType).toBe('mixed');
    expect(enDoc.routeType).toBe('mixed');
    expect((elDoc.waypoints as Array<{ placeKey?: { _ref: string } }>)[0].placeKey?._ref).toBe(
      'place-known-place-el',
    );
    expect((enDoc.waypoints as Array<{ placeKey?: { _ref: string } }>)[0].placeKey?._ref).toBe(
      'place-known-place-en',
    );
  });
});
