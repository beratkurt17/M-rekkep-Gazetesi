// Derleme sırasında kullanılan Supabase bağlantısı (sadece okuma, anonim anahtar).
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_URL as url, SUPABASE_ANON_KEY as key, supabaseUrlValid } from '../supabase-ayar';

if (url && !supabaseUrlValid) {
  throw new Error(
    `PUBLIC_SUPABASE_URL geçersiz görünüyor (${url.length} karakter, "${url.slice(0, 12)}…" ile başlıyor). ` +
    'Biçimi şöyle olmalı: https://<proje-kimliği>.supabase.co — başında/sonunda başka bir şey olmamalı.',
  );
}

// Supabase bilgisi yoksa ya da PUBLIC_SAMPLE_DATA=1 verilmişse (tasarım denemesi)
// örnek verilerle çalışır.
export const usingSampleData = !url || !key || import.meta.env.PUBLIC_SAMPLE_DATA === '1';

// GitHub'daki yayın derlemesinde (CI) örnek veriyle site yayınlanmasın: Supabase bilgisi
// yoksa derleme durur, canlıdaki son sürüm olduğu gibi kalır.
if (process.env.CI && usingSampleData) {
  throw new Error(
    'Yayın derlemesinde Supabase bilgisi yok (ya da PUBLIC_SAMPLE_DATA=1). ' +
    'GitHub → Settings → Secrets and variables → Actions → Variables altında ' +
    'PUBLIC_SUPABASE_URL ve PUBLIC_SUPABASE_ANON_KEY tanımlı olmalı.',
  );
}

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
