import { createClient } from '@supabase/supabase-js';
import type { Article, Placement, SiteSettings } from './types';
import { ORNEK_YAZILAR, ORNEK_AYARLAR } from './ornek-veri';
import { sanitizeBody } from './sanitize';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Supabase bilgisi yoksa ya da PUBLIC_SAMPLE_DATA=1 verilmişse (tasarım denemesi)
// örnek verilerle çalışır.
export const usingSampleData = !url || !key || import.meta.env.PUBLIC_SAMPLE_DATA === '1';

const supabase = usingSampleData ? null : createClient(url, key, {
  auth: { persistSession: false },
});

/** Kapak görseli yalnızca https adresi olabilir (javascript:, data: vb. atılır). */
function safeImageUrl(v: unknown): string | null {
  return typeof v === 'string' && /^https:\/\/[^\s"'<>]+$/i.test(v) ? v : null;
}

/** Veritabanı satırını Article'a çevirir; sonradan eklenen alanlar eski satırlarda boş olabilir. */
function toArticle(r: Record<string, unknown>): Article {
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    spot: (r.spot as string) ?? null,
    body: sanitizeBody((r.body as string) ?? ''),
    label: (r.label as string) ?? null,
    byline: (r.byline as string) ?? null,
    cover_image: safeImageUrl(r.cover_image),
    image_caption: (r.image_caption as string) ?? null,
    placement: ((r.placement as Placement) ?? 'normal'),
    published_at: String(r.published_at),
    view_count: Number(r.view_count ?? 0),
    ig_quote: (r.ig_quote as string) ?? null,
  };
}

let cache: Article[] | null = null;

/** Yayındaki tüm yazılar, en yeniden eskiye. */
export async function getArticles(): Promise<Article[]> {
  // Derlemede tek seferlik çekim yeterli; yerel sunucuda (dev) her istekte taze veri gelsin.
  if (cache && !import.meta.env.DEV) return cache;
  if (!supabase) {
    console.warn('[mürekkep] Supabase bilgisi yok — örnek verilerle derleniyor.');
    cache = ORNEK_YAZILAR;
    return cache;
  }
  // RLS sadece yayındaki ve tarihi gelmiş yazıları döndürür.
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) throw new Error(`Yazılar alınamadı: ${error.message}`);
  cache = (data ?? []).map(toArticle);
  return cache;
}

export async function getSettings(): Promise<SiteSettings> {
  if (!supabase) return ORNEK_AYARLAR;
  const { data, error } = await supabase.from('site_settings').select('key, value');
  if (error) throw new Error(`Ayarlar alınamadı: ${error.message}`);
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as SiteSettings;
}

/**
 * Ana sayfa: manşet (editör seçtiyse en yeni manşet, yoksa en son yazı)
 * ve manşet dışındaki yazılar.
 */
export async function getFrontPage() {
  const all = await getArticles();
  const lead = all.find((a) => a.placement === 'manset') ?? all[0] ?? null;
  const latest = all.filter((a) => a.id !== lead?.id);
  const popular = [...all].sort((a, b) => b.view_count - a.view_count).slice(0, 5);
  return { lead, latest, popular };
}
