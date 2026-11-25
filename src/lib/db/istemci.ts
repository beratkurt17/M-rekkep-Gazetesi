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

/**
 * Derlemede ağ aksaklığına dayanıklı istek: bağlantı hatasında 3 kez daha dener
 * (1, 3, 6 sn arayla). Yine olmazsa asıl sebebi (ör. zaman aşımı, adres bulunamadı)
 * kayda yazar — "fetch failed" tek başına bir şey söylemez.
 */
async function sturdyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const waits = [1000, 3000, 6000];
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(input, init);
    } catch (err) {
      const cause = (err as { cause?: { code?: string; message?: string } }).cause;
      const why = [cause?.code, cause?.message].filter(Boolean).join(' — ') || String(err);
      if (attempt >= waits.length) {
        console.error(`[mürekkep] Supabase'e bağlanılamadı (${attempt + 1} deneme): ${why}`);
        throw err;
      }
      console.warn(`[mürekkep] Supabase bağlantı hatası, yeniden deneniyor (${attempt + 1}/${waits.length}): ${why}`);
      await new Promise((r) => setTimeout(r, waits[attempt]));
    }
  }
}

export const supabase = usingSampleData ? null : createClient(url, key, {
  auth: { persistSession: false },
  global: { fetch: sturdyFetch },
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
