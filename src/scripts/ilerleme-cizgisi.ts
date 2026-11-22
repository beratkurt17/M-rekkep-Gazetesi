// Sayfanın en üstünde ince çizgi: yazı okundukça dolar.
// Markup: <div class="ilerleme"><span></span></div> (src/pages/yazi/[slug].astro)
import { articleBody, onScrollFrame, readRatio } from './okuma-konumu';

export function initProgressBar() {
  const bar = document.querySelector<HTMLElement>('.ilerleme span');
  const body = articleBody();
  if (!bar || !body) return;
  onScrollFrame(() => { bar.style.transform = `scaleX(${readRatio(body).toFixed(4)})`; });
}
