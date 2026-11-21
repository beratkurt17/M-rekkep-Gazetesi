export type Placement = 'manset' | 'surmanset' | 'normal';

export interface Article {
  id: string;
  slug: string;
  title: string;
  spot: string | null;
  body: string;
  label: string | null;
  byline: string | null;
  cover_image: string | null;
  image_caption: string | null;
  placement: Placement;
  published_at: string;
  view_count: number;
  /** Editörün hikâye kartı için seçtiği alıntı (dize sonları \n ile korunur). */
  ig_quote: string | null;
}

export interface SiteSettings {
  editor_note?: { title?: string; text: string };
  daily_word?: { word: string; meaning: string };
}
