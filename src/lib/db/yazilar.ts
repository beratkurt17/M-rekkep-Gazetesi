// Yazılar: veritabanından çekme, yazar/dizi bilgisini bağlama ve ana sayfa düzeni.
import type { Article, Author, Bicim, Placement, Series } from '../types';
import { ORNEK_YAZILAR } from '../ornek-veri';
import { sanitizeBody } from '../sanitize';
import { supabase, safeImageUrl } from './istemci';
import { getAuthors } from './yazarlar';
import { getSeries } from './diziler';

interface Lookups { authors: Map<string, Author>; series: Map<string, Series> }

/** Veritabanı satırını Article'a çevirir; sonradan eklenen alanlar eski satırlarda boş olabilir. */
function toArticle(r: Record<string, unknown>, l: Lookups): Article {
  const author = r.author_id ? l.authors.get(String(r.author_id)) : undefined;
  const series = r.series_id ? l.series.get(String(r.series_id)) : undefined;
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    spot: (r.spot as string) ?? null,
    body: sanitizeBody((r.body as string) ?? ''),
    label: (r.label as string) ?? null,
    byline: author?.name ?? ((r.byline as string) || null),
    author: author ? { slug: author.slug, name: author.name } : null,
    series: series && r.series_part
      ? { slug: series.slug, title: series.title, part: Number(r.series_part) }
      : null,
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
  const [{ data, error }, authors, series] = await Promise.all([
    supabase.from('articles').select('*').order('published_at', { ascending: false }),
    getAuthors(),
    getSeries(),
  ]);
  if (error) throw new Error(`Yazılar alınamadı: ${error.message}`);
  const lookups: Lookups = {
    authors: new Map(authors.map((a) => [a.id, a])),
    series: new Map(series.map((s) => [s.id, s])),
  };
  cache = (data ?? []).map((r) => toArticle(r, lookups));
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
