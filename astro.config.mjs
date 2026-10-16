import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jrortizdesign.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
  // every page except the 404 (which is also noindex)
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(new URL(page).pathname) })],
});
