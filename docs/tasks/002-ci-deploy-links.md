# Task 002: CI check, Pages deploy and base-path link check

Agent: specialist · Model: opus · Branch: task/002-ci-deploy-links · Reviewer: security-reviewer/opus · Risk: high

## Constraints

GC-01, GC-02, GC-09

## Read first

- `docs/plans/phase-1-mvp.md` § Interfaces › Config, § Interfaces › npm scripts, § Review Focus (1, 6), § Owner actions
- `memory-bank/decisions.md` D-004

## Files

Create: `.github/workflows/deploy.yml`, `scripts/check-links.mjs`,
`tests/unit/check-links.test.ts`, `tests/fixtures/links/` (small HTML fixtures).
Modify: `.github/workflows/ci.yml` (bootstrap version from the plan PR, D-007: replace with requirement 3 and drop the `hashFiles` conditions), `astro.config.mjs`, `package.json` (script `check:links`), `scripts/check.ps1`, `scripts/check.sh`.

## Interfaces

- Config values exactly as § Interfaces › Config (site, base, trailingSlash, build.format, output).
- `scripts/check-links.mjs` exports `checkLinks(distDir: string, base: string): Promise<LinkError[]>` where
  `LinkError = { file: string; attr: 'href' | 'src'; value: string; reason: 'missing-base' | 'not-found' }`.
  CLI `node scripts/check-links.mjs <distDir> <base>` prints one line per error and exits 1 if any, else prints `links: ok`.

## Requirements

1. `checkLinks` scans every `*.html` under `distDir`, every `href`/`src` attribute value.
   Ignore: URLs with a scheme (`http:`, `https:`, `mailto:`, `tel:`, `data:`), protocol-relative `//`, pure `#fragment`.
   Root-relative values not starting with `${base}/` → `missing-base`.
   Values starting with `${base}/`: strip base, query and fragment; must map to an existing file, or to `index.html`
   inside an existing directory, else `not-found`. Relative values (`./x`, `x`) resolve against the file's directory.
2. Node built-ins only (a regex attribute scan is acceptable; no new dependency).
3. `ci.yml`: name `CI`; triggers `pull_request` and `push` to `main`; one job with id and name `check` on `ubuntu-latest`:
   `actions/checkout@v4`, `actions/setup-node@v4` (`node-version-file: .nvmrc`, `cache: npm`), `npm ci`, `bash scripts/check.sh`.
   `permissions: contents: read`.
4. `deploy.yml`: triggers `push` to `main` and `workflow_dispatch`; job `build` (checkout, setup-node, `npm ci`,
   `npm run build`, `actions/upload-pages-artifact@v3` with `path: dist`) and job `deploy`
   (`needs: build`, `environment: github-pages` with `url: ${{ steps.deployment.outputs.page_url }}`, `actions/deploy-pages@v4` id `deployment`).
   Permissions `contents: read`, `pages: write`, `id-token: write`; `concurrency: { group: pages, cancel-in-progress: false }`.
5. Only official `actions/*` actions; no secrets; no third-party actions.
6. Gate scripts: add step `links` (`npm run check:links`) after `build`.

## Tests

`tests/unit/check-links.test.ts` (fixtures under `tests/fixtures/links/`):
- `check-links › accepts prefixed links that exist` → `[]`.
- `check-links › flags root-relative link without base` (`/about/`) → one error, reason `missing-base`.
- `check-links › flags prefixed link to missing page` (`/tuan-blog/nope/`) → one error, reason `not-found`.
- `check-links › resolves directory links to index.html` (`/tuan-blog/en/` with `en/index.html`) → `[]`.
- `check-links › ignores external, mailto and fragment links` → `[]`.
- `check-links › strips query and fragment` (`/tuan-blog/?a=1#x`) → `[]`.
- Gate run prints `links: ok` and `ALL CHECKS PASSED` on the placeholder page; CI job `check` is green on the PR.

## Not doing

No i18n config (003). No branch protection or Pages settings changes (owner action). No Lighthouse in CI.
