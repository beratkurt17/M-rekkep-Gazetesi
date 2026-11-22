// Diziler (tefrika): dizi sayfaları ve yazılardaki "3. bölüm" bilgisi.
import type { Article, Series } from '../types';
import { ORNEK_DIZILER } from '../ornek-veri';
import { supabase, tableMissing } from './istemci';

let cache: Series[] | null = null;

export async function getSeries(): Promise<Series[]> {
  if (cache && !import.meta.env.DEV) return cache;
  if (!supabase) return (cache = ORNEK_DIZILER);
  const { data, error } = await supabase.from('series').select('id, slug, title, description').order('title');
  if (error) {
    if (tableMissing(error)) return (cache = []);
    throw new Error(`Diziler alınamadı: ${error.message}`);
  }
  cache = (data ?? []).map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    description: (r.description as string) ?? null,
  }));
  return cache;
}

/** Bir dizinin yayındaki bölümleri, bölüm sırasıyla. */
export function seriesParts(all: Article[], slug: string): Article[] {
  return all
    .filter((a) => a.series?.slug === slug)
    .sort((a, b) => a.series!.part - b.series!.part || a.published_at.localeCompare(b.published_at));
}
