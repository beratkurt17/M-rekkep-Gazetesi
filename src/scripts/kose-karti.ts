// Telefondaki köşe kutusu: seçiciye dokununca ilgili köşe görünür.
// Ok tuşlarıyla da gezilebilir (sekme düzeni).

export function initKoseKarti() {
  const box = document.querySelector<HTMLElement>('[data-kose-karti]');
  const tabs = box ? [...box.querySelectorAll<HTMLButtonElement>('[role="tab"]')] : [];
  if (!tabs.length) return;

  const select = (tab: HTMLButtonElement, focus = false) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')!)!.hidden = !on;
    }
    if (focus) tab.focus();
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      select(tabs[(i + dir + tabs.length) % tabs.length], true);
    });
  });
}
