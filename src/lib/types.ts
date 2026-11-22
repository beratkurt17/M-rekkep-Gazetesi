export type Placement = 'manset' | 'surmanset' | 'normal';

/** Yazının dizgisi: otomatik → metindeki dize sonlarına bakılır. */
export type Bicim = 'otomatik' | 'duzyazi' | 'siir';

/** Yazıda gösterilen yazar (sayfa bağlantısı için adresiyle). */
export interface AuthorRef { slug: string; name: string }

/** Yazının yer aldığı sayı (yalnızca yayındaki sayılar). */
export interface IssueRef { number: number }

/** Yazının ait olduğu dizi ve bölüm numarası. */
export interface SeriesRef { slug: string; title: string; part: number }

export interface Article {
  id: string;
  slug: string;
  title: string;
  spot: string | null;
  body: string;
  label: string | null;
  /** Gösterilen yazar adı: yazar kaydı varsa onun adı, yoksa eski serbest metin. */
  byline: string | null;
  /** Yazar kaydı (yazar sayfasına bağlantı için); eski yazılarda null olabilir. */
  author: AuthorRef | null;
  /** Dizi (tefrika) bölümü ise dizi bilgisi. */
  series: SeriesRef | null;
  /** Yayındaki bir sayıya bağlıysa sayı numarası; sayı içindeki sırası. */
  issue: (IssueRef & { order: number | null }) | null;
  cover_image: string | null;
  image_caption: string | null;
  placement: Placement;
  published_at: string;
  view_count: number;
  /** Editörün hikâye kartı için seçtiği alıntı (dize sonları \n ile korunur). */
  ig_quote: string | null;
  bicim: Bicim;
}

export interface Author {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  photo: string | null;
}

export interface Series {
  id: string;
  slug: string;
  title: string;
  description: string | null;
}

/** Gazetenin bir sayısı: numara, dosya konusu ve girişi. */
export interface Issue {
  id: string;
  number: number;
  theme: string | null;
  intro: string | null;
  published_at: string;
}

export interface SiteSettings {
  editor_note?: { title?: string; text: string };
  daily_word?: { word: string; meaning: string };
}
