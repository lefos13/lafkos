import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  IMAGE_PRESETS,
  WIKIMEDIA_THUMBNAIL_STEPS,
  buildSrcSet,
  getClosestWikimediaStep,
  getOptimizedImageUrl,
  getResponsiveImageAttributes,
  isResizableHost,
} from '../src/lib/images';

describe('Responsive Image Utilities', () => {
  describe('Wikimedia Standard Steps', () => {
    it('defines standard production Wikimedia thumbnail steps', () => {
      expect(WIKIMEDIA_THUMBNAIL_STEPS).toEqual([
        20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840,
      ]);
    });

    it('rounds requested widths up to the nearest valid Wikimedia standard step', () => {
      expect(getClosestWikimediaStep(100)).toBe(120);
      expect(getClosestWikimediaStep(250)).toBe(250);
      expect(getClosestWikimediaStep(300)).toBe(330);
      expect(getClosestWikimediaStep(400)).toBe(500);
      expect(getClosestWikimediaStep(640)).toBe(960);
      expect(getClosestWikimediaStep(1200)).toBe(1280);
      expect(getClosestWikimediaStep(1500)).toBe(1920);
      expect(getClosestWikimediaStep(2000)).toBe(3840);
      expect(getClosestWikimediaStep(5000)).toBe(3840);
    });
  });

  describe('upload.wikimedia.org URL Transformation', () => {
    const originalJpg =
      'https://upload.wikimedia.org/wikipedia/commons/a/ae/Pelion%2C_Pagassitikos_Gulf_and_coastline._Photo_taken_from_Lafkos_village.jpg';
    const greekCharsJpg =
      'https://upload.wikimedia.org/wikipedia/commons/f/fb/%CE%9A%CE%B1%CE%BC%CF%80%CE%B1%CE%BD%CE%B1%CF%81%CE%B9%CF%8C_%CE%91%CE%B3%CE%AF%CF%89%CE%BD_%CE%91%CF%80%CE%BF%CF%83%CF%84%CF%8C%CE%BB%CF%89%CE%BD%2C_%CE%91%CF%81%CE%B3%CE%B1%CE%BB%CE%B1%CF%83%CF%84%CE%AE_8966.jpg';
    const existingThumbJpg =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Lafkos_Way_01.jpg/1280px-Lafkos_Way_01.jpg';
    const originalSvg = 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Vector_map_pelion.svg';
    const existingThumbSvg =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Vector_map_pelion.svg/1000px-Vector_map_pelion.svg.png';

    it('transforms original Wikimedia JPG URLs to valid thumbnail step URLs', () => {
      expect(getOptimizedImageUrl(originalJpg, 500)).toBe(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Pelion%2C_Pagassitikos_Gulf_and_coastline._Photo_taken_from_Lafkos_village.jpg/500px-Pelion%2C_Pagassitikos_Gulf_and_coastline._Photo_taken_from_Lafkos_village.jpg',
      );
      expect(getOptimizedImageUrl(originalJpg, 1280)).toBe(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Pelion%2C_Pagassitikos_Gulf_and_coastline._Photo_taken_from_Lafkos_village.jpg/1280px-Pelion%2C_Pagassitikos_Gulf_and_coastline._Photo_taken_from_Lafkos_village.jpg',
      );
    });

    it('preserves percent-encoded Greek and special characters in Wikimedia filenames', () => {
      expect(getOptimizedImageUrl(greekCharsJpg, 960)).toBe(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/%CE%9A%CE%B1%CE%BC%CF%80%CE%B1%CE%BD%CE%B1%CF%81%CE%B9%CF%8C_%CE%91%CE%B3%CE%AF%CF%89%CE%BD_%CE%91%CF%80%CE%BF%CF%83%CF%84%CF%8C%CE%BB%CF%89%CE%BD%2C_%CE%91%CF%81%CE%B3%CE%B1%CE%BB%CE%B1%CF%83%CF%84%CE%AE_8966.jpg/960px-%CE%9A%CE%B1%CE%BC%CF%80%CE%B1%CE%BD%CE%B1%CF%81%CE%B9%CF%8C_%CE%91%CE%B3%CE%AF%CF%89%CE%BD_%CE%91%CF%80%CE%BF%CF%83%CF%84%CF%8C%CE%BB%CF%89%CE%BD%2C_%CE%91%CF%81%CE%B3%CE%B1%CE%BB%CE%B1%CF%83%CF%84%CE%AE_8966.jpg',
      );
    });

    it('replaces width on existing Wikimedia thumbnail URLs with new standard steps', () => {
      expect(getOptimizedImageUrl(existingThumbJpg, 330)).toBe(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Lafkos_Way_01.jpg/330px-Lafkos_Way_01.jpg',
      );
      expect(getOptimizedImageUrl(existingThumbJpg, 960)).toBe(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Lafkos_Way_01.jpg/960px-Lafkos_Way_01.jpg',
      );
    });

    it('transforms Wikimedia SVG URLs to standard PNG rendered thumbnails', () => {
      expect(getOptimizedImageUrl(originalSvg, 500)).toBe(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Vector_map_pelion.svg/500px-Vector_map_pelion.svg.png',
      );
      expect(getOptimizedImageUrl(existingThumbSvg, 1280)).toBe(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Vector_map_pelion.svg/1280px-Vector_map_pelion.svg.png',
      );
    });

    it('handles non-commons language project prefixes (e.g. wikipedia/el/...)', () => {
      const elProjectUrl = 'https://upload.wikimedia.org/wikipedia/el/1/1a/Lafkos_history.png';
      expect(getOptimizedImageUrl(elProjectUrl, 500)).toBe(
        'https://upload.wikimedia.org/wikipedia/el/thumb/1/1a/Lafkos_history.png/500px-Lafkos_history.png',
      );
    });
  });

  describe('commons.wikimedia.org Special:FilePath Transformation', () => {
    const specialFilePath =
      'https://commons.wikimedia.org/wiki/Special:FilePath/Pelion%2C_Pagassitikos_Gulf_and_coastline._Photo_taken_from_Lafkos_village.jpg';

    it('appends or updates width query parameter with valid standard step', () => {
      expect(getOptimizedImageUrl(specialFilePath, 500)).toBe(`${specialFilePath}?width=500`);
      expect(getOptimizedImageUrl(`${specialFilePath}?width=1280`, 330)).toBe(
        `${specialFilePath}?width=330`,
      );
    });

    it('preserves other existing query parameters on Special:FilePath', () => {
      expect(getOptimizedImageUrl(`${specialFilePath}?debug=1`, 960)).toBe(
        `${specialFilePath}?debug=1&width=960`,
      );
    });
  });

  describe('Sanity CDN Transformation', () => {
    const sanityUrl = 'https://cdn.sanity.io/images/prj123/production/abc123456-1200x800.jpg';

    it('adds w, auto=format, and q query parameters to Sanity image URLs', () => {
      expect(getOptimizedImageUrl(sanityUrl, 800)).toBe(`${sanityUrl}?w=800&auto=format&q=80`);
    });

    it('preserves existing query parameters on Sanity CDN URLs while setting width', () => {
      const withCrop = `${sanityUrl}?fit=crop&crop=center`;
      expect(getOptimizedImageUrl(withCrop, 640)).toBe(
        `${sanityUrl}?fit=crop&crop=center&w=640&auto=format&q=80`,
      );
    });

    it('preserves custom quality or auto settings if already specified on Sanity URL', () => {
      const customParams = `${sanityUrl}?auto=webp&q=90`;
      expect(getOptimizedImageUrl(customParams, 1200)).toBe(`${sanityUrl}?auto=webp&q=90&w=1200`);
    });
  });

  describe('Unsplash URL Transformation', () => {
    const unsplashUrl =
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=82';

    it('updates w parameter while preserving crop and quality', () => {
      expect(getOptimizedImageUrl(unsplashUrl, 600)).toBe(
        'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=82',
      );
    });
  });

  describe('Unsupported Hosts and Fallback Behaviors', () => {
    const unsupportedHosts = [
      'https://www.greekgastronomyguide.gr/wp-content/uploads/2022/06/fournos.jpg',
      'https://www.topoguide.gr/mountains/thessaly/advs_pelion/pelion_southern/pois/img/moni.jpg',
      'https://magnesianews.gr/wp-content/uploads/2021/07/giannis3.jpg',
      'https://www.discover-pelion.gr/wp-content/uploads/2021/05/liri-2.jpg',
    ];

    it('returns original URL unmodified for unsupported external hosts without proxying', () => {
      for (const url of unsupportedHosts) {
        expect(isResizableHost(url)).toBe(false);
        expect(getOptimizedImageUrl(url, 500)).toBe(url);
      }
    });

    it('safely handles relative paths, data URIs, and invalid URLs', () => {
      expect(getOptimizedImageUrl('/images/og-default.png', 500)).toBe('/images/og-default.png');
      expect(getOptimizedImageUrl('data:image/png;base64,iVBORw0K...', 500)).toBe(
        'data:image/png;base64,iVBORw0K...',
      );
      expect(getOptimizedImageUrl('not-a-valid-url', 500)).toBe('not-a-valid-url');
    });
  });

  describe('SrcSet Generation and Deduplication', () => {
    const wikimediaUrl =
      'https://upload.wikimedia.org/wikipedia/commons/a/ae/Pelion%2C_Pagassitikos_Gulf_and_coastline._Photo_taken_from_Lafkos_village.jpg';
    const unsupportedUrl =
      'https://www.greekgastronomyguide.gr/wp-content/uploads/2022/06/fournos.jpg';

    it('generates a clean srcset for resizable hosts with exact standard steps', () => {
      const srcset = buildSrcSet(wikimediaUrl, [500, 960, 1280, 1920]);
      expect(srcset).toBeDefined();
      expect(srcset).toContain('500px-Pelion');
      expect(srcset).toContain('500w');
      expect(srcset).toContain('960px-Pelion');
      expect(srcset).toContain('960w');
      expect(srcset).toContain('1280px-Pelion');
      expect(srcset).toContain('1280w');
      expect(srcset).toContain('1920px-Pelion');
      expect(srcset).toContain('1920w');
    });

    it('deduplicates srcset entries when multiple requested widths map to the same thumbnail URL', () => {
      // 400 and 500 both map to 500px step in Wikimedia
      const srcset = buildSrcSet(wikimediaUrl, [400, 500, 1000, 1280]);
      expect(srcset).toBeDefined();
      const candidates = srcset!.split(', ');
      // Should only have 2 unique candidate URLs (500px and 1280px)
      expect(candidates.length).toBe(2);
      expect(candidates[0]).toContain('500px-Pelion');
      expect(candidates[1]).toContain('1280px-Pelion');
    });

    it('returns undefined srcset for unsupported hosts to prevent redundant identical candidates', () => {
      expect(buildSrcSet(unsupportedUrl, [500, 960, 1280])).toBeUndefined();
    });
  });

  describe('Responsive Image Presets and Attribute Helpers', () => {
    const wikimediaUrl =
      'https://upload.wikimedia.org/wikipedia/commons/a/ae/Pelion%2C_Pagassitikos_Gulf_and_coastline._Photo_taken_from_Lafkos_village.jpg';
    const unsupportedUrl =
      'https://www.greekgastronomyguide.gr/wp-content/uploads/2022/06/fournos.jpg';

    it('provides tailored presets for hero, storyHero, featureCard, card, waypoint, and eventCard', () => {
      expect(IMAGE_PRESETS.hero.defaultWidth).toBe(1280);
      expect(IMAGE_PRESETS.storyHero.sizes).toBe('(min-width: 1280px) 1280px, 100vw');
      expect(IMAGE_PRESETS.featureCard.widths).toEqual([500, 960, 1280]);
      expect(IMAGE_PRESETS.card.widths).toEqual([330, 500, 960, 1280]);
      expect(IMAGE_PRESETS.mapThumbnail.defaultWidth).toBe(330);
    });

    it('resolves responsive image attributes with optimized fallback src and srcset for resizable images', () => {
      const attrs = getResponsiveImageAttributes({
        src: wikimediaUrl,
        preset: 'card',
      });

      expect(attrs.src).toContain('960px-Pelion');
      expect(attrs.srcset).toBeDefined();
      expect(attrs.sizes).toBe(IMAGE_PRESETS.card.sizes);
    });

    it('resolves responsive image attributes gracefully for unsupported hosts', () => {
      const attrs = getResponsiveImageAttributes({
        src: unsupportedUrl,
        preset: 'hero',
      });

      expect(attrs.src).toBe(unsupportedUrl);
      expect(attrs.srcset).toBeUndefined();
      expect(attrs.sizes).toBeUndefined();
    });
  });

  describe('Template and Render Contracts', () => {
    it('enforces that FeatureCard.astro uses ResponsiveImage with lazy/async and featureCard preset', () => {
      const template = readFileSync(resolve('src/components/FeatureCard.astro'), 'utf8');
      expect(template).toContain('ResponsiveImage');
      expect(template).toContain('preset="featureCard"');
      expect(template).toContain('loading="lazy"');
      expect(template).toContain('decoding="async"');
      expect(template).toContain('class="feature-card-media"');
    });

    it('enforces that StoryCard.astro uses ResponsiveImage with lazy/async and card preset', () => {
      const template = readFileSync(resolve('src/components/StoryCard.astro'), 'utf8');
      expect(template).toContain('ResponsiveImage');
      expect(template).toContain('preset="card"');
      expect(template).toContain('loading="lazy"');
      expect(template).toContain('decoding="async"');
    });

    it('enforces that place detail hero uses ResponsiveImage with eager/high/async priority', () => {
      const template = readFileSync(resolve('src/pages/[locale]/places/[slug].astro'), 'utf8');
      expect(template).toContain('ResponsiveImage');
      expect(template).toContain('preset="hero"');
      expect(template).toContain('loading="eager"');
      expect(template).toContain('decoding="async"');
      expect(template).toContain('fetchpriority="high"');
    });

    it('enforces that story detail hero uses ResponsiveImage with eager/high/async priority', () => {
      const template = readFileSync(resolve('src/pages/[locale]/stories/[slug].astro'), 'utf8');
      expect(template).toContain('ResponsiveImage');
      expect(template).toContain('preset="storyHero"');
      expect(template).toContain('loading="eager"');
      expect(template).toContain('decoding="async"');
      expect(template).toContain('fetchpriority="high"');
    });

    it('enforces that trail detail hero uses eager/high/async and waypoints use lazy/async', () => {
      const template = readFileSync(resolve('src/pages/[locale]/trails/[slug].astro'), 'utf8');
      expect(template).toContain('ResponsiveImage');
      expect(template).toContain('preset="hero"');
      expect(template).toContain('preset="waypoint"');
      expect(template).toContain('loading="eager"');
      expect(template).toContain('loading="lazy"');
      expect(template).toContain('fetchpriority="high"');
    });

    it('enforces that events index uses ResponsiveImage with lazy/async and eventCard preset', () => {
      const template = readFileSync(resolve('src/pages/[locale]/events/index.astro'), 'utf8');
      expect(template).toContain('ResponsiveImage');
      expect(template).toContain('preset="eventCard"');
      expect(template).toContain('loading="lazy"');
      expect(template).toContain('decoding="async"');
    });

    it('enforces that MapExplorer generates optimized thumbnail URLs and srcset with lazy/async', () => {
      const component = readFileSync(resolve('src/components/MapExplorer.tsx'), 'utf8');
      expect(component).toContain('getOptimizedImageUrl');
      expect(component).toContain('buildSrcSet');
      expect(component).toContain('mapThumbnail');
      expect(component).toContain('loading="lazy"');
      expect(component).toContain('decoding="async"');
    });

    it('verifies built production HTML contains responsive srcset attributes on place detail pages when built', () => {
      const builtPlacePath = resolve('dist/el/places/plateia-lafkou/index.html');
      if (existsSync(builtPlacePath)) {
        const html = readFileSync(builtPlacePath, 'utf8');
        expect(html).toContain('srcset=');
        expect(html).toContain('sizes=');
        expect(html).toContain('fetchpriority="high"');
        expect(html).toContain('loading="eager"');
        expect(html).toContain('decoding="async"');
        // Ensure the default src is an optimized thumbnail (1280px), not raw full-size original
        expect(html).toContain('/thumb/');
        expect(html).toContain('1280px-');
      }
    });
  });
});
