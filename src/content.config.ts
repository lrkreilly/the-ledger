import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const DESK_SLUGS = [
  'value-and-trade-offs',
  'home-and-services',
  'internet-claims',
  'work-and-standards',
] as const;

const desks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/desks' }),
  schema: z.object({
    name: z.string(),
    slug: z.enum(DESK_SLUGS),
    numeral: z.string(),
    lens: z.string(),
    dominantQuestion: z.string(),
    about: z.string(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    desk: z.enum(DESK_SLUGS),
    author: z.string().default('Luke'),
    publishDate: z.coerce.date(),
    modifiedDate: z.coerce.date().optional(),
    summary: z.string().min(20).max(280),
    ogImage: z.string().optional(),
    paperTrail: z.object({
      method: z.string().min(1, 'Paper Trail requires a method.'),
      // basis is an array — enumeration over gesturing. "Basis" rather than
      // "sources" because Ledger pieces often rest on a mix of public docs,
      // pattern analysis, and first-principles reasoning. Not all of that is
      // sourcing in the strict sense. For reasoning pieces, the array must
      // still contain one explicit entry declaring that stance (see
      // .cursorrules). The array can never be empty.
      basis: z
        .array(
          z.object({
            label: z.string().min(1, 'Each basis entry needs a label.'),
            url: z.string().url().optional(),
          }),
        )
        .min(1, 'Paper Trail requires at least one basis entry.'),
      limits: z.string().min(1, 'Paper Trail requires limits.'),
      updates: z
        .array(
          z.object({
            date: z.coerce.date(),
            change: z.string(),
          }),
        )
        .default([]),
    }),
    // When set, the article is treated as retracted: body is hidden, a
    // retraction notice replaces it, JSON-LD switches to RetractedArticle,
    // and the piece is removed from listings (desk index, homepage cards,
    // RSS, llms.txt). The URL stays live; the original Paper Trail is still
    // shown so readers see what the piece argued and why it's retracted.
    retracted: z
      .object({
        date: z.coerce.date(),
        reason: z.string().min(1, 'A retracted article requires a reason.'),
      })
      .optional(),
  }),
});

export const collections = { desks, articles };
