# Decisions

One line per decision. Long decisions go to `decisions/D-NNN.md` and are linked from the Source column.

| ID | Date | Decision | Source |
|---|---|---|---|
| D-001 | 2026-11-23 | Phase 1 scope = MVP live on GitHub Pages: Astro scaffold + real gate + CI, warm design tokens with light/dark, shared layout with vi/en switcher, home with post list, post page, About page, 1-2 sample posts per language, Pages deploy. RSS, sitemap, tags, SEO/OG deferred to phase 2. | P1 grill |
| D-002 | 2026-11-23 | Light/dark: follows prefers-color-scheme by default plus a toggle that persists in localStorage; one inline no-flash script under 1 KB is the only allowed client JS (documented exception to GC-03). | P1 grill |
| D-003 | 2026-11-23 | Untranslated posts: each locale lists only posts in that locale; posts pair via a shared translationKey; the language switcher links to the translation if it exists, otherwise to the other locale home page. | P1 grill |
| D-004 | 2026-11-23 | Hosting: GitHub Pages project site, site https://tuanluu-agilityio.github.io, base /tuan-blog; all internal links and assets go through the base path (custom domain possible later by config only). | P1 grill |
| D-005 | 2026-11-23 | Phase 1 split into 7 tasks (001-007); shared contracts live in docs/plans/phase-1-mvp.md § Interfaces; post-build checks run as gate steps check:links and test:dist after build. | P1 plan |
| D-006 | 2026-11-23 | Owner delegated decisions: run to completion without asking, decide the recommended option, log issues and report at the end. | owner message |
| D-007 | 2026-11-23 | Bootstrap CI: a minimal .github/workflows/ci.yml with job check (runs scripts/check.sh; npm steps only when package-lock.json exists) lands with the phase 1 plan so the required check exists from PR #1; task 002 turns it into its final form. | P1 merge refused: no checks |
| D-008 | 2026-11-23 | Toolchain from task 001: Astro 7.4, ESLint 10 flat config (+ @eslint/js), Prettier 3, TypeScript 6, Vitest 5; .prettierignore also excludes .github and CLAUDE.md. Q-01 closed (gate guard removed). | task 001 |
| D-009 | 2026-11-23 | .gitattributes `* text=auto eol=lf` (png/woff2 binary) so Prettier passes on Windows CRLF checkouts; check-links strips HTML comments and inline script bodies before scanning. | task 002 |
| D-010 | 2026-11-23 | Orchestrator (delegated, D-006) enabled GitHub Pages with build_type=workflow and branch protection on main requiring status check `check`; first deploy live (HTTP 200). | task 002 owner actions |
| D-011 | 2026-11-23 | Astro 7 content layer: z from astro/zod (zod 4); formatDate uses timeZone UTC; post helpers generic <T extends Post>; post id = path (vi/slug), slug = last segment. | task 003 |
