// Yazı metni editörü: contenteditable + araç çubuğu.
import { escapeHtml } from '../ortak/metin';

export interface RichEditor {
  getHtml(): string;
  setHtml(html: string): void;
}

export function createEditor(
  area: HTMLElement,
  toolbar: HTMLElement,
  onImage: () => Promise<string | null>,
): RichEditor {
  document.execCommand('defaultParagraphSeparator', false, 'p');

  const run = (cmd: string, value?: string) => {
    area.focus();
    document.execCommand(cmd, false, value);
  };

  toolbar.addEventListener('mousedown', (e) => {
    // Butona basınca editördeki seçim kaybolmasın
    if ((e.target as HTMLElement).closest('button')) e.preventDefault();
  });

  toolbar.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-cmd]');
    if (!btn) return;
    const cmd = btn.dataset.cmd!;
    switch (cmd) {
      case 'h2': case 'h3': case 'p': case 'blockquote':
        run('formatBlock', cmd); break;
      case 'ul': run('insertUnorderedList'); break;
      case 'link': {
        const url = prompt('Bağlantı adresi (https://...)');
        if (url) run('createLink', url);
        break;
      }
      case 'image': {
        const sel = saveSelection();
        const src = await onImage();
        if (src) {
          restoreSelection(sel);
          run('insertHTML', `<img src="${escapeHtml(src)}" alt="">`);
        }
        break;
      }
      default: run(cmd); // bold, italic, removeFormat, undo, redo
    }
  });

  // Yapıştırırken biçimi temizle: tek satır sonu → <br>, boş satır → yeni paragraf
  // (şiir dizeleri korunur)
  area.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') ?? '';
    const html = text
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((para) => para.trim())
      .filter(Boolean)
      .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
      .join('');
    run('insertHTML', html);
  });

  return {
    getHtml: () => area.innerHTML,
    setHtml: (html) => { area.innerHTML = html || '<p><br></p>'; },
  };
}

function saveSelection(): Range | null {
  const s = getSelection();
  return s && s.rangeCount ? s.getRangeAt(0).cloneRange() : null;
}
function restoreSelection(r: Range | null) {
  if (!r) return;
  const s = getSelection();
  s?.removeAllRanges();
  s?.addRange(r);
}
