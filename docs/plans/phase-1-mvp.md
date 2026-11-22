# Phase 1: MVP blog live on GitHub Pages

## Goal

A bilingual (vi default at `/`, en at `/en/`) minimal blog built with Astro + TypeScript is live at
`https://tuanluu-agilityio.github.io/tuan-blog/`, deployed by GitHub Actions on every push to `main`.
It has a warm, muted design with light/dark modes and a theme toggle, a shared layout with a language
switcher, a home page listing posts per locale, a post page, an About page and 1-2 sample posts per
language. The quality gate runs real lint, test, build and link checks locally and as the CI check
`check`. Decisions: D-001 to D-004 in `memory-bank/decisions.md`.

Requirements summary (from grill, requirements mode):
- Outcome: a reader opens the public URL, reads posts in vi or en, switches language and theme.
- In scope: scaffold, gate, CI, deploy, design tokens, theme toggle, layout, home, post, About, 404, sample posts.
- Out of scope (phase 2, see backlog): RSS, sitemap, tags/categories, SEO/Open Graph tags, search, comments.
- Constraints touched: GC-01 to GC-09 (all).
- Risk areas entered: Deploy/CI, i18n routing/URLs, design tokens, content schema.
- Acceptance: gate passes; the CI check `check` passes; the live URL returns 200 for vi and en pages; Lighthouse
  Performance and Accessibility >= 95 on home and a post page (mobile).

## Interfaces

Shared contracts. Packages cite these sections; spelling here is binding.

### Config (owner: 002)
- `astro.config.mjs`: `site: 'https://tuanluu-agilityio.github.io'`, `base: '/tuan-blog'`, `trailingSlash: 'always'`,
  `build.format: 'directory'`, `output: 'static'`.
- 003 adds `i18n: { locales: ['vi','en'], defaultLocale: 'vi', routing: { prefixDefaultLocale: false } }` to the same file.

### npm scripts (owner: 001; 002 adds `check:links`; 006 adds `test:dist`)
- `lint` = `eslint . && prettier --check . && astro check`; `test` = `vitest run` (unit tests in `tests/unit/`);
  `build` = `astro build`; `check:links` = `node scripts/check-links.mjs dist /tuan-blog`;
  `test:dist` = `vitest run --config vitest.dist.config.ts` (tests in `tests/dist/`, read the built `dist/`).
- Gate order in `scripts/check.ps1` and `scripts/check.sh`: lint, test, build, check:links, test:dist
  (each task adds its own step). Marker `ALL CHECKS PASSED` last. CI job `check` runs `bash scripts/check.sh`.

### i18n (owner: 003) - `src/i18n/`
- `locales = ['vi','en'] as const`; `type Locale = 'vi' | 'en'`; `defaultLocale: Locale = 'vi'`.
- `ui: Record<Locale, Record<UiKey, string>>`; `t(locale: Locale, key: UiKey): string`.
  Keys used in phase 1: `nav.home`, `nav.about`, `lang.switch`, `theme.toggle`, `posts.heading`, `posts.empty`,
  `post.published`, `post.updated`, `notFound.title`, `notFound.back`, `site.title`, `site.description`.
- `localizedPath(locale: Locale, path: string, base = import.meta.env.BASE_URL): string`:
  joins base, `en/` prefix (only for `en`) and `path`; result always starts with `/tuan-blog/` and ends with `/`.
  Examples: `('vi','/')` -> `/tuan-blog/`; `('en','posts/hello')` -> `/tuan-blog/en/posts/hello/`.
- `formatDate(date: Date, locale: Locale): string` via `Intl.DateTimeFormat` (`vi-VN` / `en-US`, day month year).

### Content (owner: 003)
- Schema file `src/content.config.ts` (Astro 5 content layer; risk area "content schema").
- Collection `posts`, glob loader `src/content/posts/**/*.{md,mdx}`; files live in `src/content/posts/vi/` and `src/content/posts/en/`.
- Fields: `title: string` (1-120 chars), `description: string` (1-200), `pubDate: date`, `updatedDate?: date`,
  `lang: 'vi' | 'en'`, `translationKey: string` (kebab-case), `draft: boolean = false`.
