# Backlog

Ideas and deferred work, one line each. Not in scope until promoted to a phase plan.

- Phase 2 candidates: RSS feed per locale, sitemap, tags/categories, SEO and Open Graph tags (deferred by D-001).
- Later: site search, comments (would need a GC-02-compatible, tracker-free option), custom domain (D-004 allows by config).
- Add .gitattributes (eol=lf for text files) to stop LF/CRLF warnings on Windows (task 001 report).
- check-links: an inline script containing a literal `<!--` could hide real links from the scan (task 002 review, low impact).
- Running check-links from Git Bash needs MSYS_NO_PATHCONV=1 (path rewriting of /tuan-blog); npm script and CI unaffected.
- Add @astrojs/mdx before the first .mdx post (glob already matches .mdx).
- Bump GitHub Actions to majors that run on Node 24 (deploy-pages@v4 warns: Node 20 deprecated).
- Owner to review UI wording in src/i18n/ui.ts (site.title "Blog của Tuấn" / "Tuan's Blog").
- layout.test.ts: two LanguageSwitcher test names differ from package 005 wording (assertions equivalent) - rename for traceability.
- Owner to replace placeholder About bios (src/pages/about.astro, src/pages/en/about.astro) and sample posts with real content.
