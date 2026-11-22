# Task 007: Phase verification on the live site

Agent: verifier · Model: sonnet · Branch: task/007-phase-verification · Reviewer: reviewer/sonnet · Risk: low

## Constraints

GC-02, GC-03, GC-04, GC-05, GC-08, GC-09

## Read first

- `docs/plans/phase-1-mvp.md` § Goal, § Review Focus, § Exit checklist

## Files

Create: `docs/testing/phase-1/README.md` (checklist with results and the commands used) and raw evidence in
`docs/testing/phase-1/` (`lighthouse-*.json`, `http-status.txt`, `screenshots/*.png`). No product code changes.

## Interfaces

None produced. Consumes the live site `https://tuanluu-agilityio.github.io/tuan-blog/`.

## Requirements

1. Precondition: the latest `deploy.yml` run on `main` succeeded (record its URL from `gh run list --workflow deploy.yml`).
   If Pages is not enabled or the run failed, stop and report.
2. HTTP 200 for `/tuan-blog/`, `/tuan-blog/en/`, `/tuan-blog/about/`, `/tuan-blog/en/about/`, `/tuan-blog/posts/xin-chao/`,
   `/tuan-blog/en/posts/hello-world/`; HTTP 404 with the custom 404 page for `/tuan-blog/does-not-exist/`.
3. Lighthouse (`npx lighthouse@latest`, mobile form factor, headless Chrome) on the vi home and `posts/xin-chao/`:
   Performance ≥ 95 and Accessibility ≥ 95; save the JSON reports.
4. Screenshots at 320px and 1280px wide, light and dark (`prefers-color-scheme` emulation), for the home page and one post;
   record whether horizontal scrolling occurs (`scrollWidth > clientWidth`).
5. Network: each page requests only `tuanluu-agilityio.github.io` URLs (from the Lighthouse network-requests audit).
6. Language switcher on the live site: `xin-chao` → `/tuan-blog/en/posts/hello-world/`; `ghi-chu-dau-tien` → `/tuan-blog/en/`.

## Tests

`docs/testing/phase-1/README.md` holds one row per requirement with PASS/FAIL and the evidence file. A FAIL is reported, not fixed.

## Not doing

No code edits and no tuning to reach scores; failures go back to the orchestrator as defects.
