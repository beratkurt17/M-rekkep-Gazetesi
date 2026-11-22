// Köşe: Günün kelimesi (her gün bir kayıt).
import { SQL } from '../ortak/veritabani';
import { kayitEkrani, alan } from '../ortak/kayit-ekrani';
import { nextFreeDay, dayLabel } from './kose-ortak';

interface KelimeRow { id: string; show_on: string; word: string; meaning: string }

export const kelimeEkrani = kayitEkrani<KelimeRow>({
  key: 'kelime',
  table: 'words',
  select: 'id, show_on, word, meaning',
  order: { column: 'show_on', ascending: false },
  sqlFile: SQL.faz4,
  text: {
    new: 'Yeni kelime',
    empty: 'Henüz kelime yok. “+ Yeni kelime” ile ekle.',
    saved: 'Kaydedildi. Site 1-2 dakika içinde güncellenir.',
    deleted: 'Kelime silindi',
    duplicate: 'Bu güne zaten bir kelime var; günü değiştir.',
  },
  item: (r) => ({ title: r.word, meta: dayLabel(r.show_on) }),
  heading: (r) => `${r.word} · ${dayLabel(r.show_on)}`,
  async fill(f, r) {
    alan(f, 'show_on').value = r?.show_on ?? await nextFreeDay('words');
    alan(f, 'word').value = r?.word ?? '';
    alan(f, 'meaning').value = r?.meaning ?? '';
  },
  collect(f) {
    const show_on = alan(f, 'show_on').value;
    const word = alan(f, 'word').value.trim();
    const meaning = alan(f, 'meaning').value.replace(/\r\n/g, '\n').trim();
    if (!show_on) return 'Hangi gün görüneceğini seç.';
    if (!word) return 'Kelime boş olamaz.';
    if (!meaning) return 'Anlamı boş olamaz.';
    return { show_on, word, meaning };
  },
  confirmDelete: async (r) => `“${r.word}” (${dayLabel(r.show_on)}) silinecek. Emin misin?`,
});
