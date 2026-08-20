import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lafkos.guide',
  integrations: [react(), sitemap()],
  output: 'static',
  prefetch: true,
  vite: {
    ssr: { noExternal: ['maplibre-gl'] },
  },
});
