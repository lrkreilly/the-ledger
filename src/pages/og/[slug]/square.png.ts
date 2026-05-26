import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderArticleOgImage } from '../../../lib/og-image';

// 1:1 square (1200x1200) — the variant Google image-rich results and
// carousel placements consume. Drops the footer row (handled by the helper)
// so the title has room to breathe inside the taller canvas. URL pattern
// /og/[slug]/square.png keeps it cleanly separated from the default
// /og/[slug].png and avoids any literal-suffix routing ambiguity.

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

export const GET: APIRoute = async ({ props }) => {
  const { article, desk } = props as { article: any; desk: any };
  const png = await renderArticleOgImage(
    { title: article.title, deskName: desk.name, publishDate: article.publishDate },
    '1-1',
  );
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
