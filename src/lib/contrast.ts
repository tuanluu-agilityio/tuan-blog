// WCAG 2.1 contrast helpers used by the token tests (task 004).

const HEX = /^#([0-9a-f]{6})$/i;

function channel(value: number): number {
  const c = value / 255;
  // WCAG 2.1 relative luminance definition (sRGB linearisation).
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const m = HEX.exec(hex);
  if (!m) throw new Error(`Expected a 6-digit hex colour, got "${hex}"`);
  const n = parseInt(m[1], 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

/** WCAG 2.1 contrast ratio of two 6-digit hex colours, from 1 to 21. */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = luminance(hexA);
  const b = luminance(hexB);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Reads the custom properties of the `:root[data-theme="light"]` and `:root[data-theme="dark"]`
 * rule blocks. A block may list other selectors too (e.g. `:root, :root[data-theme="light"]`).
 */
export function parseThemeTokens(
  css: string,
): Record<'light' | 'dark', Record<string, string>> {
  const result: Record<'light' | 'dark', Record<string, string>> = {
    light: {},
    dark: {},
  };
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  for (const [, selector, body] of source.matchAll(rule)) {
    // Accept either quote style in attribute selectors (Prettier may rewrite them).
    const selectors = selector
      .split(',')
      .map((s) => s.trim().replace(/'/g, '"'));
    for (const theme of ['light', 'dark'] as const) {
      if (!selectors.includes(`:root[data-theme="${theme}"]`)) continue;
      for (const [, name, value] of body.matchAll(
        /(--[\w-]+)\s*:\s*([^;]+);/g,
      )) {
        result[theme][name] = value.trim();
      }
    }
  }
  return result;
}
