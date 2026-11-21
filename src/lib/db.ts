import { createClient } from '@supabase/supabase-js';
import type { Article, SiteSettings } from './types';
import { ORNEK_YAZILAR, ORNEK_AYARLAR } from './ornek-veri';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Supabase bilgisi yoksa ya da PUBLIC_SAMPLE_DATA=1 verilmişse (tasarım denemesi)
// örnek verilerle çalışır.
export const usingSampleData = !url || !key || import.meta.env.PUBLIC_SAMPLE_DATA === '1';

const supabase = usingSampleData ? null : createClient(url, key, {
  auth: { persistSession: false },
});

const FIELDS =
  'id, slug, title, spot, body, label, byline, cover_image, image_caption, placement, published_at, view_count';

let cache: Article[] | null = null;

/** Yayındaki tüm yazılar, en yeniden eskiye. Derleme sırasında bir kez çekilir. */
export async function getArticles(): Promise<Article[]> {
  if (cache) return cache;
  if (!supabase) {
    console.warn('[mürekkep] Supabase bilgisi yok — örnek verilerle derleniyor.');
    cache = ORNEK_YAZILAR;
    return cache;
  }
  // RLS sadece yayındaki ve tarihi gelmiş yazıları döndürür.
  const { data, error } = await supabase
    .from('articles')
    .select(FIELDS)
    .order('published_at', { ascending: false });
  if (error) throw new Error(`Yazılar alınamadı: ${error.message}`);
  cache = (data ?? []) as Article[];
  return cache;
}

export async function getSettings(): Promise<SiteSettings> {
  if (!supabase) return ORNEK_AYARLAR;
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) throw new Error(`Ayarlar alınamadı: ${error.message}`);
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as SiteSettings;
}

/** Ana sayfa düzeni: manşet, sürmanşetler ve geri kalanlar. */
export async function getFrontPage() {
  const all = await getArticles();
  const manset = all.find((a) => a.placement === 'manset') ?? all[0];
  const surmanset = all
    .filter((a) => a.placement === 'surmanset' && a.id !== manset?.id)
    .slice(0, 4);
  const used = new Set([manset?.id, ...surmanset.map((a) => a.id)]);
  const rest = all.filter((a) => !used.has(a.id));
  const popular = [...all].sort((a, b) => b.view_count - a.view_count).slice(0, 5);
  return { manset, surmanset, rest, popular };
}
