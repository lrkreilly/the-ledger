// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Build URL → lastmod map from article frontmatter at config-load time.
// The @astrojs/sitemap serialize() hook uses this to emit accurate per-
// article <lastmod>, without needing to reach into astro:content (which
// isn't available outside the Astro component runtime). Cheap, runs once
// per build, doesn't touch the per-route hot path.
async function buildArticleLastmodMap() {
  const articlesDir = join(__dirname, 'src/content/articles');
  const files = await readdir(articlesDir);
  const map = new Map();
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const text = await readFile(join(articlesDir, file), 'utf-8');
    const fm = text.match(/^---\n([\s\S]*?)\n---/)?.[1];
    if (!fm) continue;
    const desk = fm.match(/^desk:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim();
    const slug = fm.match(/^slug:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim();
    const publishDate = fm.match(/^publishDate:\s*(.+)$/m)?.[1]?.trim();
    const modifiedDate = fm.match(/^modifiedDate:\s*(.+)$/m)?.[1]?.trim();
    if (desk && slug && publishDate) {
      const url = `https://theledger.media/${desk}/${slug}/`;
      map.set(url, modifiedDate || publishDate);
    }
  }
  return map;
}

const articleLastmod = await buildArticleLastmodMap();
const buildDate = new Date();

export default defineConfig({
  site: 'https://theledger.media',
  // Trailing slash on every page URL — matches the canonical form emitted in
  // JSON-LD and the Vercel-level redirect in vercel.json. Keeps internal
  // navigation hop-free (no 308 between pages a reader clicks through).
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // lastmod per URL: article publish/modified date when known,
      // build timestamp for static pages (homepage, desk indexes, framework,
      // about). Crawlers use lastmod to prioritise re-fetches.
      serialize(item) {
        const articleDate = articleLastmod.get(item.url);
        item.lastmod = articleDate ? new Date(articleDate) : buildDate;
        return item;
      },
    }),
  ],
  build: {
    // Inline all stylesheets into the HTML — eliminates CSS as render-blocking
    // critical-path requests. Our total CSS is small (~5 KiB) so inlining is
    // a clear win over a separate fetch.
    inlineStylesheets: 'always',
  },
});
