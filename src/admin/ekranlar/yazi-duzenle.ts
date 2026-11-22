// Ekran: Yazı editörü (yeni yazı / düzenleme, kapak, Instagram alıntısı, kaydet-yayınla).
import type { Article, Placement } from '../../lib/types';
import { $ } from '../ortak/dom';
import { sb } from '../ortak/supabase';
import { markDirty, markClean, confirmLeave } from '../ortak/kirli';
import { showView } from '../ortak/gezinme';
import { slugify, escapeHtml, orNull, isoToLocalInput, localInputToIso, shortDate } from '../ortak/metin';
import { sanitizeHtml } from '../ortak/temizle';
import { uploadImage } from '../ortak/gorsel';
import { showToast } from '../../scripts/toast';
import { createEditor, type RichEditor } from '../yazi/zengin-metin';
import { openPreview } from '../yazi/onizleme';
import { statusOf, type Row } from '../yazi/tipler';

let editor: RichEditor;
let current: Row | null = null;   // düzenlenen yazı (yeni yazıda null)
let coverUrl: string | null = null;
let slugTouched = false;

const form = () => $<HTMLFormElement>('edit-form');
const field = (name: string) => form().elements.namedItem(name) as HTMLInputElement;

function changed() {
  markDirty();
  setSaveState('Kaydedilmemiş değişiklikler var');
}

export function bindYaziDuzenle() {
  editor = createEditor($('body-editor'), $('toolbar'), pickInlineImage);

  $('back-btn').addEventListener('click', () => { if (confirmLeave()) showView('list'); });

  form().addEventListener('input', changed);
  $('body-editor').addEventListener('input', changed);
  form().addEventListener('submit', (e) => e.preventDefault());

  field('title').addEventListener('input', () => {
    if (!slugTouched) field('slug').value = slugify(field('title').value);
  });
  field('slug').addEventListener('input', () => { slugTouched = true; });

  $('publish-btn').addEventListener('click', () => save('published'));
  $('draft-btn').addEventListener('click', () => save('draft'));
  $('preview-btn').addEventListener('click', () => openPreview(collectArticle()));
  $('unpublish-btn').addEventListener('click', () => {
    if (confirm('Yazı yayından kaldırılıp taslağa alınacak. Emin misin?')) save('draft');
  });

  // Instagram alıntısı: editörde seçili metni (dize sonlarıyla) alana al
  $('quote-from-selection').addEventListener('mousedown', (e) => e.preventDefault());
  $('quote-from-selection').addEventListener('click', () => {
    const sel = getSelection();
    const area = $('body-editor');
    const text = sel && sel.rangeCount && area.contains(sel.anchorNode) ? sel.toString().trim() : '';
    if (!text) { showToast('Önce metinde bir cümle ya da birkaç dize seç.'); return; }
    field('ig_quote').value = text.replace(/\n{3,}/g, '\n\n');
    changed();
    showToast('Alıntı alındı');
  });

  $<HTMLInputElement>('cover-file').addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const url = await uploadImage(file);
    if (url) { coverUrl = url; markDirty(); renderCover(); }
  });
  $('cover-remove').addEventListener('click', () => { coverUrl = null; markDirty(); renderCover(); });
}

export function openEditor(row: Row | null) {
  current = row;
  coverUrl = row?.cover_image ?? null;
  slugTouched = !!row; // mevcut yazının adresi başlıkla otomatik değişmesin

  field('title').value = row?.title ?? '';
  field('spot').value = row?.spot ?? '';
  field('byline').value = row?.byline ?? '';
  field('label').value = row?.label ?? '';
  field('manset').checked = row?.placement === 'manset';
  field('ig_quote').value = row?.ig_quote ?? '';
  field('image_caption').value = row?.image_caption ?? '';
  field('slug').value = row?.slug ?? '';
  field('published_at').value = isoToLocalInput(row?.published_at ?? null);
  editor.setHtml(row?.body ?? '');
  renderCover();
  renderStatus();
  showView('edit');
  setSaveState(row ? `Son kayıt: ${shortDate(row.updated_at)}` : 'Henüz kaydedilmedi');
}

