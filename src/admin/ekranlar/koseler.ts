// Ekran: Köşeler — bölüm seçici (Dize · Kelime · Takvim · Editörden) ve editörün notu.
// Dize/kelime/takvim bölümleri ortak kayıt ekranıdır: kose-dize.ts, kose-kelime.ts, kose-takvim.ts
import { $ } from '../ortak/dom';
import { sb } from '../ortak/supabase';
import { confirmLeave, markClean, markDirty } from '../ortak/kirli';
import { showToast } from '../../scripts/toast';
import { dizeEkrani } from './kose-dize';
import { kelimeEkrani } from './kose-kelime';
import { takvimEkrani } from './kose-takvim';

const BOLUMLER = { dize: dizeEkrani, kelime: kelimeEkrani, takvim: takvimEkrani } as const;
type Bolum = keyof typeof BOLUMLER | 'not';
let active: Bolum = 'dize';

function showBolum(b: Bolum) {
  active = b;
  document.querySelectorAll<HTMLButtonElement>('[data-kose]').forEach((t) =>
    t.setAttribute('aria-selected', String(t.dataset.kose === b)),
  );
  for (const k of [...Object.keys(BOLUMLER), 'not']) $(`${k}-bolum`).hidden = k !== b;
  markClean();
  if (b === 'not') loadNote();
  else BOLUMLER[b].show();
}

async function loadNote() {
  const { data, error } = await sb().from('site_settings').select('value').eq('key', 'editor_note').maybeSingle();
  if (error) { showToast('Not alınamadı: ' + error.message); return; }
  const f = $<HTMLFormElement>('not-form');
  (f.elements.namedItem('note_title') as HTMLInputElement).value = data?.value?.title ?? '';
  (f.elements.namedItem('note_text') as HTMLTextAreaElement).value = data?.value?.text ?? '';
}

async function saveNote(e: Event) {
  e.preventDefault();
  const f = new FormData(e.target as HTMLFormElement);
  const v = (n: string) => String(f.get(n) ?? '').trim();
  const { error } = await sb().from('site_settings').upsert({
    key: 'editor_note',
    value: { title: v('note_title'), text: v('note_text') },
    updated_at: new Date().toISOString(),
  });
  if (error) { showToast('Kaydedilemedi: ' + error.message, 4500); return; }
  markClean();
  showToast('Not kaydedildi. Site 1-2 dakika içinde güncellenir.', 4500);
}

export function bindKoseler() {
  Object.values(BOLUMLER).forEach((e) => e.bind());
  document.querySelectorAll<HTMLButtonElement>('[data-kose]').forEach((t) =>
    t.addEventListener('click', () => { if (confirmLeave()) showBolum(t.dataset.kose as Bolum); }),
  );
  $('not-form').addEventListener('input', markDirty);
  $('not-form').addEventListener('submit', saveNote);
}

/** Sekme açıldığında son seçili bölüm görünür. */
export const showKoseler = () => showBolum(active);
