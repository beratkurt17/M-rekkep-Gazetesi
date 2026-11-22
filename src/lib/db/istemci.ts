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

/** Görsel adresi yalnızca https olabilir (javascript:, data: vb. atılır). */
export function safeImageUrl(v: unknown): string | null {
  return typeof v === 'string' && /^https:\/\/[^\s"'<>]+$/i.test(v) ? v : null;
}