function renderStatus() {
  const pill = $('edit-status');
  if (!current) { pill.textContent = 'Yeni yazı'; pill.className = 'pill draft'; }
  else { const s = statusOf(current); pill.textContent = s.text; pill.className = `pill ${s.cls}`; }
  const live = current?.status === 'published';
  $('publish-btn').textContent = live ? 'Güncelle' : 'Yayınla';
  $('draft-btn').hidden = live;
  $('unpublish-btn').hidden = !live;
}

function renderCover() {
  const box = $('cover-preview');
  box.innerHTML = coverUrl ? `<img src="${escapeHtml(coverUrl)}" alt="">` : '<span class="muted">Görsel yok</span>';
  $('cover-remove').hidden = !coverUrl;
}

function setSaveState(text: string, kind: '' | 'ok' | 'error' = '') {
  const el = $('save-state');
  el.textContent = text;
  el.className = `save-state ${kind}`;
}

/** Formdaki (kaydedilmemiş olabilir) hâliyle yazı — önizleme ve kaydetme için. */
function collectArticle(): Article {
  const title = field('title').value.trim();
  return {
    id: current?.id ?? 'onizleme',
    slug: field('slug').value.trim() || slugify(title) || 'onizleme',
    title: title || 'Başlıksız yazı',
    spot: orNull(field('spot').value),
    body: sanitizeHtml(editor.getHtml()),
    label: orNull(field('label').value),
    byline: orNull(field('byline').value),
    cover_image: coverUrl,
    image_caption: orNull(field('image_caption').value),
    placement: (field('manset').checked ? 'manset' : 'normal') as Placement,
    published_at: localInputToIso(field('published_at').value) ?? current?.published_at ?? new Date().toISOString(),
    view_count: 0,
    ig_quote: orNull(field('ig_quote').value.replace(/\r\n/g, '\n')),
  };
}

async function save(status: 'draft' | 'published') {
  const title = field('title').value.trim();
  if (!title) { setSaveState('Başlık boş olamaz.', 'error'); field('title').focus(); return; }
  const a = collectArticle();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug)) {
    setSaveState('Adres sadece küçük harf, rakam ve tire içerebilir.', 'error'); return;
  }

  let publishedAt = localInputToIso(field('published_at').value);
  if (status === 'published' && !publishedAt) publishedAt = new Date().toISOString();

  const record = {
    title: a.title, slug: a.slug, spot: a.spot, body: a.body,
    label: a.label, byline: a.byline, cover_image: a.cover_image, image_caption: a.image_caption,
    placement: a.placement, ig_quote: a.ig_quote,
    status, published_at: publishedAt,
  };

  setSaveState('Kaydediliyor…');
  const buttons = document.querySelectorAll<HTMLButtonElement>('.action-buttons button');
  buttons.forEach((b) => (b.disabled = true));
  const { data, error } = await (current
    ? sb().from('articles').update(record).eq('id', current.id).select('*').single()
    : sb().from('articles').insert(record).select('*').single());
  buttons.forEach((b) => (b.disabled = false));

  // Hata: yazılan metin olduğu gibi ekranda kalır, hiçbir alan sıfırlanmaz.
  if (error) {
    const msg = error.code === '23505'
      ? 'Bu adres başka bir yazıda kullanılıyor; “Adres” alanını değiştir.'
      : error.message.includes('ig_quote')
        ? 'Veritabanında Instagram alıntısı alanı yok. supabase/2026-11-21-instagram-alintisi.sql dosyasını çalıştır.'
        : 'Kaydedilemedi: ' + error.message;
    setSaveState(`${msg} Metnin ekranda duruyor; tekrar deneyebilirsin.`, 'error');
    return;
  }

  current = data as Row;
  markClean();
  slugTouched = true;
  field('published_at').value = isoToLocalInput(current.published_at);
  renderStatus();

  const s = statusOf(current);
  const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  setSaveState(
    status === 'draft' ? `Taslak kaydedildi · ${time}. Sitede görünmez.`
      : s.cls === 'scheduled' ? `Planlandı: ${shortDate(current.published_at)} itibarıyla yayına girecek.`
      : `Yayımlandı · ${time}. Site 1-2 dakika içinde güncellenir.`,
    'ok',
  );
}

function pickInlineImage(): Promise<string | null> {
  const input = $<HTMLInputElement>('inline-image-file');
  return new Promise((resolve) => {
    input.onchange = async () => {
      const file = input.files?.[0];
      input.value = '';
      resolve(file ? await uploadImage(file) : null);
    };
    input.click();
  });
}
