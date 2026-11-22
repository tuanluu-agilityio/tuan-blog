import { describe, expect, test } from 'vitest';
import { locales, ui } from '../../src/i18n/ui';
import { formatDate, localizedPath, t } from '../../src/i18n/utils';

describe('i18n', () => {
  test('localizedPath vi root', () => {
    expect(localizedPath('vi', '/', '/tuan-blog/')).toBe('/tuan-blog/');
  });
  test('localizedPath en root', () => {
    expect(localizedPath('en', '/', '/tuan-blog/')).toBe('/tuan-blog/en/');
  });
  test('localizedPath en post', () => {
    expect(localizedPath('en', 'posts/hello', '/tuan-blog/')).toBe(
      '/tuan-blog/en/posts/hello/',
    );
  });
  test('localizedPath slashes', () => {
    expect(localizedPath('vi', '//posts//a/', '/tuan-blog')).toBe(
      '/tuan-blog/posts/a/',
    );
  });
  test('localizedPath never emits /vi/', () => {
    for (const p of ['/', 'posts/a', '/about/', '']) {
      expect(localizedPath('vi', p, '/tuan-blog/')).not.toMatch(/\/vi\//);
    }
  });
  test('localizedPath defaults base to BASE_URL', () => {
    const base = import.meta.env.BASE_URL;
    expect(localizedPath('en', 'about')).toBe(
      localizedPath('en', 'about', base),
    );
    expect(localizedPath('vi', '/')).toBe(localizedPath('vi', '/', base));
  });

  test('ui has same keys for vi and en', () => {
    expect(Object.keys(ui.en).sort()).toEqual(Object.keys(ui.vi).sort());
    expect(Object.keys(ui.vi).sort()).toEqual(
      [
        'nav.home',
        'nav.about',
        'lang.switch',
        'theme.toggle',
        'posts.heading',
        'posts.empty',
        'post.published',
        'post.updated',
        'notFound.title',
        'notFound.back',
        'site.title',
        'site.description',
      ].sort(),
    );
  });
  test('no empty strings', () => {
    for (const locale of locales) {
      for (const value of Object.values(ui[locale])) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });
  test('t returns the string', () => {
    expect(t('en', 'nav.home')).toBe(ui.en['nav.home']);
    expect(t('vi', 'nav.home')).toBe(ui.vi['nav.home']);
    // @ts-expect-error unknown keys are rejected by the type checker
    expect(t('en', 'nope.key')).toBeUndefined();
  });

  test('formatDate', () => {
    const d = new Date('2026-01-05T00:00:00Z');
    expect(formatDate(d, 'vi')).toContain('2026');
    expect(formatDate(d, 'en')).toContain('January');
  });
});
