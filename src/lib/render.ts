// Akış öğesi ve yazı sayfasının HTML'i — TEK KAYNAK.
// Hem site (Astro sayfaları) hem yönetim panelindeki önizleme bu fonksiyonları kullanır;
// böylece önizleme ile yayındaki görünüm birebir aynıdır.
// Stiller: src/styles/feed.css ve src/styles/article.css
import type { Article } from './types';
import { feedExcerpt, formatDate, formatDateTime, readingMinutes, hasLongOpening, isPoemArticle } from './format';
import { poemStanzas } from './siir';
import { extractFootnotes, footnotesHtml } from './dipnot';

export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function articlePath(slug: string): string {
  return `/yazi/${slug}/`;
}

export function authorPath(slug: string): string {
  return `/yazar/${slug}/`;
}

export function seriesPath(slug: string): string {
  return `/dizi/${slug}/`;
}

/** "Okuma Üzerine · 2. bölüm" */
export function seriesLabel(s: { title: string; part: number }): string {
  return `${s.title} · ${s.part}. bölüm`;
}

/** Akıştaki tek bir yazı. lead=true → manşet. */
export function feedItemHtml(a: Article, opts: { lead?: boolean; href?: string } = {}): string {
  const lead = !!opts.lead;
  const href = esc(opts.href ?? articlePath(a.slug));
  const h = lead ? 'h2' : 'h3';
  const ex = feedExcerpt(a);

  const media = a.cover_image
    ? `<a class="fi-media" href="${href}" tabindex="-1" aria-hidden="true">` +
      `<img src="${esc(a.cover_image)}" alt="" loading="${lead ? 'eager' : 'lazy'}" decoding="async"></a>`
    : '';

  const excerpt = !ex ? ''
    : ex.kind === 'poem'
      ? `<p class="fi-excerpt is-poem">${ex.lines.map(esc).join('<br>')}</p>`
      : `<p class="fi-excerpt">${esc(ex.text)}</p>`;

  const meta = [
    a.label ? `<span class="fi-label">${esc(a.label)}</span>` : '',
    a.series ? `<span class="fi-series">${esc(seriesLabel(a.series))}</span>` : '',
    `<time datetime="${esc(a.published_at)}">${formatDate(a.published_at)}</time>`,
  ].filter(Boolean).join('<span aria-hidden="true"> · </span>');

  return `<article class="fi${lead ? ' fi--lead' : ''}${a.cover_image ? ' fi--img' : ''}">
  ${media}
  <div class="fi-text">
    <${h} class="fi-title"><a href="${href}">${esc(a.title)}</a></${h}>
    ${a.byline ? `<p class="fi-byline">${esc(a.byline)}</p>` : ''}
    ${excerpt}
    <p class="fi-meta">${meta}</p>
  </div>
</article>`;
}

/** Yazı sayfasının okuma sütunu: başlık bloğu + kapak + gövde. */
export function articleHtml(a: Article): string {
  const poem = isPoemArticle(a);
  const bodyClass = ['art-body', poem ? 'is-poem' : '', !poem && hasLongOpening(a.body) ? 'dropcap' : '']
    .filter(Boolean).join(' ');
  const fn = extractFootnotes(a.body);
  const body = poem ? poemStanzas(fn.html) : fn.html;

  return `<header class="art-head">
  ${a.label ? `<p class="art-label">${esc(a.label)}</p>` : ''}
  ${a.series ? `<p class="art-series"><a href="${esc(seriesPath(a.series.slug))}">${esc(a.series.title)}</a><span aria-hidden="true"> · </span>${a.series.part}. bölüm</p>` : ''}
  <h1 class="art-title">${esc(a.title)}</h1>
  ${a.spot ? `<p class="art-spot">${esc(a.spot)}</p>` : ''}
  ${a.author ? `<p class="art-byline"><a href="${esc(authorPath(a.author.slug))}">${esc(a.author.name)}</a></p>`
    : a.byline ? `<p class="art-byline">${esc(a.byline)}</p>` : ''}
  <div class="art-meta-row">
    <p class="art-meta"><time datetime="${esc(a.published_at)}">${formatDateTime(a.published_at)}</time><span aria-hidden="true"> · </span>${readingMinutes(a.body)} dk okuma</p>
    <div class="art-actions">
      <button type="button" class="art-btn" data-action="reading" aria-pressed="false">Okuma modu</button>
      <button type="button" class="art-btn" data-action="share" aria-haspopup="dialog">Paylaş</button>
    </div>
  </div>
</header>
${a.cover_image ? `<figure class="art-cover">
  <img src="${esc(a.cover_image)}" alt="${esc(a.image_caption ?? '')}">
  ${a.image_caption ? `<figcaption>${esc(a.image_caption)}</figcaption>` : ''}
</figure>` : ''}
<div class="${bodyClass}">${body}</div>
${footnotesHtml(fn.notes)}`;
}

/** WhatsApp paylaşım adresi: gerçek başlık + kalıcı bağlantı, doğru kodlanmış. */
export function whatsappUrl(title: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
}
