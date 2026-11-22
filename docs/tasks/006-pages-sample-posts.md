# Task 006: Pages and sample posts

Agent: builder · Model: sonnet · Branch: task/006-pages-sample-posts · Reviewer: reviewer/opus · Risk: medium

## Constraints

GC-01, GC-02, GC-03, GC-04, GC-05, GC-07, GC-08

## Read first

- `docs/plans/phase-1-mvp.md` § Interfaces (all subsections), § Review Focus (2, 3, 5)
- `memory-bank/decisions.md` D-001, D-003
- Props of `src/layouts/BaseLayout.astro`; exports of `src/lib/getPosts.ts`, `src/lib/posts.ts`, `src/i18n/utils.ts`

## Files

Create: `src/pages/posts/[slug].astro`, `src/pages/en/posts/[slug].astro`, `src/pages/404.astro`, `src/components/PostList.astro`,
`src/layouts/PostLayout.astro`, `src/content/posts/vi/xin-chao.md`, `src/content/posts/en/hello-world.md`
(both `translationKey: hello-world`), `src/content/posts/vi/ghi-chu-dau-tien.md` (vi only), `vitest.dist.config.ts`,
`tests/dist/routes.test.ts`. Remove the `.gitkeep` files in `src/content/posts/*/`.
Modify: `src/pages/index.astro`, and the heading-only placeholders from task 005 (D-013) `src/pages/en/index.astro`, `src/pages/about.astro`, `src/pages/en/about.astro`, `src/i18n/ui.ts` (new keys only if needed, both locales), `package.json` (`test:dist`),
`scripts/check.ps1`, `scripts/check.sh` (step `dist` after `links`).

## Interfaces

Consumes everything in § Interfaces. Produces the script `test:dist` as in § npm scripts. Post URLs follow § Content.

## Requirements

1. Home (vi `/`, en `/en/`): heading `posts.heading`; `PostList` of `getPostsForLocale(locale)` showing title link, date via `formatDate`
   and description; `posts.empty` when there are none.
2. Post pages: `getStaticPaths` builds each locale only from that locale's posts; render title, `post.published` date, and
   `post.updated` date when present; content in `<article>` limited to `--measure`; `alternateHref` = translation URL from
   `findTranslation`, else undefined.
3. About pages: a short placeholder bio per locale (the owner edits later), same layout.
4. `404.astro`: vi and en text from `ui` (`notFound.title`, `notFound.back`) with links to both homes.
5. Sample posts: valid front matter, short realistic text, Vietnamese with full diacritics; `xin-chao` dated after `ghi-chu-dau-tien`.
6. No client JS besides the theme script; no third-party URLs in the output.
7. The glob loader sets `post.id` to the path (`vi/xin-chao`); the URL slug is the last `/` segment of `id`.
   `getStaticPaths` must use `getPostsForLocale` (never raw `getCollection`) so drafts stay out of production builds.

## Tests

`tests/dist/routes.test.ts` (reads `dist/`):
- `build output has expected routes`: `index.html`, `en/index.html`, `posts/xin-chao/index.html`, `posts/ghi-chu-dau-tien/index.html`,
  `en/posts/hello-world/index.html`, `about/index.html`, `en/about/index.html`, `404.html` exist; no `vi/` directory.
- `LanguageSwitcher route › paired post links to its translation` (`posts/xin-chao` → `/tuan-blog/en/posts/hello-world/`);
  `unpaired post links to en home` (`posts/ghi-chu-dau-tien` → `/tuan-blog/en/`).
- `js budget › only the inline theme script, under 1024 bytes, no script src` across all HTML files.
- `no third-party requests › no http(s) URLs in src/href of link, script, img, iframe`.
- `home lists newest first` in vi (`xin-chao` before `ghi-chu-dau-tien`).

## Not doing

No RSS, sitemap, tags, pagination or OG tags (phase 2). No comments, search or analytics.
