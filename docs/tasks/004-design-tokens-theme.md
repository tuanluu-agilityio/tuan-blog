# Task 004: Design tokens, fonts and theme toggle

Agent: specialist · Model: opus · Branch: task/004-design-tokens-theme · Reviewer: security-reviewer/opus · Risk: high

## Constraints

GC-03, GC-04, GC-05, GC-06

## Read first

- `docs/plans/phase-1-mvp.md` § Interfaces › Design tokens and theme; § Review Focus (4, 5)
- `memory-bank/decisions.md` D-002

## Files

Create: `src/styles/tokens.css`, `src/styles/global.css` (reset, base typography, link and focus styles using tokens),
`src/styles/fonts.ts` (imports the `@fontsource` CSS), `src/components/ThemeScript.astro`, `src/components/ThemeToggle.astro`,
`src/lib/contrast.ts`, `src/lib/themeScript.ts`, `tests/unit/tokens.test.ts`, `tests/unit/theme-script.test.ts`.
Modify: `package.json` (font dependencies), `src/pages/index.astro` (import styles, render ThemeScript and a toggle for a manual check).

## Interfaces

- § Interfaces › Design tokens and theme (property names, theme selectors, storage key, component markup).
- `contrastRatio(hexA: string, hexB: string): number` (WCAG 2.1 relative luminance);
  `parseThemeTokens(css: string): Record<'light' | 'dark', Record<string, string>>`.
- `THEME_SCRIPT: string` exported from `src/lib/themeScript.ts`; `ThemeScript.astro` renders `<script is:inline set:html={THEME_SCRIPT} />`.
- `ThemeToggle.astro` props `{ label: string }` (005 passes `t(locale, 'theme.toggle')`).

## Requirements

1. The palette starts from the plan values; change a value only to meet requirement 2, and list changes in the report.
2. Contrast per theme: text/bg, text/surface, muted/bg, muted/surface, accent/bg, accent-contrast/accent ≥ 4.5; accent/bg ≥ 3 for the focus ring (covered by 4.5).
3. Fonts: `@fontsource-variable/fraunces` and `@fontsource/be-vietnam-pro` (weights 400, 600), `latin` and `vietnamese` subsets only,
   `font-display: swap`; `--font-display` and `--font-body` end with system fallbacks. No external font URLs.
4. `THEME_SCRIPT` reads `localStorage.theme`; `light`/`dark` wins, else `matchMedia('(prefers-color-scheme: dark)')`;
   sets `document.documentElement.dataset.theme`; on `DOMContentLoaded` wires every `[data-theme-toggle]` to flip the theme,
   save it and set `aria-pressed` (`"true"` when dark). Storage access in try/catch, so blocked storage still follows the system. ≤ 1024 bytes.
5. Visible `:focus-visible` style (2px accent outline, offset 2px); `prefers-reduced-motion: reduce` disables transitions.
6. Base CSS works from 320px: no horizontal scroll, body text ≥ 16px (1rem), prose width `--measure`.

## Tests

- `tokens contrast › <theme> <pair>`: one test per pair in requirement 2 per theme, parsing `src/styles/tokens.css` from disk.
- `tokens › both themes define every --color-* token as 6-digit hex`.
- `contrast › contrastRatio('#000000','#FFFFFF') is 21`; `('#777777','#FFFFFF') ≈ 4.48 (±0.01)`; `('#999999','#FFFFFF') < 4.5`.
- `theme script › under 1024 bytes`; `uses stored theme`; `falls back to prefers-color-scheme`; `survives localStorage throwing`;
  `toggle flips, persists and sets aria-pressed`. Run `THEME_SCRIPT` with `new Function` against stub `window`, `document`, `localStorage`.

## Not doing

No layout, header or footer (005). No per-page styles, CSS framework, animation library or icon font.
