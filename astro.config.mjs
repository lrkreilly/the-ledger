// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://theledger.media',
  // Trailing slash on every page URL — matches the canonical form emitted in
  // JSON-LD and the Vercel-level redirect in vercel.json. Keeps internal
  // navigation hop-free (no 308 between pages a reader clicks through).
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: {
    // Inline all stylesheets into the HTML — eliminates CSS as render-blocking
    // critical-path requests. Our total CSS is small (~5 KiB) so inlining is
    // a clear win over a separate fetch.
    inlineStylesheets: 'always',
  },
});
