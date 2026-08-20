import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lafkos.guide',
  i18n: {
    defaultLocale: 'el',
    locales: ['el', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
  integrations: [react(), sitemap()],
  output: 'static',
  prefetch: true,
  vite: {
    optimizeDeps: {
      /* MapLibre ships a separate worker entry that Vite's optimizer cannot
       * serve reliably when it is prebundled as a dependency. */
      exclude: ['maplibre-gl'],
    },
    ssr: { noExternal: ['maplibre-gl'] },
  },
});