- Slug = file name without extension. Post URL = `localizedPath(lang, 'posts/<slug>')`.
- `type Post = { id: string; data: { title: string; description: string; pubDate: Date; updatedDate?: Date; lang: Locale; translationKey: string; draft: boolean } }`
  (structurally compatible with `CollectionEntry<'posts'>`); `type UiKey = keyof typeof ui.vi`.
- `src/lib/posts.ts` pure helpers (no `astro:content` import, testable in Vitest):
  `filterPublished(posts, isProd: boolean)` drops `draft` only when `isProd`;
  `sortByDateDesc(posts)` by `pubDate` desc, ties by `title` asc;
  `postsForLocale(posts, locale)`; `findTranslation(posts, post, targetLocale): Post | undefined` matches `translationKey`.
- `src/lib/getPosts.ts`: `getPostsForLocale(locale: Locale)` wraps `getCollection('posts')` with the helpers above.

### Design tokens and theme (owner: 004)
- `src/styles/tokens.css`: custom properties `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`,
  `--color-accent`, `--color-accent-contrast`, `--color-border`, `--font-display`, `--font-body`,
  `--space-1` .. `--space-8`, `--measure` (max line length, 65ch).
- Themes: `:root[data-theme="light"]` and `:root[data-theme="dark"]`, each block defining every `--color-*` as a 6-digit hex.
- Starting palette (may be tuned only to pass contrast tests):
  light bg `#F5EFE6`, surface `#EDE3D4`, text `#2B211B`, muted `#6B5A4C`, accent `#A8461F`, accent-contrast `#FFF8F0`, border `#D9CBB8`;
  dark bg `#1C1714`, surface `#26201B`, text `#EFE6DA`, muted `#B5A595`, accent `#E08A5B`, accent-contrast `#1C1714`, border `#3A312A`.
- Fonts (self-hosted via `@fontsource`, OFL, `vietnamese` + `latin` subsets): display `Fraunces Variable`, body `Be Vietnam Pro` (400, 600).
- Theme storage: `localStorage` key `theme`, values `light` | `dark`; no value = follow `prefers-color-scheme`.
- `src/components/ThemeScript.astro`: inline `<script is:inline>` in `<head>`, sets `data-theme` before paint, < 1 KB (D-002).
- `src/components/ThemeToggle.astro`: `<button type="button" data-theme-toggle aria-pressed>` with `aria-label` from `t(locale,'theme.toggle')`.

### Layout (owner: 005)
- `src/layouts/BaseLayout.astro` props: `{ locale: Locale; title: string; description?: string; alternateHref?: string }`.
  Sets `<html lang>`, includes ThemeScript, Header, `<main>`, Footer.
- `src/components/Header.astro` (site title link, nav Home/About, LanguageSwitcher, ThemeToggle).
- `src/components/LanguageSwitcher.astro` props `{ locale: Locale; alternateHref?: string }`: links to `alternateHref`
  if given, else `localizedPath(other, '/')`; has `hreflang` and `lang` attributes (D-003).

## Review Focus

1. Base path: every internal `href`/`src` in `dist/` starts with `/tuan-blog/` and resolves to a file - `check-links` (002) and `localizedPath` tests (003).
2. i18n URLs: vi pages unprefixed, en under `/en/`, no duplicate vi pages under `/vi/` - `build output has expected routes` (006), `localizedPath` tests (003).
3. Translation pairing: switcher goes to the translation or the other locale home, never to a 404 - `findTranslation` tests (003), `LanguageSwitcher` route test (006).
4. Contrast: every text/background pair in both themes meets WCAG AA (4.5:1 text; focus ring via accent >= 3:1); borders are decorative only (~1.4:1) and no control relies on them - `tokens contrast` tests (004). Wording corrected in the phase review (P1R).
5. Client JS budget: the only script is the inline theme script, < 1 KB, no external scripts, no trackers - `js budget` test (006) and review.
6. Deploy workflow: least-privilege permissions (`contents: read`, `pages: write`, `id-token: write`), pinned official actions, no secrets printed - security review of 002.
7. Drafts never published in production builds - `filterPublished` tests (003).

