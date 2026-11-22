import { describe, expect, test } from 'vitest';
import { postSchema } from '../../src/content.config';

const valid = {
  title: 'Xin chào',
  description: 'Bài viết đầu tiên',
  pubDate: '2026-01-05',
  lang: 'vi',
  translationKey: 'hello-world',
};

describe('schema', () => {
  test('accepts valid front matter', () => {
    const r = postSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.data?.pubDate).toBeInstanceOf(Date);
  });
  test('coerces YAML dates and ISO strings', () => {
    const r = postSchema.parse({
      ...valid,
      pubDate: new Date('2026-01-05'),
      updatedDate: '2026-02-01T10:00:00Z',
    });
    expect(r.pubDate).toBeInstanceOf(Date);
    expect(r.updatedDate).toBeInstanceOf(Date);
  });
  test('rejects bad lang', () => {
    expect(postSchema.safeParse({ ...valid, lang: 'fr' }).success).toBe(false);
  });
  test('rejects empty title', () => {
    expect(postSchema.safeParse({ ...valid, title: '' }).success).toBe(false);
  });
  test('rejects title over 120', () => {
    const ok = postSchema.safeParse({ ...valid, title: 'a'.repeat(120) });
    const tooLong = postSchema.safeParse({ ...valid, title: 'a'.repeat(121) });
    expect(ok.success).toBe(true);
    expect(tooLong.success).toBe(false);
  });
  test('rejects bad description length', () => {
    const empty = postSchema.safeParse({ ...valid, description: '' });
    const long = postSchema.safeParse({
      ...valid,
      description: 'a'.repeat(201),
    });
    expect(empty.success).toBe(false);
    expect(long.success).toBe(false);
  });
  test('rejects invalid date', () => {
    const r = postSchema.safeParse({ ...valid, pubDate: 'not a date' });
    expect(r.success).toBe(false);
  });
  test('rejects non-kebab translationKey', () => {
    const bad = [
      'Hello',
      'hello_world',
      'hello--world',
      '-hello',
      'hello-',
      '',
      'xin chào',
    ];
    for (const key of bad) {
      const r = postSchema.safeParse({ ...valid, translationKey: key });
      expect(r.success).toBe(false);
    }
  });
  test('defaults draft to false', () => {
    expect(postSchema.parse(valid).draft).toBe(false);
    expect(postSchema.parse({ ...valid, draft: true }).draft).toBe(true);
  });
});
