# Task 009: Pages CMS editor config

Agent: orchestrator (config only) · Model: opus · Branch: task/009-pages-cms · Reviewer: reviewer/sonnet · Risk: low

## Constraints

GC-01, GC-02, GC-03, GC-07, GC-08

## Read first

- `src/content.config.ts` (`postSchema`)
- Pages CMS docs: https://pagescms.org/docs/configuration/

## Files

Create: `.pages.yml`, `public/images/.gitkeep`.

## Interfaces

Consumes `postSchema`. Produces no code interface; Pages CMS reads `.pages.yml` from the repo root on `main`.

## Requirements

1. Two collections: `posts-vi` (`src/content/posts/vi`) and `posts-en` (`src/content/posts/en`), `format: yaml-frontmatter`, `.gitkeep` excluded.
2. Fields mirror `postSchema`: `title` string max 120, `description` text max 200, `pubDate` date `yyyy-MM-dd`,
   `lang` select fixed to the collection's locale, `translationKey` with the schema's kebab regex, `draft` boolean default false,
   `body` rich-text markdown. All required ones `required: true`.
3. `updatedDate` is not a form field (an empty value would fail `z.coerce.date()`); `settings.content.merge: true` keeps it
   when it was set by hand.
4. Media: `public/images` served as `/tuan-blog/images` (base path), images only.
5. No change to the site output, schema or CI.

## Tests

- Gate passes unchanged (no product code changes); `prettier --check` covers `.pages.yml`.
- Reviewer checks each field against `postSchema` by reading both files.

## Not doing

No Decap CMS, OAuth server or admin page in the site. No schema change.
