// Köşe: Günün dizesi / alıntısı (her gün bir kayıt).
import { orNull } from '../ortak/metin';
import { SQL } from '../ortak/veritabani';
import { kayitEkrani, alan } from '../ortak/kayit-ekrani';
import { nextFreeDay, dayLabel } from './kose-ortak';

interface DizeRow { id: string; show_on: string; body: string; author: string | null; source: string | null }

const firstLine = (s: string) => {
  const l = s.split('\n')[0].trim();
  return l.length > 70 ? l.slice(0, 70) + '…' : l;
};

export const dizeEkrani = kayitEkrani<DizeRow>({
  key: 'dize',
  table: 'quotes',
  select: 'id, show_on, body, author, source',
  order: { column: 'show_on', ascending: false },
  sqlFile: SQL.faz4,
  text: {
    new: 'Yeni dize',
    empty: 'Henüz dize yok. “+ Yeni dize” ile ekle.',
    saved: 'Kaydedildi. Site 1-2 dakika içinde güncellenir.',
    deleted: 'Dize silindi',
    duplicate: 'Bu güne zaten bir dize var; günü değiştir.',
  },
  item: (r) => ({ title: firstLine(r.body), meta: [dayLabel(r.show_on), r.author].filter(Boolean).join(' · ') }),
  heading: (r) => dayLabel(r.show_on),
  async fill(f, r) {
    alan(f, 'show_on').value = r?.show_on ?? await nextFreeDay('quotes');
    alan(f, 'body').value = r?.body ?? '';
    alan(f, 'author').value = r?.author ?? '';
    alan(f, 'source').value = r?.source ?? '';
  },
  collect(f) {
    const show_on = alan(f, 'show_on').value;
    const body = alan(f, 'body').value.replace(/\r\n/g, '\n').trim();
    if (!show_on) return 'Hangi gün görüneceğini seç.';
    if (!body) return 'Dize / alıntı boş olamaz.';
    return { show_on, body, author: orNull(alan(f, 'author').value), source: orNull(alan(f, 'source').value) };
  },
  confirmDelete: async (r) => `${dayLabel(r.show_on)} tarihli dize silinecek. Emin misin?`,
});
