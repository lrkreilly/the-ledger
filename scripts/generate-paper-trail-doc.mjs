// One-off generator for the Paper Trail reference doc.
// Run: node scripts/generate-paper-trail-doc.mjs
// Output: C:\Users\Luke\Downloads\paper-trail.docx

import fs from 'node:fs';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, ShadingType, LevelFormat, PageOrientation, PageNumber,
  Footer, Header,
} from 'docx';

const FONT_SERIF = 'Georgia';
const FONT_SANS = 'Arial';
const FONT_MONO = 'Consolas';

const INK = '0F0E0C';
const INK_2 = '4A463F';
const INK_3 = '807A6E';
const RULE = 'C9C2B3';
const PAPER_2 = 'EFEAE0';

// ---- helpers ----

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 160, line: 320 },
  ...opts,
  children: typeof text === 'string'
    ? [new TextRun({ text, font: FONT_SANS, size: 22, color: INK, ...opts.run })]
    : text,
});

const lead = (text) => new Paragraph({
  spacing: { after: 360, line: 360 },
  children: [new TextRun({
    text, italics: true, font: FONT_SERIF, size: 26, color: INK_2,
  })],
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 480, after: 200 },
  children: [new TextRun({
    text, font: FONT_SERIF, size: 36, color: INK, bold: false,
  })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 320, after: 120 },
  children: [new TextRun({
    text, font: FONT_SERIF, size: 28, color: INK,
  })],
});

const eyebrow = (text) => new Paragraph({
  spacing: { before: 120, after: 80 },
  children: [new TextRun({
    text: text.toUpperCase(), font: FONT_SANS, size: 18, color: INK_3,
    bold: true, characterSpacing: 60,
  })],
});

const bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 100, line: 300 },
  children: [new TextRun({ text, font: FONT_SANS, size: 22, color: INK })],
});

// Code block: shaded paragraph with mono font, one paragraph per line so
// line breaks survive cleanly.
const codeBlock = (code) => {
  const lines = code.split('\n');
  return lines.map((line, i) => new Paragraph({
    spacing: { after: 0, before: 0, line: 280 },
    shading: { fill: PAPER_2, type: ShadingType.CLEAR, color: 'auto' },
    border: i === 0
      ? { top: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 6 } }
      : i === lines.length - 1
        ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 6 } }
        : undefined,
    indent: { left: 200, right: 200 },
    children: [new TextRun({
      text: line || ' ',
      font: FONT_MONO,
      size: 20,
      color: INK,
    })],
  }));
};

const rule = () => new Paragraph({
  spacing: { before: 240, after: 240 },
  border: {
    bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 1 },
  },
  children: [new TextRun({ text: '' })],
});

// ---- document ----

