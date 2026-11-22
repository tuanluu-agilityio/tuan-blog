import { describe, expect, test } from 'vitest';
import { THEME_SCRIPT } from '../../src/lib/themeScript';

type Listener = () => void;

class StubButton {
  attrs: Record<string, string> = {};
  listeners: Listener[] = [];
  setAttribute(name: string, value: string) {
    this.attrs[name] = value;
  }
  addEventListener(type: string, fn: Listener) {
    if (type === 'click') this.listeners.push(fn);
  }
  click() {
    for (const fn of this.listeners) fn();
  }
}

interface Env {
  storage?: Record<string, string>;
  throwing?: boolean;
  prefersDark?: boolean;
  buttons?: number;
}

function run(env: Env = {}) {
  const store: Record<string, string> = { ...(env.storage ?? {}) };
  const localStorage = env.throwing
    ? {
        getItem(): string | null {
          throw new Error('SecurityError');
        },
        setItem(): void {
          throw new Error('SecurityError');
        },
      }
    : {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => {
          store[k] = String(v);
        },
      };
  const buttons = Array.from(
    { length: env.buttons ?? 0 },
    () => new StubButton(),
  );
  const domReady: Listener[] = [];
  const documentElement = { dataset: {} as Record<string, string> };
  const document = {
    documentElement,
    addEventListener(type: string, fn: Listener) {
      if (type === 'DOMContentLoaded') domReady.push(fn);
    },
    querySelectorAll(sel: string) {
      return sel === '[data-theme-toggle]' ? buttons : [];
    },
  };
  const window = {
    localStorage,
    matchMedia: (q: string) => ({
      matches: q === '(prefers-color-scheme: dark)' && !!env.prefersDark,
    }),
  };
  const matchMedia = window.matchMedia;
  new Function(
    'window',
    'document',
    'localStorage',
    'matchMedia',
    THEME_SCRIPT,
  )(window, document, localStorage, matchMedia);
  return {
    theme: () => documentElement.dataset.theme,
    store,
    buttons,
    ready: () => domReady.forEach((fn) => fn()),
  };
}

describe('theme script', () => {
  test('under 1024 bytes', () => {
    expect(new TextEncoder().encode(THEME_SCRIPT).length).toBeLessThanOrEqual(
      1024,
    );
  });

  test('uses stored theme', () => {
    expect(
      run({ storage: { theme: 'dark' }, prefersDark: false }).theme(),
    ).toBe('dark');
    expect(
      run({ storage: { theme: 'light' }, prefersDark: true }).theme(),
    ).toBe('light');
  });

  test('falls back to prefers-color-scheme', () => {
    expect(run({ prefersDark: true }).theme()).toBe('dark');
    expect(run({ prefersDark: false }).theme()).toBe('light');
    expect(
      run({ storage: { theme: 'bogus' }, prefersDark: true }).theme(),
    ).toBe('dark');
  });

  test('survives localStorage throwing', () => {
    const env = run({ throwing: true, prefersDark: true, buttons: 1 });
    expect(env.theme()).toBe('dark');
    env.ready();
    expect(() => env.buttons[0].click()).not.toThrow();
    expect(env.theme()).toBe('light');
  });

  test('toggle flips, persists and sets aria-pressed', () => {
    const env = run({ prefersDark: false, buttons: 2 });
    env.ready();
    expect(env.buttons.map((b) => b.attrs['aria-pressed'])).toEqual([
      'false',
      'false',
    ]);
    env.buttons[0].click();
    expect(env.theme()).toBe('dark');
    expect(env.store.theme).toBe('dark');
    expect(env.buttons.map((b) => b.attrs['aria-pressed'])).toEqual([
      'true',
      'true',
    ]);
    env.buttons[1].click();
    expect(env.theme()).toBe('light');
    expect(env.store.theme).toBe('light');
    expect(env.buttons.map((b) => b.attrs['aria-pressed'])).toEqual([
      'false',
      'false',
    ]);
  });
});
