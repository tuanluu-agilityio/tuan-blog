# Task 001: Scaffold Astro project and real gate

Agent: scaffolder · Model: sonnet · Branch: task/001-scaffold-astro · Reviewer: reviewer/sonnet · Risk: low

## Constraints

GC-01, GC-03, GC-06, GC-07

## Read first

- `docs/plans/phase-1-mvp.md` § Interfaces › npm scripts
- `scripts/check.ps1`, `scripts/check.sh` (whole files, ~25 lines each)
- `memory-bank/activeContext.md` § Waiting on owner (Q-01)

## Files

Create: `package.json`, `package-lock.json`, `astro.config.mjs` (minimal: `output: 'static'` only; 002 adds site/base),
`tsconfig.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `vitest.config.ts`, `src/pages/index.astro`
(placeholder `<h1>tuan-blog</h1>`), `src/env.d.ts` if Astro needs it, `tests/unit/smoke.test.ts`, `.nvmrc` (`22`).
Modify: `scripts/check.ps1`, `scripts/check.sh`, `.gitignore` (add `dist/`, `.astro/`, `node_modules/` if missing).

## Interfaces

Produces the npm scripts `lint`, `test`, `build` exactly as in § Interfaces › npm scripts.

## Requirements

1. Latest stable Astro with TypeScript `strict` (extend `astro/tsconfigs/strict`). Package manager npm; commit the lockfile.
2. Dev dependencies: `eslint` (flat config) with `eslint-plugin-astro` and `typescript-eslint`, `prettier` with
   `prettier-plugin-astro`, `@astrojs/check`, `typescript`, `vitest`. All MIT/Apache/ISC/BSD licensed.
3. `vitest.config.ts` uses Astro's `getViteConfig` and includes only `tests/unit/**/*.test.ts`.
4. `.prettierignore` covers `dist`, `.astro`, `node_modules`, `package-lock.json`, `memory-bank`, `docs`, `.darkforge`.
   ESLint ignores `dist`, `.astro`, `node_modules`.
5. Gate scripts: remove the Q-01 `package.json` guard; steps in order `lint` (`npm run lint`), `test` (`npm test`),
   `build` (`npm run build`); keep the existing failure handling and the `ALL CHECKS PASSED` line last.
6. `package.json`: `"private": true`, `"type": "module"`, `"engines": { "node": ">=22" }`.
7. No client-side JS, no integrations beyond what Astro needs to build.

## Tests

- `tests/unit/smoke.test.ts` › `smoke: vitest runs` - asserts `1 + 1 === 2` (proves the runner and config load).
- Gate: `df gate` prints `ALL CHECKS PASSED`; its output shows lint, test and build ran.
- Failure path: temporarily add an unformatted file, confirm `npm run lint` fails, remove it (record in the report).

## Not doing

No i18n, site/base, CI workflows, styles, fonts, layouts or content (tasks 002-006). No Tailwind or UI framework.
