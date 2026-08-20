/*
 * These schemas mirror the public content contract. Required attribution,
 * sources, verification, and seed flags make editorial omissions visible in
 * the Studio before a document can be considered ready for publication.
 */

import { defineField, defineType } from 'sanity';

const localizedSlug = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'slug',
    options: { source: 'title' },
    validation: (rule) => rule.required(),
  });

const localizedText = (name: string, title: string, rows = 3) =>
  defineField({ name, title, type: 'text', rows, validation: (rule) => rule.required() });

const imageMetaFields = [
  defineField({
    name: 'alt',
    title: 'Alt text',
    type: 'string',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'credit',
    title: 'Credit / Photographer',
    type: 'string',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'license',
    title: 'License',
    type: 'string',
    validation: (rule) => rule.required(),
  }),
];

const sourceField = defineField({
  name: 'sources',
  title: 'Sources & Citations',
  type: 'array',
  of: [
    {
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'url',
          title: 'URL',
          type: 'url',
          validation: (rule) => rule.required(),
        }),
      ],
    },
  ],
  validation: (rule) => rule.min(1),
});

const imageField = (name: string, title: string, required = false) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: imageMetaFields,
    validation: required ? (rule) => rule.required() : undefined,
  });

const galleryField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [{ type: 'image', options: { hotspot: true }, fields: imageMetaFields }],
  });

const coordinateField = (name: string, title: string, required = false) =>
  defineField({
    name,
    title,
    type: 'geopoint',
    validation: required ? (rule) => rule.required() : undefined,
  });

const paragraphList = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [{ type: 'text' }],
    validation: (rule) => rule.min(1),
  });

