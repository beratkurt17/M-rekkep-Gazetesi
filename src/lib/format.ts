// Tarih ve metin yardımcıları (sunucu + tarayıcı ortak).
import type { Bicim } from './types';

const tz = 'Europe/Istanbul';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: tz,
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: tz,
  });
}

export function todayLong(date = new Date()): string {
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz,
  });
}

// ---------------------------------------------------------------------
// HTML → düz metin
// ---------------------------------------------------------------------
const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Satır sonları (\n) ve paragraf/kıta boşlukları (\n\n) korunarak düz metin. */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<sup\b[^>]*\bdata-not=[^>]*>[\s\S]*?<\/sup>/gi, '') // dipnot işaretleri
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|h2|h3|li|blockquote|figure)>/gi, '\n\n')
      .replace(/<[^>]*>/g, ''),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Paragraf içinde metin–<br>–metin varsa şiir kabul edilir (dizeler alt alta). */
export function isPoem(html: string): boolean {
  return /[^>\s]\s*<br\s*\/?>\s*[^<\s]/i.test(html);
}

/** Yazı şiir olarak mı dizilsin? Editörün seçimi önceliklidir; "otomatik"te metne bakılır. */
export function isPoemArticle(a: { bicim?: Bicim; body: string }): boolean {
  if (a.bicim === 'siir') return true;
  if (a.bicim === 'duzyazi') return false;
  return isPoem(a.body);
}

export function readingMinutes(html: string): number {
  const words = htmlToText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Meta açıklaması / akış özeti için tek satırlık düz metin. */
export function plainExcerpt(html: string, max = 160): string {
  const text = htmlToText(html).replace(/\s+/g, ' ');
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…';
}

/** Şiirin ilk n dizesi (metinden aynen alınır). */
export function poemLines(html: string, n: number): string[] {
  return htmlToText(html).split('\n').map((l) => l.trim()).filter(Boolean).slice(0, n);
}

/** İlk paragraf uzun ise true (büyük baş harf için). Yalnızca düzyazıda çağrılır. */
export function hasLongOpening(html: string, minChars = 140): boolean {
  const first = html.match(/^\s*<p[^>]*>([\s\S]*?)<\/p>/i);
  return !!first && htmlToText(first[1]).length >= minChars;
}

export type Excerpt =
  | { kind: 'spot' | 'prose'; text: string }
  | { kind: 'poem'; lines: string[] };

/** Akıştaki kısa metin: spot → (şiirse) ilk iki dize → metnin girişi. */
export function feedExcerpt(a: { spot: string | null; body: string; bicim?: Bicim }): Excerpt | null {
  if (a.spot?.trim()) return { kind: 'spot', text: a.spot.trim() };
  if (isPoemArticle(a)) {
    const lines = poemLines(a.body, 2);
    return lines.length ? { kind: 'poem', lines } : null;
  }
  const text = plainExcerpt(a.body, 220);
  return text ? { kind: 'prose', text } : null;
}
