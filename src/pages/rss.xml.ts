// RSS beslemesi: /rss.xml — son 50 yazı, tam metniyle (dipnotlar yazının sonunda).
// Okurlar RSS okuyucularından takip edebilir; bülten servisleri de buradan beslenebilir.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getArticles } from '../lib/db';
import { plainExcerpt } from '../lib/format';
import { articlePath, esc } from '../lib/render';
import { extractFootnotes, footnotesHtml } from '../lib/dipnot';
import type { Article } from '../lib/types';

/** Besleme okuyucusunda görünecek tam metin (kapak + gövde + dipnotlar). */
function content(a: Article): string {
  const fn = extractFootnotes(a.body);
  const cover = a.cover_image
    ? `<figure><img src="${esc(a.cover_image)}" alt="${esc(a.image_caption ?? '')}">${a.image_caption ? `<figcaption>${esc(a.image_caption)}</figcaption>` : ''}</figure>`
    : '';
  const spot = a.spot ? `<p><em>${esc(a.spot)}</em></p>` : '';
  return cover + spot + fn.html + footnotesHtml(fn.notes);
}

export async function GET(context: APIContext) {
  const all = (await getArticles()).slice(0, 50);
  return rss({
    title: 'Mürekkep',
    description: 'Mürekkep — edebiyat gazetesi. Şiir, öykü, deneme ve söyleşiler.',
    site: context.site!,
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    customData: '<language>tr</language>',
    trailingSlash: true,
    items: all.map((a) => ({
      title: a.title,
      link: articlePath(a.slug),
      pubDate: new Date(a.published_at),
      description: a.spot || plainExcerpt(a.body, 300),
      content: content(a),
      categories: a.label ? [a.label] : undefined,
      customData: a.byline ? `<dc:creator>${esc(a.byline)}</dc:creator>` : undefined,
    })),
  });
}
