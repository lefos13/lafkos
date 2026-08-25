import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const headersPath = resolve(dirname(fileURLToPath(import.meta.url)), '../public/_headers');

describe('CSP header', () => {
  it('allows YouTube nocookie embeds via frame-src', () => {
    const headers = readFileSync(headersPath, 'utf-8');
    const cspLine = headers
      .split('\n')
      .find((line) => line.startsWith('  Content-Security-Policy:'));

    expect(cspLine).toBeDefined();
    expect(cspLine).toMatch(/frame-src[^;]*https:\/\/www\.youtube-nocookie\.com/);
  });
});
