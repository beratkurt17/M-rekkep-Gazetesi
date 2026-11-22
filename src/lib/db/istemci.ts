// Derleme sırasında kullanılan Supabase bağlantısı (sadece okuma, anonim anahtar).
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Supabase bilgisi yoksa ya da PUBLIC_SAMPLE_DATA=1 verilmişse (tasarım denemesi)
// örnek verilerle çalışır.
export const usingSampleData = !url || !key || import.meta.env.PUBLIC_SAMPLE_DATA === '1';

export const supabase = usingSampleData ? null : createClient(url, key, {
  auth: { persistSession: false },
});

/**
 * Tablo henüz kurulmamış mı? (ör. yeni fazın SQL dosyası çalıştırılmadan derleme yapıldı)
 * Bu durumda site çökmez; o içerik türü boş sayılır ve uyarı yazılır.
 */
export function tableMissing(error: { code?: string; message: string }): boolean {
  const missing = error.code === 'PGRST205' || error.code === '42P01';
  if (missing) console.warn(`[mürekkep] Tablo yok, atlanıyor (SQL dosyası çalıştırılmamış olabilir): ${error.message}`);
  return missing;
}

/** Görsel adresi yalnızca https olabilir (javascript:, data: vb. atılır). */
export function safeImageUrl(v: unknown): string | null {
  return typeof v === 'string' && /^https:\/\/[^\s"'<>]+$/i.test(v) ? v : null;
}
