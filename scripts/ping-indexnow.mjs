#!/usr/bin/env node
// Pings IndexNow (Bing, Yandex, Seznam) with all URLs from the built sitemap.
// Runs as a post-build step. Only fires when SITE_DEPLOY=1 is set so it doesn't
// ping on every local build.

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const KEY = 'c5b295148dd74941859b3b9d186485006e04e05b86df404bbaf1621dac336131';
const HOST = 'theledger.media';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const shouldRun = process.env.SITE_DEPLOY === '1' || process.env.VERCEL === '1';
if (!shouldRun) {
  console.log('[indexnow] Skipping — set SITE_DEPLOY=1 to enable.');
  process.exit(0);
}

const sitemapPath = path.join(process.cwd(), 'dist', 'sitemap-0.xml');
let sitemapXml;
try {
  sitemapXml = await readFile(sitemapPath, 'utf-8');
} catch (err) {
  console.error(`[indexnow] Could not read ${sitemapPath}:`, err.message);
  process.exit(1);
}

const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.warn('[indexnow] No URLs found in sitemap — skipping.');
  process.exit(0);
}

console.log(`[indexnow] Submitting ${urls.length} URLs to IndexNow…`);

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

try {
  const res = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (res.ok || res.status === 202) {
    console.log(`[indexnow] OK (${res.status}) — ${urls.length} URLs submitted.`);
  } else {
    const body = await res.text();
    console.warn(`[indexnow] Non-OK response ${res.status}:`, body.slice(0, 500));
  }
} catch (err) {
  console.error('[indexnow] Request failed:', err.message);
}
