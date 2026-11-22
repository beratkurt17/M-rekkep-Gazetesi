// Yazı editöründe "Sayı" seçimi:
// - yeni yazı en son açılan (en yüksek numaralı) sayıya hazır gelir,
// - sayıya yeni eklenen yazı içindekilerin sonuna yerleşir (sıra Sayılar ekranından değişir),
// - seçilen sayı taslaksa uyarır.
import { $ } from '../ortak/dom';
import { sb } from '../ortak/supabase';
import { isSchemaMissing, SQL } from '../ortak/veritabani';

interface SayiSecenek { id: string; number: number; theme: string | null; status: string; published_at: string | null }
interface Yerlesim { id: string; issue_id: string; issue_order: number | null }

let issues: SayiSecenek[] = [];
let placements: Yerlesim[] = [];
let loaded = false;
let missing = false;

let form: HTMLFormElement;
let articleId: string | null = null;
let originalIssue: string | null = null;
let originalOrder: number | null = null;

const sel = () => form.elements.namedItem('issue_id') as HTMLSelectElement;

export function invalidateIssues() { loaded = false; }

async function load() {
  if (loaded) return;
  const [i, p] = await Promise.all([
    sb().from('issues').select('id, number, theme, status, published_at').order('number', { ascending: false }),
    sb().from('articles').select('id, issue_id, issue_order').not('issue_id', 'is', null),
  ]);
  missing = [i.error, p.error].some((e) => e && isSchemaMissing(e));
  issues = (i.data ?? []) as SayiSecenek[];
  placements = (p.data ?? []) as Yerlesim[];
  loaded = !i.error && !p.error;
}

function label(s: SayiSecenek) {
  const draft = s.status !== 'published' ? ' (taslak)' : s.published_at && new Date(s.published_at) > new Date() ? ' (planlı)' : '';
  return `Sayı ${s.number}${s.theme ? ` · ${s.theme}` : ''}${draft}`;
}

function renderHint() {
  const el = $('sayi-hint');
  const s = issues.find((x) => x.id === sel().value);
  el.textContent =
    missing ? `Sayı seçimi için Supabase'de ${SQL.faz3} dosyasını çalıştır.`
    : !issues.length ? 'Henüz sayı yok. “Sayılar” sekmesinden ilk sayıyı açabilirsin.'
    : !s ? 'Bu yazı bir sayıya ait olmadan yayımlanır.'
    : s.status !== 'published' ? `Sayı ${s.number} henüz taslak. Yazı yayımlanırsa sitede görünür, ama sayı yayına alınana kadar sayıyla birlikte görünmez.`
    : `Sayı ${s.number} içindekilerine eklenir. Sırasını “Sayılar” sekmesinden değiştirebilirsin.`;
}

export function bindSayiSecimi(f: HTMLFormElement) {
  form = f;
  sel().addEventListener('change', renderHint);
}

export async function fillSayiSecimi(row: { id: string; issue_id?: string | null; issue_order?: number | null } | null) {
  await load();
  articleId = row?.id ?? null;
  originalIssue = row?.issue_id ?? null;
  originalOrder = row?.issue_order ?? null;
  // Yeni yazı → en son açılan sayı; mevcut yazı → kendi sayısı (yoksa boş)
  const chosen = row ? originalIssue : issues[0]?.id ?? null;
  sel().replaceChildren(
    new Option('— Sayıya bağlı değil —', '', !chosen, !chosen),
    ...issues.map((s) => new Option(label(s), s.id, s.id === chosen, s.id === chosen)),
  );
  sel().disabled = missing;
  renderHint();
}

/** Kaydedilecek alanlar. Sayı değiştiyse yazı yeni sayının içindekilerinin sonuna gider. */
export function collectSayiSecimi(): Record<string, unknown> {
  if (missing) return {};
  const issueId = sel().value || null;
  if (!issueId) return { issue_id: null, issue_order: null };
  if (issueId === originalIssue && originalOrder) return { issue_id: issueId, issue_order: originalOrder };
  const last = Math.max(0, ...placements
    .filter((p) => p.issue_id === issueId && p.id !== articleId)
    .map((p) => p.issue_order ?? 0));
  return { issue_id: issueId, issue_order: Math.min(999, last + 1) };
}

/** Kayıttan sonra: bir sonraki kayıtta sıra yeniden hesaplanmasın. */
export function savedSayiSecimi(row: { id: string; issue_id?: string | null; issue_order?: number | null }) {
  articleId = row.id;
  originalIssue = row.issue_id ?? null;
  originalOrder = row.issue_order ?? null;
  placements = placements.filter((p) => p.id !== row.id);
  if (row.issue_id) placements.push({ id: row.id, issue_id: row.issue_id, issue_order: row.issue_order ?? null });
}
