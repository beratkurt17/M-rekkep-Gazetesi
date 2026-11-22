import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Site GitHub Pages üzerinde statik olarak yayınlanır.
// Yeni yazı yayınlandığında GitHub Actions siteyi yeniden oluşturur.

// Yerelde .env, GitHub Actions'ta ortam değişkenleri kullanılır.
try { process.loadEnvFile('.env'); } catch { /* CI'da .env yok */ }
const SUPABASE = process.env.PUBLIC_SUPABASE_URL
  ? new URL(process.env.PUBLIC_SUPABASE_URL).origin
  : 'https://*.supabase.co';

export default defineConfig({
  site: 'https://murekkepgzt.com',
  output: 'static',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  // Sitede kod bloğu yok; Shiki satır içi stil kullandığı için CSP ile çakışır.
  markdown: { syntaxHighlight: false },

  // İçerik Güvenlik Politikası (CSP): tarayıcı yalnızca bu sitenin kendi betiklerini
  // çalıştırır; sayfaya bir şekilde kod sokulsa bile çalışmaz. Astro satır içi
  // betik/stil özetlerini (hash) otomatik ekler. (Yalnızca derlenmiş sitede etkin.)
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        `img-src 'self' data: blob: ${SUPABASE}`,
        "font-src 'self' https://fonts.gstatic.com",
        `connect-src 'self' ${SUPABASE} ${SUPABASE.replace('https://', 'wss://')}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-src 'none'",
        "worker-src 'self'",
        "manifest-src 'self'",
      ],
      styleDirective: { resources: ["'self'", 'https://fonts.googleapis.com'] },
      // 'wasm-unsafe-eval': site içi arama (Pagefind) WebAssembly kullanır; yalnızca
      // derlenmiş WebAssembly'ye izin verir, eval() gibi metinden kod çalıştırmayı açmaz.
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
    },
  },
});
