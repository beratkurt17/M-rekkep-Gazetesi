// Yazı gövdesine göre okuma konumu (ilerleme çizgisi ve "kaldığın yer" ortak kullanır).
// Konum oran olarak tutulur (0–1); yazı boyutu değişse de aynı yere denk gelir.

export const articleBody = () => document.querySelector<HTMLElement>('.art-body');

function bodyBox(body: HTMLElement) {
  const r = body.getBoundingClientRect();
  return { top: r.top + scrollY, height: Math.max(1, r.height) };
}

/** Ekranın üst kenarı gövdenin neresinde? (0: başında, 1: sonunda) */
export function topRatio(body: HTMLElement): number {
  const { top, height } = bodyBox(body);
  return Math.min(1, Math.max(0, (scrollY - top) / height));
}

/** Okunan kısım: ekranın alt kenarı gövdenin neresine geldi? (çizgi için) */
export function readRatio(body: HTMLElement): number {
  const { top, height } = bodyBox(body);
  return Math.min(1, Math.max(0, (scrollY + innerHeight - top) / height));
}

/** Gövdede verilen orana kaydırır. */
export function scrollToRatio(body: HTMLElement, ratio: number) {
  const { top, height } = bodyBox(body);
  scrollTo({ top: top + ratio * height - 16, behavior: 'smooth' });
}

/** Kaydırma ve yeniden boyutlandırmada, kare başına en çok bir kez çalıştırır. */
export function onScrollFrame(fn: () => void) {
  let queued = false;
  const run = () => { queued = false; fn(); };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  schedule();
}
