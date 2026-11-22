# Task 005: Base layout, header, footer and language switcher

Agent: builder · Model: sonnet · Branch: task/005-layout-switcher · Reviewer: reviewer/opus · Risk: medium

## Constraints

GC-03, GC-04, GC-05, GC-08

## Read first

- `docs/plans/phase-1-mvp.md` § Interfaces › i18n, › Design tokens and theme, › Layout; § Review Focus (3, 5)
- `memory-bank/decisions.md` D-003
- Exports of `src/i18n/utils.ts`, `src/i18n/ui.ts`, `src/components/ThemeScript.astro`, `src/components/ThemeToggle.astro`

## Files

Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`,
`src/components/LanguageSwitcher.astro`, `tests/unit/layout.test.ts`.
Modify: `src/pages/index.astro` (use BaseLayout with `locale="vi"`).

## Interfaces

Consumes `t`, `localizedPath`, `Locale`, `ThemeScript`, `ThemeToggle`, global styles and fonts.
Produces `BaseLayout` and `LanguageSwitcher` exactly as § Interfaces › Layout.

## Requirements

1. `BaseLayout`: `<html lang={locale}>`; `<title>` = `${title} · ${t(locale,'site.title')}`, or only the site title when `title`
   equals it; `<meta name="description">` = `description ?? t(locale,'site.description')`; viewport meta; ThemeScript first in `<head>`;
   skip link to `#main`; `<main id="main">`; imports the global styles and fonts once.
2. `Header`: site title linking to `localizedPath(locale,'/')`; `<nav>` labelled by a `ui` string, with Home and About
   (`localizedPath(locale,'about')`); `aria-current="page"` on the current item (from `Astro.url.pathname`); LanguageSwitcher; ThemeToggle.
3. `LanguageSwitcher`: one link to the other locale; text is that locale's own name (`Tiếng Việt` / `English`) with `lang` and
   `hreflang` set to the target locale; href = `alternateHref ?? localizedPath(other,'/')`.
4. `Footer`: `© <build year> Tuan Luu`; no external links or scripts.
5. No hard-coded UI strings outside `src/i18n/ui.ts`, except the locale names in requirement 3. New keys go in both locales.
6. Header wraps cleanly at 320px (no horizontal scroll, no JS menu).

## Tests

Vitest with Astro's `experimental_AstroContainer`:
- `LanguageSwitcher › vi without alternate links to /tuan-blog/en/`; `en without alternate links to /tuan-blog/`;
  `uses alternateHref when given`; `sets lang and hreflang`.
- `BaseLayout › sets html lang`; `composes title`; `falls back to site description`; `has skip link and main#main`;
  `contains exactly one script and it is the theme script`.
- `Header › marks current nav item with aria-current`.

## Not doing

No post list, post page, About content or 404 (006). No mobile menu JS, search or social links.
