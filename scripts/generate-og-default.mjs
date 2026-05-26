// One-off generator for /public/og-default.png — the fallback OG image used
// by every non-article page (homepage, desk indexes, about, framework).
//
// Mirrors the per-article OG template in src/pages/og/[slug].png.ts: same
// 1200x630 canvas, same paper background, same bracket-mark wordmark, same
// Source Serif 4 + Inter typography. Differs only in the static content:
// the title is "The Ledger" and the bottom row carries the tagline alone
// (no per-article date).
//
// Re-run with: node scripts/generate-og-default.mjs
// Commit the resulting /public/og-default.png to source control so it ships
// as a static asset (no build-time dependency on this script).

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';

const fontsDir = path.join(process.cwd(), 'node_modules', '@fontsource');
const serifPath = path.join(fontsDir, 'source-serif-4', 'files', 'source-serif-4-latin-400-normal.woff');
const sansPath = path.join(fontsDir, 'inter', 'files', 'inter-latin-500-normal.woff');

const [serif, sans] = await Promise.all([readFile(serifPath), readFile(sansPath)]);
const fonts = [
  { name: 'Source Serif 4', data: serif, weight: 400, style: 'normal' },
  { name: 'Inter', data: sans, weight: 500, style: 'normal' },
];

const markup = html`
  <div style="width:1200px;height:630px;display:flex;flex-direction:column;justify-content:space-between;background:#F6F2EA;padding:80px;font-family:'Source Serif 4';color:#0F0E0C;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:36px;height:18px;border-left:3px solid #0F0E0C;border-bottom:3px solid #0F0E0C;display:flex;"></div>
        <div style="font-family:'Source Serif 4';font-size:42px;color:#0F0E0C;display:flex;">ledger</div>
        <div style="width:36px;height:18px;border-right:3px solid #0F0E0C;border-top:3px solid #0F0E0C;display:flex;"></div>
      </div>
      <div style="font-family:Inter;font-size:18px;font-weight:500;letter-spacing:3px;color:#807A6E;text-transform:uppercase;display:flex;align-items:center;height:60px;">MMXXVI</div>
    </div>

    <div style="font-size:128px;line-height:1.0;letter-spacing:-3px;color:#0F0E0C;display:flex;">The Ledger</div>

    <div style="display:flex;justify-content:space-between;align-items:flex-end;font-family:Inter;font-size:16px;font-weight:500;letter-spacing:2.5px;color:#807A6E;text-transform:uppercase;">
      <div style="display:flex;">A decision-quality publication</div>
      <div style="display:flex;">theledger.media</div>
    </div>
  </div>
`;

const svg = await satori(markup, { width: 1200, height: 630, fonts });
const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

const outPath = path.join(process.cwd(), 'public', 'og-default.png');
await writeFile(outPath, png);
console.log(`Wrote ${outPath} (${png.length} bytes)`);
