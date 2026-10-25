import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../src/lib/html';

/*
 * The MapLibre popup is built with innerHTML, so CMS text must not be able to
 * close an attribute or inject markup. React JSX escaping does not cover it.
 */
describe('escapeHtml', () => {
  it('neutralizes tag, attribute, and entity delimiters', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
    );
    expect(escapeHtml("Lafkos & 'South Pelion'")).toBe('Lafkos &amp; &#39;South Pelion&#39;');
  });

  it('leaves ordinary Greek text and URL characters unchanged', () => {
    expect(escapeHtml('Πλατεία Λαύκου — 39.1779, 23.2466')).toBe(
      'Πλατεία Λαύκου — 39.1779, 23.2466',
    );
    expect(escapeHtml('https://example.com/a?x=1&y=2')).toBe('https://example.com/a?x=1&amp;y=2');
  });
});
