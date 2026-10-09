import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jrortizdesign.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
});
