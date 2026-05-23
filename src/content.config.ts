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
      sources: z.string().min(1, 'Paper Trail requires sources.'),
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
  }),
});

export const collections = { desks, articles };
