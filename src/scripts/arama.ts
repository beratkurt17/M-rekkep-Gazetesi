// Site içi arama (Pagefind). Dizin derlemede oluşur (npm run build → dist/pagefind/);
// arama okurun tarayıcısında çalışır, sunucu gerekmez. Yalnızca yazılar dizinlenir.
// Adres çubuğundaki ?q= aramayı paylaşılabilir kılar.

interface PagefindResult {
  url: string;
  excerpt: string; // <mark> içeren, Pagefind'in kaçışladığı HTML
  meta: { title?: string; yazar?: string; tur?: string; tarih?: string };
}
interface Pagefind {
  options(o: Record<string, unknown>): Promise<void>;
  search(q: string): Promise<{ results: { data(): Promise<PagefindResult> }[] } | null>;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Alıntıda yalnızca <mark> vurgusu kalır; başka her şey düz metne çevrilir. */
function safeExcerpt(html: string): string {
  const t = document.createElement('template');
  t.innerHTML = html; // template içeriği çalıştırılmaz
  const out = document.createElement('p');
  for (const n of t.content.childNodes) {
    if (n.nodeName === 'MARK') {
      const m = document.createElement('mark');
      m.textContent = n.textContent;
      out.append(m);
    } else {
      out.append(n.textContent ?? '');
    }
  }
  return out.innerHTML;
}

export async function initArama() {
  const form = document.getElementById('arama-form') as HTMLFormElement | null;
  const input = document.getElementById('arama-kutusu') as HTMLInputElement | null;
  const list = document.getElementById('arama-sonuclari');
  const status = document.getElementById('arama-durum');
  if (!form || !input || !list || !status) return;

  let pf: Pagefind;
  try {
    const url = '/pagefind/pagefind.js';
    pf = (await import(/* @vite-ignore */ url)) as Pagefind;
    await pf.options({ excerptLength: 24 });
  } catch {
    status.textContent = 'Arama şu an kullanılamıyor. (Yerel geliştirmede arama dizini yoktur; yayındaki sitede çalışır.)';
    input.disabled = true;
    return;
  }

  let seq = 0;
  async function run(q: string) {
    const my = ++seq;
    const query = q.trim();
    const u = new URL(location.href);
    if (query) u.searchParams.set('q', query); else u.searchParams.delete('q');
    history.replaceState(null, '', u);

    if (query.length < 2) { list!.innerHTML = ''; status!.textContent = ''; return; }
    status!.textContent = 'Aranıyor…';
    const res = await pf.search(query);
    if (my !== seq || !res) return; // daha yeni bir arama başladı
    const data = await Promise.all(res.results.slice(0, 20).map((r) => r.data()));
    if (my !== seq) return;

    status!.textContent = res.results.length
      ? `“${query}” için ${res.results.length} yazı bulundu${res.results.length > 20 ? ' (ilk 20 gösteriliyor)' : ''}.`
      : `“${query}” için sonuç bulunamadı. Başka bir kelime dene.`;
    list!.innerHTML = data.map((d) => {
      const meta = [d.meta.tur, d.meta.yazar, d.meta.tarih].filter(Boolean).map((m) => esc(m!)).join(' · ');
      return `<li>
        <a href="${esc(d.url)}"><h2>${esc(d.meta.title ?? d.url)}</h2></a>
        ${meta ? `<p class="ar-meta">${meta}</p>` : ''}
        <p class="ar-excerpt">${safeExcerpt(d.excerpt)}</p>
      </li>`;
    }).join('');
  }

  let timer: number | undefined;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => run(input.value), 220);
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(timer); run(input.value); input.blur(); });

  const q = new URL(location.href).searchParams.get('q');
  if (q) { input.value = q; run(q); }
}
