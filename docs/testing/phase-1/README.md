# Phase 1 verification on the live site

Date: 2026-11-23 (UTC 2026-11-22 21:48 onward) · OS: Windows 11 (10.0.26300) · Node v24.20.0 · Lighthouse 13.6.0 (`npx lighthouse@latest`) ·
Chrome (installed, headless) · Playwright (temporary install outside the repo, not in package.json) · Site: https://tuanluu-agilityio.github.io/tuan-blog/

| # | Requirement | Result | Evidence |
|---|---|---|---|
| 1 | Latest `deploy.yml` run on `main` succeeded | PASS | Run https://github.com/tuanluu-agilityio/tuan-blog/actions/runs/45074035205 (success, sha 12a1367); `gh run list --workflow deploy.yml --branch main` |
| 2 | HTTP 200 on 6 URLs; 404 + custom page on `/does-not-exist/` | PASS | `http-status.txt` (6x 200, 404 with the vi "Không tìm thấy trang" page body) |
| 3 | Lighthouse mobile, Perf >= 95 and A11y >= 95 on home and `posts/xin-chao/` | PASS | `lighthouse-home.json`: Perf 100, A11y 100. `lighthouse-post.json`: Perf 100, A11y 100 |
| 4 | Screenshots 320 and 1280, light and dark, home and post; no horizontal scroll | PASS | `screenshots/{home,post}-{320,1280}-{light,dark}.png`, `scroll-width.json`: scrollWidth == clientWidth in all 8 cases (hscroll false); `data-theme` matched the emulated scheme each time |
| 5 | Only `tuanluu-agilityio.github.io` requests | PASS (note) | Lighthouse `network-requests` audit: 7 requests per page (document, 1 CSS, 4 woff2, favicon), all on `tuanluu-agilityio.github.io`, 0 scripts requested. Note: `/favicon.ico` is requested at the host root and returns 404 (`curl`), outside `/tuan-blog/`; same host, no third party |
| 6 | Switcher: `xin-chao` -> `/tuan-blog/en/posts/hello-world/`; `ghi-chu-dau-tien` -> `/tuan-blog/en/` | PASS | `language-switcher.txt` (real click in headless Chrome, both landed with HTTP 200); hrefs also in `http-status.txt` |

## Commands

- `gh run list --workflow deploy.yml --branch main --limit 2 --json url,conclusion,status,headSha`
- `curl -s -o /dev/null -w '%{http_code}' <url>` for each path (see `http-status.txt`)
- `CHROME_PATH=<chrome.exe> npx lighthouse@latest <url> --form-factor=mobile --only-categories=performance,accessibility --chrome-flags="--headless=new" --output=json` (default mobile throttling; JSON saved untrimmed, under 500 KB each)
- Playwright script (kept outside the repo): Chromium viewport 320x800 and 1280x800, `colorScheme` light/dark, `fullPage` screenshot, `scrollWidth` vs `clientWidth` of `documentElement`; then click `a.lang-switch` on the two vi posts.

## Observations (not fixed, for the orchestrator)

1. Minor copy/rendering defect: vi post meta renders "Đăng ngày20 tháng 11, 2026" with no space between the label and the `<time>` (HTML: `<span>Đăng ngày<time ...>`). Visible in `screenshots/post-320-dark.png`. Not a requirement failure.
2. `https://tuanluu-agilityio.github.io/favicon.ico` 404s (browser default request; no `<link rel="icon">`). Harmless to the checklist; a console 404 may appear.

## Open owner steps

None for this package. Exit-checklist items outside this package (branch protection requiring `check`, memory bank, Q-01) were not verified here.
