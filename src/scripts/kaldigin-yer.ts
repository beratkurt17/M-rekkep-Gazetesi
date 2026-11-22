// Kaldığın yerden devam: uzun bir yazıda okurun konumu kendi tarayıcısında saklanır.
// Yazıya yarım bırakıp dönen okura altta "Kaldığın yerden devam et" önerilir.
// Hesap/sunucu yok; bilgi yalnızca okurun cihazında durur.
// Markup: #devam (src/pages/yazi/[slug].astro)
import { articleBody, onScrollFrame, scrollToRatio, topRatio } from './okuma-konumu';

const KEY = 'murekkep:kalinan-yer';
const MAX_ENTRIES = 40;          // en son okunan 40 yazı hatırlanır
const MAX_AGE = 90 * 86_400_000; // 90 günden eski kayıt unutulur
const MIN_MINUTES = 3;           // kısa yazılarda öneri gösterilmez

type Store = Record<string, { r: number; t: number }>;

function load(): Store {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store; } catch { return {}; }
}

function save(store: Store) {
  const entries = Object.entries(store)
    .filter(([, v]) => Date.now() - v.t < MAX_AGE)
    .sort((a, b) => b[1].t - a[1].t)
    .slice(0, MAX_ENTRIES);
  try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(entries))); } catch { /* depolama kapalı */ }
}

export function initResume() {
  const root = document.querySelector<HTMLElement>('[data-article]');
  const body = articleBody();
  const box = document.getElementById('devam');
  if (!root || !body || !box) return;
  const slug = root.dataset.slug!;
  if (Number(root.dataset.minutes) < MIN_MINUTES) return;

  // 1) Öneri: ortalarda bırakılmışsa ve sayfa en baştan açıldıysa (geri tuşuyla dönülmediyse)
  const saved = load()[slug];
  if (saved && saved.r > 0.08 && saved.r < 0.92 && scrollY < 200 && Date.now() - saved.t < MAX_AGE) {
    box.hidden = false;
    const hide = () => { box.hidden = true; removeEventListener('scroll', onScroll); };
    const startY = scrollY;
    const onScroll = () => { if (Math.abs(scrollY - startY) > 500) hide(); };
    addEventListener('scroll', onScroll, { passive: true });
    box.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-devam]');
      if (!b) return;
      hide();
      if (b.dataset.devam === 'evet') scrollToRatio(body, saved.r);
    });
    setTimeout(hide, 15_000);
  }

  // 2) Kayıt: okurken en çok saniyede bir; sona gelindiyse kayıt silinir
  let last = 0;
  const record = (force = false) => {
    if (!force && Date.now() - last < 1000) return;
    last = Date.now();
    const r = topRatio(body);
    const store = load();
    if (r >= 0.92) delete store[slug];
    else if (r > 0.02) store[slug] = { r: Number(r.toFixed(4)), t: Date.now() };
    else return;
    save(store);
  };
  onScrollFrame(() => record());
  addEventListener('pagehide', () => record(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) record(true); });
}
