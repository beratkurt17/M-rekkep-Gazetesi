// Ekran: Yazılar listesi (süzme, düzenlemeye açma, silme).
import { $ } from '../ortak/dom';
import { sb } from '../ortak/supabase';
import { escapeHtml, shortDate } from '../ortak/metin';
import { showToast } from '../../scripts/toast';
import { statusOf, type ListRow, type Row } from '../yazi/tipler';
import { openEditor } from './yazi-duzenle';

type Filter = 'all' | 'draft' | 'published';

let posts: ListRow[] = [];
let filter: Filter = 'all';

export function bindYaziListesi() {
  document.querySelectorAll<HTMLButtonElement>('.filter').forEach((b) =>
    b.addEventListener('click', () => { filter = b.dataset.filter as Filter; renderList(); }),
  );
  $('new-btn').addEventListener('click', () => openEditor(null));
}

export async function loadList() {
  $('post-list').innerHTML = '<li class="muted">Yükleniyor…</li>';
  const { data, error } = await sb()
    .from('articles')
    .select('id, slug, title, status, placement, published_at, updated_at, label')
    .order('updated_at', { ascending: false });
  if (error) { $('post-list').innerHTML = ''; showToast('Yazılar alınamadı: ' + error.message); return; }
  posts = data as ListRow[];
  renderList();
}

function renderList() {
  const counts = {
    all: posts.length,
    draft: posts.filter((p) => p.status === 'draft').length,
    published: posts.filter((p) => p.status === 'published').length,
  };
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => (el.textContent = String(counts[el.dataset.count as Filter])));
  document.querySelectorAll<HTMLButtonElement>('.filter').forEach((b) => b.classList.toggle('active', b.dataset.filter === filter));

  const rows = filter === 'all' ? posts : posts.filter((p) => p.status === filter);
  const empty = $('list-empty');
  empty.hidden = rows.length > 0;
  empty.textContent = filter === 'draft' ? 'Taslak yok.' : filter === 'published' ? 'Yayında yazı yok.' : 'Henüz yazı yok. “Yeni yazı” ile başla.';

  $('post-list').innerHTML = rows.map((r) => {
    const s = statusOf(r);
    return `<li class="post" data-id="${r.id}">
      <button class="post-title" data-act="edit">${escapeHtml(r.title)}</button>
      <div class="post-meta">
        <span class="pill ${s.cls}">${s.text}</span>
        ${r.placement === 'manset' ? '<span class="pill">Manşet</span>' : ''}
        ${r.label ? `<span>${escapeHtml(r.label)}</span>` : ''}
        <span class="muted">${shortDate(r.published_at ?? r.updated_at)}</span>
      </div>
      <div class="post-actions">
        ${s.cls === 'live' ? `<a href="/yazi/${encodeURIComponent(r.slug)}/" target="_blank">Sitede gör</a>` : ''}
        <button class="danger" data-act="delete">Sil</button>
      </div>
    </li>`;
  }).join('');

  $('post-list').querySelectorAll<HTMLButtonElement>('button[data-act]').forEach((b) =>
    b.addEventListener('click', async () => {
      const li = b.closest<HTMLElement>('li')!;
      const id = li.dataset.id!;
      if (b.dataset.act === 'edit') {
        const { data: row, error } = await sb().from('articles').select('*').eq('id', id).single();
        if (error) showToast('Yazı açılamadı: ' + error.message); else openEditor(row as Row);
      } else {
        const title = li.querySelector('.post-title')!.textContent;
        if (!confirm(`“${title}” kalıcı olarak silinecek. Bu geri alınamaz. Emin misin?`)) return;
        const { error } = await sb().from('articles').delete().eq('id', id);
        if (error) showToast('Silinemedi: ' + error.message); else { showToast('Yazı silindi'); loadList(); }
      }
    }),
  );
}
