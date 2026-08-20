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
  { name: 'alt', title: 'Alt text', type: 'string', validation: (rule: any) => rule.required() },
  { name: 'credit', title: 'Credit', type: 'string', validation: (rule: any) => rule.required() },
  { name: 'license', title: 'License', type: 'string', validation: (rule: any) => rule.required() },
];
const sourceField = defineField({
  name: 'sources',
  title: 'Sources',
  type: 'array',
  of: [
    {
      type: 'object',
      fields: [
        { name: 'label', title: 'Label', type: 'string' },
        { name: 'url', title: 'URL', type: 'url' },
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
const coordinateField = defineField({
  name: 'coordinate',
  title: 'Map coordinate',
  type: 'geopoint',
  validation: (rule) => rule.required(),
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
      title: 'Stable entity key',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'language', title: 'Language', type: 'string', readOnly: true }),
    localizedText('title', 'Title', 2),
    localizedSlug('slug', 'Slug'),
    localizedText('summary', 'Summary', 3),
    paragraphList('body', 'Body paragraphs'),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ['heritage', 'architecture', 'sacred', 'nature', 'viewpoint', 'community'] },
      validation: (rule) => rule.required(),
    }),
    coordinateField,
    imageField('hero', 'Hero image', true),
    galleryField('gallery', 'Gallery'),
    paragraphList('practical', 'Practical notes'),
    sourceField,
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'isSeed',
      title: 'Editorial seed — exclude from launch',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'entityKey', media: 'hero' } },
});

const trail = defineType({
  name: 'trail',
  title: 'Trail',
  type: 'document',
  fields: [
    defineField({
      name: 'entityKey',
      title: 'Stable entity key',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'language', title: 'Language', type: 'string', readOnly: true }),
    localizedText('title', 'Title', 2),
    localizedSlug('slug', 'Slug'),
    localizedText('summary', 'Summary', 3),
    paragraphList('body', 'Body paragraphs'),
    defineField({
      name: 'geometry',
      title: 'Line geometry',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'lng', title: 'Longitude', type: 'number' },
            { name: 'lat', title: 'Latitude', type: 'number' },
          ],
        },
      ],
      validation: (rule) => rule.min(2),
    }),
    defineField({
      name: 'waypoints',
      title: 'Photographed waypoints',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Waypoint title',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'coordinate',
              title: 'Waypoint coordinate',
              type: 'geopoint',
              validation: (rule) => rule.required(),
            },
            {
              name: 'image',
              title: 'Waypoint image',
              type: 'image',
              options: { hotspot: true },
              fields: imageMetaFields,
            },
          ],
        },
      ],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'distanceMeters',
      title: 'Distance (m)',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duration (min)',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'elevationGainMeters',
      title: 'Elevation gain (m)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: { list: ['easy', 'moderate', 'demanding'] },
      validation: (rule) => rule.required(),
    }),
    localizedText('surface', 'Surface', 2),
    paragraphList('safety', 'Safety notes'),
    defineField({
      name: 'gpx',
      title: 'GPX file',
      type: 'file',
      options: { accept: '.gpx,application/gpx+xml' },
    }),
    sourceField,
    defineField({
      name: 'lastVerifiedAt',
      title: 'Last field verification',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'isSeed',
      title: 'Editorial seed — exclude from launch',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'entityKey' } },
});

const story = defineType({
  name: 'story',
  title: 'Story',
  type: 'document',
  fields: [
    defineField({
      name: 'entityKey',
      title: 'Stable entity key',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'language', title: 'Language', type: 'string', readOnly: true }),
    localizedText('title', 'Title', 2),
    localizedSlug('slug', 'Slug'),
    localizedText('summary', 'Summary', 3),
    paragraphList('body', 'Body paragraphs'),
    imageField('hero', 'Hero image', true),
    defineField({
      name: 'relatedKeys',
      title: 'Related entity keys',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    sourceField,
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'isSeed',
      title: 'Editorial seed — exclude from launch',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'entityKey', media: 'hero' } },
});

const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({ name: 'id', title: 'ID', type: 'string', validation: (rule) => rule.required() }),
    localizedText('label', 'Label', 1),
    localizedText('description', 'Description', 2),
    defineField({ name: 'color', title: 'Map color', type: 'string' }),
    defineField({ name: 'icon', title: 'Icon', type: 'string' }),
  ],
});

const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    localizedText('title', 'Site title', 1),
    localizedText('description', 'Description', 2),
    defineField({ name: 'emergencyNotice', title: 'Emergency notice', type: 'text' }),
  ],
});

export const schema = [place, trail, story, category, siteSettings];
