import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Article, Placement } from '../lib/types';
import { createEditor, type RichEditor } from './editor';
import { openPreview } from './preview';
import { showToast } from '../scripts/toast';
import {
  slugify, escapeHtml, sanitizeHtml, compressImage,
  isoToLocalInput, localInputToIso, shortDate,
} from './util';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

/** Veritabanındaki yazı satırı (panelde taslaklar da görünür). */
interface Row extends Omit<Article, 'published_at'> {
  status: 'draft' | 'published';
  published_at: string | null;
  updated_at: string;
}
type ListRow = Pick<Row, 'id' | 'slug' | 'title' | 'status' | 'placement' | 'published_at' | 'updated_at' | 'label'>;
type Filter = 'all' | 'draft' | 'published';

let sb: SupabaseClient;
let editor: RichEditor;
let current: Row | null = null;   // düzenlenen yazı (yeni yazıda null)
let coverUrl: string | null = null;
let slugTouched = false;
let dirty = false;
let posts: ListRow[] = [];
let filter: Filter = 'all';

const form = () => $<HTMLFormElement>('edit-form');
const field = (name: string) => form().elements.namedItem(name) as HTMLInputElement;

// ---------------------------------------------------------------------
// Başlangıç ve giriş
// ---------------------------------------------------------------------
export function initAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  sb = createClient(url, key);
  editor = createEditor($('body-editor'), $('toolbar'), pickInlineImage);
  bindUi();

  sb.auth.getSession().then(({ data }) => {
    if (data.session) enterApp(); else showLogin();
  });
}

function showLogin(msg?: string) {
  $('app').hidden = true;
  $('login').hidden = false;
  const err = $('login-error');
  err.hidden = !msg;
  err.textContent = msg ?? '';
}

async function enterApp() {
  const { data: isAdmin, error } = await sb.rpc('is_admin');
  if (error || !isAdmin) {
    await sb.auth.signOut();
    showLogin('Bu hesabın yönetim yetkisi yok.');
    return;
  }
  $('login').hidden = true;
  $('app').hidden = false;
  showView('list');
}

const confirmLeave = () => !dirty || confirm('Kaydedilmemiş değişiklikler var. Çıkılsın mı?');

// ---------------------------------------------------------------------
// Arayüz bağlantıları
// ---------------------------------------------------------------------
function bindUi() {
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target as HTMLFormElement);
    const btn = (e.target as HTMLFormElement).querySelector('button')!;
    btn.disabled = true;
    const { error } = await sb.auth.signInWithPassword({
      email: String(f.get('email')),
      password: String(f.get('password')),
    });
    btn.disabled = false;
    if (error) showLogin('E-posta veya şifre hatalı.');
    else enterApp();
  });

  $('logout-btn').addEventListener('click', async () => {
    if (!confirmLeave()) return;
    await sb.auth.signOut();
    showLogin();
  });

  $('rebuild-btn').addEventListener('click', async () => {
    const { error } = await sb.rpc('request_rebuild');
    showToast(error ? 'Güncelleme isteği gönderilemedi: ' + error.message
                    : 'Site yeniden oluşturuluyor — 1-2 dakika içinde yayında.', 4500);
  });

  document.querySelectorAll<HTMLButtonElement>('.tab').forEach((t) =>
    t.addEventListener('click', () => { if (confirmLeave()) showView(t.dataset.view as 'list' | 'settings'); }),
  );
  document.querySelectorAll<HTMLButtonElement>('.filter').forEach((b) =>
    b.addEventListener('click', () => { filter = b.dataset.filter as Filter; renderList(); }),
  );

  $('new-btn').addEventListener('click', () => openEditor(null));
  $('back-btn').addEventListener('click', () => { if (confirmLeave()) showView('list'); });

  form().addEventListener('input', () => { dirty = true; setSaveState('Kaydedilmemiş değişiklikler var'); });
  $('body-editor').addEventListener('input', () => { dirty = true; setSaveState('Kaydedilmemiş değişiklikler var'); });
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
    dirty = true;
    setSaveState('Kaydedilmemiş değişiklikler var');
    showToast('Alıntı alındı');
  });

  $<HTMLInputElement>('cover-file').addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const url = await uploadImage(file);
    if (url) { coverUrl = url; dirty = true; renderCover(); }
  });
  $('cover-remove').addEventListener('click', () => { coverUrl = null; dirty = true; renderCover(); });

  $('settings-form').addEventListener('submit', saveSettings);

  window.addEventListener('beforeunload', (e) => { if (dirty) e.preventDefault(); });
}

function showView(v: 'list' | 'edit' | 'settings') {
  for (const name of ['list', 'edit', 'settings']) $(`view-${name}`).hidden = name !== v;
  document.querySelectorAll<HTMLButtonElement>('.tab').forEach((t) =>
    t.classList.toggle('active', t.dataset.view === v || (v === 'edit' && t.dataset.view === 'list')),
  );
  dirty = false;
  if (v === 'list') loadList();
  if (v === 'settings') loadSettings();
  scrollTo(0, 0);
}

