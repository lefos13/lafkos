/*
 * Pure helpers for the optional embedded-video field shared by places and
 * trails. The parser accepts only the YouTube URL shapes the embed component
 * can render and extracts the canonical 11-character video id, so callers
 * never trust arbitrary URLs inside an <iframe>.
 */

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extracts the video id from a supported YouTube URL.
 *
 * Only https is accepted: an http embed would be blocked as mixed content on
 * this https-only site anyway, so rejecting it early keeps seed data honest.
 * Extra query parameters (t, si, list, …) are tolerated; anything that does
 * not resolve to a video id yields undefined rather than throwing.
 */
export function parseYouTubeVideoId(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }

  if (parsed.protocol !== 'https:') return undefined;
  const host = parsed.hostname.replace(/^(?:www|m)\./, '');

  /* Host variants (www., m., youtube-nocookie.com) normalize to the three
   * canonical domains; everything else is out of contract. */
  if (host === 'youtu.be') {
    const segments = parsed.pathname.split('/').filter(Boolean);
    return segments.length === 1 && VIDEO_ID_PATTERN.test(segments[0])
      ? segments[0]
      : undefined;
  }
  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return undefined;

  const segments = parsed.pathname.split('/').filter(Boolean);
  switch (segments[0]) {
    case 'watch': {
      const id = parsed.searchParams.get('v');
      return id !== null && VIDEO_ID_PATTERN.test(id) ? id : undefined;
    }
    case 'shorts':
    case 'embed': {
      const candidate = segments[1];
      return segments.length === 2 && candidate !== undefined && VIDEO_ID_PATTERN.test(candidate)
        ? candidate
        : undefined;
    }
    default:
      return undefined;
  }
}
