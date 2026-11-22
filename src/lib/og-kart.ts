// Paylaşım görseli (1200×630 PNG): kapak görseli olmayan yazılar WhatsApp, X vb.
// bağlantı önizlemesinde logo yerine kendi tipografik kartlarıyla görünür.
// YALNIZCA DERLEMEDE çalışır (src/pages/og/[slug].png.ts). Yazı tipleri projeyle
// gelir (@fontsource, açık lisans); Türkçe harfler için latin-ext dosyaları da yüklenir.
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import type { Article } from './types';
import { formatDate } from './format';

const W = 1200;
const H = 630;
const C = { paper: '#e8e0d0', ink: '#25221f', ink2: '#47423c', ink3: '#5f584f', accent: '#742f38' };

const root = process.cwd();
const font = (pkg: string, file: string) => fs.readFileSync(path.join(root, 'node_modules/@fontsource', pkg, 'files', file));

type FontDef = Parameters<typeof satori>[1]['fonts'][number];
let fonts: FontDef[] | null = null;
function loadFonts(): FontDef[] {
  if (fonts) return fonts;
  // latin ve latin-ext (ş, ğ, İ…) ayrı dosyalar; satori aynı adlı ikinci dosyaya geçmediği
  // için latin-ext "<ad>Ext" adıyla yüklenir ve fontFamily'de yedek olarak verilir (FF()).
  const f = (name: string, pkg: string, base: string, weight: 400 | 600 | 700): FontDef[] =>
    (['latin', 'latin-ext'] as const).map((sub) => ({
      name: sub === 'latin' ? name : `${name}Ext`, weight, style: 'normal' as const,
      data: font(pkg, `${base}-${sub}-${weight}-normal.woff`),
    }));
  fonts = [
    ...f('Gloock', 'gloock', 'gloock', 400),
    ...f('Serif', 'source-serif-4', 'source-serif-4', 700),
    ...f('Sans', 'source-sans-3', 'source-sans-3', 600),
    ...f('Sans', 'source-sans-3', 'source-sans-3', 700),
  ];
  return fonts;
}

let logo: string | null = null;
const logoData = () => (logo ??= `data:image/jpeg;base64,${fs.readFileSync(path.join(root, 'public/logo.jpg')).toString('base64')}`);

/** Yazı tipi + Türkçe harfler için yedeği */
const FF = (name: string) => `${name}, ${name}Ext`;

// satori, React öğesi biçiminde düz nesneler kabul eder
type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node =>
  ({ type, props: { style: { display: 'flex', ...style }, children, ...extra } });

/** Başlık uzunluğuna göre punto: kısa başlık büyük, uzun başlık sığacak kadar. */
function titleSize(t: string): number {
  const n = t.length;
  return n <= 28 ? 84 : n <= 50 ? 70 : n <= 80 ? 58 : n <= 120 ? 48 : 40;
}

export async function ogPng(a: Article, domain: string): Promise<Buffer> {
  const kicker = [a.label, a.series ? `${a.series.title} · ${a.series.part}. bölüm` : null].filter(Boolean).join('  ·  ');
  const footLeft = [a.issue ? `Sayı ${a.issue.number}` : null, formatDate(a.published_at)].filter(Boolean).join(' · ');

  const tree = el('div', {
    // satori'de genişlik/yükseklik kenar boşluklarını içermez: iç alan = kart − boşluk
    width: W - 2 * 72, height: H - 52 - 46, flexDirection: 'column', backgroundColor: C.paper, color: C.ink,
    paddingTop: 52, paddingRight: 72, paddingBottom: 46, paddingLeft: 72,
  }, [
    // Künye: amblem + Mürekkep + çift çizgi
    el('div', { alignItems: 'center', gap: 18 }, [
      el('img', { width: 64, height: 64, borderRadius: 32 }, undefined, { src: logoData(), width: 64, height: 64 }),
      el('div', { flexDirection: 'column' }, [
        el('div', { fontFamily: FF('Gloock'), fontSize: 52, lineHeight: 1 }, 'Mürekkep'),
        el('div', { fontFamily: FF('Sans'), fontWeight: 600, fontSize: 15, letterSpacing: 4, color: C.ink2, marginTop: 4 }, 'EDEBİYAT GAZETESİ'),
      ]),
    ]),
    el('div', { marginTop: 22, height: 8, borderTop: `3px solid ${C.ink}`, borderBottom: `1.5px solid ${C.ink}` }),

    // Yazı
    el('div', { flexDirection: 'column', flexGrow: 1, flexShrink: 1, minHeight: 0, justifyContent: 'center', gap: 18 }, [
      kicker ? el('div', { fontFamily: FF('Sans'), fontWeight: 700, fontSize: 24, letterSpacing: 3, color: C.accent }, kicker.toLocaleUpperCase('tr-TR')) : null,
      el('div', { fontFamily: FF('Serif'), fontWeight: 700, fontSize: titleSize(a.title), lineHeight: 1.12, letterSpacing: -0.5 }, a.title),
      a.byline ? el('div', { fontFamily: FF('Sans'), fontWeight: 600, fontSize: 30, color: C.ink2 }, a.byline) : null,
    ].filter(Boolean)),

    // Alt satır
    el('div', { justifyContent: 'space-between', alignItems: 'center', borderTop: `1.5px solid ${C.ink}`, paddingTop: 16,
      fontFamily: FF('Sans'), fontWeight: 600, fontSize: 22, color: C.ink3 }, [
      el('div', {}, footLeft),
      el('div', { color: C.accent }, domain),
    ]),
  ]);

  const svg = await satori(tree as never, { width: W, height: H, fonts: loadFonts() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
