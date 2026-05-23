import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getCollection('articles');
  const desks = await getCollection('desks');
  return articles.map((article) => {
    const desk = desks.find((d) => d.data.slug === article.data.desk);
    if (!desk) throw new Error(`Article ${article.id} references unknown desk ${article.data.desk}`);
    return {
      params: { slug: article.data.slug },
      props: { article: article.data, desk: desk.data },
    };
  });
};

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

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

export const GET: APIRoute = async ({ props }) => {
  const { article, desk } = props as { article: any; desk: any };
  const deskLabel = displayDeskName(desk.name as string);
  const dateLabel = dateFmt.format(article.publishDate).toUpperCase();

  const markup = html`
    <div style="width:1200px;height:630px;display:flex;flex-direction:column;justify-content:space-between;background:#F6F2EA;padding:80px;font-family:'Source Serif 4';color:#0F0E0C;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:36px;height:18px;border-left:3px solid #0F0E0C;border-bottom:3px solid #0F0E0C;display:flex;"></div>
          <div style="font-family:'Source Serif 4';font-size:42px;color:#0F0E0C;display:flex;">ledger</div>
          <div style="width:36px;height:18px;border-right:3px solid #0F0E0C;border-top:3px solid #0F0E0C;display:flex;"></div>
        </div>
        <div style="font-family:Inter;font-size:18px;font-weight:500;letter-spacing:3px;color:#807A6E;text-transform:uppercase;display:flex;align-items:center;height:60px;">${deskLabel}</div>
      </div>

      <div style="font-size:68px;line-height:1.08;letter-spacing:-1.5px;color:#0F0E0C;display:flex;">${article.title}</div>

      <div style="display:flex;justify-content:space-between;align-items:flex-end;font-family:Inter;font-size:16px;font-weight:500;letter-spacing:2.5px;color:#807A6E;text-transform:uppercase;">
        <div style="display:flex;">A decision-quality publication</div>
        <div style="display:flex;">${dateLabel}</div>
      </div>
    </div>
  `;

  const fonts = await loadFonts();
  const svg = await satori(markup as any, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
