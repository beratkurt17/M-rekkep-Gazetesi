// Yazarlar (yazar sayfaları ve yazılardaki yazar adı).
import type { Author } from '../types';
import { ORNEK_YAZARLAR } from '../ornek-veri';
import { supabase, safeImageUrl, tableMissing } from './istemci';

let cache: Author[] | null = null;

export async function getAuthors(): Promise<Author[]> {
  if (cache && !import.meta.env.DEV) return cache;
  if (!supabase) return (cache = ORNEK_YAZARLAR);
  const { data, error } = await supabase.from('authors').select('id, slug, name, bio, photo').order('name');
  if (error) {
    if (tableMissing(error)) return (cache = []);
    throw new Error(`Yazarlar alınamadı: ${error.message}`);
  }
  cache = (data ?? []).map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    bio: (r.bio as string) ?? null,
    photo: safeImageUrl(r.photo),
  }));
  return cache;
}
