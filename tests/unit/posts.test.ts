import { describe, expect, test } from 'vitest';
import {
  filterPublished,
  findTranslation,
  postsForLocale,
  sortByDateDesc,
  type Post,
} from '../../src/lib/posts';

function post(id: string, over: Partial<Post['data']> = {}): Post {
  return {
    id,
    data: {
      title: id,
      description: 'd',
      pubDate: new Date('2026-01-01T00:00:00Z'),
      lang: 'vi',
      translationKey: id,
      draft: false,
      ...over,
    },
  };
}

describe('posts', () => {
  test('sortByDateDesc newest first, ties by title', () => {
    const posts = [
      post('a', { title: 'B', pubDate: new Date('2026-01-01') }),
      post('b', { title: 'Z', pubDate: new Date('2026-03-01') }),
      post('c', { title: 'A', pubDate: new Date('2026-01-01') }),
    ];
    const input = [...posts];
    expect(sortByDateDesc(posts).map((p) => p.id)).toEqual(['b', 'c', 'a']);
    expect(posts).toEqual(input);
  });

  test('filterPublished drops drafts in prod only', () => {
    const posts = [post('a'), post('b', { draft: true })];
    expect(filterPublished(posts, true).map((p) => p.id)).toEqual(['a']);
    expect(filterPublished(posts, false).map((p) => p.id)).toEqual(['a', 'b']);
  });

  test('postsForLocale', () => {
    const posts = [post('a'), post('b', { lang: 'en' }), post('c')];
    expect(postsForLocale(posts, 'vi').map((p) => p.id)).toEqual(['a', 'c']);
    expect(postsForLocale(posts, 'en').map((p) => p.id)).toEqual(['b']);
  });

  test('findTranslation finds pair', () => {
    const vi = post('vi/hello', { translationKey: 'hello' });
    const en = post('en/hello', { translationKey: 'hello', lang: 'en' });
    const other = post('en/other', { translationKey: 'other', lang: 'en' });
    expect(findTranslation([vi, other, en], vi, 'en')).toBe(en);
    expect(findTranslation([vi, other, en], en, 'vi')).toBe(vi);
  });

  test('returns undefined when missing', () => {
    const vi = post('vi/hello', { translationKey: 'hello' });
    const other = post('en/other', { translationKey: 'other', lang: 'en' });
    expect(findTranslation([vi, other], vi, 'en')).toBeUndefined();
  });

  test('ignores same-locale post', () => {
    const vi = post('vi/hello', { translationKey: 'hello' });
    const vi2 = post('vi/hello-2', { translationKey: 'hello' });
    expect(findTranslation([vi, vi2], vi, 'vi')).toBeUndefined();
    expect(findTranslation([vi, vi2], vi, 'en')).toBeUndefined();
  });
});
