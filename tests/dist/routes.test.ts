import { describe, expect, it } from 'vitest';

// @types/node is not installed, so node:fs is loaded through an untyped specifier (paths are repo-root relative).
const fsModule = 'node:fs';
const fs = (await import(/* @vite-ignore */ fsModule)) as {
  readFileSync(path: string, encoding: 'utf8'): string;
  existsSync(path: string): boolean;
  readdirSync(
    path: string,
    options: { withFileTypes: true },
  ): { name: string; isDirectory(): boolean }[];
};
const dist = 'dist';

function read(rel: string): string {
  return fs.readFileSync(`${dist}/${rel}`, 'utf8');
}

function htmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(`${dist}/${dir}`, {
    withFileTypes: true,
  })) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...htmlFiles(rel));
    else if (entry.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

describe('build output', () => {
  it('build output has expected routes', () => {
    for (const f of [
      'index.html',
      'en/index.html',
      'posts/xin-chao/index.html',
      'posts/ghi-chu-dau-tien/index.html',
      'en/posts/hello-world/index.html',
      'about/index.html',
      'en/about/index.html',
      '404.html',
    ]) {
      expect(fs.existsSync(`${dist}/${f}`), f).toBe(true);
    }
    expect(fs.existsSync(`${dist}/vi`)).toBe(false);
  });
});

describe('LanguageSwitcher route', () => {
  it('paired post links to its translation', () => {
    expect(read('posts/xin-chao/index.html')).toContain(
      'href="/tuan-blog/en/posts/hello-world/"',
    );
  });
  it('unpaired post links to en home', () => {
    expect(read('posts/ghi-chu-dau-tien/index.html')).toContain(
      'href="/tuan-blog/en/"',
    );
  });
});

describe('js budget', () => {
  it('only the inline theme script, under 1024 bytes, no script src', () => {
    for (const f of htmlFiles('')) {
      const html = read(f);
      expect(html, f).not.toMatch(/<script[^>]*\ssrc=/i);
      const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
      expect(scripts.length, f).toBeLessThanOrEqual(1);
      for (const s of scripts) {
        expect(new TextEncoder().encode(s[1] ?? '').length, f).toBeLessThan(1024);
      }
    }
  });
});

describe('no third-party requests', () => {
  it('no http(s) URLs in src/href of link, script, img, iframe', () => {
    const tag = /<(link|script|img|iframe)\b[^>]*>/gi;
    for (const f of htmlFiles('')) {
      for (const m of read(f).matchAll(tag)) {
        expect(m[0], f).not.toMatch(/\s(?:src|href)=["']?https?:/i);
      }
    }
  });
});

describe('home', () => {
  it('home lists newest first', () => {
    const html = read('index.html');
    const a = html.indexOf('/tuan-blog/posts/xin-chao/');
    const b = html.indexOf('/tuan-blog/posts/ghi-chu-dau-tien/');
    expect(a).toBeGreaterThan(-1);
    expect(b).toBeGreaterThan(a);
  });
});
