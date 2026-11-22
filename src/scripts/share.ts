// Paylaşım: WhatsApp, bağlantı kopyalama, Instagram hikâye kartı.
// Yazı bilgisi [data-article] öğesinin data-* alanlarından okunur.
import { showToast } from './toast';
import { drawStoryCard, loadStoryFonts, quoteSegments, quoteFitsCard } from '../lib/story-card';

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Eski tarayıcı / izin yok: geçici alanla dene
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Görsel oluşturulamadı'))), 'image/png'),
  );
}

export function initShare() {
  const root = document.querySelector<HTMLElement>('[data-article]');
  const sheet = document.getElementById('share-sheet') as HTMLDialogElement | null;
  const story = document.getElementById('story-dialog') as HTMLDialogElement | null;
  if (!root || !sheet || !story) return;

  const { url = '', title = '', byline = '', quote = '', domain = '', slug = 'yazi' } = root.dataset;
  const canvas = story.querySelector<HTMLCanvasElement>('.story-canvas')!;
  const notice = story.querySelector<HTMLElement>('.story-notice')!;
  const noticeText = story.querySelector<HTMLElement>('.story-notice-text')!;
  const segBox = story.querySelector<HTMLElement>('.segments')!;
  let chosenQuote: string | null = quote || null;

  const render = () => {
    const res = drawStoryCard(canvas, { title, byline: byline || null, quote: chosenQuote, domain });
    // Alıntı sığmadıysa: kesmeden başlıkla hazırla, okura daha kısa bölüm seçtir
    if (quote && (!res.quoteFits || chosenQuote !== quote)) showSegments(res.quoteFits);
    else notice.hidden = true;
  };

  const showSegments = (fits: boolean) => {
    const segs = quoteSegments(quote).filter(quoteFitsCard);
    notice.hidden = false;
    noticeText.textContent = fits
      ? 'Kartta kullanılan bölüm:'
      : 'Alıntının tamamı karta sığmıyor; kart şimdilik başlıkla hazırlandı. Alıntıdan daha kısa bir bölüm seçebilirsin:';
    segBox.replaceChildren(
      ...segs.map((s) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = s;
        b.setAttribute('aria-pressed', String(s === chosenQuote));
        b.addEventListener('click', () => { chosenQuote = s; render(); });
        return b;
      }),
    );
  };

  const openStory = async () => {
    story.showModal();
    await loadStoryFonts();
    render();
  };

  const download = async () => {
    const blob = await canvasBlob(canvas);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `murekkep-${slug}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  const shareImage = async () => {
    const blob = await canvasBlob(canvas);
    const file = new File([blob], `murekkep-${slug}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file] }); }
      catch (err) { if ((err as Error).name !== 'AbortError') showToast('Paylaşım açılamadı.'); }
    } else {
      await download();
      showToast('Bu cihaz görsel paylaşımını desteklemiyor; görsel indirildi.');
    }
  };

  document.addEventListener('click', async (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-action="share"], [data-share]');
    if (!t) return;
    switch (t.dataset.action ?? t.dataset.share) {
      case 'share': sheet.showModal(); break;
      case 'whatsapp': sheet.close(); break; // bağlantı yeni sekmede açılır
      case 'copy':
        showToast((await copyText(url)) ? 'Bağlantı kopyalandı' : `Kopyalanamadı: ${url}`);
        if (sheet.open) sheet.close();
        break;
      case 'story': if (sheet.open) sheet.close(); await openStory(); break;
      case 'print': sheet.close(); setTimeout(() => print(), 50); break; // pencere kapansın, sonra baskı
      case 'story-share': await shareImage(); break;
      case 'story-download': await download(); showToast('Görsel indirildi'); break;
      case 'close': t.closest('dialog')?.close(); break;
    }
  });

  // Pencere dışına dokununca kapansın
  for (const d of [sheet, story]) {
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  }
}
