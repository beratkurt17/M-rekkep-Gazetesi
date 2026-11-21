// Görselsiz yazılar için tipografik kapak renkleri.
// Koyu, doygunluğu düşük "baskı mürekkebi" tonları: krem yazı hepsinin üstünde okunur.
import type { Article } from './types';

const TONES = {
  bordo: '#6b1e22',
  lacivert: '#1e3350',
  zeytin: '#3d4826',
  hardal: '#7a5214',
  murdum: '#4a2441',
  is: '#2b2724',
} as const;

type Tone = keyof typeof TONES;

/** Tür → renk. Okur zamanla rengi türle eşleştirir. */
const BY_LABEL: Record<string, Tone> = {
  'öykü': 'bordo',
  'şiir': 'lacivert',
  'deneme': 'zeytin',
  'kitap': 'hardal',
  'söyleşi': 'murdum',
  'dosya': 'is',
};

const FALLBACK: Tone[] = ['bordo', 'lacivert', 'zeytin', 'hardal', 'murdum', 'is'];

/** Etiketten (yoksa adresten) sabit bir ton üretir; aynı yazı hep aynı rengi alır. */
export function coverTone(a: Pick<Article, 'label' | 'slug'>): string {
  const key = a.label?.toLocaleLowerCase('tr-TR').trim();
  if (key && BY_LABEL[key]) return TONES[BY_LABEL[key]];
  let h = 0;
  for (const ch of a.slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[FALLBACK[h % FALLBACK.length]];
}

/** Başlığın ilk harfi (baştaki tırnak/noktalama atlanır). */
export function initialOf(title: string): string {
  const m = title.match(/[\p{L}\p{N}]/u);
  return m ? m[0].toLocaleUpperCase('tr-TR') : '';
}
