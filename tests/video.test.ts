import { describe, expect, it } from 'vitest';
import { youTubeUrlSchema } from '../src/lib/content';
import { parseYouTubeVideoId } from '../src/lib/video';

const ID = 'dQw4w9WgXcQ';
const OTHER_ID = 'M7lc1UVf-VE';

const acceptedUrls = [
  `https://www.youtube.com/watch?v=${ID}`,
  `https://youtube.com/watch?v=${ID}`,
  `https://m.youtube.com/watch?v=${ID}`,
  `https://www.youtube.com/watch?v=${ID}&t=90s&si=abc`,
  `https://www.youtube.com/watch?si=abc&list=PL123&v=${ID}`,
  `https://youtu.be/${ID}`,
  `https://youtu.be/${ID}?t=42&si=x`,
  `https://www.youtube.com/shorts/${ID}`,
  `https://youtube.com/shorts/${ID}?feature=share`,
  `https://www.youtube.com/embed/${ID}`,
  `https://www.youtube-nocookie.com/embed/${ID}?autoplay=0`,
];

const rejectedUrls = [
  'dQw4w9WgXcQ',
  '',
  `http://www.youtube.com/watch?v=${ID}`,
  'https://vimeo.com/123456789',
  'https://www.youtube.com/watch',
  `https://www.youtube.com/watch?v=${ID.slice(0, 10)}`,
  `https://www.youtube.com/watch?v=${OTHER_ID}!`,
  `https://youtu.be/${ID}/extra`,
  `https://example.com/embed/${ID}`,
];

describe('parseYouTubeVideoId', () => {
  it('extracts the id from every accepted URL form', () => {
    for (const url of acceptedUrls) {
      expect(parseYouTubeVideoId(url), url).toBe(ID);
    }
  });

  it('returns a different id when the URL points at another video', () => {
    expect(parseYouTubeVideoId(`https://youtu.be/${OTHER_ID}`)).toBe(OTHER_ID);
  });

  it('rejects URLs outside the contract', () => {
    for (const url of rejectedUrls) {
      expect(parseYouTubeVideoId(url), url).toBeUndefined();
    }
  });
});

describe('youTubeUrlSchema', () => {
  it('accepts the same matrix as the parser', () => {
    for (const url of [...acceptedUrls, `https://youtu.be/${OTHER_ID}`]) {
      expect(youTubeUrlSchema.safeParse(url).success, url).toBe(true);
    }
  });

  it('rejects the same matrix as the parser', () => {
    for (const url of rejectedUrls) {
      expect(youTubeUrlSchema.safeParse(url).success, url).toBe(false);
    }
  });
});
