// news-image-20261121 — "Saturday 21 November 2026: 46 date-checked stories".
// The entry image is rendered at build time from frontpage.html (hand-written
// HTML/CSS + inline SVG, no network) into entry.png beside this file. This
// program copies those exact bytes to the grader's output directory, so the
// judge sees exactly what was rendered. Node 22, standard library only.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const src = new URL('./entry.png', import.meta.url);

// Validate the entry image before copying, so a bad build fails loudly here
// instead of shipping a broken file to the grader.
let bytes;
try {
  bytes = readFileSync(src);
} catch {
  throw new Error('entry.png is missing next to main.ts — render frontpage.html first');
}
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error('entry.png is not a PNG file');
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png must be 1024x1024, got ${width}x${height}`);
}
const size = statSync(src).size;
if (size > 1048576) {
  throw new Error(`entry.png is ${size} bytes, over the 1 MiB gate limit`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(src, join(outDir, 'entry.png'));
console.log(`copied entry.png (${size} bytes, ${width}x${height}) to ${join(outDir, 'entry.png')}`);
