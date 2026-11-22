// Yazılar: veritabanından çekme ve ana sayfa düzeni.
import type { Article, Bicim, Placement } from '../types';
import { ORNEK_YAZILAR } from '../ornek-veri';
import { sanitizeBody } from '../sanitize';
import { supabase, safeImageUrl } from './istemci';

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
    bicim: ((r.bicim as Bicim) ?? 'otomatik'),
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
