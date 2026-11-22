// Basit kayıt ekranı: liste + form (yeni / düzenle / sil). Yazarlar, diziler ve
// sonraki fazlarda benzer içerik türleri bunu kullanır; her ekran yalnızca kendi
// alanlarını tanımlar.
//
// HTML (src/components/admin/KayitEkrani.astro ile üretilir), id'ler `${key}-…`:
//   -liste, -yeni, -listesi, -bos, (-ara) → liste bölümü
//   -duzen, -geri, -form, -baslik, -sil, -durum → form bölümü
import { $ } from './dom';
import { sb } from './supabase';
import { markDirty, markClean, confirmLeave } from './kirli';
import { escapeHtml, slugify } from './metin';
import { dbErrorMessage } from './veritabani';
import { showToast } from '../../scripts/toast';

interface Sira { column: string; ascending?: boolean }

export interface KayitEkraniAyar<T extends { id: string }> {
  key: string;
  table: string;
  select: string;
  /** Liste sırası; birden çok alan verilebilir (ör. ay, sonra gün). */
  order: Sira | Sira[];
  /** Tablo yoksa çalıştırılacak SQL dosyası (hata mesajı için). */
  sqlFile: string;
  text: {
    new: string; empty: string; saved: string; deleted: string;
    /** Benzersiz alan çakışınca (varsayılan: adres kullanılıyor). */
    duplicate?: string;
  };
  /** Adres (slug) bu alandan otomatik üretilir (yeni kayıtta, elle değiştirilene kadar). */
  slugFrom?: string;
  /** Listede satır: başlık ve altındaki küçük bilgi. */
  item(r: T): { title: string; meta?: string };
  /** Form başlığı (düzenlerken). */
  heading(r: T): string;
  fill(form: HTMLFormElement, r: T | null): void | Promise<void>;
  /** Kaydedilecek alanlar; hata varsa açıklama metni döner. */
  collect(form: HTMLFormElement): Record<string, unknown> | string;
  /** Silmeden önce sorulacak soru. */
  confirmDelete(r: T): Promise<string>;
  /** Kayıt eklendi/değişti/silindi (ör. başka ekranların önbelleğini tazele). */
  changed?(): void;
  /**
   * Kayıt başarıyla kaydedildikten sonra (ör. bağlı satırları güncelle, formu yenile).
   * Hata metni dönerse kullanıcıya gösterilir.
   */
  afterSave?(r: T): void | string | Promise<void | string>;
}

export interface KayitEkrani {
  bind(): void;
  /** Ekran açıldığında: listeyi göster ve yükle. */
  show(): void;
}

export function kayitEkrani<T extends { id: string }>(c: KayitEkraniAyar<T>): KayitEkrani {
  const id = (s: string) => $(`${c.key}-${s}`);
  const form = () => id('form') as HTMLFormElement;
  let rows: T[] = [];
  let query = '';
  let current: T | null = null;
  let slugTouched = false;

  const status = (text: string, kind: '' | 'ok' | 'error' = '') => {
    const el = id('durum');
    el.textContent = text;
    el.className = `save-state ${kind}`;
  };

  const showList = () => {
    id('duzen').hidden = true;
    id('liste').hidden = false;
    markClean();
    load();
  };

  async function load() {
    const list = id('listesi');
    list.innerHTML = '<li class="muted">Yükleniyor…</li>';
    let q = sb().from(c.table).select(c.select);
    for (const o of [c.order].flat()) q = q.order(o.column, { ascending: o.ascending ?? true });
    const { data, error } = await q;
    if (error) {
      list.innerHTML = '';
      id('bos').hidden = false;
      id('bos').textContent = dbErrorMessage(error, c.sqlFile);
      return;
    }
    rows = (data ?? []) as unknown as T[];
    renderList();
  }

  /** Listeyi (varsa arama metnine göre süzerek) çizer. */
  function renderList() {
    const norm = (s: string) => s.toLocaleLowerCase('tr-TR');
    const items = rows.map((r) => ({ r, it: c.item(r) }))
      .filter(({ it }) => !query || norm(`${it.title} ${it.meta ?? ''}`).includes(norm(query)));
    id('bos').hidden = items.length > 0;
    id('bos').textContent = rows.length ? 'Aramaya uyan kayıt yok.' : c.text.empty;
    id('listesi').innerHTML = items.map(({ r, it }) => {
      return `<li class="post" data-id="${escapeHtml(r.id)}">
        <button type="button" class="post-title">${escapeHtml(it.title)}</button>
        ${it.meta ? `<div class="post-meta muted">${escapeHtml(it.meta)}</div>` : ''}
      </li>`;
    }).join('');
  }

  async function open(r: T | null) {
    current = r;
    slugTouched = !!r;
    form().reset();
    await c.fill(form(), r);
    id('baslik').textContent = r ? c.heading(r) : c.text.new;
    id('sil').hidden = !r;
    status('');
    id('liste').hidden = true;
    id('duzen').hidden = false;
    markClean();
    scrollTo(0, 0);
  }

  async function save(e: Event) {
    e.preventDefault();
    const rec = c.collect(form());
    if (typeof rec === 'string') { status(rec, 'error'); return; }
    if ('slug' in rec && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(rec.slug))) {
      status('Adres yalnızca küçük harf, rakam ve tire içerebilir.', 'error');
      return;
    }
    status('Kaydediliyor…');
    const q = current
      ? sb().from(c.table).update(rec).eq('id', current.id).select(c.select).single()
      : sb().from(c.table).insert(rec).select(c.select).single();
    const { data, error } = await q;
    if (error) {
      const msg = error.code === '23505' && c.text.duplicate ? c.text.duplicate : dbErrorMessage(error, c.sqlFile);
      status(`${msg} Yazdıkların ekranda duruyor.`, 'error');
      return;
    }
    current = data as unknown as T;
    slugTouched = true;
    id('baslik').textContent = c.heading(current);
    id('sil').hidden = false;
    const afterError = await c.afterSave?.(current);
    c.changed?.();
    if (afterError) { status(afterError, 'error'); return; }
    markClean();
    status(c.text.saved, 'ok');
  }

  async function remove() {
    if (!current) return;
    if (!confirm(await c.confirmDelete(current))) return;
    const { error } = await sb().from(c.table).delete().eq('id', current.id);
    if (error) { status(dbErrorMessage(error, c.sqlFile), 'error'); return; }
    showToast(c.text.deleted);
    c.changed?.();
    showList();
  }

  return {
    bind() {
      id('yeni').addEventListener('click', () => open(null));
      id('geri').addEventListener('click', () => { if (confirmLeave()) showList(); });
      id('listesi').addEventListener('click', (e) => {
        const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-id]');
        const r = li && rows.find((x) => x.id === li.dataset.id);
        if (r) open(r);
      });
      document.getElementById(`${c.key}-ara`)?.addEventListener('input', (e) => {
        query = (e.target as HTMLInputElement).value.trim();
        renderList();
      });
      form().addEventListener('input', (e) => {
        markDirty();
        status('Kaydedilmemiş değişiklikler var');
        const t = e.target as HTMLInputElement;
        const slug = form().elements.namedItem('slug') as HTMLInputElement | null;
        if (!slug) return;
        if (t === slug) slugTouched = true;
        else if (c.slugFrom && t.name === c.slugFrom && !slugTouched) slug.value = slugify(t.value);
      });
      form().addEventListener('submit', save);
      id('sil').addEventListener('click', remove);
    },
    show: showList,
  };
}

/** Formdaki alanı adıyla verir. */
export const alan = (form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) as HTMLInputElement;
