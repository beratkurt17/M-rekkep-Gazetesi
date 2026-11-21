// Yazı gövdesini derleme sırasında (sunucu tarafında) temizler.
// Panel de kaydederken temizliyor; bu ikinci katman, biri panel dışından
// veritabanına zararlı HTML yazsa bile sitede çalışmamasını sağlar.
// Sadece derlemede kullanılır — tarayıcı paketine girmez.
import sanitizeHtml from 'sanitize-html';

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'blockquote', 'a',
    'ul', 'ol', 'li', 'img', 'figure', 'figcaption', 'hr',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'loading'],
  },
  allowedSchemes: ['https', 'http', 'mailto'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    b: 'strong',
    i: 'em',
    h1: 'h2',
    h4: 'h3',
    div: 'p',
    a: (_tag, attribs) => {
      const out: Record<string, string> = { href: attribs.href ?? '' };
      if (/^https?:/i.test(out.href)) Object.assign(out, { target: '_blank', rel: 'noopener noreferrer' });
      return { tagName: 'a', attribs: out };
    },
    img: (_tag, attribs) => ({
      tagName: 'img',
      attribs: { src: attribs.src ?? '', alt: attribs.alt ?? '', loading: 'lazy' },
    }),
  },
};

export function sanitizeBody(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
