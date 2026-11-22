// Ekran: Diziler (tefrika) — ad, adres, tanıtım; bölümler yazılardan gelir.
import { $ } from '../ortak/dom';
import { sb } from '../ortak/supabase';
import { escapeHtml, orNull, slugify } from '../ortak/metin';
import { SQL } from '../ortak/veritabani';
import { kayitEkrani, alan } from '../ortak/kayit-ekrani';
import { invalidateChoices } from '../yazi/secimler';

interface DiziRow { id: string; slug: string; title: string; description: string | null }

/** Formda dizinin bölümleri (taslaklar dahil), bölüm sırasıyla. */
async function renderParts(seriesId: string | null) {
  const box = $('dizi-bolumleri');
  if (!seriesId) { box.innerHTML = '<li class="muted">Dizi kaydedildikten sonra yazılara eklenebilir.</li>'; return; }
  box.innerHTML = '<li class="muted">Yükleniyor…</li>';
  const { data, error } = await sb().from('articles')
    .select('title, series_part, status')
    .eq('series_id', seriesId)
    .order('series_part');
  if (error) { box.innerHTML = `<li class="muted">${escapeHtml(error.message)}</li>`; return; }
  box.innerHTML = data.length
    ? data.map((p) => `<li><strong>${p.series_part}.</strong> ${escapeHtml(p.title)}${p.status !== 'published' ? ' <span class="pill draft">Taslak</span>' : ''}</li>`).join('')
    : '<li class="muted">Henüz bölüm yok.</li>';
}

const ekran = kayitEkrani<DiziRow>({
  key: 'dizi',
  table: 'series',
  select: 'id, slug, title, description',
  order: { column: 'title' },
  sqlFile: SQL.faz2,
  slugFrom: 'title',
  text: {
    new: 'Yeni dizi',
    empty: 'Henüz dizi yok. “+ Yeni dizi” ile ekle.',
    saved: 'Kaydedildi. Site 1-2 dakika içinde güncellenir.',
    deleted: 'Dizi silindi',
  },
  item: (r) => ({ title: r.title, meta: r.description ? r.description.slice(0, 90) + (r.description.length > 90 ? '…' : '') : undefined }),
  heading: (r) => r.title,
  fill(f, r) {
    alan(f, 'title').value = r?.title ?? '';
    alan(f, 'slug').value = r?.slug ?? '';
    alan(f, 'description').value = r?.description ?? '';
    return renderParts(r?.id ?? null);
  },
  collect(f) {
    const title = alan(f, 'title').value.trim();
    if (!title) return 'Dizinin adı boş olamaz.';
    return {
      title,
      slug: alan(f, 'slug').value.trim() || slugify(title),
      description: orNull(alan(f, 'description').value.replace(/\r\n/g, '\n')),
    };
  },
  async confirmDelete(r) {
    const { count } = await sb().from('articles').select('id', { count: 'exact', head: true }).eq('series_id', r.id);
    return `“${r.title}” dizisi silinecek.` +
      (count ? ` ${count} bölüm diziden çıkar; yazılar silinmez, ayrı yazı olarak kalır.` : '') +
      ' Emin misin?';
  },
  changed: invalidateChoices,
  afterSave: (r) => { renderParts(r.id); },
});

export const bindDiziler = ekran.bind;
export const showDiziler = ekran.show;
