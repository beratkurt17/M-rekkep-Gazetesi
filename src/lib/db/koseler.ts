// Ana sayfa köşeleri: editörün notu, günün dizesi, günün kelimesi, bugün edebiyatta.
// "Bugün" Türkiye saatine göredir. Site saatte bir yeniden oluşturulduğu için
// gün değişince köşeler de kendiliğinden değişir.
import type { CalendarEntry, Koseler, Quote, Word } from '../types';
import { ORNEK_KOSELER } from '../ornek-veri';
import { supabase, tableMissing } from './istemci';
import { getSettings } from './ayarlar';
import { todayIso } from '../format';

function todayLabel(d = new Date()): string {
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' });
}

/** O güne ait kayıt; yoksa en son tarihli geçmiş kayıt (köşe boş kalmasın). */
async function latestUpTo<T>(table: string, columns: string, today: string): Promise<T | null> {
  const { data, error } = await supabase!
    .from(table).select(columns).lte('show_on', today)
    .order('show_on', { ascending: false }).limit(1);
  if (error) {
    if (tableMissing(error)) return null;
    throw new Error(`${table} alınamadı: ${error.message}`);
  }
  return (data?.[0] as T) ?? null;
}

async function calendarFor(today: string): Promise<CalendarEntry[]> {
  const [, m, d] = today.split('-').map(Number);
  const { data, error } = await supabase!
    .from('calendar').select('year, kind, person, note')
    .eq('month', m).eq('day', d)
    .order('year', { ascending: true, nullsFirst: false });
  if (error) {
    if (tableMissing(error)) return [];
    throw new Error(`Takvim alınamadı: ${error.message}`);
  }
  return (data ?? []) as CalendarEntry[];
}

let cache: Koseler | null = null;

export async function getKoseler(): Promise<Koseler> {
  if (cache && !import.meta.env.DEV) return cache;
  if (!supabase) return (cache = ORNEK_KOSELER);

  const today = todayIso();
  const [settings, quote, word, cal] = await Promise.all([
    getSettings(),
    latestUpTo<Quote>('quotes', 'body, author, source', today),
    latestUpTo<Word>('words', 'word, meaning', today),
    calendarFor(today),
  ]);
  const legacyWord = settings.daily_word?.word ? settings.daily_word : null;
  const note = settings.editor_note?.text?.trim()
    ? { title: settings.editor_note.title?.trim() || 'Editörden', text: settings.editor_note.text.trim() }
    : null;

  cache = {
    note,
    quote,
    word: word ?? legacyWord, // tablo henüz yoksa eski tek kelime ayarı
    today: cal,
    todayLabel: todayLabel(),
  };
  return cache;
}
