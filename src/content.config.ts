import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { locales } from './i18n/ui';

export const postSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(200),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  lang: z.enum(locales),
  translationKey: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  draft: z.boolean().default(false),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: postSchema,
});

export const collections = { posts };
