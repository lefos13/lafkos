import { createClient, type ClientConfig, type SanityClient } from '@sanity/client';
import {
  createImageUrlBuilder,
  type ImageUrlBuilder,
  type SanityImageSource,
} from '@sanity/image-url';

export interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  token?: string;
  useCdn: boolean;
}

export function getSanityConfig(): SanityConfig {
  const projectId =
    (typeof process !== 'undefined' ? process.env?.PUBLIC_SANITY_PROJECT_ID : undefined) ??
    (import.meta.env?.PUBLIC_SANITY_PROJECT_ID as string | undefined) ??
    '';

  const dataset =
    (typeof process !== 'undefined' ? process.env?.PUBLIC_SANITY_DATASET : undefined) ??
    (import.meta.env?.PUBLIC_SANITY_DATASET as string | undefined) ??
    'production';

  const apiVersion =
    (typeof process !== 'undefined' ? process.env?.SANITY_API_VERSION : undefined) ??
    (import.meta.env?.SANITY_API_VERSION as string | undefined) ??
    '2026-08-01';

  const token =
    (typeof process !== 'undefined'
      ? process.env?.SANITY_API_TOKEN || process.env?.PUBLIC_SANITY_TOKEN
      : undefined) ??
    (import.meta.env?.SANITY_API_TOKEN as string | undefined) ??
    (import.meta.env?.PUBLIC_SANITY_TOKEN as string | undefined) ??
    undefined;

  return {
    projectId: projectId.trim(),
    dataset: dataset.trim(),
    apiVersion: apiVersion.trim(),
    token: token?.trim(),
    useCdn: !token,
  };
}

export function isSanityConfigured(config = getSanityConfig()): boolean {
  return (
    Boolean(config.projectId) &&
    config.projectId !== 'replace-with-project-id' &&
    config.projectId !== 'undefined'
  );
}

let clientInstance: SanityClient | null = null;

export function getSanityClient(customConfig?: Partial<ClientConfig>): SanityClient {
  if (clientInstance && !customConfig) {
    return clientInstance;
  }

  const config = getSanityConfig();
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    token: config.token,
    useCdn: config.useCdn,
    ...customConfig,
  });

  if (!customConfig) {
    clientInstance = client;
  }
  return client;
}

export function urlForImage(source: unknown): ImageUrlBuilder | null {
  const config = getSanityConfig();
  if (!isSanityConfigured(config) || !source) {
    return null;
  }
  const builder = createImageUrlBuilder({
    projectId: config.projectId,
    dataset: config.dataset,
  });
  return builder.image(source as SanityImageSource);
}
