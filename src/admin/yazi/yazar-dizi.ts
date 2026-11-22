// Yazı editöründe "Yazar" ve "Dizi (tefrika)" alanları: doldurma, hızlı ekleme,
// bölüm önerisi ve kaydedilecek değerler. Listeler: ./secimler.ts
import type { AuthorRef, SeriesRef } from '../../lib/types';
import { $ } from '../ortak/dom';
import { SQL } from '../ortak/veritabani';
import { showToast } from '../../scripts/toast';
import {
  YENI, ESKI, missing, loadChoices, fillAuthorSelect, fillSeriesSelect,
  authorById, seriesById, usedParts, partTakenBy, createAuthor, createSeries,
} from './secimler';

let form: HTMLFormElement;
let articleId: string | null = null;
let legacyByline: string | null = null;

const authorSel = () => form.elements.namedItem('author_id') as HTMLSelectElement;
const seriesSel = () => form.elements.namedItem('series_id') as HTMLSelectElement;
const partInput = () => form.elements.namedItem('series_part') as HTMLInputElement;

function hint(id: string, text: string) {
  const el = $(id);
  el.textContent = text;
  el.hidden = !text;
}

function renderAuthor() {
  const v = authorSel().value;
  $('yeni-yazar').hidden = v !== YENI;
  hint('yazar-hint',
    missing ? `Yazar listesi için Supabase'de ${SQL.faz2} dosyasını çalıştır.`
    : v === ESKI ? 'Bu yazının yazarı eski usulde yazılmış. Listeden seçersen yazar sayfasına bağlanır.'
    : '');
}

function renderSeries() {
  const v = seriesSel().value;
  $('yeni-dizi').hidden = v !== YENI;
  const inSeries = !!v && v !== YENI;
  $('bolum-satir').hidden = !inSeries;
  if (missing) { hint('dizi-hint', `Dizi seçimi için Supabase'de ${SQL.faz2} dosyasını çalıştır.`); return; }
  if (!inSeries) { hint('dizi-hint', 'Bölüm bölüm yayımlanan bir yazıysa diziyi seç.'); return; }

  const used = usedParts(v, articleId);
  const part = Number(partInput().value);
  const taken = part ? partTakenBy(v, part, articleId) : null;
  hint('dizi-hint', [
    used.length ? `Bu dizideki diğer bölümler: ${used.join(', ')}.` : 'Dizinin ilk bölümü.',
    taken ? `Dikkat: ${part}. bölüm numarası “${taken}” yazısında da kullanılıyor.` : '',
  ].filter(Boolean).join(' '));
}

/** Dizi seçilince bölüm numarası boşsa sıradaki numarayı öner. */
function suggestPart() {
  const v = seriesSel().value;
  if (!v || v === YENI || partInput().value) return;
  const used = usedParts(v, articleId);
  partInput().value = String((used.at(-1) ?? 0) + 1);
}

/** "Ekle" düğmesi: editörden çıkmadan yeni yazar/dizi kaydı. */
function bindQuickAdd(
  inputId: string, buttonId: string,
  create: (v: string) => Promise<{ id: string } | { error: string }>,
  done: (id: string) => void, onChange: () => void,
) {
  const input = $<HTMLInputElement>(inputId);
  const btn = $<HTMLButtonElement>(buttonId);
  const run = async () => {
    const v = input.value.trim();
    if (!v) { showToast('Önce adı yaz.'); input.focus(); return; }
    btn.disabled = true;
    const res = await create(v);
    btn.disabled = false;
    if ('error' in res) { showToast(res.error, 4500); return; }
    input.value = '';
    done(res.id);
    onChange();
    showToast('Eklendi');
  };
  btn.addEventListener('click', run);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
}

export function bindYazarDizi(f: HTMLFormElement, onChange: () => void) {
  form = f;
  authorSel().addEventListener('change', () => {
    renderAuthor();
    if (authorSel().value === YENI) {
      const input = $<HTMLInputElement>('yeni-yazar-ad');
      if (!input.value && legacyByline) input.value = legacyByline;
      input.focus();
    }
  });
  seriesSel().addEventListener('change', () => {
    if (seriesSel().value === YENI) $<HTMLInputElement>('yeni-dizi-ad').focus();
    suggestPart();
    renderSeries();
  });
  partInput().addEventListener('input', renderSeries);

  bindQuickAdd('yeni-yazar-ad', 'yeni-yazar-ekle', createAuthor, (id) => {
    fillAuthorSelect(authorSel(), id, null);
    renderAuthor();
  }, onChange);
  bindQuickAdd('yeni-dizi-ad', 'yeni-dizi-ekle', createSeries, (id) => {
    fillSeriesSelect(seriesSel(), id);
    partInput().value = '';
    suggestPart();
    renderSeries();
  }, onChange);
}

export interface YazarDiziRow {
  id: string;
  byline: string | null;
  author_id?: string | null;
  series_id?: string | null;
  series_part?: number | null;
}

export async function fillYazarDizi(row: YazarDiziRow | null) {
  await loadChoices();
  articleId = row?.id ?? null;
  legacyByline = row?.author_id ? null : row?.byline ?? null;
  fillAuthorSelect(authorSel(), row?.author_id ?? null, legacyByline);
  fillSeriesSelect(seriesSel(), row?.series_id ?? null);
  partInput().value = row?.series_part ? String(row.series_part) : '';
  $<HTMLInputElement>('yeni-yazar-ad').value = '';
  $<HTMLInputElement>('yeni-dizi-ad').value = '';
  renderAuthor();
  renderSeries();
}

export interface YazarDiziDegerleri {
  /** Veritabanına yazılacak alanlar. */
  fields: Record<string, unknown>;
  /** Önizleme için. */
  byline: string | null;
  author: AuthorRef | null;
  series: SeriesRef | null;
  /** Kaydı engelleyen eksik (önizlemeyi engellemez). */
  error?: string;
}

export function collectYazarDizi(): YazarDiziDegerleri {
  // Tablolar yoksa (Faz 2 SQL'i çalıştırılmadı) bu alanlara hiç dokunma; kayıt yine yapılabilsin.
  if (missing) return { fields: {}, byline: legacyByline, author: null, series: null };

  let error: string | undefined;
  const a = authorSel().value;
  const au = a && a !== YENI && a !== ESKI ? authorById(a) : null;
  if (a === YENI) error = 'Yeni yazarı “Ekle” ile kaydet ya da listeden bir yazar seç.';

  const s = seriesSel().value;
  const se = s && s !== YENI ? seriesById(s) : null;
  const part = Number(partInput().value);
  if (s === YENI) error ??= 'Yeni diziyi “Ekle” ile kaydet ya da listeden bir dizi seç.';
  if (se && !(Number.isInteger(part) && part >= 1 && part <= 999)) error ??= 'Bölüm numarası 1 ile 999 arasında bir sayı olmalı.';

  return {
    fields: {
      author_id: au?.id ?? null,
      byline: a === ESKI ? legacyByline : null, // eski serbest metin yalnızca açıkça seçiliyse kalır
      series_id: se?.id ?? null,
      series_part: se ? part : null,
    },
    byline: au?.name ?? (a === ESKI ? legacyByline : null),
    author: au ? { slug: au.slug, name: au.name } : null,
    series: se && part ? { slug: se.slug, title: se.title, part } : null,
    error,
  };
}
