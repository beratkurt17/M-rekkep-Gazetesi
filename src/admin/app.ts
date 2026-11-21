import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createEditor, type RichEditor } from './editor';
import {
  slugify, escapeHtml, sanitizeHtml, compressImage,
  isoToLocalInput, localInputToIso, shortDate,
} from './util';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

interface Row {
  id: string; slug: string; title: string; spot: string | null; body: string;
  label: string | null; byline: string | null; cover_image: string | null;
  image_caption: string | null; placement: string; status: string;
  published_at: string | null; updated_at: string;
}

let sb: SupabaseClient;
let editor: RichEditor;
let current: Row | null = null;   // düzenlenen yazı (yeni yazıda null)
let coverUrl: string | null = null;
let slugTouched = false;
let dirty = false;

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
    if (dirty && !confirm('Kaydedilmemiş değişiklikler var. Çıkılsın mı?')) return;
    await sb.auth.signOut();
    showLogin();
  });

  $('rebuild-btn').addEventListener('click', async () => {
    const { error } = await sb.rpc('request_rebuild');
    toast(error ? 'Güncelleme isteği gönderilemedi: ' + error.message
                : 'Site yeniden oluşturuluyor — 1-2 dakika içinde yayında.');
  });

  document.querySelectorAll<HTMLButtonElement>('.tab').forEach((t) =>
    t.addEventListener('click', () => {
      if (dirty && !confirm('Kaydedilmemiş değişiklikler var. Devam edilsin mi?')) return;
      showView(t.dataset.view as 'list' | 'settings');
    }),
  );

  $('new-btn').addEventListener('click', () => openEditor(null));
  $('back-btn').addEventListener('click', () => {
    if (dirty && !confirm('Kaydedilmemiş değişiklikler var. Çıkılsın mı?')) return;
    showView('list');
  });

  const form = $<HTMLFormElement>('edit-form');
  form.addEventListener('input', () => (dirty = true));
  $('body-editor').addEventListener('input', () => (dirty = true));

  const title = form.elements.namedItem('title') as HTMLTextAreaElement;
  const slug = form.elements.namedItem('slug') as HTMLInputElement;
  title.addEventListener('input', () => { if (!slugTouched) slug.value = slugify(title.value); });
  slug.addEventListener('input', () => { slugTouched = true; });
  form.addEventListener('submit', (e) => e.preventDefault());

  $('publish-btn').addEventListener('click', () => save('published'));
  $('draft-btn').addEventListener('click', () => save('draft'));
  $('unpublish-btn').addEventListener('click', () => {
    if (confirm('Yazı yayından kaldırılıp taslağa alınacak. Emin misin?')) save('draft');
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
const PLACEMENT: Record<string, string> = { manset: 'Manşet', surmanset: 'Sürmanşet', normal: '—' };

async function loadList() {
  const body = $('list-body');
  body.innerHTML = '<tr><td colspan="5" class="muted">Yükleniyor…</td></tr>';
  const { data, error } = await sb
    .from('articles')
    .select('id, slug, title, status, placement, published_at, updated_at, label')
    .order('updated_at', { ascending: false });
  if (error) { body.innerHTML = ''; toast('Yazılar alınamadı: ' + error.message); return; }

  $('list-empty').hidden = data.length > 0;
  body.innerHTML = data.map((r) => {
    const s = statusOf(r as Row);
    return `<tr data-id="${r.id}">
      <td class="t">${r.label ? `<span class="label">${escapeHtml(r.label)}</span> ` : ''}
        <button class="link" data-act="edit">${escapeHtml(r.title)}</button></td>
      <td><span class="pill ${s.cls}">${s.text}</span></td>
      <td>${PLACEMENT[r.placement] ?? '—'}</td>
      <td class="muted">${shortDate(r.published_at ?? r.updated_at)}</td>
      <td class="row-actions">
        ${s.cls === 'live' ? `<a href="/yazi/${encodeURIComponent(r.slug)}" target="_blank">Gör</a>` : ''}
        <button class="link danger" data-act="delete">Sil</button>
      </td>
    </tr>`;
  }).join('');

  body.querySelectorAll<HTMLButtonElement>('button[data-act]').forEach((b) =>
    b.addEventListener('click', async () => {
      const id = b.closest('tr')!.dataset.id!;
      if (b.dataset.act === 'edit') {
        const { data: row, error } = await sb.from('articles').select('*').eq('id', id).single();
        if (error) toast('Yazı açılamadı: ' + error.message); else openEditor(row as Row);
      } else {
        const title = b.closest('tr')!.querySelector('.t button')!.textContent;
        if (!confirm(`“${title}” kalıcı olarak silinecek. Bu geri alınamaz. Emin misin?`)) return;
        const { error } = await sb.from('articles').delete().eq('id', id);
        if (error) toast('Silinemedi: ' + error.message); else { toast('Yazı silindi.'); loadList(); }
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

  const f = $<HTMLFormElement>('edit-form');
  const set = (n: string, v: string) => ((f.elements.namedItem(n) as HTMLInputElement).value = v);
  set('label', row?.label ?? '');
  set('title', row?.title ?? '');
  set('byline', row?.byline ?? '');
  set('spot', row?.spot ?? '');
  set('slug', row?.slug ?? '');
  set('status', row?.status ?? 'draft');
  set('placement', row?.placement ?? 'normal');
  set('published_at', isoToLocalInput(row?.published_at ?? null));
  set('image_caption', row?.image_caption ?? '');
  editor.setHtml(row?.body ?? '');
  renderCover();
  renderStatus();
  showView('edit');
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

async function save(status: 'draft' | 'published') {
  const f = $<HTMLFormElement>('edit-form');
  const get = (n: string) => ((f.elements.namedItem(n) as HTMLInputElement).value ?? '').trim();
  const orNull = (v: string) => v || null;

  const title = get('title');
  const slug = get('slug') || slugify(title);
  if (!title) { toast('Başlık boş olamaz.'); return; }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    toast('Adres sadece küçük harf, rakam ve tire içerebilir.'); return;
  }

  let publishedAt = localInputToIso(get('published_at'));
  if (status === 'published' && !publishedAt) publishedAt = new Date().toISOString();

  const record = {
    title,
    slug,
    label: orNull(get('label')),
    byline: orNull(get('byline')),
    spot: orNull(get('spot')),
    body: sanitizeHtml(editor.getHtml()),
    cover_image: coverUrl,
    image_caption: orNull(get('image_caption')),
    placement: get('placement') || 'normal',
    status,
    published_at: publishedAt,
  };

  const q = current
    ? sb.from('articles').update(record).eq('id', current.id).select('*').single()
    : sb.from('articles').insert(record).select('*').single();
  const { data, error } = await q;

  if (error) {
    toast(error.code === '23505'
      ? 'Bu adres başka bir yazıda kullanılıyor; “Bağlantı” bölümünden değiştir.'
      : 'Kaydedilemedi: ' + error.message);
    return;
  }

  current = data as Row;
  dirty = false;
  (f.elements.namedItem('published_at') as HTMLInputElement).value = isoToLocalInput(current.published_at);
  slugTouched = true;
  editor.setHtml(current.body);
  renderStatus();

  const s = statusOf(current);
  toast(
    status === 'draft' ? 'Taslak kaydedildi.'
      : s.cls === 'scheduled' ? `Planlandı: ${shortDate(current.published_at)} itibarıyla yayına girecek.`
      : 'Yayınlandı. Site 1-2 dakika içinde güncellenecek.',
  );
}

// ---------------------------------------------------------------------
// Görseller
// ---------------------------------------------------------------------
async function uploadImage(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) { toast('Lütfen bir görsel dosyası seç.'); return null; }
  toast('Görsel yükleniyor…');
  try {
    const blob = await compressImage(file);
    const d = new Date();
    const path = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.webp`;
    const { error } = await sb.storage.from('gorseller').upload(path, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
    });
    if (error) throw error;
    toast('Görsel yüklendi.');
    return sb.storage.from('gorseller').getPublicUrl(path).data.publicUrl;
  } catch (err) {
    toast('Görsel yüklenemedi: ' + (err as Error).message);
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
  if (error) { toast('Ayarlar alınamadı: ' + error.message); return; }
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
  const { error } = await sb.from('site_settings').upsert([
    { key: 'editor_note', value: { title: v('note_title'), text: v('note_text') }, updated_at: new Date().toISOString() },
    { key: 'daily_word', value: { word: v('word'), meaning: v('meaning') }, updated_at: new Date().toISOString() },
  ]);
  toast(error ? 'Kaydedilemedi: ' + error.message : 'Ayarlar kaydedildi. Site 1-2 dakika içinde güncellenecek.');
}

// ---------------------------------------------------------------------
let toastTimer: number | undefined;
function toast(msg: string) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (t.hidden = true), 4500);
}
