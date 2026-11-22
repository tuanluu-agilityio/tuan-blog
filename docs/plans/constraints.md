# Global constraints

Rules every task in tuan-blog must follow. Task packages cite these by id.

GC-01 Static output only: no runtime backend or database.
GC-02 No third-party trackers or analytics, no advertising cookies (reader privacy).
GC-03 Minimal client-side JavaScript (0 KB by default unless truly needed); Lighthouse Performance and Accessibility >= 95.
GC-04 Accessibility: WCAG 2.1 AA, including colour contrast of the warm, muted palette.
GC-05 Responsive from 320px wide; supports light and dark modes.
GC-06 Only openly licensed fonts and dependencies (OFL, MIT, ...); fonts are self-hosted, no Google Fonts CDN.
GC-07 Posts are Markdown/MDX files in the repo; no external CMS.
GC-08 Bilingual Vietnamese and English: all UI and posts support vi and en via Astro i18n routing (vi default at /, en at /en/); no hard-coded single-language UI strings.
GC-09 Deployed to GitHub Pages via GitHub Actions, with correct site and base in the Astro config.
