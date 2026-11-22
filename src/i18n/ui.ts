export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi';

const vi = {
  'nav.home': 'Trang chủ',
  'nav.about': 'Giới thiệu',
  'lang.switch': 'English',
  'theme.toggle': 'Chuyển chế độ sáng/tối',
  'posts.heading': 'Bài viết',
  'posts.empty': 'Chưa có bài viết nào.',
  'post.published': 'Đăng ngày',
  'post.updated': 'Cập nhật ngày',
  'notFound.title': 'Không tìm thấy trang',
  'notFound.back': 'Quay về trang chủ',
  'site.title': 'Blog của Tuấn',
  'site.description': 'Ghi chép về lập trình, công việc và cuộc sống.',
} as const;

export type UiKey = keyof typeof vi;

export const ui: Record<Locale, Record<UiKey, string>> = {
  vi,
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'lang.switch': 'Tiếng Việt',
    'theme.toggle': 'Toggle light/dark mode',
    'posts.heading': 'Posts',
    'posts.empty': 'No posts yet.',
    'post.published': 'Published on',
    'post.updated': 'Updated on',
    'notFound.title': 'Page not found',
    'notFound.back': 'Back to home',
    'site.title': "Tuan's Blog",
    'site.description': 'Notes on programming, work and life.',
  },
};
