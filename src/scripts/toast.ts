// Kısa geri bildirim mesajı (sayfada id="toast" olan öğe kullanılır).
let timer: number | undefined;

export function showToast(message: string, ms = 2800) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(timer);
  timer = window.setTimeout(() => (el.hidden = true), ms);
}
