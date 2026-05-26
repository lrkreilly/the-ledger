// Shared rendering helper for article OG cards. Three variants land at three
// URLs (16:9 default, 4:3, 1:1 square) — each variant uses the same brand
// language (paper background, bracket-mark wordmark, Source Serif title, Inter
// metadata) but different canvas dimensions and title sizing.
//
// Google Article schema recommends multiple aspect ratios so the article is
// eligible for more rich-result placements (carousels, image-rich snippets).
// 16:9 stays at the existing /og/[slug].png URL so anything already in the
// wild (social shares, RSS, llms.txt) continues to resolve unchanged.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';

// Satori accepts woff/ttf but not woff2 — use the .woff files in @fontsource.
const fontsDir = path.join(process.cwd(), 'node_modules', '@fontsource');
const serifPath = path.join(fontsDir, 'source-serif-4', 'files', 'source-serif-4-latin-400-normal.woff');
const sansPath = path.join(fontsDir, 'inter', 'files', 'inter-latin-500-normal.woff');

let fontsCache: Array<{ name: string; data: Buffer; weight: 400 | 500; style: 'normal' }> | null = null;
async function loadFonts() {
  if (fontsCache) return fontsCache;
  const [serif, sans] = await Promise.all([readFile(serifPath), readFile(sansPath)]);
  fontsCache = [
    { name: 'Source Serif 4', data: serif, weight: 400, style: 'normal' },
    { name: 'Inter', data: sans, weight: 500, style: 'normal' },
  ];
  return fontsCache;
}

// satori-html's tagged template escapes `&` to `&amp;`, but satori then renders
// the entity as literal text rather than decoding it. Display the desk label
// with an em dash instead of an ampersand to sidestep the issue while keeping
// the editorial feel.
const displayDeskName = (name: string) => name.replace(/ & /g, ' — ');

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export type OgVariant = '16-9' | '4-3' | '1-1';

// Per-variant layout tuning. 4:3 and 1:1 get larger title sizes to fill the
// extra vertical space; 1:1 drops the footer row entirely so the title has
// room to breathe (the square card is meant for image-rich carousels where
// the publication URL is shown elsewhere by the host).
const VARIANTS: Record<OgVariant, {
  width: number;
  height: number;
  titleSize: number;
  padding: number;
  showFooter: boolean;
}> = {
  '16-9': { width: 1200, height: 630, titleSize: 68, padding: 80, showFooter: true },
  '4-3':  { width: 1200, height: 900, titleSize: 84, padding: 90, showFooter: true },
  '1-1':  { width: 1200, height: 1200, titleSize: 100, padding: 100, showFooter: false },
};

interface ArticleOgInput {
  title: string;
  deskName: string;
  publishDate: Date;
}

export async function renderArticleOgImage(
  input: ArticleOgInput,
  variant: OgVariant,
): Promise<Uint8Array> {
  const { width, height, titleSize, padding, showFooter } = VARIANTS[variant];
  const deskLabel = displayDeskName(input.deskName);
  const dateLabel = dateFmt.format(input.publishDate).toUpperCase();

  // Two full templates, branched by variant. Important: satori-html's `html`
  // tagged template treats ${interpolated} values as TEXT, not markup, so
  // injecting pre-built `<div>` strings via interpolation produces escaped
  // `&lt;div&gt;` output. Each branch builds its own complete tree instead.
  // (An earlier version of this file used a `${footerMarkup}` interpolation
  // and shipped escaped HTML into the OG cards as visible text. Don't.)
  const markup = showFooter
    ? html`
      <div style="width:${width}px;height:${height}px;display:flex;flex-direction:column;justify-content:space-between;background:#F6F2EA;padding:${padding}px;font-family:'Source Serif 4';color:#0F0E0C;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:36px;height:18px;border-left:3px solid #0F0E0C;border-bottom:3px solid #0F0E0C;display:flex;"></div>
            <div style="font-family:'Source Serif 4';font-size:42px;color:#0F0E0C;display:flex;">ledger</div>
            <div style="width:36px;height:18px;border-right:3px solid #0F0E0C;border-top:3px solid #0F0E0C;display:flex;"></div>
          </div>
          <div style="font-family:Inter;font-size:18px;font-weight:500;letter-spacing:3px;color:#807A6E;text-transform:uppercase;display:flex;align-items:center;height:60px;">${deskLabel}</div>
        </div>

        <div style="font-size:${titleSize}px;line-height:1.06;letter-spacing:-1.8px;color:#0F0E0C;display:flex;">${input.title}</div>

        <div style="display:flex;justify-content:space-between;align-items:flex-end;font-family:Inter;font-size:16px;font-weight:500;letter-spacing:2.5px;color:#807A6E;text-transform:uppercase;">
          <div style="display:flex;">A decision-quality publication</div>
          <div style="display:flex;">${dateLabel}</div>
        </div>
      </div>
    `
    : html`
      <div style="width:${width}px;height:${height}px;display:flex;flex-direction:column;justify-content:space-between;background:#F6F2EA;padding:${padding}px;font-family:'Source Serif 4';color:#0F0E0C;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:36px;height:18px;border-left:3px solid #0F0E0C;border-bottom:3px solid #0F0E0C;display:flex;"></div>
            <div style="font-family:'Source Serif 4';font-size:42px;color:#0F0E0C;display:flex;">ledger</div>
            <div style="width:36px;height:18px;border-right:3px solid #0F0E0C;border-top:3px solid #0F0E0C;display:flex;"></div>
          </div>
          <div style="font-family:Inter;font-size:18px;font-weight:500;letter-spacing:3px;color:#807A6E;text-transform:uppercase;display:flex;align-items:center;height:60px;">${deskLabel}</div>
        </div>

        <div style="font-size:${titleSize}px;line-height:1.06;letter-spacing:-1.8px;color:#0F0E0C;display:flex;">${input.title}</div>

        <div style="display:flex;height:1px;"></div>
      </div>
    `;

  const fonts = await loadFonts();
  const svg = await satori(markup as any, { width, height, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}
