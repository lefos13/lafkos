/*
 * Remote image URL optimization and responsive srcset utilities.
 * Handles Wikimedia standard thumbnail step conventions, Sanity CDN params,
 * and graceful fallback for unsupported external image hosts without proxying.
 */

export const WIKIMEDIA_THUMBNAIL_STEPS = [
  20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840,
] as const;

export type WikimediaThumbnailStep = (typeof WIKIMEDIA_THUMBNAIL_STEPS)[number];

/*
 * Finds the smallest standard Wikimedia thumbnail step >= requested width.
 * Caps at the maximum supported step (3840px).
 */
export function getClosestWikimediaStep(requestedWidth: number): WikimediaThumbnailStep {
  if (requestedWidth <= WIKIMEDIA_THUMBNAIL_STEPS[0]) {
    return WIKIMEDIA_THUMBNAIL_STEPS[0];
  }
  for (const step of WIKIMEDIA_THUMBNAIL_STEPS) {
    if (step >= requestedWidth) {
      return step;
    }
  }
  return WIKIMEDIA_THUMBNAIL_STEPS[WIKIMEDIA_THUMBNAIL_STEPS.length - 1];
}

/*
 * Determines if a remote image host supports client-side URL width resizing.
 */
export function isResizableHost(src: string): boolean {
  if (!src || (!src.startsWith('http://') && !src.startsWith('https://'))) {
    return false;
  }
  try {
    const url = new URL(src);
    if (url.hostname === 'upload.wikimedia.org') {
      return true;
    }
    if (
      url.hostname === 'commons.wikimedia.org' &&
      url.pathname.startsWith('/wiki/Special:FilePath/')
    ) {
      return true;
    }
    if (url.hostname === 'cdn.sanity.io' && url.pathname.startsWith('/images/')) {
      return true;
    }
    if (url.hostname === 'images.unsplash.com') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/*
 * Generates an optimized remote image URL for a given target width.
 * For upload.wikimedia.org, generates valid standard thumbnail step paths.
 * For Sanity CDN, adds or updates `w`, `auto=format`, and `q` parameters.
 * For unsupported hosts, returns the original source unmodified.
 */
export function getOptimizedImageUrl(src: string, width: number): string {
  if (!src || (!src.startsWith('http://') && !src.startsWith('https://'))) {
    return src;
  }

  try {
    const url = new URL(src);

    if (url.hostname === 'upload.wikimedia.org') {
      const step = getClosestWikimediaStep(width);

      // Match existing thumbnail URL: /wikipedia/{project}/thumb/{path}/{width}px-{filename}
      const thumbMatch = url.pathname.match(/^\/wikipedia\/([^/]+)\/thumb\/(.+)\/\d+px-[^/]+$/);
      if (thumbMatch) {
        const project = thumbMatch[1];
        const baseFilePath = thumbMatch[2];
        const filename = baseFilePath.split('/').pop() || '';
        const isSvg = filename.toLowerCase().endsWith('.svg');
        const thumbFilename = isSvg ? `${step}px-${filename}.png` : `${step}px-${filename}`;
        return `${url.origin}/wikipedia/${project}/thumb/${baseFilePath}/${thumbFilename}`;
      }

      // Match original upload URL: /wikipedia/{project}/{hash1}/{hash2}/{filename}
      const origMatch = url.pathname.match(/^\/wikipedia\/([^/]+)\/(.+)$/);
      if (origMatch) {
        const project = origMatch[1];
        const filePath = origMatch[2];
        const filename = filePath.split('/').pop() || '';
        const isSvg = filename.toLowerCase().endsWith('.svg');
        const thumbFilename = isSvg ? `${step}px-${filename}.png` : `${step}px-${filename}`;
        return `${url.origin}/wikipedia/${project}/thumb/${filePath}/${thumbFilename}`;
      }

      return src;
    }

    if (
      url.hostname === 'commons.wikimedia.org' &&
      url.pathname.startsWith('/wiki/Special:FilePath/')
    ) {
      const step = getClosestWikimediaStep(width);
      url.searchParams.set('width', step.toString());
      return url.toString();
    }

    if (url.hostname === 'cdn.sanity.io' && url.pathname.startsWith('/images/')) {
      url.searchParams.set('w', Math.round(width).toString());
      if (!url.searchParams.has('auto')) {
        url.searchParams.set('auto', 'format');
      }
      if (!url.searchParams.has('q')) {
        url.searchParams.set('q', '80');
      }
      return url.toString();
    }

    if (url.hostname === 'images.unsplash.com') {
      url.searchParams.set('w', Math.round(width).toString());
      if (!url.searchParams.has('auto')) {
        url.searchParams.set('auto', 'format');
      }
      if (!url.searchParams.has('q')) {
        url.searchParams.set('q', '80');
      }
      return url.toString();
    }

    return src;
  } catch {
    return src;
  }
}

/*
 * Builds a valid HTML srcset attribute string with deduplicated width candidates.
 * Returns undefined for unsupported hosts to avoid duplicate identical candidates.
 */
export function buildSrcSet(src: string, widths: readonly number[]): string | undefined {
  if (!isResizableHost(src) || widths.length === 0) {
    return undefined;
  }

  const seen = new Map<string, number>();

  for (const w of widths) {
    const candidateUrl = getOptimizedImageUrl(src, w);
    if (!seen.has(candidateUrl)) {
      // Use the actual thumbnail step or specified width for the descriptor
      const stepMatch = candidateUrl.match(/\/(\d+)px-[^/]+$/);
      const descriptorWidth = stepMatch ? Number(stepMatch[1]) : w;
      seen.set(candidateUrl, descriptorWidth);
    }
  }

  if (seen.size === 0) {
    return undefined;
  }

  return Array.from(seen.entries())
    .map(([candidateUrl, candidateWidth]) => `${candidateUrl} ${candidateWidth}w`)
    .join(', ');
}

export interface ResponsiveImagePreset {
  readonly widths: readonly number[];
  readonly defaultWidth: number;
  readonly sizes: string;
}

export const IMAGE_PRESETS = {
  hero: {
    widths: [500, 960, 1280, 1920],
    defaultWidth: 1280,
    sizes: '(min-width: 1024px) 580px, 100vw',
  },
  storyHero: {
    widths: [500, 960, 1280, 1920],
    defaultWidth: 1280,
    sizes: '(min-width: 1280px) 1280px, 100vw',
  },
  featureCard: {
    widths: [500, 960, 1280],
    defaultWidth: 960,
    sizes: '(min-width: 1280px) 620px, (min-width: 640px) 50vw, 100vw',
  },
  card: {
    widths: [330, 500, 960, 1280],
    defaultWidth: 960,
    sizes: '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw',
  },
  waypoint: {
    widths: [330, 500, 960, 1280],
    defaultWidth: 960,
    sizes: '(min-width: 1024px) 400px, 100vw',
  },
  eventCard: {
    widths: [330, 500, 960, 1280],
    defaultWidth: 960,
    sizes: '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw',
  },
  mapThumbnail: {
    widths: [250, 330, 500],
    defaultWidth: 330,
    sizes: '300px',
  },
} as const satisfies Record<string, ResponsiveImagePreset>;

export type ImagePresetName = keyof typeof IMAGE_PRESETS;

export interface ResponsiveImageOptions {
  src: string;
  preset?: ImagePresetName;
  widths?: readonly number[];
  defaultWidth?: number;
  sizes?: string;
}

export interface ResponsiveImageAttributes {
  src: string;
  srcset?: string;
  sizes?: string;
}

/*
 * Returns optimized src, srcset, and sizes attributes for a given image source and preset.
 */
export function getResponsiveImageAttributes(
  options: ResponsiveImageOptions,
): ResponsiveImageAttributes {
  const { src, preset } = options;
  const config = preset ? IMAGE_PRESETS[preset] : undefined;

  const widths = options.widths ?? config?.widths ?? [500, 960, 1280];
  const defaultWidth = options.defaultWidth ?? config?.defaultWidth ?? 960;
  const sizes = options.sizes ?? config?.sizes;

  const optimizedSrc = getOptimizedImageUrl(src, defaultWidth);
  const srcset = buildSrcSet(src, widths);

  return {
    src: optimizedSrc,
    srcset,
    sizes: srcset ? sizes : undefined,
  };
}
