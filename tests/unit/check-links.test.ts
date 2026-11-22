import { describe, expect, test } from 'vitest';
import { checkLinks } from '../../scripts/check-links.mjs';

const BASE = '/tuan-blog';
// Paths are relative to the Vitest root (repo root); avoids Node type imports in astro check.
const fixture = (name: string) => `tests/fixtures/links/${name}`;

describe('check-links', () => {
  test('accepts prefixed links that exist', async () => {
    expect(await checkLinks(fixture('ok'), BASE)).toEqual([]);
  });

  test('flags root-relative link without base', async () => {
    const errors = await checkLinks(fixture('missing-base'), BASE);
    expect(errors).toEqual([
      {
        file: 'index.html',
        attr: 'href',
        value: '/about/',
        reason: 'missing-base',
      },
    ]);
  });

  test('flags prefixed link to missing page', async () => {
    const errors = await checkLinks(fixture('not-found'), BASE);
    expect(errors).toEqual([
      {
        file: 'index.html',
        attr: 'href',
        value: '/tuan-blog/nope/',
        reason: 'not-found',
      },
    ]);
  });

  test('resolves directory links to index.html', async () => {
    expect(await checkLinks(fixture('dir-index'), BASE)).toEqual([]);
  });

  test('ignores external, mailto and fragment links', async () => {
    expect(await checkLinks(fixture('external'), BASE)).toEqual([]);
  });

  test('strips query and fragment', async () => {
    expect(await checkLinks(fixture('query'), BASE)).toEqual([]);
  });

  test('does not resolve links outside the dist directory', async () => {
    const errors = await checkLinks(fixture('traversal'), BASE);
    expect(errors.map((e) => e.reason)).toEqual(['not-found', 'not-found']);
  });

  test('ignores code inside inline scripts and comments', async () => {
    const errors = await checkLinks(fixture('inline-code'), BASE);
    // Only the real <script src> tag pointing at a missing file is reported.
    expect(errors).toEqual([
      {
        file: 'index.html',
        attr: 'src',
        value: '/tuan-blog/missing.js',
        reason: 'not-found',
      },
    ]);
  });
});
