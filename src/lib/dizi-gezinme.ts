// Dizi (tefrika) bölümünün sonunda: önceki / sonraki bölüm ve "Tüm bölümler".
// Yalnızca yayındaki bölümler sayılır. Stiller: src/styles/article.css → "Dizi gezintisi"
import type { Article } from './types';
import { esc, articlePath, seriesPath } from './render';

export function seriesNavHtml(current: Article, parts: Article[]): string {
  if (!current.series || parts.length < 2) return '';
  const i = parts.findIndex((p) => p.id === current.id);
  const prev = i > 0 ? parts[i - 1] : null;
  const next = i >= 0 && i < parts.length - 1 ? parts[i + 1] : null;

  const link = (p: Article, dir: 'prev' | 'next') => `
    <a class="sn-link sn-${dir}" href="${esc(articlePath(p.slug))}">
      <span class="sn-dir">${dir === 'prev' ? '← Önceki bölüm' : 'Sonraki bölüm →'}</span>
      <span class="sn-title">${p.series!.part}. ${esc(p.title)}</span>
    </a>`;

  return `<nav class="series-nav" aria-label="Dizinin bölümleri" data-pagefind-ignore>
  <p class="section-title">Dizi · <a href="${esc(seriesPath(current.series.slug))}">${esc(current.series.title)}</a></p>
  <div class="sn-links">${prev ? link(prev, 'prev') : ''}${next ? link(next, 'next') : ''}</div>
  <a class="sn-all" href="${esc(seriesPath(current.series.slug))}">Tüm bölümler (${parts.length})</a>
</nav>`;
}
