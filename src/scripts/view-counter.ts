// Okunma sayacı: aynı tarayıcıda aynı yazı oturum başına bir kez sayılır.
// Adres ve herkese açık anahtar [data-article] öğesinin data-* alanlarından okunur
// (sayfaya satır içi betik gömülmez — CSP ile uyumlu).
export function countView() {
  const el = document.querySelector<HTMLElement>('[data-article]');
  const { slug, api, apiKey } = el?.dataset ?? {};
  if (!slug || !api || !apiKey) return;
  try {
    const k = `okundu:${slug}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, '1');
    fetch(`${api}/rest/v1/rpc/increment_view`, {
      method: 'POST',
      headers: { apikey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_slug: slug }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* depolama kapalı olabilir */ }
}
