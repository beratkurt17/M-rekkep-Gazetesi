// Ekran: Sayılar — numara, dosya konusu, dosya girişi, yayın durumu ve içindekilerin sırası.
import { $ } from '../ortak/dom';
import { sb } from '../ortak/supabase';
import { markDirty } from '../ortak/kirli';
import { escapeHtml, orNull, isoToLocalInput, localInputToIso, shortDate } from '../ortak/metin';
import { SQL, dbErrorMessage } from '../ortak/veritabani';
import { kayitEkrani, alan } from '../ortak/kayit-ekrani';
import { invalidateIssues } from '../yazi/sayi-secimi';

interface SayiRow {
  id: string;
  number: number;
  theme: string | null;
  intro: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  articles?: { count: number }[];
}

interface Icerik { id: string; title: string; status: string; issue_order: number | null }

/** Formdaki içindekiler (sırası değiştirilebilir). */
let contents: Icerik[] = [];

function statusText(r: Pick<SayiRow, 'status' | 'published_at'>) {
  if (r.status !== 'published') return 'Taslak';
  if (r.published_at && new Date(r.published_at) > new Date()) return 'Planlı';
  return 'Yayında';
}

function renderContents() {
  const box = $('sayi-icindekiler');
  if (!contents.length) {
    box.innerHTML = '<li class="muted">Bu sayıda henüz yazı yok. Yazının “Sayı” seçiminden ekle.</li>';
    return;
  }
  box.innerHTML = contents.map((c, i) => `<li data-i="${i}">
    <span class="sira-no">${i + 1}.</span>
    <span class="sira-t">${escapeHtml(c.title)}${c.status !== 'published' ? ' <span class="pill draft">Taslak</span>' : ''}</span>
    <button type="button" class="sira-btn" data-yon="-1" aria-label="Yukarı taşı" ${i === 0 ? 'disabled' : ''}>↑</button>
    <button type="button" class="sira-btn" data-yon="1" aria-label="Aşağı taşı" ${i === contents.length - 1 ? 'disabled' : ''}>↓</button>
  </li>`).join('');
}

async function loadContents(issueId: string | null) {
  contents = [];
  if (!issueId) { renderContents(); return; }
  $('sayi-icindekiler').innerHTML = '<li class="muted">Yükleniyor…</li>';
  const { data, error } = await sb().from('articles')
    .select('id, title, status, issue_order')
    .eq('issue_id', issueId)
    .order('issue_order', { ascending: true, nullsFirst: false })
    .order('published_at', { ascending: false });
  if (error) { $('sayi-icindekiler').innerHTML = `<li class="muted">${escapeHtml(error.message)}</li>`; return; }
  contents = data as Icerik[];
  renderContents();
}

/** Sırası değişen yazıları kaydeder (1, 2, 3…). */
async function saveOrder(): Promise<string | void> {
  const changed = contents
    .map((c, i) => ({ c, order: i + 1 }))
    .filter(({ c, order }) => c.issue_order !== order);
  for (const { c, order } of changed) {
    const { error } = await sb().from('articles').update({ issue_order: order }).eq('id', c.id);
    if (error) return `Sayı kaydedildi ama yazı sırası kaydedilemedi: ${dbErrorMessage(error, SQL.faz3)}`;
    c.issue_order = order;
  }
}

const ekran = kayitEkrani<SayiRow>({
  key: 'sayi',
  table: 'issues',
  select: 'id, number, theme, intro, status, published_at, articles(count)',
  order: { column: 'number', ascending: false },
  sqlFile: SQL.faz3,
  text: {
    new: 'Yeni sayı',
    empty: 'Henüz sayı yok. “+ Yeni sayı” ile ilk sayıyı aç.',
    saved: 'Kaydedildi. Site 1-2 dakika içinde güncellenir.',
    deleted: 'Sayı silindi',
    duplicate: 'Bu numarada başka bir sayı var; numarayı değiştir.',
  },
  item: (r) => ({
    title: `Sayı ${r.number}${r.theme ? ` — ${r.theme}` : ''}`,
    meta: [statusText(r), r.published_at ? shortDate(r.published_at) : null, `${r.articles?.[0]?.count ?? 0} yazı`]
      .filter(Boolean).join(' · '),
  }),
  heading: (r) => `Sayı ${r.number}${r.theme ? ` — ${r.theme}` : ''}`,
  async fill(f, r) {
    if (r) {
      alan(f, 'number').value = String(r.number);
    } else {
      // Yeni sayı: bir öncekinin devamı
      const { data } = await sb().from('issues').select('number').order('number', { ascending: false }).limit(1);
      alan(f, 'number').value = String((data?.[0]?.number ?? 0) + 1);
    }
    alan(f, 'theme').value = r?.theme ?? '';
    alan(f, 'intro').value = r?.intro ?? '';
    alan(f, 'status').value = r?.status ?? 'draft';
    alan(f, 'published_at').value = isoToLocalInput(r?.published_at ?? null);
    await loadContents(r?.id ?? null);
  },
  collect(f) {
    const number = Number(alan(f, 'number').value);
    if (!Number.isInteger(number) || number < 1) return 'Sayı numarası 1 ya da daha büyük bir tam sayı olmalı.';
    const status = alan(f, 'status').value as SayiRow['status'];
    let published_at = localInputToIso(alan(f, 'published_at').value);
    if (status === 'published' && !published_at) {
      published_at = new Date().toISOString();
      alan(f, 'published_at').value = isoToLocalInput(published_at);
    }
    return {
      number,
      theme: orNull(alan(f, 'theme').value),
      intro: orNull(alan(f, 'intro').value.replace(/\r\n/g, '\n')),
      status,
      published_at,
    };
  },
  async confirmDelete(r) {
    const n = r.articles?.[0]?.count ?? 0;
    return `Sayı ${r.number} silinecek.` +
      (n ? ` İçindeki ${n} yazı sayıdan çıkar; yazılar silinmez, yayında kalır.` : '') +
      ' Emin misin?';
  },
  afterSave: saveOrder,
  changed: invalidateIssues,
});

export function bindSayilar() {
  ekran.bind();
  $('sayi-icindekiler').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-yon]');
    if (!btn) return;
    const i = Number(btn.closest<HTMLElement>('li')!.dataset.i);
    const j = i + Number(btn.dataset.yon);
    if (j < 0 || j >= contents.length) return;
    [contents[i], contents[j]] = [contents[j], contents[i]];
    renderContents();
    markDirty();
    $('sayi-durum').textContent = 'Sıra değişti — kaydetmek için “Kaydet”e bas.';
    $('sayi-durum').className = 'save-state';
    // Odak taşınan yazının okunda kalsın (klavye ve ekran okuyucu için)
    $('sayi-icindekiler').querySelector<HTMLButtonElement>(`li[data-i="${j}"] [data-yon="${btn.dataset.yon}"]`)?.focus();
  });
}

export const showSayilar = ekran.show;
