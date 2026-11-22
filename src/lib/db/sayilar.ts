// Sayılar: yayındaki sayılar (en yeniden eskiye) ve bir sayının içindekiler.
// RLS yalnızca yayındaki ve tarihi gelmiş sayıları döndürür.
import type { Article, Issue } from '../types';
import { ORNEK_SAYILAR } from '../ornek-veri';
import { supabase, tableMissing } from './istemci';

let cache: Issue[] | null = null;

export async function getIssues(): Promise<Issue[]> {
  if (cache && !import.meta.env.DEV) return cache;
  if (!supabase) return (cache = ORNEK_SAYILAR);
  const { data, error } = await supabase
    .from('issues')
    .select('id, number, theme, intro, published_at')
    .order('number', { ascending: false });
  if (error) {
    if (tableMissing(error)) return (cache = []);
    throw new Error(`Sayılar alınamadı: ${error.message}`);
  }
  cache = (data ?? []).map((r) => ({
    id: String(r.id),
    number: Number(r.number),
    theme: (r.theme as string) || null,
    intro: (r.intro as string) || null,
    published_at: String(r.published_at),
  }));
  return cache;
}

/** Bir sayının yayındaki yazıları: editörün verdiği sırayla, sırası olmayanlar tarihe göre sonda. */
export function issueArticles(all: Article[], number: number): Article[] {
  const big = Number.MAX_SAFE_INTEGER;
  return all
    .filter((a) => a.issue?.number === number)
    .sort((a, b) => (a.issue!.order ?? big) - (b.issue!.order ?? big)
      || b.published_at.localeCompare(a.published_at));
}