const doc = new Document({
  creator: 'The Ledger',
  title: 'Paper Trail',
  description: "The Ledger's method — how every conclusion shows its working",
  styles: {
    default: {
      document: { run: { font: FONT_SANS, size: 22 } },
    },
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '—', // em dash, matches site style
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 280 } } },
          },
        ],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1700, right: 1700, bottom: 1700, left: 1700 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({
            text: 'THE LEDGER  ·  PAPER TRAIL',
            font: FONT_SANS, size: 16, color: INK_3, characterSpacing: 80,
          })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Page ', font: FONT_SANS, size: 18, color: INK_3 }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT_SANS, size: 18, color: INK_3 }),
            new TextRun({ text: ' of ', font: FONT_SANS, size: 18, color: INK_3 }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_SANS, size: 18, color: INK_3 }),
          ],
        })],
      }),
    },
    children: [

      // Title block
      new Paragraph({
        spacing: { before: 600, after: 200 },
        children: [new TextRun({
          text: 'HOW THE LEDGER WORKS',
          font: FONT_SANS, size: 18, color: INK_3, characterSpacing: 120, bold: true,
        })],
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({
          text: 'Paper Trail',
          font: FONT_SERIF, size: 88, color: INK,
        })],
      }),
      lead("The Ledger’s method — how every conclusion shows its working."),
      rule(),

      // Opening
      p("Paper Trail has three layers — editorial concept, code enforcement, visual rendering — wired so the discipline can’t be bypassed."),

      // 1. Editorial concept
      h1('1. Editorial concept'),
      p("From the editorial framework:"),
      new Paragraph({
        spacing: { before: 120, after: 200 },
        indent: { left: 540 },
        border: {
          left: { style: BorderStyle.SINGLE, size: 18, color: '7A1E0E', space: 12 },
        },
        children: [new TextRun({
          text: "Every conclusion shows its working: the assumptions, evidence considered, limits that apply, and where the conclusion stops being true. It says here is how this conclusion was reached, not here is why you should trust us. If a Ledger piece cannot show its working, it does not belong here.",
          italics: true, font: FONT_SERIF, size: 24, color: INK,
        })],
      }),
      p('Three required fields and one optional list:'),
      bullet("Method — how the conclusion was reached (frame, reasoning, what kind of question this is)."),
      bullet("Sources — what evidence was used (no inventions; if nothing solid exists, say so)."),
      bullet("Limits — what this argument does not cover (where it stops being true, what kind of reader it isn’t for)."),
      bullet("Updates (optional) — corrections and revisions over time, each dated."),

      // 2. How it's enforced
      h1("2. How it’s enforced (the code side)"),

      h2('Schema validation — src/content.config.ts'),
      p('This runs at build time via Astro’s content collections and Zod. If you commit an article with a missing or empty method, sources, or limits, the build fails. Vercel won’t deploy. The editorial rule is enforced by the compiler, not by your willpower.'),
      ...codeBlock(`paperTrail: z.object({
  method:  z.string().min(1, 'Paper Trail requires a method.'),
  sources: z.string().min(1, 'Paper Trail requires sources.'),
  limits:  z.string().min(1, 'Paper Trail requires limits.'),
  updates: z.array(z.object({
    date:   z.coerce.date(),
    change: z.string(),
  })).default([]),
})`),

      h2('Frontmatter format — every article'),
      ...codeBlock(`---
title: "Article title"
slug: "article-slug"
desk: "value-and-trade-offs"
author: "Luke"
publishDate: 2026-05-23
summary: "One sentence."
paperTrail:
  method: "How the conclusion was reached."
  sources: "What evidence was used."
  limits: "What this argument does not cover."
  updates:
    - date: 2026-09-15
      change: "Revised conclusion based on new evidence from..."
---

Article body in markdown.`),

      h2('Side effects in ArticleLayout.astro'),
      p('The updates array does three things behind the scenes:'),
      bullet("Auto-updates the article’s modified date. The most recent update date becomes effectiveModified, overriding any modifiedDate in frontmatter. The only way to bump the modified date is to log a real correction."),
      bullet("Drives the article header label. When effectiveModified differs from publishDate, the byline shows: By Luke · 23 May 2026 · Updated 15 September 2026."),
      bullet("Emits formal corrections in JSON-LD. Each update becomes a CorrectionComment block inside the Article schema — a recognised signal Google indexes for editorial corrections, and AI ingestors that read JSON-LD pick it up too."),

      ...codeBlock(`"correction": [
  { "@type": "CorrectionComment", "text": "...", "datePublished": "..." }
]`),

      // 3. How it renders
      h1('3. How it renders (the visual side)'),
      p("src/components/PaperTrail.astro is dropped at the bottom of every article body (after the markdown slot, inside the prose container). It renders:"),
      bullet("A heavy 2px black top rule — visually separates Paper Trail from the article body so it reads as method, not as more prose."),
      bullet("An eyebrow label “Paper Trail” plus an italic intro: “How this conclusion was reached.”"),
      bullet("A definition list with three rows — Method / Sources / Limits — in a 120px label / fluid value grid."),
      bullet("An Updates section below, only rendered if at least one update exists, listing each in date / change rows sorted newest-first."),
      p('The visual hierarchy is deliberate: it’s lower-key than the article, formal in tone, never feels promotional. Structured like a colophon, not a sales pitch.'),

      // 4. How you use it
      h1('4. How you use it when writing'),

      h2('A new piece'),
      p("Open src/content/articles/[slug].md, fill the frontmatter including paperTrail, write the body, commit, push. That’s it. The schema check runs on the first npm run build, and again in Vercel CI on every push."),

      h2('A correction to a live piece'),
      bullet('Edit the article markdown directly (fix the body).'),
      bullet('Append a new entry to paperTrail.updates with the date and a description of the change.'),
      bullet('Commit and push.'),
      p('The site automatically:'),
      bullet("Bumps the article’s modifiedDate to the new update’s date."),
      bullet('Shows “Updated [date]” in the byline.'),
      bullet('Renders the new update entry in the Paper Trail block.'),
      bullet('Emits a CorrectionComment in the JSON-LD so search engines see it as a formal correction.'),
      bullet('Triggers IndexNow on deploy to re-crawl.'),
      p('Typos and small clarifications: edit silently, no update entry needed. Substantive changes — new evidence, revised conclusions, retracted claims — get a logged entry.'),

      h2('Removing a piece entirely'),
      p('If a piece becomes wrong enough that it should no longer stand, remove the article file but leave a stub at the URL recording what was there and why. Not automated — handled manually when needed; the framework says the page should “record what was there and why.”'),

      // The principle
      h1('The principle behind it'),
      p("The whole mechanism is built so the editorial discipline is the path of least resistance. You literally cannot publish without method, sources, and limits. You literally cannot show an “Updated” date without logging what changed. The framework is enforced by the compiler, surfaced to readers in the article, and structured for machines in JSON-LD — all from one block of frontmatter. That’s the spine of the whole publication."),

      rule(),
      new Paragraph({
        spacing: { before: 240 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: 'The Ledger  ·  MMXXVI',
          font: FONT_SANS, size: 16, color: INK_3, characterSpacing: 120, bold: true,
        })],
      }),

    ],
  }],
});

const outputPath = 'C:\\Users\\Luke\\Downloads\\paper-trail.docx';
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outputPath, buffer);
console.log(`Wrote ${outputPath} (${buffer.length.toLocaleString()} bytes)`);
