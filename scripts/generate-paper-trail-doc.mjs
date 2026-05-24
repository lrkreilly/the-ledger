// One-off generator for the Paper Trail reference doc.
// Run: node scripts/generate-paper-trail-doc.mjs
// Output: C:\Users\Luke\Downloads\paper-trail.docx

import fs from 'node:fs';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, ShadingType, LevelFormat, PageNumber,
  Footer, Header,
} from 'docx';

const FONT_SERIF = 'Georgia';
const FONT_SANS = 'Arial';
const FONT_MONO = 'Consolas';

const INK = '0F0E0C';
const INK_2 = '4A463F';
const INK_3 = '807A6E';
const ACCENT = '7A1E0E';
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

const bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 100, line: 300 },
  children: [new TextRun({ text, font: FONT_SANS, size: 22, color: INK })],
});

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

const pullQuote = (text) => new Paragraph({
  spacing: { before: 120, after: 200 },
  indent: { left: 540 },
  border: {
    left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 12 },
  },
  children: [new TextRun({
    text, italics: true, font: FONT_SERIF, size: 24, color: INK,
  })],
});

const callout = (label, body) => new Paragraph({
  spacing: { before: 240, after: 240 },
  shading: { fill: PAPER_2, type: ShadingType.CLEAR, color: 'auto' },
  border: {
    top: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 8 },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 8 },
  },
  indent: { left: 200, right: 200 },
  children: [
    new TextRun({
      text: `${label.toUpperCase()}  ·  `,
      font: FONT_SANS, size: 18, color: ACCENT,
      bold: true, characterSpacing: 80,
    }),
    new TextRun({ text: body, font: FONT_SANS, size: 22, color: INK }),
  ],
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
            text: '—',
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
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({
          text: 'Version 2.1  ·  Basis terminology, retraction flag, editorial conventions',
          font: FONT_SANS, size: 18, color: INK_3, characterSpacing: 80, bold: true,
        })],
      }),
      rule(),

      p("Paper Trail has three layers — editorial concept, code enforcement, visual rendering — wired so the discipline can’t be bypassed. Five frontmatter fields cover every editorial action the publication needs to take."),

      // 1. Editorial concept
      h1('1. Editorial concept'),
      p("From the editorial framework:"),
      pullQuote("Every conclusion shows its working: the assumptions, evidence considered, limits that apply, and where the conclusion stops being true. It says here is how this conclusion was reached, not here is why you should trust us. If a Ledger piece cannot show its working, it does not belong here."),

      p("The Ledger standard, in one sentence each:"),
      bullet("Method explains how the conclusion was reached."),
      bullet("Basis explains what the conclusion draws on."),
      bullet("Limits explains where the claim stops."),
      p("The mechanism is five frontmatter fields — three required, two optional:"),
      bullet("Method (required, string) — frame, reasoning, what kind of question this is."),
      bullet("Basis (required, structured array) — public docs, pattern analysis, lived experience, first-principles reasoning, or a mix. Each entry is its own item; the array can never be empty."),
      bullet("Limits (required, string) — where the argument stops being true, what kind of reader it isn’t for."),
      bullet("Updates (optional, array) — corrections and revisions over time, each dated."),
      bullet("Retracted (optional, object) — formal retraction marker. When present, the article is withdrawn but the URL stays live with a retraction notice."),

      // 2. The schema
      h1("2. How it’s enforced (the code side)"),

      h2('Schema validation — src/content.config.ts'),
      p('This runs at build time via Astro’s content collections and Zod. If a required field is missing or violates the shape, the build fails. Vercel won’t deploy. The editorial rule is enforced by the compiler, not by your willpower.'),
      ...codeBlock(`paperTrail: z.object({
  method: z.string().min(1, 'Paper Trail requires a method.'),
  basis:  z.array(z.object({
    label: z.string().min(1, 'Each basis entry needs a label.'),
    url:   z.string().url().optional(),
  })).min(1, 'Paper Trail requires at least one basis entry.'),
  limits:  z.string().min(1, 'Paper Trail requires limits.'),
  updates: z.array(z.object({
    date:   z.coerce.date(),
    change: z.string(),
  })).default([]),
}),
retracted: z.object({
  date:   z.coerce.date(),
  reason: z.string().min(1, 'A retracted article requires a reason.'),
}).optional(),`),

      h2('Frontmatter format — every article'),
      ...codeBlock(`---
title: "Article title"
slug: "article-slug"
desk: "value-and-trade-offs"
author: "Luke"
publishDate: 2026-05-23
summary: "One sentence, 20–280 chars."
paperTrail:
  method: "How the conclusion was reached."
  basis:
    - label: "A specific basis entry."
      url: "https://..."           # optional
    - label: "Another specific basis entry."
  limits: "What this argument does not cover."
  updates:
    - date: 2026-09-15
      change: "Revised conclusion based on new evidence from..."
---

Article body in markdown.`),

      // 3. Basis as an array
      h1('3. Basis — what the argument rests on'),
      p('The field is called Basis, not "Sources." Ledger pieces often rest on a mix of public docs, pattern analysis, lived experience, and first-principles reasoning. Not all of that is "sourcing" in the strict academic or journalistic sense. A field called Sources would force every entry to dress itself up as a citation, which invites bad-faith gesturing. Basis is honest about what the piece is actually built on, whatever shape that takes.'),

      h2('Why the structured-array format'),
      p('Basis is a YAML array; each entry is its own item. A vague string ("industry experience, common sense") slips by as prose. The same content as a single list item exposes its weakness. The format doesn’t make weak entries impossible — but it makes them visible, both to the writer and the reader.'),
      p('Each entry should be specific enough that a reader could in principle understand what it is. "Public guidance from trade associations" is acceptable. "My experience" is not — if a piece rests on personal experience, name what kind ("Operations work across N home-services contractors over X years").'),
      p('Optional url is the only enrichment. Resist any urge to add more fields (type, accessed_date, quote). The strength of the format is that it’s just label plus optional url. The moment you add a third field, people start using fields to hide weakness.'),

      h2('Reasoning pieces — arguments from first principles'),
      p('Some Ledger pieces argue from definitions, trade-offs, or framework reasoning rather than from external evidence or observation. The framework allows this — but the choice must be declared, not hidden.'),
      p('For a reasoning piece, the basis array must contain exactly one entry with this exact label:'),
      ...codeBlock(`basis:
  - label: "Argument from first principles."`),
      callout('Rule', "The absence of external evidence is never accidental on The Ledger. It’s always a positive claim. Empty basis won’t compile."),

      // 4. Updates and what counts
      h1('4. Updates — what counts as substantive'),
      p("The Updates array is for substantive editorial changes only. The cost of an unnecessary update entry is small; the cost of a silent substantive change is editorial drift over months."),

      h2('A change is substantive — and must be logged — if it:'),
      bullet('Changes the conclusion.'),
      bullet('Removes or weakens a claim.'),
      bullet('Adds material new evidence.'),
      bullet('Narrows or expands the scope of the argument.'),
      bullet('Adds or removes a basis entry.'),

      h2('A change is not substantive — edit silently — if it:'),
      bullet('Fixes a typo, grammar, or phrasing.'),
      bullet('Updates a broken link to its current equivalent.'),
      bullet('Changes formatting, headings, or visual presentation.'),
      bullet('Tightens prose without altering the argument.'),

      callout('When in doubt', 'Log it. The cost of an unnecessary entry is small. The cost of a silent substantive change is editorial drift.'),

      h2('What an Updates entry triggers automatically'),
      bullet("Bumps the article’s effectiveModified to the most recent update date — overrides any modifiedDate in frontmatter."),
      bullet("The byline shows: By Luke · 23 May 2026 · Updated 15 September 2026."),
      bullet("Renders the new entry in the Paper Trail block, newest first."),
      bullet("Emits a CorrectionComment in the JSON-LD so search engines see it as a formal correction."),
      bullet("Triggers IndexNow on deploy to re-crawl."),

      ...codeBlock(`"correction": [
  { "@type": "CorrectionComment", "text": "...", "datePublished": "..." }
]`),

      // 5. Retraction
      h1('5. Retraction — the formal withdrawal mechanism'),
      p("If a piece becomes wrong enough that it should no longer stand, add a retracted block to the frontmatter. The build does the rest."),

      ...codeBlock(`retracted:
  date: 2026-08-12
  reason: "The central claim relied on a 2019 dataset that has since
    been formally withdrawn. The conclusion no longer holds."`),

      h2('What retraction triggers automatically'),
      bullet("Hides the article body. The now-wrong prose is no longer publicly readable."),
      bullet("Renders a formal retraction notice with date and reason."),
      bullet("Keeps the original Paper Trail visible — so readers see how the retracted conclusion was reached."),
      bullet("Adds a “Retracted” eyebrow above the title; strikes through title and standfirst."),
      bullet("Replaces the “Updated [date]” byline element with “Retracted [date].”"),
      bullet("Switches the JSON-LD @type from Article to RetractedArticle — schema.org’s recognised retraction signal."),
      bullet("Removes the piece from the homepage, desk index, RSS feed, and llms.txt."),

      callout('URL stays live', 'Retraction is a recorded act, not a deletion. The URL resolves forever. Other sites that linked to the piece still hit a real page that tells them the story.'),

      // 6. How it renders
      h1('6. How it renders (the visual side)'),

      h2('Standard article'),
      p("src/components/PaperTrail.astro sits at the bottom of every article body. It renders:"),
      bullet("A heavy 2px black top rule — visually separates Paper Trail from the article body so it reads as method, not as more prose."),
      bullet("An eyebrow label “Paper Trail” plus an italic intro: “How this conclusion was reached.”"),
      bullet("A definition list with three rows — Method / Basis / Limits — in a 120px label / fluid value grid."),
      bullet("Basis rendered as a bulleted list, one entry per line. Labels with URLs become underlined links."),
      bullet("An Updates section below, only rendered if at least one update exists, listing each in date / change rows sorted newest-first."),

      h2('Retracted article'),
      bullet("Oxblood “Retracted” eyebrow above the title."),
      bullet("Title and standfirst struck through and faded to grey."),
      bullet("Retraction notice block with oxblood top rule, “Retraction notice” label, lead sentence, italic reason, and a pointer to the preserved Paper Trail."),
      bullet("Paper Trail still renders underneath, unchanged."),
      bullet("Article body slot is not rendered at all."),

      p('The visual hierarchy is deliberate: Paper Trail reads as method, not marketing. Retraction reads as a public, transparent withdrawal — not an apology, not a deletion.'),

      // 7. Workflows
      h1('7. How you use it when writing'),

      h2('A new piece'),
      p("Open src/content/articles/[slug].md, fill the frontmatter including paperTrail, write the body, commit, push. The schema check runs on the first npm run build, and again in Vercel CI on every push."),

      h2('A correction to a live piece'),
      bullet('Edit the article markdown directly (fix the body).'),
      bullet('Append a new entry to paperTrail.updates with the date and a description of the change.'),
      bullet('If the correction adds or removes a basis entry, edit the basis array too.'),
      bullet('Commit and push.'),
      p('Use the substantive-vs-not test above to decide whether an Updates entry is needed. When in doubt, log it.'),

      h2('Retracting a piece'),
      bullet('Add a retracted block with date and reason to the frontmatter.'),
      bullet('Leave the body content in place — the build hides it automatically; you don’t need to delete it.'),
      bullet('Commit and push.'),
      p('The retraction notice replaces the body, the URL stays live, the piece disappears from all listings. No further action needed.'),

      h2('Removing a piece entirely (rare)'),
      p("Almost never the right move. Retraction is the formal pattern; outright file deletion is reserved for edge cases like legal takedown or a piece that should never have shipped. The framework prefers visible withdrawal over silent removal."),

      // The principle
      h1('The principle behind it'),
      p("The whole mechanism is built so the editorial discipline is the path of least resistance. You literally cannot publish without method, basis, and limits. You literally cannot have an empty basis array. You literally cannot show an “Updated” date without logging what changed. You literally cannot retract a piece without a date and a reason. The framework is enforced by the compiler, surfaced to readers in the article, and structured for machines in JSON-LD — all from one block of frontmatter. That’s the spine of the whole publication."),

      rule(),

      // Appendix: complete frontmatter reference
      h1('Appendix — Complete frontmatter reference'),
      p("Every field that can appear on an article, in the order it should be written. Required fields are marked; everything else is optional."),

      ...codeBlock(`---
# IDENTITY (required)
title: "Article title"
slug: "article-slug-in-kebab-case"
desk: "value-and-trade-offs"
  # or: home-and-services | internet-claims | work-and-standards
author: "Luke"
publishDate: 2026-05-23

# OPTIONAL DATES
modifiedDate: 2026-05-30
  # Usually unnecessary — auto-derived from updates / retraction.

# DISPLAY (required)
summary: "One sentence, 20–280 chars."

# OPTIONAL OG OVERRIDE
ogImage: "/og/custom-image.png"
  # Defaults to /og/{slug}.png (auto-generated at build).

# PAPER TRAIL (required)
paperTrail:
  method: "How the conclusion was reached."
  basis:
    - label: "A specific basis entry."
      url: "https://..."           # url is optional
    - label: "Argument from first principles."
      # Use this exact label, alone, for reasoning pieces.
  limits: "What this argument does not cover."
  updates:
    - date: 2026-09-15
      change: "Revised conclusion based on..."

# RETRACTION (optional, sets the whole article to retracted state)
retracted:
  date: 2026-08-12
  reason: "Why the piece can no longer stand."
---`),

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
