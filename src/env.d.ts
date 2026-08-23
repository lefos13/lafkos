/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_MAP_STYLE_URL?: string;
  readonly PUBLIC_MAP_PMTILES_URL?: string;
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
  readonly SANITY_STUDIO_PROJECT_ID?: string;
  readonly SANITY_STUDIO_DATASET?: string;
  readonly SANITY_API_VERSION?: string;
  readonly SANITY_API_TOKEN?: string;
  readonly SANITY_AUTH_TOKEN?: string;
  readonly PUBLIC_SANITY_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
