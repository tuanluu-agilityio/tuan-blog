import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tuanluu-agilityio.github.io',
  base: '/tuan-blog',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  output: 'static',
});
