export type Placement = 'manset' | 'surmanset' | 'normal';

/** Yazının dizgisi: otomatik → metindeki dize sonlarına bakılır. */
export type Bicim = 'otomatik' | 'duzyazi' | 'siir';

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
  bicim: Bicim;
}

export interface SiteSettings {
  editor_note?: { title?: string; text: string };
  daily_word?: { word: string; meaning: string };
}
