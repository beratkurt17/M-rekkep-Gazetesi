// Ekran: Site ayarları (editörün notu, günün kelimesi).
import { $ } from '../ortak/dom';
import { sb } from '../ortak/supabase';
import { showToast } from '../../scripts/toast';

export function bindAyarlar() {
  $('settings-form').addEventListener('submit', saveSettings);
}

export async function loadSettings() {
  const { data, error } = await sb().from('site_settings').select('key, value');
  if (error) { showToast('Ayarlar alınamadı: ' + error.message); return; }
  const s = Object.fromEntries(data.map((r) => [r.key, r.value]));
  const f = $<HTMLFormElement>('settings-form');
  const set = (n: string, v: string) => ((f.elements.namedItem(n) as HTMLInputElement).value = v ?? '');
  set('note_title', s.editor_note?.title);
  set('note_text', s.editor_note?.text);
  set('word', s.daily_word?.word);
  set('meaning', s.daily_word?.meaning);
}

async function saveSettings(e: Event) {
  e.preventDefault();
  const f = new FormData(e.target as HTMLFormElement);
  const v = (n: string) => String(f.get(n) ?? '').trim();
  const now = new Date().toISOString();
  const { error } = await sb().from('site_settings').upsert([
    { key: 'editor_note', value: { title: v('note_title'), text: v('note_text') }, updated_at: now },
    { key: 'daily_word', value: { word: v('word'), meaning: v('meaning') }, updated_at: now },
  ]);
  showToast(error ? 'Kaydedilemedi: ' + error.message : 'Ayarlar kaydedildi. Site 1-2 dakika içinde güncellenir.', 4500);
}
