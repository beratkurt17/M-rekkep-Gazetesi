// Dipnot numarasına dokununca not, sayfa kaymadan alttan kartla açılır.
// Markup: numaralar src/lib/dipnot.ts, kart #dipnot-kart (src/pages/yazi/[slug].astro)

export function initFootnotes() {
  const card = document.getElementById('dipnot-kart');
  if (!card || !document.querySelector('[data-dipnot]')) return;
  const title = card.querySelector<HTMLElement>('.dn-card-title')!;
  const text = card.querySelector<HTMLElement>('.dn-card-text')!;
  let opener: HTMLElement | null = null;

  const close = () => {
    if (card.hidden) return;
    card.hidden = true;
    opener?.focus({ preventScroll: true });
    opener = null;
  };

  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const ref = t.closest<HTMLAnchorElement>('a[data-dipnot]');
    if (ref) {
      const n = ref.dataset.dipnot!;
      const note = document.querySelector(`#dn-${n} .dn-text`);
      if (!note) return; // liste yoksa bağlantı normal çalışsın
      e.preventDefault();
      title.textContent = `Dipnot ${n}`;
      text.textContent = note.textContent;
      card.hidden = false;
      opener = ref;
      card.focus({ preventScroll: true });
      return;
    }
    if (t.closest('.dn-card-close') || !t.closest('#dipnot-kart')) close();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
