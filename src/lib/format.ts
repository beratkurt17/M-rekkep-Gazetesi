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

export function todayLong(): string {
  return new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz,
  });
}

/** Dakika cinsinden okuma süresi (HTML etiketleri hariç). */
export function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** İlk paragrafı uzun düzyazı ile başlıyorsa true (büyük baş harf için; şiirde kullanılmaz). */
export function hasLongOpening(html: string, minChars = 140): boolean {
  const first = html.match(/^\s*<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!first || /<br\s*\/?>/i.test(first[1])) return false;
  return first[1].replace(/<[^>]*>/g, '').trim().length >= minChars;
}

/** Meta açıklaması için düz metin özet. */
export function plainExcerpt(html: string, max = 160): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}
