import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import BaseLayout from '../../src/layouts/BaseLayout.astro';
import Header from '../../src/components/Header.astro';
import LanguageSwitcher from '../../src/components/LanguageSwitcher.astro';
import { localizedPath } from '../../src/i18n/utils';

const BASE = import.meta.env.BASE_URL;
const render = async (
  component: Parameters<AstroContainer['renderToString']>[0],
  props: Record<string, unknown>,
  url = 'http://localhost/',
  slots?: Record<string, string>,
) => {
  const container = await AstroContainer.create();
  return container.renderToString(component, {
    props,
    slots,
    request: new Request(url),
  });
};

describe('LanguageSwitcher', () => {
  test('vi without alternate links to the en home', async () => {
    const html = await render(LanguageSwitcher, { locale: 'vi' });
    expect(html).toContain(`href="${localizedPath('en', '/', BASE)}"`);
    expect(localizedPath('en', '/', '/tuan-blog')).toBe('/tuan-blog/en/');
  });

  test('en without alternate links to the vi home', async () => {
    const html = await render(LanguageSwitcher, { locale: 'en' });
    expect(html).toContain(`href="${localizedPath('vi', '/', BASE)}"`);
    expect(localizedPath('vi', '/', '/tuan-blog')).toBe('/tuan-blog/');
  });

  test('uses alternateHref when given', async () => {
    const html = await render(LanguageSwitcher, {
      locale: 'vi',
      alternateHref: '/tuan-blog/en/posts/x/',
    });
    expect(html).toContain('href="/tuan-blog/en/posts/x/"');
  });

  test('sets lang and hreflang', async () => {
    const vi = await render(LanguageSwitcher, { locale: 'vi' });
    expect(vi).toContain('lang="en"');
    expect(vi).toContain('hreflang="en"');
    expect(vi).toContain('>English<');
    const en = await render(LanguageSwitcher, { locale: 'en' });
    expect(en).toContain('lang="vi"');
    expect(en).toContain('hreflang="vi"');
    expect(en).toContain('>Tiếng Việt<');
  });
});

describe('BaseLayout', () => {
  const page = (props: Record<string, unknown>) =>
    render(BaseLayout, props, 'http://localhost/', { default: '<p>hi</p>' });

  test('sets html lang', async () => {
    expect(await page({ locale: 'en', title: 'X' })).toContain(
      '<html lang="en">',
    );
    expect(await page({ locale: 'vi', title: 'X' })).toContain(
      '<html lang="vi">',
    );
  });

  test('composes title', async () => {
    expect(await page({ locale: 'en', title: 'About' })).toContain(
      '<title>About · Tuan&#39;s Blog</title>',
    );
    expect(await page({ locale: 'en', title: "Tuan's Blog" })).toMatch(
      /<title>Tuan(&#39;|')s Blog<\/title>/,
    );
  });

  test('falls back to site description', async () => {
    const html = await page({ locale: 'en', title: 'X' });
    expect(html).toContain('Notes on programming, work and life.');
    const custom = await page({
      locale: 'en',
      title: 'X',
      description: 'Custom',
    });
    expect(custom).toContain('content="Custom"');
  });

  test('has skip link and main#main', async () => {
    const html = await page({ locale: 'en', title: 'X' });
    expect(html).toMatch(/<a[^>]*href="#main"/);
    expect(html).toMatch(/<main id="main"/);
  });

  test('contains exactly one script and it is the theme script', async () => {
    const html = await page({ locale: 'en', title: 'X' });
    const scripts = html.match(/<script\b/g) ?? [];
    expect(scripts).toHaveLength(1);
    expect(html.indexOf('<script')).toBeLessThan(html.indexOf('<title'));
    expect(html).toContain('data-theme');
  });
});

describe('Header', () => {
  test('marks current nav item with aria-current', async () => {
    const about = localizedPath('en', 'about', BASE);
    const html = await render(
      Header,
      { locale: 'en' },
      `http://localhost${about}`,
    );
    const current = html.match(/<a[^>]*aria-current="page"[^>]*>/g) ?? [];
    expect(current).toHaveLength(1);
    expect(current[0]).toContain(`href="${about}"`);
  });
});
