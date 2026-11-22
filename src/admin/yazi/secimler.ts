// Yazı editöründeki yazar ve dizi seçimleri:
// - listeleri yükler (Yazarlar/Diziler ekranında değişiklik olunca tazelenir),
// - "+ Yeni yazar" / "+ Yeni dizi" ile editörden çıkmadan kayıt ekler,
// - dizide sıradaki bölüm numarasını önerir, çakışan numarayı bildirir.
import { sb } from '../ortak/supabase';
import { slugify } from '../ortak/metin';
import { dbErrorMessage, isSchemaMissing, SQL } from '../ortak/veritabani';

export interface YazarSecenek { id: string; slug: string; name: string }
export interface DiziSecenek { id: string; slug: string; title: string }
interface Bolum { id: string; title: string; series_id: string; series_part: number | null }

export const YENI = '__yeni__';
export const ESKI = '__eski__';

let authors: YazarSecenek[] = [];
let series: DiziSecenek[] = [];
let parts: Bolum[] = [];
let loaded = false;
/** Yazar/dizi tabloları henüz kurulmadıysa (Faz 2 SQL'i çalıştırılmadı) true. */
export let missing = false;

export function invalidateChoices() { loaded = false; }

export async function loadChoices(): Promise<void> {
  if (loaded) return;
  const [a, s, p] = await Promise.all([
    sb().from('authors').select('id, slug, name').order('name'),
    sb().from('series').select('id, slug, title').order('title'),
    sb().from('articles').select('id, title, series_id, series_part').not('series_id', 'is', null),
  ]);
  missing = [a.error, s.error, p.error].some((e) => e && isSchemaMissing(e));
  authors = (a.data ?? []) as YazarSecenek[];
  series = (s.data ?? []) as DiziSecenek[];
  parts = (p.data ?? []) as Bolum[];
  loaded = !a.error && !s.error && !p.error;
}

const opt = (value: string, label: string, selected = false) => {
  const o = new Option(label, value, selected, selected);
  return o;
};

/** Yazar listesi. Eski serbest metin yazar adı kayda bağlı değilse ayrı seçenek olarak durur. */
export function fillAuthorSelect(sel: HTMLSelectElement, selectedId: string | null, legacyByline: string | null) {
  const legacy = !selectedId && legacyByline ? legacyByline.trim() : '';
  const match = legacy ? authors.find((a) => a.name === legacy) : undefined;
  const chosen = selectedId ?? match?.id ?? (legacy ? ESKI : '');
  sel.replaceChildren(
    opt('', '— Yazar yok —', chosen === ''),
    ...(legacy && !match ? [opt(ESKI, `${legacy} (eski kayıt)`, true)] : []),
    ...authors.map((a) => opt(a.id, a.name, a.id === chosen)),
    opt(YENI, '+ Yeni yazar ekle…'),
  );
  sel.disabled = missing;
}

export function fillSeriesSelect(sel: HTMLSelectElement, selectedId: string | null) {
  sel.replaceChildren(
    opt('', '— Dizi yok —', !selectedId),
    ...series.map((s) => opt(s.id, s.title, s.id === selectedId)),
    opt(YENI, '+ Yeni dizi ekle…'),
  );
  sel.disabled = missing;
}

export const authorById = (id: string) => authors.find((a) => a.id === id) ?? null;
export const seriesById = (id: string) => series.find((s) => s.id === id) ?? null;

/** Dizide bu yazı dışındaki bölüm numaraları, sıralı. */
export function usedParts(seriesId: string, exceptArticleId: string | null): number[] {
  return parts
    .filter((p) => p.series_id === seriesId && p.id !== exceptArticleId && p.series_part)
    .map((p) => p.series_part!)
    .sort((x, y) => x - y);
}

export function partTakenBy(seriesId: string, part: number, exceptArticleId: string | null): string | null {
  return parts.find((p) => p.series_id === seriesId && p.series_part === part && p.id !== exceptArticleId)?.title ?? null;
}

/** Editörden hızlı yazar ekleme. Başarılıysa yeni kaydın id'si, değilse hata metni. */
export async function createAuthor(name: string): Promise<{ id: string } | { error: string }> {
  const slug = slugify(name);
  if (!slug) return { error: 'Geçerli bir ad yaz.' };
  const { data, error } = await sb().from('authors').insert({ name, slug }).select('id, slug, name').single();
  if (error) return { error: dbErrorMessage(error, SQL.faz2) };
  authors = [...authors, data as YazarSecenek].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  return { id: (data as YazarSecenek).id };
}

export async function createSeries(title: string): Promise<{ id: string } | { error: string }> {
  const slug = slugify(title);
  if (!slug) return { error: 'Geçerli bir dizi adı yaz.' };
  const { data, error } = await sb().from('series').insert({ title, slug }).select('id, slug, title').single();
  if (error) return { error: dbErrorMessage(error, SQL.faz2) };
  series = [...series, data as DiziSecenek].sort((a, b) => a.title.localeCompare(b.title, 'tr'));
  return { id: (data as DiziSecenek).id };
}
