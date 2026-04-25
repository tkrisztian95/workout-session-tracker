/**
 * Rasterizes src/app/icon.svg into:
 *   - src/app/apple-icon.png  (180x180, iOS home screen)
 *   - src/app/favicon.ico     (multi-size: 16, 32, 48 — PNG-embedded ICO)
 *
 * Usage: node tools/generate-app-icons.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'src/app/icon.svg');
const appleOut = resolve(root, 'src/app/apple-icon.png');
const faviconOut = resolve(root, 'src/app/favicon.ico');

const ICO_SIZES = [16, 32, 48];
const APPLE_SIZE = 180;

async function rasterize(svg, size) {
  return sharp(svg, { density: Math.max(96, size * 4) })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

function buildIco(pngBuffers) {
  const headerSize = 6;
  const entrySize = 16;
  const count = pngBuffers.length;
  let offset = headerSize + entrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(entrySize * count);
  pngBuffers.forEach((buf, i) => {
    const e = entries.subarray(i * entrySize, (i + 1) * entrySize);
    const sz = ICO_SIZES[i];
    e.writeUInt8(sz >= 256 ? 0 : sz, 0); // width
    e.writeUInt8(sz >= 256 ? 0 : sz, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
  });

  return Buffer.concat([header, entries, ...pngBuffers]);
}

const svg = await readFile(svgPath);

const apple = await rasterize(svg, APPLE_SIZE);
await writeFile(appleOut, apple);
console.log(`wrote ${appleOut} (${APPLE_SIZE}x${APPLE_SIZE})`);

const icoPngs = await Promise.all(ICO_SIZES.map((s) => rasterize(svg, s)));
await writeFile(faviconOut, buildIco(icoPngs));
console.log(`wrote ${faviconOut} (${ICO_SIZES.join(',')}px)`);
