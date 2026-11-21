// Panel önizlemesi: kaydedilmemiş hâliyle akış öğesi, yazı sayfası ve hikâye kartı.
// Site ile AYNI render fonksiyonlarını kullanır (src/lib/render.ts, src/lib/story-card.ts).
import type { Article } from '../lib/types';
import { feedItemHtml, articleHtml } from '../lib/render';
import { drawStoryCard, loadStoryFonts } from '../lib/story-card';

const SITE_HOST = new URL(import.meta.env.SITE ?? 'https://murekkepgzt.com').host;

let bound = false;

function bind(dlg: HTMLDialogElement) {
  if (bound) return;
  bound = true;
  dlg.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === dlg || t.closest('[data-close]')) { dlg.close(); return; }
    const tab = t.closest<HTMLButtonElement>('.pv-tab');
    if (tab) {
      dlg.querySelectorAll('.pv-tab').forEach((b) => b.classList.toggle('active', b === tab));
      dlg.querySelectorAll<HTMLElement>('.pv-pane').forEach((p) => (p.hidden = p.dataset.pane !== tab.dataset.pane));
      return;
    }
    // Önizlemedeki bağlantılar ve butonlar çalışmasın
    if (t.closest('.pv-phone a, .pv-phone button')) e.preventDefault();
  });
}

export async function openPreview(a: Article) {
  const dlg = document.getElementById('preview-dialog') as HTMLDialogElement;
  bind(dlg);

  dlg.querySelector('.pv-feed')!.innerHTML = feedItemHtml(a, { lead: a.placement === 'manset', href: '#' });
  dlg.querySelector('.pv-page')!.innerHTML = articleHtml(a);

  dlg.showModal();

  await loadStoryFonts();
  const res = drawStoryCard(dlg.querySelector<HTMLCanvasElement>('.pv-story')!, {
    title: a.title, byline: a.byline, quote: a.ig_quote, domain: SITE_HOST,
  });
  dlg.querySelector('.pv-story-note')!.textContent = !a.ig_quote
    ? 'Instagram alıntısı boş olduğu için kartta başlık ve yazar kullanıldı.'
    : res.quoteFits
      ? 'Kartta Instagram alıntısı kullanıldı.'
      : 'Alıntı karta sığmıyor; kart başlıkla hazırlandı. Daha kısa bir bölüm seçersen alıntı kullanılır (okur da sitede kısa bir bölüm seçebilir).';
}
