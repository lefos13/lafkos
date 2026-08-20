/*
 * The Studio is intentionally a separate package from the static site. It can
 * be hosted by Sanity while the public build stays credential-free and static.
 */

import { documentInternationalization } from '@sanity/document-internationalization';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schema } from './schemaTypes';

export default defineConfig({
  name: 'lafkos-guide',
  title: 'Lafkos Guide Studio',
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID ?? 'replace-with-project-id',
  dataset: process.env.PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [
    structureTool(),
    visionTool(),
    documentInternationalization({
      supportedLanguages: [
        { id: 'el', title: 'Ελληνικά' },
        { id: 'en', title: 'English' },
      ],
      schemaTypes: ['place', 'trail', 'story'],
    }),
  ],
  schema: { types: schema },
});
