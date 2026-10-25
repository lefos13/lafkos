/*
 * Escapes untrusted CMS strings before they are interpolated into HTML strings.
 * React handles escaping in JSX; the MapLibre popup builds its DOM from an HTML
 * string, so titles, summaries, and image URLs need one explicit boundary.
 */
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character,
  );
}
