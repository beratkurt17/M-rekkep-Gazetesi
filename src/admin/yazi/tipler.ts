// Panelde yazı satırının tipleri ve durum etiketi (liste ve editör ortak kullanır).
import type { Article } from '../../lib/types';

/**
 * Veritabanındaki yazı satırı (panelde taslaklar da görünür).
 * Sitedeki Article'dan farkı: yazar/dizi kimlikle tutulur (author_id, series_id).
 */
export interface Row extends Omit<Article, 'published_at' | 'author' | 'series'> {
  status: 'draft' | 'published';
  published_at: string | null;
  updated_at: string;
  author_id?: string | null;   // Faz 2 SQL'inden önce bu alanlar yoktur
  series_id?: string | null;
  series_part?: number | null;
}

export type ListRow = Pick<Row, 'id' | 'slug' | 'title' | 'status' | 'placement' | 'published_at' | 'updated_at' | 'label'>;

export function statusOf(r: Pick<Row, 'status' | 'published_at'>): { text: string; cls: string } {
  if (r.status !== 'published') return { text: 'Taslak', cls: 'draft' };
  if (r.published_at && new Date(r.published_at) > new Date()) return { text: 'Planlı', cls: 'scheduled' };
  return { text: 'Yayında', cls: 'live' };
}
