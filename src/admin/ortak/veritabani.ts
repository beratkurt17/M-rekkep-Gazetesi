// Veritabanı hatalarını kullanıcıya anlaşılır Türkçe mesaja çevirir.

interface DbError { code?: string; message: string }

/** Tablo ya da alan yok → ilgili fazın SQL dosyası çalıştırılmamış. */
export function isSchemaMissing(e: DbError): boolean {
  return ['PGRST205', '42P01', 'PGRST204', '42703'].includes(e.code ?? '');
}

export function dbErrorMessage(e: DbError, sqlFile: string): string {
  if (e.code === '23505') return 'Bu adres başka bir kayıtta kullanılıyor; “Adres” alanını değiştir.';
  if (isSchemaMissing(e)) return `Veritabanı güncel değil. Supabase SQL Editor'de ${sqlFile} dosyasını çalıştır.`;
  if (e.code === '23514') return 'Bir alan kurallara uymuyor (çok uzun ya da geçersiz olabilir).';
  return e.message;
}

/** Her fazın veritabanı dosyası (hata mesajlarında kullanıcıya gösterilir). */
export const SQL = {
  igQuote: 'supabase/2026-11-21-instagram-alintisi.sql',
  faz1: 'supabase/2026-11-22-faz1-bicim.sql',
  faz2: 'supabase/2026-11-22-faz2-yazarlar-diziler.sql',
} as const;
