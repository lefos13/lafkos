import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lafkos-guide.vercel.app',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'el',
    locales: ['el', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  /*
   * The root route is a permanent redirect to the default locale, so it must
   * not be advertised as an indexable sitemap location.
   */
  integrations: [
    react(),
    sitemap({ filter: (page) => new URL(page).pathname !== '/' }),
  ],
  output: 'static',
  prefetch: true,
  vite: {
    optimizeDeps: {
      /* MapLibre and PMTiles ship separate worker and protocol entries that Vite's
       * optimizer should not prebundle to avoid outdated dependency hash errors. */
      exclude: ['maplibre-gl', 'pmtiles'],
    },
    ssr: { noExternal: ['maplibre-gl', 'pmtiles'] },
  },
});
