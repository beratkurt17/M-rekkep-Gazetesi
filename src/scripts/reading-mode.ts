// Okuma modu + yazı boyutu (A− / A+).
// - Açılınca menü, öneriler ve paylaşım çekilir (global.css: html.is-reading).
// - Mod değişirken sayfa başa sıçramaz: ekrandaki paragraf yerinde kalır.
// - Seçilen yazı boyutu tarayıcıda saklanır, sonraki yazıda da geçerlidir.

const SIZE_KEY = 'murekkep:yazi-boyutu';
const SIZES = [15, 16, 17, 18, 19, 20, 22, 24, 26];
const root = document.documentElement;

export function applySavedSize() {
  try {
    const v = Number(localStorage.getItem(SIZE_KEY));
    if (SIZES.includes(v)) root.style.setProperty('--read-size', `${v}px`);
  } catch { /* depolama kapalı olabilir */ }
}

/** Değişiklik sırasında görünen içeriği yerinde tutar. */
function keepPosition(change: () => void) {
  const items = document.querySelectorAll<HTMLElement>('.art-head > *, .art-cover, .art-body > *');
  const anchor = [...items].find((el) => el.getBoundingClientRect().bottom > 0);
  const before = anchor?.getBoundingClientRect().top ?? 0;
  change();
  if (anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - before, behavior: 'instant' });
}

export function initReadingMode() {
  applySavedSize();

  const bar = document.getElementById('reading-bar');
  const body = document.querySelector<HTMLElement>('.art-body');
  if (!bar || !body) return;
  const toggles = () => document.querySelectorAll<HTMLButtonElement>('[data-action="reading"]');

  const setMode = (on: boolean) => {
    keepPosition(() => {
      root.classList.toggle('is-reading', on);
      bar.hidden = !on;
      toggles().forEach((b) => b.setAttribute('aria-pressed', String(on)));
    });
    if (on) bar.querySelector<HTMLButtonElement>('.rb-exit')?.focus({ preventScroll: true });
    else toggles()[0]?.focus({ preventScroll: true });
  };

  const stepSize = (dir: 1 | -1) => {
    const current = parseFloat(getComputedStyle(body).fontSize);
    let i = SIZES.findIndex((s) => s >= current - 0.5);
    if (i < 0) i = SIZES.length - 1;
    const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, i + dir))];
    keepPosition(() => root.style.setProperty('--read-size', `${next}px`));
    try { localStorage.setItem(SIZE_KEY, String(next)); } catch {}
  };

  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-action="reading"], .rb-exit, [data-font]');
    if (!t) return;
    if (t.matches('[data-action="reading"]')) setMode(!root.classList.contains('is-reading'));
    else if (t.matches('.rb-exit')) setMode(false);
    else stepSize(t.dataset.font === '+' ? 1 : -1);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-reading') && !document.querySelector('dialog[open]')) {
      setMode(false);
    }
  });
}
