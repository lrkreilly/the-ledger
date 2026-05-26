import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderArticleOgImage } from '../../../lib/og-image';

// 4:3 (1200x900) — covers older social card formats and broader image-result
// eligibility. Same layout as 16:9 with a slightly larger title to fill the
// extra vertical space.

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
    '4-3',
  );
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
