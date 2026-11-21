// Okur bir yazıdan geri döndüğünde akışta kaldığı yere dönsün
// (tarayıcının geri önbelleği çalışmazsa yedek).
const KEY = 'murekkep:akis-konum';

export function rememberFeedPosition() {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const y = Number(sessionStorage.getItem(KEY));
    if (nav?.type === 'back_forward' && y > 0) {
      addEventListener('load', () => { if (scrollY < 10) scrollTo(0, y); });
    }
    addEventListener('pagehide', () => sessionStorage.setItem(KEY, String(scrollY)));
  } catch { /* depolama kapalı olabilir */ }
}
