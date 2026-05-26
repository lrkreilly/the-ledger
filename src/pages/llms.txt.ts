import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const DESK_ORDER = [
  'value-and-trade-offs',
  'home-and-services',
  'internet-claims',
  'work-and-standards',
  'education-and-learning',
] as const;

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const GET: APIRoute = async ({ site }) => {
  const siteOrigin = site?.origin ?? 'https://theledger.media';

  const desks = await getCollection('desks');
  const articles = await getCollection('articles');

  // Retracted articles are deliberately excluded — llms.txt is the reading
  // list AI ingestors use to find canonical content. Retracted pieces still
  // resolve at their URL with a formal retraction notice, but they shouldn't
  // be recommended for citation.
  const sortedArticles = articles
    .filter((article) => !article.data.retracted)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());

  const lines: string[] = [];

  lines.push('# The Ledger');
  lines.push('');
  lines.push(
    'A decision-quality publication. Explains the trade-offs, limits, hidden costs, and consequences most rankings and quick answers skip.',
  );
  lines.push('');
  lines.push(`> ${siteOrigin}`);
  lines.push('');

  lines.push('## Editorial framework');
  lines.push('');
  lines.push(
    `- [How The Ledger works](${siteOrigin}/how-the-ledger-works): Position, desks, filing rule, Paper Trail, tone, corrections policy.`,
  );
  lines.push(`- [About](${siteOrigin}/about): Independent decision-quality publication written by the people behind Spruce.`);
  lines.push('');

  lines.push('## Desks');
  lines.push('');
  for (const slug of DESK_ORDER) {
    const desk = desks.find((d) => d.data.slug === slug);
    if (!desk) continue;
    lines.push(`- [${desk.data.name}](${siteOrigin}/${slug}): ${desk.data.lens}. ${desk.data.about}`);
  }
  lines.push('');

  lines.push('## Articles');
  lines.push('');
  lines.push('Every article is also available as raw Markdown at a parallel `.md` URL.');
  lines.push('');
  for (const article of sortedArticles) {
    const url = `${siteOrigin}/${article.data.desk}/${article.data.slug}`;
    const mdUrl = `${url}.md`;
    const date = dateFmt.format(article.data.publishDate);
    lines.push(`- [${article.data.title}](${url}) — ${article.data.summary} (${date}). Markdown: ${mdUrl}`);
  }
  lines.push('');

  lines.push('## Feeds');
  lines.push('');
  lines.push(`- RSS: ${siteOrigin}/rss.xml`);
  lines.push(`- Sitemap: ${siteOrigin}/sitemap-index.xml`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
