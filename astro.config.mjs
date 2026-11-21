import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Site GitHub Pages üzerinde statik olarak yayınlanır.
// Yeni yazı yayınlandığında GitHub Actions siteyi yeniden oluşturur.
export default defineConfig({
  site: 'https://murekkepgzt.com',
  output: 'static',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
});
