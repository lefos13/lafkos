import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { chromium } from '@playwright/test';

/*
 * Renders the committed 1200×630 social fallback from a branded SVG, then
 * recompresses the Playwright screenshot to keep the asset reproducible.
 */

export const SOCIAL_CARD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#152925"/>
      <stop offset="40%" stop-color="#1f3b36"/>
      <stop offset="100%" stop-color="#274a44"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#2d554f" stop-opacity="0.5"/>
      <stop offset="70%" stop-color="#172e2a" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#0e1d1a" stop-opacity="0.95"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a87f43"/>
      <stop offset="50%" stop-color="#e0be84"/>
      <stop offset="100%" stop-color="#a87f43"/>
    </linearGradient>
    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0a1412" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Layers -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#vignette)"/>

  <!-- Outer Border Frame with Inset Double Stroke -->
  <rect x="36" y="36" width="1128" height="558" rx="16" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-opacity="0.85"/>
  <rect x="46" y="46" width="1108" height="538" rx="10" fill="none" stroke="#40635c" stroke-width="1" stroke-opacity="0.6"/>

  <!-- Top Region: Brand Mark Crest -->
  <g transform="translate(600, 160)" filter="url(#subtleShadow)">
    <circle r="46" fill="#172f2b" stroke="url(#goldGrad)" stroke-width="2"/>
    <circle r="40" fill="none" stroke="#7e6538" stroke-width="1" stroke-opacity="0.7"/>

    <!-- Stylized Greek Lambda 'λ' -->
    <path d="M -10,-24 C -7,-24 -3,-20 0,-10 L 16,22 C 17,24 19,25 21,25 M -1,-7 L -18,22 C -19,24 -21,25 -23,25"
          fill="none" stroke="#f4efe4" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Context Eyebrow -->
  <text x="600" y="260"
        fill="#c89d5c"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="16"
        font-weight="600"
        letter-spacing="5"
        text-anchor="middle">ΝΟΤΙΟ ΠΗΛΙΟ · SOUTH PELION</text>

  <!-- Main Wordmark -->
  <text x="600" y="348"
        fill="#f4efe4"
        font-family="Georgia, 'Times New Roman', 'Baskerville', serif, system-ui"
        font-size="72"
        font-weight="700"
        letter-spacing="1.5"
        text-anchor="middle"
        filter="url(#subtleShadow)">Lafkos Guide</text>

  <!-- Elegant Center Divider -->
  <g transform="translate(600, 392)">
    <line x1="-140" y1="0" x2="-20" y2="0" stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.8"/>
    <polygon points="0,-5 6,0 0,5 -6,0" fill="#e0be84"/>
    <line x1="20" y1="0" x2="140" y2="0" stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.8"/>
  </g>

  <!-- Localized Place Context -->
  <text x="600" y="445"
        fill="#e6ded0"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="30"
        font-weight="500"
        letter-spacing="1.5"
        text-anchor="middle">Λαύκος · Νότιο Πήλιο</text>

  <!-- Descriptive Tagline -->
  <text x="600" y="492"
        fill="#9ab4ad"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="19"
        font-weight="400"
        letter-spacing="1.2"
        text-anchor="middle">Πολιτιστικός Οδηγός · Μονοπάτια · Ιστορικό Αρχείο</text>

  <!-- Safe Area Domain Footer -->
  <text x="600" y="552"
        fill="#668780"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-size="14"
        font-weight="500"
        letter-spacing="2"
        text-anchor="middle">LAFKOS-GUIDE.VERCEL.APP</text>
</svg>`;

/* Recompresses PNG IDAT chunks without changing the rendered pixels. */
function compressPngBuffer(inputBuffer: Buffer): Buffer {
  const sig = inputBuffer.subarray(0, 8);
  let offset = 8;
  const chunks: Array<{ type: string; data: Buffer }> = [];
  const idatBuffers: Buffer[] = [];

  while (offset < inputBuffer.length) {
    const length = inputBuffer.readUInt32BE(offset);
    const type = inputBuffer.toString('ascii', offset + 4, offset + 8);
    const data = inputBuffer.subarray(offset + 8, offset + 8 + length);

    if (type === 'IDAT') {
      idatBuffers.push(data);
    } else {
      chunks.push({ type, data });
    }

    offset += 12 + length;
  }

  const combinedIdat = Buffer.concat(idatBuffers);
  const uncompressedRaw = zlib.inflateSync(combinedIdat);
  const recompressedIdat = zlib.deflateSync(uncompressedRaw, {
    level: 9,
    strategy: zlib.constants.Z_FILTERED,
  });

  function crc32(buf: Buffer): number {
    const table: number[] = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c;
    }
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type: string, data: Buffer): Buffer {
    const typeBuf = Buffer.from(type);
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcInput = Buffer.concat([typeBuf, data]);
    const crc = crc32(crcInput);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const outChunks = [sig];
  for (const chunk of chunks) {
    if (chunk.type === 'IEND') {
      outChunks.push(makeChunk('IDAT', recompressedIdat));
    }
    outChunks.push(makeChunk(chunk.type, chunk.data));
  }

  return Buffer.concat(outChunks);
}

export async function generateSocialCard(): Promise<Buffer> {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  await page.setContent(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1200px; height: 630px; overflow: hidden; background: #152925; }
  </style>
</head>
<body>
  ${SOCIAL_CARD_SVG}
</body>
</html>`);

  const rawBuffer = await page.screenshot({ type: 'png', omitBackground: false });
  await browser.close();

  return compressPngBuffer(rawBuffer);
}

async function main() {
  const outDir = path.resolve('public/images');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outputPath = path.join(outDir, 'og-default.png');
  const buffer = await generateSocialCard();
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${outputPath} (${buffer.length} bytes, 1200x630 PNG)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
