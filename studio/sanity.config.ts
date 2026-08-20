/*
 * The Studio is intentionally a separate package from the static site. It can
 * be hosted by Sanity while the public build stays credential-free and static.
 */

import { documentInternationalization } from '@sanity/document-internationalization';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schema } from './schemaTypes';
import { structure } from './structure';

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || '';

const dataset =
  process.env.SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'lafkos-guide',
  title: 'Lafkos Guide Studio',
  projectId: projectId || 'replace-with-project-id',
  dataset: dataset || 'production',
  plugins: [
    structureTool({ structure }),
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
