import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getCollection('articles');
  return articles.map((article) => ({
    params: { desk: article.data.desk, slug: article.data.slug },
    props: { id: article.id },
  }));
};

export const GET: APIRoute = async ({ props, site, params }) => {
  const id = (props as { id: string }).id;
  const filePath = path.join(process.cwd(), 'src', 'content', 'articles', `${id}.md`);
  const source = await readFile(filePath, 'utf-8');

  const canonicalUrl = site
    ? new URL(`/${params.desk}/${params.slug}`, site).href
    : `https://theledger.media/${params.desk}/${params.slug}`;

  return new Response(source, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Robots-Tag': 'noindex, follow',
      'Link': `<${canonicalUrl}>; rel="canonical"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