const place = defineType({
  name: 'place',
  title: 'Place',
  type: 'document',
  fields: [
    defineField({
      name: 'entityKey',
      title: 'Stable entity key (shared across languages)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'language', title: 'Language', type: 'string', readOnly: true }),
    localizedText('title', 'Title', 2),
    localizedText('eyebrow', 'Eyebrow / Subtitle', 1),
    localizedSlug('slug', 'Slug'),
    localizedText('summary', 'Summary', 3),
    paragraphList('body', 'Body paragraphs'),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Heritage / Ιστορία', value: 'heritage' },
          { title: 'Architecture / Αρχιτεκτονική', value: 'architecture' },
          { title: 'Sacred / Ιεροί τόποι', value: 'sacred' },
          { title: 'Nature / Φύση', value: 'nature' },
          { title: 'Viewpoint / Θέα', value: 'viewpoint' },
          { title: 'Community / Καθημερινή ζωή', value: 'community' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    coordinateField('coordinate', 'Map coordinate (Point)', true),
    coordinateField('mapAnchor', 'Custom Map Camera Anchor (optional)'),
    imageField('hero', 'Hero image', true),
    galleryField('gallery', 'Gallery'),
    paragraphList('practical', 'Practical notes (hours, access, tips)'),
    sourceField,
    defineField({
      name: 'featured',
      title: 'Featured on home / top spots',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isSeed',
      title: 'Editorial seed (needs field verification before launch)',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      entityKey: 'entityKey',
      language: 'language',
      category: 'category',
      isSeed: 'isSeed',
      featured: 'featured',
      media: 'hero',
    },
    prepare({ title, entityKey, language, category, isSeed, featured, media }) {
      const langBadge = language ? `[${language.toUpperCase()}]` : '';
      const statusBadge = isSeed ? '⚠️ Seed' : '✓ Verified';
      const featuredBadge = featured ? '★' : '';
      return {
        title: [langBadge, title || 'Untitled Place'].filter(Boolean).join(' '),
        subtitle: [entityKey, category, statusBadge, featuredBadge].filter(Boolean).join(' • '),
        media,
      };
    },
  },
});

const trail = defineType({
  name: 'trail',
  title: 'Trail',
  type: 'document',
  fields: [
    defineField({
      name: 'entityKey',
      title: 'Stable entity key (shared across languages)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'language', title: 'Language', type: 'string', readOnly: true }),
    localizedText('title', 'Title', 2),
    localizedText('eyebrow', 'Eyebrow / Subtitle', 1),
    localizedSlug('slug', 'Slug'),
    localizedText('summary', 'Summary', 3),
    paragraphList('body', 'Body paragraphs'),
    defineField({
      name: 'geometry',
      title: 'Line geometry (Coordinates)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'lng',
              title: 'Longitude',
              type: 'number',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'lat',
              title: 'Latitude',
              type: 'number',
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
      validation: (rule) => rule.min(2),
    }),
    defineField({
      name: 'waypoints',
      title: 'Photographed waypoints along trail',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Waypoint title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'coordinate',
              title: 'Waypoint coordinate',
              type: 'geopoint',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'image',
              title: 'Waypoint image',
              type: 'image',
              options: { hotspot: true },
              fields: imageMetaFields,
            }),
          ],
        },
      ],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'distanceMeters',
      title: 'Distance (meters)',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (minutes)',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'elevationGainMeters',
      title: 'Elevation gain (meters)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          { title: 'Easy / Εύκολη', value: 'easy' },
          { title: 'Moderate / Μέτρια', value: 'moderate' },
          { title: 'Demanding / Απαιτητική', value: 'demanding' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    localizedText('surface', 'Trail surface (e.g. καλντερίμι, χωματόδρομος)', 2),
    paragraphList('safety', 'Safety notes & equipment recommendations'),
    defineField({
      name: 'gpx',
      title: 'GPX Track file',
      type: 'file',
      options: { accept: '.gpx,application/gpx+xml' },
    }),
    sourceField,
    defineField({
      name: 'lastVerifiedAt',
      title: 'Last field verification date',
      type: 'date',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on home / top trails',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isSeed',
      title: 'Editorial seed (needs field verification before launch)',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      entityKey: 'entityKey',
      language: 'language',
      difficulty: 'difficulty',
      distanceMeters: 'distanceMeters',
      durationMinutes: 'durationMinutes',
      isSeed: 'isSeed',
      featured: 'featured',
    },
    prepare({
      title,
      entityKey,
      language,
      difficulty,
      distanceMeters,
      durationMinutes,
      isSeed,
      featured,
    }) {
      const langBadge = language ? `[${language.toUpperCase()}]` : '';
      const dist = distanceMeters ? `${(distanceMeters / 1000).toFixed(1)} km` : '';
      const dur = durationMinutes ? `${durationMinutes} min` : '';
      const diff = difficulty ? difficulty.toUpperCase() : '';
      const stats = [dist, dur, diff].filter(Boolean).join(' • ');
      const statusBadge = isSeed ? '⚠️ Seed' : '✓ Verified';
      const featuredBadge = featured ? '★' : '';

      return {
        title: [langBadge, title || 'Untitled Trail'].filter(Boolean).join(' '),
        subtitle: [entityKey, stats, statusBadge, featuredBadge].filter(Boolean).join(' • '),
      };
    },
  },
});

const story = defineType({
  name: 'story',
  title: 'Story',
  type: 'document',
  fields: [
    defineField({
      name: 'entityKey',
      title: 'Stable entity key (shared across languages)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'language', title: 'Language', type: 'string', readOnly: true }),
    localizedText('title', 'Title', 2),
    localizedText('eyebrow', 'Eyebrow / Subtitle', 1),
    localizedSlug('slug', 'Slug'),
    localizedText('summary', 'Summary', 3),
    paragraphList('body', 'Body paragraphs'),
    imageField('hero', 'Hero image', true),
    defineField({
      name: 'relatedKeys',
      title: 'Related place or trail entity keys',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    sourceField,
    defineField({
      name: 'featured',
      title: 'Featured on home / top stories',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isSeed',
      title: 'Editorial seed (needs field verification before launch)',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      entityKey: 'entityKey',
      language: 'language',
      isSeed: 'isSeed',
      featured: 'featured',
      media: 'hero',
    },
    prepare({ title, entityKey, language, isSeed, featured, media }) {
      const langBadge = language ? `[${language.toUpperCase()}]` : '';
      const statusBadge = isSeed ? '⚠️ Seed' : '✓ Verified';
      const featuredBadge = featured ? '★' : '';
      return {
        title: [langBadge, title || 'Untitled Story'].filter(Boolean).join(' '),
        subtitle: [entityKey, statusBadge, featuredBadge].filter(Boolean).join(' • '),
        media,
      };
    },
  },
});

const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'Category ID',
      type: 'string',
      options: {
        list: ['heritage', 'architecture', 'sacred', 'nature', 'viewpoint', 'community', 'trail'],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'labelEl',
      title: 'Label (Greek / Ελληνικά)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'labelEn',
      title: 'Label (English)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'descriptionEl',
      title: 'Description (Greek / Ελληνικά)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'descriptionEn',
      title: 'Description (English)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'color',
      title: 'Map theme color (hex)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon symbol',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      id: 'id',
      labelEl: 'labelEl',
      labelEn: 'labelEn',
      icon: 'icon',
      color: 'color',
    },
    prepare({ id, labelEl, labelEn, icon, color }) {
      return {
        title: `${icon || '✦'} ${labelEl || id} / ${labelEn || id}`,
        subtitle: `ID: ${id} • Color: ${color}`,
      };
    },
  },
});

const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitleEl',
      title: 'Site Title (Greek)',
      type: 'string',
      initialValue: 'Οδηγός Λαύκου',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'siteTitleEn',
      title: 'Site Title (English)',
      type: 'string',
      initialValue: 'Lafkos Guide',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'descriptionEl',
      title: 'Site Description (Greek)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'descriptionEn',
      title: 'Site Description (English)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'introEl',
      title: 'Hero Intro Short (Greek)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'introEn',
      title: 'Hero Intro Short (English)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'introLongEl',
      title: 'Hero Intro Extended (Greek)',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'introLongEn',
      title: 'Hero Intro Extended (English)',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'seedNoticeEl',
      title: 'Seed Data Warning Banner (Greek)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'seedNoticeEn',
      title: 'Seed Data Warning Banner (English)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'emergencyNoticeEl',
      title: 'Emergency / Weather Advisory Notice (Greek)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'emergencyNoticeEn',
      title: 'Emergency / Weather Advisory Notice (English)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'footerEl',
      title: 'Footer Copy (Greek)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'footerEn',
      title: 'Footer Copy (English)',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Global Site Settings',
        subtitle: 'Bilingual metadata, intro copy, advisories & footer',
      };
    },
  },
});

export const schema = [place, trail, story, category, siteSettings];
