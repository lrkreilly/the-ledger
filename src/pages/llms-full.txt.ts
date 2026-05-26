import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// /llms-full.txt — the entire publication as a single Markdown document for
// AI ingestors that prefer one file over crawling per-page. Emerging
// convention (Anthropic-proposed) that pairs with /llms.txt: llms.txt is
// the table of contents, llms-full.txt is the full text.
//
// Includes: every non-retracted article in reverse-chronological order, each
// with its full body and complete Paper Trail. Retracted pieces appear as
// retraction notices, body omitted — same treatment they get in the HTML
// view. The framework page is summarised at the top so an ingestor can read
// this file alone and understand the publication's editorial discipline.

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const GET: APIRoute = async ({ site }) => {
  const siteOrigin = site?.origin ?? 'https://theledger.media';
  const articles = await getCollection('articles');
  const desks = await getCollection('desks');

  const sorted = [...articles].sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );

  const lines: string[] = [];

  lines.push('# The Ledger');
  lines.push('');
  lines.push(
    'A decision-quality publication. Explains the trade-offs, limits, hidden costs, and consequences most rankings and quick answers skip.',
  );
  lines.push('');
  lines.push(`Site: ${siteOrigin}`);
  lines.push(`Editorial framework: ${siteOrigin}/how-the-ledger-works/`);
  lines.push(`About: ${siteOrigin}/about/`);
  lines.push('');

  lines.push('## Editorial framework (summary)');
  lines.push('');
  lines.push(
    'Every Ledger piece must help a reader understand a choice, claim, system, or trade-off more clearly, and fairly explain the conditions where the easier, cheaper, faster, or more convenient answer is good enough — and where it stops working. The publication does not rank, sell, or publish buyer-style recommendations.',
  );
  lines.push('');
  lines.push(
    'Every conclusion ships with a *Paper Trail* — the method used, the basis (documents, observation, reasoning), the limits of the conclusion, and the time spent. Retracted pieces stay at their URL with a retraction notice; their original conclusions are not preserved because the publication no longer stands behind them.',
  );
  lines.push('');

  lines.push('## Desks');
  lines.push('');
  for (const desk of desks) {
    lines.push(`- **${desk.data.name}** — ${desk.data.lens}. ${desk.data.about}`);
  }
  lines.push('');

  lines.push('## Articles');
  lines.push('');
  lines.push(
    'All articles below in reverse-chronological order. Each entry includes the full body and the article\'s Paper Trail.',
  );
  lines.push('');

  for (const article of sorted) {
    const desk = desks.find((d) => d.data.slug === article.data.desk);
    const deskName = desk?.data.name ?? article.data.desk;
    const url = `${siteOrigin}/${article.data.desk}/${article.data.slug}/`;
    const date = dateFmt.format(article.data.publishDate);

    lines.push('---');
    lines.push('');
    lines.push(`### ${article.data.title}`);
    lines.push('');
    lines.push(`**Desk:** ${deskName}  `);
    lines.push(`**Published:** ${date}  `);
    lines.push(`**Author:** ${article.data.author}  `);
    lines.push(`**URL:** ${url}`);
    lines.push('');
    lines.push(`*${article.data.summary}*`);
    lines.push('');

    if (article.data.retracted) {
      const retractedDate = dateFmt.format(article.data.retracted.date);
      lines.push(`**RETRACTED on ${retractedDate}.** ${article.data.retracted.reason}`);
      lines.push('');
      lines.push(
        '_The original body is not reproduced — The Ledger no longer stands behind the conclusion. The Paper Trail below is preserved so readers can see how the retracted conclusion was reached._',
      );
      lines.push('');
    } else {
      // Raw Markdown body — already the format AI ingestors want.
      lines.push(article.body?.trim() ?? '');
      lines.push('');
    }

    lines.push('**Paper Trail**');
    lines.push('');
    lines.push(`- **Method:** ${article.data.paperTrail.method}`);
    lines.push('- **Basis:**');
    for (const b of article.data.paperTrail.basis) {
      lines.push(`  - ${b.label}${b.url ? ` — ${b.url}` : ''}`);
    }
    lines.push(`- **Limits:** ${article.data.paperTrail.limits}`);
    if (article.data.paperTrail.timeSpent) {
      lines.push(`- **Time spent:** ${article.data.paperTrail.timeSpent}`);
    }
    if (article.data.paperTrail.updates.length > 0) {
      lines.push('- **Updates:**');
      for (const u of article.data.paperTrail.updates) {
        lines.push(`  - ${dateFmt.format(u.date)}: ${u.change}`);
      }
    }
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