// ---------------------------------------------------------------------
// Yazı listesi
// ---------------------------------------------------------------------
function statusOf(r: Pick<Row, 'status' | 'published_at'>): { text: string; cls: string } {
  if (r.status !== 'published') return { text: 'Taslak', cls: 'draft' };
  if (r.published_at && new Date(r.published_at) > new Date()) return { text: 'Planlı', cls: 'scheduled' };
  return { text: 'Yayında', cls: 'live' };
}

async function loadList() {
  $('post-list').innerHTML = '<li class="muted">Yükleniyor…</li>';
  const { data, error } = await sb
    .from('articles')
    .select('id, slug, title, status, placement, published_at, updated_at, label')
    .order('updated_at', { ascending: false });
  if (error) { $('post-list').innerHTML = ''; showToast('Yazılar alınamadı: ' + error.message); return; }
  posts = data as ListRow[];
  renderList();
}

function renderList() {
  const counts = {
    all: posts.length,
    draft: posts.filter((p) => p.status === 'draft').length,
    published: posts.filter((p) => p.status === 'published').length,
  };
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => (el.textContent = String(counts[el.dataset.count as Filter])));
  document.querySelectorAll<HTMLButtonElement>('.filter').forEach((b) => b.classList.toggle('active', b.dataset.filter === filter));

  const rows = filter === 'all' ? posts : posts.filter((p) => p.status === filter);
  const empty = $('list-empty');
  empty.hidden = rows.length > 0;
  empty.textContent = filter === 'draft' ? 'Taslak yok.' : filter === 'published' ? 'Yayında yazı yok.' : 'Henüz yazı yok. “Yeni yazı” ile başla.';

  $('post-list').innerHTML = rows.map((r) => {
    const s = statusOf(r);
    return `<li class="post" data-id="${r.id}">
      <button class="post-title" data-act="edit">${escapeHtml(r.title)}</button>
      <div class="post-meta">
        <span class="pill ${s.cls}">${s.text}</span>
        ${r.placement === 'manset' ? '<span class="pill">Manşet</span>' : ''}
        ${r.label ? `<span>${escapeHtml(r.label)}</span>` : ''}
        <span class="muted">${shortDate(r.published_at ?? r.updated_at)}</span>
      </div>
      <div class="post-actions">
        ${s.cls === 'live' ? `<a href="/yazi/${encodeURIComponent(r.slug)}/" target="_blank">Sitede gör</a>` : ''}
        <button class="danger" data-act="delete">Sil</button>
      </div>
    </li>`;
  }).join('');

  $('post-list').querySelectorAll<HTMLButtonElement>('button[data-act]').forEach((b) =>
    b.addEventListener('click', async () => {
      const li = b.closest<HTMLElement>('li')!;
      const id = li.dataset.id!;
      if (b.dataset.act === 'edit') {
        const { data: row, error } = await sb.from('articles').select('*').eq('id', id).single();
        if (error) showToast('Yazı açılamadı: ' + error.message); else openEditor(row as Row);
      } else {
        const title = li.querySelector('.post-title')!.textContent;
        if (!confirm(`“${title}” kalıcı olarak silinecek. Bu geri alınamaz. Emin misin?`)) return;
        const { error } = await sb.from('articles').delete().eq('id', id);
        if (error) showToast('Silinemedi: ' + error.message); else { showToast('Yazı silindi'); loadList(); }
      }
    }),
  );
}

// ---------------------------------------------------------------------
// Editör
// ---------------------------------------------------------------------
function openEditor(row: Row | null) {
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

const orNull = (v: string) => (v.trim() ? v.trim() : null);

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
    ? sb.from('articles').update(record).eq('id', current.id).select('*').single()
    : sb.from('articles').insert(record).select('*').single());
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
  dirty = false;
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

// ---------------------------------------------------------------------
// Görseller
// ---------------------------------------------------------------------
async function uploadImage(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) { showToast('Lütfen bir görsel dosyası seç.'); return null; }
  showToast('Görsel yükleniyor…');
  try {
    const blob = await compressImage(file);
    const d = new Date();
    const path = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.webp`;
    const { error } = await sb.storage.from('gorseller').upload(path, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
    });
    if (error) throw error;
    showToast('Görsel yüklendi');
    return sb.storage.from('gorseller').getPublicUrl(path).data.publicUrl;
  } catch (err) {
    showToast('Görsel yüklenemedi: ' + (err as Error).message, 4500);
    return null;
  }
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

// ---------------------------------------------------------------------
// Site ayarları
// ---------------------------------------------------------------------
async function loadSettings() {
  const { data, error } = await sb.from('site_settings').select('key, value');
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
  const { error } = await sb.from('site_settings').upsert([
    { key: 'editor_note', value: { title: v('note_title'), text: v('note_text') }, updated_at: now },
    { key: 'daily_word', value: { word: v('word'), meaning: v('meaning') }, updated_at: now },
  ]);
  showToast(error ? 'Kaydedilemedi: ' + error.message : 'Ayarlar kaydedildi. Site 1-2 dakika içinde güncellenir.', 4500);
}
