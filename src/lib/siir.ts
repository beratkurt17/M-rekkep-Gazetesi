// Şiir dizgisi: <p>dize<br>dize</p> → <p class="kita"><span class="dize">…</span>…</p>
// Her dize ayrı blok olduğu için telefonda uzun dize kırılınca devamı asılı girintiyle
// alta kayar; okur yeni dize ile kırılan dizeyi ayırt eder. Satır başı girintileri
// (&nbsp;) olduğu gibi korunur.
// Stiller: src/styles/article.css → "Şiir"

const INLINE = /<(\/?)(strong|em|u|a|sup)\b[^>]*>/gi;

/** Satırdaki satır içi etiketler kendi içinde açılıp kapanıyor mu? */
function balanced(line: string): boolean {
  let depth = 0;
  for (const m of line.matchAll(INLINE)) {
    depth += m[1] ? -1 : 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

/** Yalnızca normal boşluk/satır sonu kırpılır; girinti için kullanılan &nbsp; kalır. */
const trimPlain = (s: string) => s.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');

export function poemStanzas(html: string): string {
  return html.replace(/<p>([\s\S]*?)<\/p>/g, (whole, inner: string) => {
    const lines = inner.split(/<br\s*\/?>/i).map(trimPlain);
    // Bir biçim (ör. italik) birden çok dizeye yayılmışsa dokunma; <br>'li hâliyle kalır.
    if (!lines.every(balanced)) return whole;
    const spans = lines.map((l) =>
      l ? `<span class="dize">${l}</span>` : '<span class="dize bos" aria-hidden="true"></span>',
    );
    return `<p class="kita">${spans.join('')}</p>`;
  });
}
