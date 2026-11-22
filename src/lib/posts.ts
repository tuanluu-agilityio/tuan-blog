import type { Locale } from '../i18n/ui';

/** Structurally compatible with `CollectionEntry<'posts'>`; kept free of `astro:content` for unit tests. */
export type Post = {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    updatedDate?: Date;
    lang: Locale;
    translationKey: string;
    draft: boolean;
  };
};

export function filterPublished<T extends Post>(
  posts: T[],
  isProd: boolean,
): T[] {
  return isProd ? posts.filter((p) => !p.data.draft) : [...posts];
}

export function sortByDateDesc<T extends Post>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) =>
      b.data.pubDate.getTime() - a.data.pubDate.getTime() ||
      a.data.title.localeCompare(b.data.title),
  );
}

export function postsForLocale<T extends Post>(
  posts: T[],
  locale: Locale,
): T[] {
  return posts.filter((p) => p.data.lang === locale);
}

export function findTranslation<T extends Post>(
  posts: T[],
  post: Post,
  targetLocale: Locale,
): T | undefined {
  return posts.find(
    (p) =>
      p !== post &&
      p.id !== post.id &&
      p.data.lang === targetLocale &&
      p.data.lang !== post.data.lang &&
      p.data.translationKey === post.data.translationKey,
  );
}
