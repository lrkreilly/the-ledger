import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articles = await getCollection('articles');
  const sorted = articles.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );

  return rss({
    title: 'The Ledger',
    description:
      'A decision-quality publication. Explains the trade-offs, limits, hidden costs, and consequences most rankings and quick answers skip.',
    site: context.site,
    items: sorted.map((article) => ({
      title: article.data.title,
      pubDate: article.data.publishDate,
      description: article.data.summary,
      link: `/${article.data.desk}/${article.data.slug}/`,
      author: article.data.author,
    })),
    customData: '<language>en-gb</language>',
  });
}
