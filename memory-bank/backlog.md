# Backlog

Ideas and deferred work, one line each. Not in scope until promoted to a phase plan.

- Phase 2 candidates: RSS feed per locale, sitemap, tags/categories, SEO and Open Graph tags (deferred by D-001).
- Later: site search, comments (would need a GC-02-compatible, tracker-free option), custom domain (D-004 allows by config).
- Add .gitattributes (eol=lf for text files) to stop LF/CRLF warnings on Windows (task 001 report).
- check-links: an inline script containing a literal `<!--` could hide real links from the scan (task 002 review, low impact).
- Running check-links from Git Bash needs MSYS_NO_PATHCONV=1 (path rewriting of /tuan-blog); npm script and CI unaffected.
