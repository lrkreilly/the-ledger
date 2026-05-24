// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://theledger.media',
  integrations: [sitemap()],
  build: {
    // Inline all stylesheets into the HTML — eliminates CSS as render-blocking
    // critical-path requests. Our total CSS is small (~5 KiB) so inlining is
    // a clear win over a separate fetch.
    inlineStylesheets: 'always',
  },
});
