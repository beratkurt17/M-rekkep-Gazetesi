// Yönetim paneli yardımcıları

const TR: Record<string, string> = {
  ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u',
};

/** "Şehrin Kitapçıları Kapanırken" → "sehrin-kitapcilari-kapanirken" */
export function slugify(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıiöşüâîû]/g, (c) => TR[c] ?? c)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** ISO → <input type="datetime-local"> değeri (tarayıcının yerel saati) */
export function isoToLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function localInputToIso(v: string): string | null {
  return v ? new Date(v).toISOString() : null;
}

export function shortDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ---------------------------------------------------------------------
// İçerik temizleme: editörden gelen HTML'de sadece izinli etiketler kalır.
// ---------------------------------------------------------------------
const ALLOWED = new Set([
  'P', 'BR', 'STRONG', 'EM', 'U', 'H2', 'H3', 'BLOCKQUOTE', 'A',
  'UL', 'OL', 'LI', 'IMG', 'FIGURE', 'FIGCAPTION', 'HR',
]);
const RENAME: Record<string, string> = { B: 'STRONG', I: 'EM', DIV: 'P', H1: 'H2', H4: 'H3' };

function safeUrl(url: string | null, allowMailto = false): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, location.origin);
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
    if (allowMailto && u.protocol === 'mailto:') return u.href;
  } catch {}
  return null;
}

export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild as HTMLElement;

  const walk = (el: Element) => {
    for (const child of [...el.children]) {
      let node = child;
      const renamed = RENAME[node.tagName];
      if (renamed) {
        const r = doc.createElement(renamed);
        while (node.firstChild) r.appendChild(node.firstChild);
        node.replaceWith(r);
        node = r;
      }
      if (!ALLOWED.has(node.tagName)) {
        // İzinsiz etiket: script/style tamamen silinir, diğerlerinin metni korunur
        if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(node.tagName)) {
          node.remove();
        } else {
          walk(node);
          node.replaceWith(...node.childNodes);
        }
        continue;
      }
      // Öznitelikleri temizle
      const keep: Record<string, string> = {};
      if (node.tagName === 'A') {
        const href = safeUrl(node.getAttribute('href'), true);
        if (href) keep.href = href;
      }
      if (node.tagName === 'IMG') {
        const src = safeUrl(node.getAttribute('src'));
        if (!src) { node.remove(); continue; }
        keep.src = src;
        keep.alt = node.getAttribute('alt') ?? '';
        keep.loading = 'lazy';
      }
      for (const a of [...node.attributes]) node.removeAttribute(a.name);
      for (const [k, v] of Object.entries(keep)) node.setAttribute(k, v);
      if (node.tagName === 'A' && keep.href?.startsWith('http')) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener');
      }
      walk(node);
    }
  };
  walk(root);

  // Paragraf sonundaki fazla <br>'leri ve boş paragrafları at
  // (yalnızca <br> içeren boş satırlar düzyazının şiir sanılmasına yol açmasın)
  root.querySelectorAll('p').forEach((p) => {
    while (p.lastChild?.nodeName === 'BR') p.lastChild.remove();
    if (!p.textContent?.trim() && !p.querySelector('img')) p.remove();
  });
  return root.innerHTML.trim();
}

// ---------------------------------------------------------------------
// Görsel: yüklemeden önce küçült ve WebP'ye çevir (depolama kotasını korur)
// ---------------------------------------------------------------------
export async function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Görsel dönüştürülemedi'))), 'image/webp', quality),
  );
}
