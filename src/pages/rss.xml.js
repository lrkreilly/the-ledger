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

  const siteOrigin = context.site?.origin ?? 'https://theledger.media';

  return rss({
    title: 'The Ledger',
    description:
      'A decision-quality publication. Explains the trade-offs, limits, hidden costs, and consequences most rankings and quick answers skip.',
    site: context.site,
    // Two namespaces:
    //   content: lets readers parse <content:encoded> (the full article body)
    //   atom: lets us emit <atom:link rel="self">, the self-reference URL
    //         that RSS validators look for
    xmlns: {
      content: 'http://purl.org/rss/1.0/modules/content/',
      atom: 'http://www.w3.org/2005/Atom',
    },
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
    // <language>, atom self-link, and channel <image> (publication logo).
    // Logo dimensions kept at 144x144 — the RSS 2.0 spec caps <image> at
    // 144 wide and 400 tall; the actual /logo.png is 512x512 but readers
    // will scale to fit. Square at 144 keeps aspect and stays in-spec.
    customData: `<language>en</language>
<atom:link href="${siteOrigin}/rss.xml" rel="self" type="application/rss+xml" />
<image>
<url>${siteOrigin}/logo.png</url>
<title>The Ledger</title>
<link>${siteOrigin}/</link>
<width>144</width>
<height>144</height>
</image>`,
  });
}
