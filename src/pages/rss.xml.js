import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import MarkdownIt from 'markdown-it';

// Markdown → HTML for the RSS body. Same renderer config as a sensible
// default: HTML-safe, links and basic formatting preserved.
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

export async function GET(context) {
  const articles = await getCollection('articles');
  const sorted = articles
    .filter((article) => !article.data.retracted)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());

  return rss({
    title: 'The Ledger',
    description:
      'A decision-quality publication. Explains the trade-offs, limits, hidden costs, and consequences most rankings and quick answers skip.',
    site: context.site,
    // Add the content: namespace so readers parse <content:encoded> correctly.
    xmlns: { content: 'http://purl.org/rss/1.0/modules/content/' },
    items: sorted.map((article) => ({
      title: article.data.title,
      pubDate: article.data.publishDate,
      // description stays as the short summary for readers that don't
      // support content:encoded; content carries the full article body.
      description: article.data.summary,
      link: `/${article.data.desk}/${article.data.slug}/`,
      author: article.data.author,
      content: md.render(article.body ?? ''),
    })),
    customData: '<language>en-gb</language>',
  });
}
