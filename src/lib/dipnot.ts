// Dipnotlar: editörde metne <sup data-not="dipnot metni">*</sup> olarak girilir.
// Yayında sırayla numaralanır, yazının sonunda "Dipnotlar" listesi oluşur.
// Telefonda numaraya dokununca not alttan kartla açılır (src/scripts/dipnot.ts);
// betik çalışmazsa bağlantı listedeki nota atlar.
import { decodeEntities } from './format';

const SUP = /<sup\b[^>]*\bdata-not="([^"]*)"[^>]*>[\s\S]*?<\/sup>/gi;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function extractFootnotes(html: string): { html: string; notes: string[] } {
  const notes: string[] = [];
  const out = html.replace(SUP, (_m, raw: string) => {
    const text = decodeEntities(raw).trim();
    if (!text) return '';
    notes.push(text);
    const n = notes.length;
    return `<sup class="dn-ref"><a href="#dn-${n}" id="dnr-${n}" data-dipnot="${n}" aria-label="Dipnot ${n}">${n}</a></sup>`;
  });
  return { html: out, notes };
}

export function footnotesHtml(notes: string[]): string {
  if (!notes.length) return '';
  const items = notes.map((t, i) =>
    `<li id="dn-${i + 1}"><span class="dn-text">${esc(t)}</span> ` +
    `<a href="#dnr-${i + 1}" class="dn-back" aria-label="Metne dön">↑</a></li>`,
  ).join('');
  return `<section class="art-notes" aria-labelledby="dipnotlar">
  <h2 class="section-title" id="dipnotlar">Dipnotlar</h2>
  <ol>${items}</ol>
</section>`;
}
