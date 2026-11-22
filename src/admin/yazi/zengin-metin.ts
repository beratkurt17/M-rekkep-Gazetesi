// Yazı metni editörü: contenteditable + araç çubuğu.
// Şiir biçiminde: Enter → yeni dize, boş dizede tekrar Enter → yeni kıta.
import { escapeHtml } from '../ortak/metin';

export interface RichEditor {
  getHtml(): string;
  setHtml(html: string): void;
}

/** Satır başındaki boşluk/sekme → bölünmez boşluk (şiir girintisi HTML'de kaybolmasın). */
function keepIndent(line: string): string {
  return line.replace(/^[ \t]+/, (m) => ' '.repeat(m.replace(/\t/g, '    ').length));
}

/** İmlecin hemen önündeki düğüm (boş metin düğümleri atlanır). */
function nodeBeforeCaret(r: Range, area: HTMLElement): Node | null {
  const c = r.startContainer;
  if (c.nodeType === Node.TEXT_NODE && r.startOffset > 0) return c;
  let n: Node | null = c.nodeType === Node.TEXT_NODE ? c : (c.childNodes[r.startOffset - 1] ?? null);
  if (n && n !== c) return n;
  // Kabın başındayız: yukarı çıkıp önceki kardeşe bak
  n = c;
  while (n && n !== area) {
    let prev = n.previousSibling;
    while (prev && prev.nodeType === Node.TEXT_NODE && !prev.textContent) prev = prev.previousSibling;
    if (prev) return prev;
    n = n.parentNode;
  }
  return null;
}

export function createEditor(
  area: HTMLElement,
  toolbar: HTMLElement,
  onImage: () => Promise<string | null>,
  isPoemMode: () => boolean = () => false,
): RichEditor {
  document.execCommand('defaultParagraphSeparator', false, 'p');

  area.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing || !isPoemMode()) return;
    const sel = getSelection();
    if (!sel || !sel.rangeCount) return;
    e.preventDefault();
    const r = sel.getRangeAt(0);
    const before = r.collapsed ? nodeBeforeCaret(r, area) : null;
    if (before?.nodeName === 'BR') {
      // Boş dizede Enter: o boş satırı sil, yeni kıta (paragraf) başlat
      (before as Element).remove();
      document.execCommand('insertParagraph');
    } else {
      document.execCommand('insertLineBreak');
    }
  });

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
  // (şiir dizeleri ve satır başı girintileri korunur)
  area.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') ?? '';
    const html = text
      .replace(/\r\n?/g, '\n')
      .split(/\n[ \t]*\n/)
      .map((para) => para.replace(/^\n+|\s+$/g, ''))
      .filter((para) => para.trim())
      .map((para) => `<p>${para.split('\n').map((l) => escapeHtml(keepIndent(l.trimEnd()))).join('<br>')}</p>`)
      .join('');
    run('insertHTML', html);
  });

  return {
    getHtml: () => area.innerHTML,
    setHtml: (html) => { area.innerHTML = html || '<p><br></p>'; },
  };
}

export function saveSelection(): Range | null {
  const s = getSelection();
  return s && s.rangeCount ? s.getRangeAt(0).cloneRange() : null;
}
export function restoreSelection(r: Range | null) {
  if (!r) return;
  const s = getSelection();
  s?.removeAllRanges();
  s?.addRange(r);
}
