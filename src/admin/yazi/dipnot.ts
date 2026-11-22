// Panelde dipnot: araç çubuğundaki "Dipnot" düğmesi imlecin olduğu yere not ekler;
// metindeki numaraya dokununca not düzenlenir ya da silinir.
// Kayıt biçimi: <sup data-not="not metni">*</sup> — yayında src/lib/dipnot.ts numaralandırır.
// Editörde numaralar CSS sayacıyla gösterilir (src/styles/admin.css → .body-editor sup).
import { $ } from '../ortak/dom';
import { escapeHtml } from '../ortak/metin';
import { showToast } from '../../scripts/toast';
import { saveSelection, restoreSelection } from './zengin-metin';

/** Editördeki dipnot işaretleri tek parça davransın (içine yazı yazılmasın). */
export function lockFootnotes(area: HTMLElement) {
  area.querySelectorAll<HTMLElement>('sup[data-not]').forEach((s) => (s.contentEditable = 'false'));
}

export function bindFootnotes(area: HTMLElement, toolbar: HTMLElement, onChange: () => void) {
  const dlg = $<HTMLDialogElement>('dipnot-dialog');
  const text = $<HTMLTextAreaElement>('dipnot-metin');
  const delBtn = dlg.querySelector<HTMLButtonElement>('[data-dn="sil"]')!;
  let editing: HTMLElement | null = null; // düzenlenen dipnot (yenide null)
  let range: Range | null = null;         // yeni dipnotun ekleneceği yer

  const open = (value: string) => {
    text.value = value;
    delBtn.hidden = !editing;
    dlg.showModal();
    text.focus();
  };

  toolbar.querySelector('[data-dipnot]')!.addEventListener('click', () => {
    const r = saveSelection();
    if (!r || !area.contains(r.commonAncestorContainer)) {
      showToast('Önce metinde dipnotun geleceği yere dokun.');
      return;
    }
    r.collapse(false); // seçili metin varsa dipnot sonuna gelir, metin silinmez
    range = r;
    editing = null;
    open('');
  });

  area.addEventListener('click', (e) => {
    const sup = (e.target as HTMLElement).closest<HTMLElement>('sup[data-not]');
    if (!sup) return;
    editing = sup;
    range = null;
    open(sup.dataset.not ?? '');
  });

  dlg.addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-dn]')?.dataset.dn;
    if (e.target === dlg || act === 'vazgec') { dlg.close(); return; }

    if (act === 'sil' && editing) {
      editing.remove();
      dlg.close();
      onChange();
      showToast('Dipnot silindi');
      return;
    }

    if (act === 'kaydet') {
      const value = text.value.replace(/\r\n/g, '\n').trim();
      if (!value) { showToast('Dipnot metni boş olamaz.'); text.focus(); return; }
      if (editing) {
        editing.dataset.not = value;
      } else {
        area.focus();
        restoreSelection(range);
        document.execCommand('insertHTML', false, `<sup data-not="${escapeHtml(value)}">*</sup>`);
        lockFootnotes(area);
      }
      dlg.close();
      onChange();
    }
  });
}
