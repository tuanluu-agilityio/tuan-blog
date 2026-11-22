# Task 003: i18n routing, content schema and post helpers

Agent: specialist · Model: opus · Branch: task/003-i18n-content · Reviewer: security-reviewer/opus · Risk: high

## Constraints

GC-01, GC-07, GC-08

## Read first

- `docs/plans/phase-1-mvp.md` § Interfaces › Config, › i18n, › Content; § Review Focus (1, 2, 3, 7)
- `memory-bank/decisions.md` D-003, D-004

## Files

Create: `src/i18n/ui.ts`, `src/i18n/utils.ts` (`t`, `localizedPath`, `formatDate`), `src/content.config.ts`,
`src/lib/posts.ts`, `src/lib/getPosts.ts`, `src/content/posts/vi/.gitkeep`, `src/content/posts/en/.gitkeep`,
`tests/unit/i18n.test.ts`, `tests/unit/posts.test.ts`, `tests/unit/schema.test.ts`.
Modify: `astro.config.mjs` (add the `i18n` block only).

## Interfaces

Exactly § Interfaces › i18n and › Content: `locales`, `Locale`, `defaultLocale`, `ui`, `UiKey`, `t`, `localizedPath`,
`formatDate`, `Post`, `filterPublished`, `sortByDateDesc`, `postsForLocale`, `findTranslation`, `getPostsForLocale`.
Also export the Zod object as `postSchema` from `src/content.config.ts` so tests can parse with it.

## Requirements

1. `ui` has every key listed in § Interfaces › i18n for both locales: non-empty, real Vietnamese (with diacritics) and English.
   `t` returns the string; TypeScript rejects unknown keys.
2. `localizedPath` tolerates `path` with or without leading/trailing `/`, collapses duplicate slashes, never emits `/vi/`;
   `base` may be `/tuan-blog` or `/tuan-blog/`.
3. `postSchema`: limits and enum exactly as § Content; `translationKey` matches `^[a-z0-9]+(-[a-z0-9]+)*$`;
   `draft` defaults to `false`; dates coerce from YAML dates and ISO strings.
4. `filterPublished(posts, true)` removes drafts, `(posts, false)` keeps them. `getPostsForLocale` passes `import.meta.env.PROD`
   and returns `sortByDateDesc(postsForLocale(filterPublished(...)))`.
5. `findTranslation` returns the post with the same `translationKey` and `data.lang === targetLocale`, else `undefined`; never the input post.
6. The build still passes with an empty posts collection (no sample posts in this task).

## Tests

- `i18n › localizedPath vi root` `('vi','/','/tuan-blog/')` → `/tuan-blog/`; `en root` → `/tuan-blog/en/`;
  `en post` `('en','posts/hello','/tuan-blog/')` → `/tuan-blog/en/posts/hello/`;
  `slashes` `('vi','//posts//a/','/tuan-blog')` → `/tuan-blog/posts/a/`.
- `i18n › ui has same keys for vi and en`; `no empty strings`.
- `i18n › formatDate` `(new Date('2026-01-05T00:00:00Z'),'vi')` contains `2026`; `'en'` contains `January`.
- `posts › sortByDateDesc newest first, ties by title`; `filterPublished drops drafts in prod only`; `postsForLocale`;
  `findTranslation finds pair`; `returns undefined when missing`; `ignores same-locale post`.
- `schema › accepts valid front matter`; `rejects bad lang` (`'fr'`); `rejects empty title`; `rejects title over 120`;
  `rejects non-kebab translationKey`; `defaults draft to false`.

## Not doing

No pages, layout, switcher UI or sample posts (005, 006). No locale detection or redirects. No RSS or sitemap.
