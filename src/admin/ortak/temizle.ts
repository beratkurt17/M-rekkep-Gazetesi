// İçerik temizleme: editörden gelen HTML'de sadece izinli etiketler kalır.
// (Derlemede ikinci bir temizlik daha yapılır: src/lib/sanitize.ts)

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
