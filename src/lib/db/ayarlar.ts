// Site ayarları (editörün notu, günün kelimesi…).
import type { SiteSettings } from '../types';
import { ORNEK_AYARLAR } from '../ornek-veri';
import { supabase } from './istemci';

export async function getSettings(): Promise<SiteSettings> {
  if (!supabase) return ORNEK_AYARLAR;
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) throw new Error(`Ayarlar alınamadı: ${error.message}`);
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as SiteSettings;
}
