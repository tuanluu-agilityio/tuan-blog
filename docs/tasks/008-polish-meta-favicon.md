# Task 008: Post meta spacing and favicon

Agent: builder · Model: sonnet · Branch: task/008-polish-meta-favicon · Reviewer: reviewer/sonnet · Risk: low

## Constraints

GC-02, GC-03, GC-06, GC-08

## Read first

- `docs/testing/phase-1/README.md` (defects noted by task 007)
- `docs/plans/phase-1-mvp.md` § Interfaces › Layout, › Design tokens and theme
- `src/layouts/PostLayout.astro`, `src/layouts/BaseLayout.astro` (head section)

## Files

Modify: `src/layouts/PostLayout.astro`, `src/layouts/BaseLayout.astro`, `tests/dist/routes.test.ts`.
Create: `public/favicon.svg`.

## Interfaces

None new. The favicon is served at `/tuan-blog/favicon.svg`.

## Requirements

1. Post meta renders a space between the label and the date in both locales, e.g. `Đăng ngày 20 tháng 11, 2026` / `Published on November 20, 2026`
   (same for `post.updated`).
2. `public/favicon.svg`: a simple original monogram "T" in the accent colour `#A8461F` on a transparent or `#F5EFE6` rounded square; under 1 KB; no external references, no script.
3. `BaseLayout` adds `<link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`}>` (resolving to `/tuan-blog/favicon.svg`), so browsers stop requesting `/favicon.ico` at the host root.

## Tests

In `tests/dist/routes.test.ts`:
- `post meta has a space before the date` - in `posts/xin-chao/index.html` the text content of the meta element matches `/Đăng ngày \d/`; in `en/posts/hello-world/index.html` it matches `/Published on \S/`.
- `favicon is linked under the base path` - every HTML file has `link rel="icon"` with href `/tuan-blog/favicon.svg`, and `dist/favicon.svg` exists and is under 1024 bytes with no `<script`.
- `check:links` passes (the favicon href resolves).

## Not doing

No PNG/ICO icon sets, web manifest or Open Graph images (phase 2). No other style changes.