## Tasks

| Task | Title | Depends | Risk | Implementer/model | Reviewer/model | Acceptance | Tests |
|---|---|---|---|---|---|---|---|
| 001 | Scaffold Astro project and real gate | none | low | scaffolder/sonnet | reviewer/sonnet | `npm ci` then `df gate` prints marker with lint, test, build running (Q-01 guard removed) | `smoke: vitest runs`, gate run |
| 002 | CI check, Pages deploy and base-path link check | 001 | high | specialist/opus | security-reviewer/opus | CI job `check` green on the PR; deploy workflow builds on `main`; `check:links` fails on an unprefixed link | `check-links.*` |
| 003 | i18n routing, content schema and post helpers | 002 | high | specialist/opus | security-reviewer/opus | vi at `/`, en at `/en/`; schema rejects invalid front matter; helpers tested | `localizedPath.*`, `t.*`, `formatDate.*`, `posts.*`, `schema.*` |
| 004 | Design tokens, fonts and theme toggle | 001 | high | specialist/opus | security-reviewer/opus | both themes pass contrast; theme persists without flash; fonts self-hosted | `tokens contrast.*`, `theme script.*` |
| 005 | Base layout, header, footer and language switcher | 003, 004 | medium | builder/sonnet | reviewer/opus | every page uses BaseLayout; switcher and toggle present and labelled per locale | `LanguageSwitcher.*`, `BaseLayout.*` |
| 006 | Pages and sample posts | 005 | medium | builder/sonnet | reviewer/opus | home, post, About in vi/en and 404 build; 1-2 sample posts per locale; JS budget held | `build output has expected routes`, `js budget`, `LanguageSwitcher route` |
| 007 | Phase verification on the live site | 006 | low | verifier/sonnet | reviewer/sonnet | evidence in `docs/testing/phase-1/`: live URLs 200, Lighthouse >= 95 (Perf, A11y) mobile, 320px screenshots, both themes | checklist in package |
| 008 | Post meta spacing and favicon (defects from 007) | 007 | low | builder/sonnet | reviewer/sonnet | meta shows a space before the date; favicon served under base | `post meta has a space before the date`, `favicon is linked under the base path` |

Task 004 touches design tokens (risk area) and so is high. 003 depends on 002 because both edit `astro.config.mjs`.
Tasks run one at a time in id order; 002, 003, 004 and 006 each edit `package.json` and `scripts/check.*`, so each
starts from the previous merge. Component tests in 005 use Astro's Container API in Vitest.

## Owner actions

- After 002 merges: Settings -> Pages -> Source = GitHub Actions (or allow the orchestrator to run `gh api` for it).
- After 002 merges: mark `check` as a required status check on `main` (branch protection).

## Exit checklist

- [x] All tasks merged - PRs #2-#9 (tasks 001-008), plan PR #1
- [x] Quality gate passes - P1R reviewer gate: ALL CHECKS PASSED on 838faab
- [x] Memory bank updated - `df memory lint`: memory: ok (task 008 commit)
- [x] CI check `check` is green on `main` and marked required - gh run list: CI success on 838faab; branch protection contexts ["check"] (P1R)
- [x] Live site returns 200 for `/tuan-blog/` and `/tuan-blog/en/` - docs/testing/phase-1/http-status.txt
- [x] Lighthouse mobile Performance and Accessibility >= 95 on home and one post - lighthouse-home.json, lighthouse-post.json: 100/100
- [x] No client JS besides the inline theme script; no third-party requests - test `js budget`, `no third-party requests`; Lighthouse network audit
- [x] Q-01 closed - D-008 (task 001 removed the gate guard)
