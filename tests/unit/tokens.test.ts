import { describe, expect, test } from 'vitest';
import { contrastRatio, parseThemeTokens } from '../../src/lib/contrast';

// Read the real file from disk. Vitest stubs CSS imports (even `?raw`) to '', and @types/node is not
// installed, so node:fs is loaded through an untyped specifier. Path is relative to the repo root.
const fsModule = 'node:fs';
const { readFileSync } = (await import(/* @vite-ignore */ fsModule)) as {
  readFileSync(path: string, encoding: 'utf8'): string;
};
const tokensCss = readFileSync('src/styles/tokens.css', 'utf8');

const themes = parseThemeTokens(tokensCss);

// Requirement 2 of task 004: [foreground, background] pairs that must reach 4.5:1 (WCAG 2.1 AA text).
// accent/bg also covers the 3:1 focus ring.
const pairs: Array<[string, string]> = [
  ['--color-text', '--color-bg'],
  ['--color-text', '--color-surface'],
  ['--color-text-muted', '--color-bg'],
  ['--color-text-muted', '--color-surface'],
  ['--color-accent', '--color-bg'],
  ['--color-accent-contrast', '--color-accent'],
];

const colorTokens = [
  '--color-bg',
  '--color-surface',
  '--color-text',
  '--color-text-muted',
  '--color-accent',
  '--color-accent-contrast',
  '--color-border',
];

describe('tokens contrast', () => {
  for (const theme of ['light', 'dark'] as const) {
    for (const [fg, bg] of pairs) {
      test(`${theme} ${fg} on ${bg}`, () => {
        const ratio = contrastRatio(themes[theme][fg], themes[theme][bg]);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe('tokens', () => {
  test('both themes define every --color-* token as 6-digit hex', () => {
    for (const theme of ['light', 'dark'] as const) {
      const defined = Object.keys(themes[theme]).filter((k) =>
        k.startsWith('--color-'),
      );
      expect(defined.sort()).toEqual([...colorTokens].sort());
      for (const name of colorTokens) {
        expect(themes[theme][name], `${theme} ${name}`).toMatch(
          /^#[0-9a-fA-F]{6}$/,
        );
      }
    }
  });

  test('no-JS dark fallback repeats the dark theme colours', () => {
    const media = tokensCss.match(
      /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme\]\)\s*\{([^}]*)\}/,
    );
    expect(media).not.toBeNull();
    const fallback = parseThemeTokens(
      `:root[data-theme="dark"] {${media![1]}}`,
    ).dark;
    for (const name of colorTokens) {
      expect(fallback[name], name).toBe(themes.dark[name]);
    }
  });

  test('defines fonts with system fallbacks, spacing scale and measure', () => {
    expect(tokensCss).toMatch(
      /--font-display:\s*'Fraunces Variable',[^;]*serif;/,
    );
    expect(tokensCss).toMatch(
      /--font-body:\s*'Be Vietnam Pro',[^;]*sans-serif;/,
    );
    for (let i = 1; i <= 8; i++) expect(tokensCss).toContain(`--space-${i}:`);
    expect(tokensCss).toMatch(/--measure:\s*65ch;/);
  });
});

describe('fonts', () => {
  const fontsCss = readFileSync('src/styles/fonts.css', 'utf8');
  const faces = fontsCss.match(/@font-face\s*\{[^}]*\}/g) ?? [];

  test('self-hosted latin and vietnamese faces only, with swap and unicode-range', () => {
    expect(faces).toHaveLength(6);
    for (const face of faces) {
      expect(face).toMatch(/font-display:\s*swap;/);
      expect(face).toMatch(/unicode-range:/);
      const urls = [...face.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]);
      expect(urls).toHaveLength(1);
      expect(urls[0]).toMatch(
        /^@fontsource(-variable)?\/[\w-]+\/files\/[\w-]+-(latin|vietnamese)-(wght|400|600)-normal\.woff2$/,
      );
    }
    expect(fontsCss).not.toMatch(/https?:/);
  });
});

describe('contrast', () => {
  test("contrastRatio('#000000','#FFFFFF') is 21", () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });
  test("contrastRatio('#777777','#FFFFFF') is about 4.48", () => {
    expect(
      Math.abs(contrastRatio('#777777', '#FFFFFF') - 4.48),
    ).toBeLessThanOrEqual(0.01);
  });
  test("contrastRatio('#999999','#FFFFFF') is below 4.5", () => {
    expect(contrastRatio('#999999', '#FFFFFF')).toBeLessThan(4.5);
  });
  test('is symmetric', () => {
    expect(contrastRatio('#FFFFFF', '#777777')).toBe(
      contrastRatio('#777777', '#FFFFFF'),
    );
  });
  test('rejects non-hex input', () => {
    expect(() => contrastRatio('red', '#FFFFFF')).toThrow();
  });
});
