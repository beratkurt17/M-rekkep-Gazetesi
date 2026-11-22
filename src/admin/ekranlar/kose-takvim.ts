// Köşe: Edebiyat takvimi — gün/ay kayıtları, her yıl tekrarlanır.
import { orNull } from '../ortak/metin';
import { SQL } from '../ortak/veritabani';
import { kayitEkrani, alan } from '../ortak/kayit-ekrani';
import { AYLAR } from '../../lib/format';

type Tur = 'dogum' | 'olum' | 'diger';
interface TakvimRow {
  id: string; month: number; day: number; year: number | null;
  kind: Tur; person: string; note: string | null; source: string | null;
}

const TUR: Record<Tur, string> = { dogum: 'Doğum', olum: 'Ölüm', diger: 'Diğer' };
const AY_GUN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const gunAy = (r: Pick<TakvimRow, 'day' | 'month'>) => `${r.day} ${AYLAR[r.month - 1]}`;

export const takvimEkrani = kayitEkrani<TakvimRow>({
  key: 'takvim',
  table: 'calendar',
  select: 'id, month, day, year, kind, person, note, source',
  order: [{ column: 'month' }, { column: 'day' }, { column: 'year' }],
  sqlFile: SQL.faz4,
  text: {
    new: 'Yeni takvim kaydı',
    empty: 'Takvim boş. “+ Yeni kayıt” ile ekle.',
    saved: 'Kaydedildi. Site 1-2 dakika içinde güncellenir.',
    deleted: 'Kayıt silindi',
    duplicate: 'Bu kişi için bu günde aynı türde bir kayıt zaten var.',
  },
  item: (r) => ({
    title: `${gunAy(r)} · ${r.person}`,
    meta: [TUR[r.kind] + (r.year ? `, ${r.year}` : ''), r.note].filter(Boolean).join(' · '),
  }),
  heading: (r) => `${gunAy(r)} · ${r.person}`,
  fill(f, r) {
    const now = new Date();
    alan(f, 'day').value = String(r?.day ?? now.getDate());
    alan(f, 'month').value = String(r?.month ?? now.getMonth() + 1);
    alan(f, 'year').value = r?.year ? String(r.year) : '';
    alan(f, 'kind').value = r?.kind ?? 'dogum';
    alan(f, 'person').value = r?.person ?? '';
    alan(f, 'note').value = r?.note ?? '';
    alan(f, 'source').value = r?.source ?? '';
  },
  collect(f) {
    const day = Number(alan(f, 'day').value);
    const month = Number(alan(f, 'month').value);
    const yearText = alan(f, 'year').value.trim();
    const year = yearText ? Number(yearText) : null;
    const person = alan(f, 'person').value.trim();
    if (!Number.isInteger(day) || day < 1 || day > AY_GUN[month - 1]) return `${AYLAR[month - 1]} ayında ${day || '?'}. gün yok.`;
    if (year !== null && (!Number.isInteger(year) || year < 1 || year > 2100)) return 'Yıl geçerli bir sayı olmalı (ör. 1901).';
    if (!person) return '“Kim / ne” boş olamaz.';
    return {
      day, month, year, person,
      kind: alan(f, 'kind').value as Tur,
      note: orNull(alan(f, 'note').value),
      source: orNull(alan(f, 'source').value),
    };
  },
  confirmDelete: async (r) => `“${gunAy(r)} · ${r.person}” kaydı silinecek. Emin misin?`,
});
