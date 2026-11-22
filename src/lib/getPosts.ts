import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/ui';
import { filterPublished, postsForLocale, sortByDateDesc } from './posts';

export async function getPostsForLocale(locale: Locale) {
  const posts = await getCollection('posts');
  return sortByDateDesc(
    postsForLocale(filterPublished(posts, import.meta.env.PROD), locale),
  );
}
