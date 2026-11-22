// Ekran: Yazarlar (ad, adres, biyografi, fotoğraf).
import { $ } from '../ortak/dom';
import { sb } from '../ortak/supabase';
import { markDirty } from '../ortak/kirli';
import { escapeHtml, orNull, slugify } from '../ortak/metin';
import { uploadImage } from '../ortak/gorsel';
import { SQL } from '../ortak/veritabani';
import { kayitEkrani, alan } from '../ortak/kayit-ekrani';
import { invalidateChoices } from '../yazi/secimler';

interface YazarRow { id: string; slug: string; name: string; bio: string | null; photo: string | null }

let photo: string | null = null;

function renderPhoto() {
  $('yazar-foto').innerHTML = photo
    ? `<img src="${escapeHtml(photo)}" alt="">`
    : '<span class="muted">Fotoğraf yok</span>';
  $('yazar-foto-kaldir').hidden = !photo;
}

const ekran = kayitEkrani<YazarRow>({
  key: 'yazar',
  table: 'authors',
  select: 'id, slug, name, bio, photo',
  order: { column: 'name' },
  sqlFile: SQL.faz2,
  slugFrom: 'name',
  text: {
    new: 'Yeni yazar',
    empty: 'Henüz yazar yok. “+ Yeni yazar” ile ekle.',
    saved: 'Kaydedildi. Site 1-2 dakika içinde güncellenir.',
    deleted: 'Yazar silindi',
  },
  item: (r) => ({ title: r.name, meta: r.bio ? r.bio.slice(0, 90) + (r.bio.length > 90 ? '…' : '') : 'Biyografi yok' }),
  heading: (r) => r.name,
  fill(f, r) {
    alan(f, 'name').value = r?.name ?? '';
    alan(f, 'slug').value = r?.slug ?? '';
    alan(f, 'bio').value = r?.bio ?? '';
    photo = r?.photo ?? null;
    renderPhoto();
  },
  collect(f) {
    const name = alan(f, 'name').value.trim();
    if (!name) return 'Ad soyad boş olamaz.';
    return {
      name,
      slug: alan(f, 'slug').value.trim() || slugify(name),
      bio: orNull(alan(f, 'bio').value.replace(/\r\n/g, '\n')),
      photo,
    };
  },
  async confirmDelete(r) {
    const { count } = await sb().from('articles').select('id', { count: 'exact', head: true }).eq('author_id', r.id);
    return `“${r.name}” silinecek.` +
      (count ? ` Bu yazara bağlı ${count} yazı var; yazılar silinmez ama yazar sayfası kalkar.` : '') +
      ' Emin misin?';
  },
  changed: invalidateChoices,
});

export function bindYazarlar() {
  ekran.bind();
  $<HTMLInputElement>('yazar-foto-dosya').addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const url = await uploadImage(file);
    if (url) { photo = url; markDirty(); renderPhoto(); }
  });
  $('yazar-foto-kaldir').addEventListener('click', () => { photo = null; markDirty(); renderPhoto(); });
}

export const showYazarlar = ekran.show;
