// Instagram hikâye kartı (1080 × 1920) — tarayıcıda <canvas> ile çizilir.
// Site (okur) ve yönetim paneli önizlemesi aynı fonksiyonu kullanır.
//
// Kural: alıntı metni ASLA görünmez biçimde kesilmez. Karta sığmazsa başlıkla
// hazırlanır ve çağıran taraf okura daha kısa bir bölüm seçtirir (quoteSegments).

export interface StoryInput {
  title: string;
  byline: string | null;
  quote: string | null;
  domain: string;
}

export interface StoryResult {
  mode: 'quote' | 'title';
  /** Alıntı verildiyse karta sığdı mı? (alıntı yoksa true) */
  quoteFits: boolean;
}

export const STORY_W = 1080;
export const STORY_H = 1920;

const C = { paper: '#E8E0D0', ink: '#25221F', ink2: '#4A443D', accent: '#742F38' };
const BRAND = 'Gloock, Georgia, serif';
const SERIF = '"Source Serif 4", Georgia, serif';
const SANS = '"Source Sans 3", system-ui, sans-serif';

const TEXT_W = STORY_W - 2 * 130;
const BOX_TOP = 500;     // orta alanın üstü
const BOX_BOTTOM = 1460; // orta alanın altı

type Ctx = CanvasRenderingContext2D;

/** Kart çizilmeden önce yazı tiplerinin yüklenmesini bekler. */
export async function loadStoryFonts(): Promise<void> {
  if (!('fonts' in document)) return;
  try {
    await Promise.all(
      [`104px ${BRAND}`, `italic 56px ${SERIF}`, `700 80px ${SERIF}`, `600 34px ${SANS}`]
        .map((f) => document.fonts.load(f, 'Mürekkep ğüşıöçİ')),
    );
  } catch { /* yazı tipi gelmezse yedek fontla çizilir */ }
}

function spacing(ctx: Ctx, px: number) {
  if ('letterSpacing' in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${px}px`;
}

/** Kelime kaydırma; \n satır sonları ve boş satırlar (kıta arası) korunur. */
function wrapLines(ctx: Ctx, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (!line || ctx.measureText(test).width <= maxW) line = test;
      else { out.push(line); line = w; }
    }
    out.push(line);
  }
  return out;
}

interface Fit { size: number; lines: string[]; lineH: number }

function fitText(
  ctx: Ctx, text: string, font: (s: number) => string,
  max: number, min: number, lineRatio: number, maxH: number,
): Fit | null {
  for (let s = max; s >= min; s -= 2) {
    ctx.font = font(s);
    const lines = wrapLines(ctx, text, TEXT_W);
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const lineH = s * lineRatio;
    if (widest <= TEXT_W && lines.length * lineH <= maxH) return { size: s, lines, lineH };
  }
  return null;
}

const quoteFont = (s: number) => `italic ${s}px ${SERIF}`;
const QUOTE_MAX_H = BOX_BOTTOM - BOX_TOP - 140;

function fitQuote(ctx: Ctx, q: string) {
  // 44px altı hikâyede telefonda okunmaz; sığmıyorsa küçültmek yerine bölüm seçtirilir.
  return fitText(ctx, q, quoteFont, 60, 44, 1.42, QUOTE_MAX_H);
}

function rule(ctx: Ctx, y: number, w: number) {
  ctx.fillStyle = C.ink;
  ctx.fillRect(130, y, STORY_W - 260, w);
}

export function drawStoryCard(canvas: HTMLCanvasElement, input: StoryInput): StoryResult {
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const cx = STORY_W / 2;

  // Üst: iki ince çizgi arasında Mürekkep imzası
  rule(ctx, 190, 3);
  ctx.fillStyle = C.ink;
  ctx.font = `104px ${BRAND}`;
  ctx.fillText('Mürekkep', cx, 318);
  ctx.font = `600 26px ${SANS}`;
  spacing(ctx, 8);
  ctx.fillStyle = C.ink2;
  ctx.fillText('EDEBİYAT GAZETESİ', cx, 372);
  spacing(ctx, 0);
  rule(ctx, 408, 1.5);

  // Orta: alıntı (sığarsa) ya da başlık
  const q = input.quote?.trim() || null;
  const fit = q ? fitQuote(ctx, q) : null;
  const mode: StoryResult['mode'] = fit ? 'quote' : 'title';

  if (fit) {
    const blockH = 120 + fit.lines.length * fit.lineH;
    let y = BOX_TOP + (BOX_BOTTOM - BOX_TOP - blockH) / 2;
    ctx.fillStyle = C.accent;
    ctx.font = `150px ${BRAND}`;
    ctx.fillText('“', cx, y + 110);
    y += 120 + fit.size;
    ctx.fillStyle = C.ink;
    ctx.font = quoteFont(fit.size);
    for (const line of fit.lines) { if (line) ctx.fillText(line, cx, y); y += fit.lineH; }

    // Alt: yazar + başlık
    let by = 1530;
    if (input.byline) {
      ctx.font = `600 38px ${SANS}`;
      ctx.fillStyle = C.ink;
      ctx.fillText(input.byline, cx, by);
      by += 52;
    }
    const t = fitText(ctx, input.title, (s) => `${s}px ${SERIF}`, 34, 24, 1.3, 96);
    ctx.fillStyle = C.ink2;
    if (t) {
      ctx.font = `${t.size}px ${SERIF}`;
      for (const line of t.lines) { ctx.fillText(line, cx, by); by += t.lineH; }
    }
  } else {
    const t = fitText(ctx, input.title, (s) => `700 ${s}px ${SERIF}`, 92, 44, 1.14, 640)
      ?? fitText(ctx, input.title, (s) => `700 ${s}px ${SERIF}`, 42, 30, 1.14, 900)!;
    const blockH = t.lines.length * t.lineH + (input.byline ? 90 : 0);
    let y = BOX_TOP + (BOX_BOTTOM - BOX_TOP - blockH) / 2 + t.size;
    ctx.fillStyle = C.ink;
    ctx.font = `700 ${t.size}px ${SERIF}`;
    for (const line of t.lines) { ctx.fillText(line, cx, y); y += t.lineH; }
    if (input.byline) {
      ctx.font = `600 40px ${SANS}`;
      ctx.fillStyle = C.ink2;
      ctx.fillText(input.byline, cx, y + 50);
    }
  }

  // En alt: alan adı
  rule(ctx, 1690, 1.5);
  ctx.font = `600 32px ${SANS}`;
  spacing(ctx, 4);
  ctx.fillStyle = C.accent;
  ctx.fillText(input.domain, cx, 1762);
  spacing(ctx, 0);

  return { mode, quoteFits: !q || !!fit };
}

/** Uzun alıntıyı seçilebilir parçalara böler: şiirde kıtalar (uzunsa 4'er dize), düzyazıda cümleler. */
export function quoteSegments(text: string): string[] {
  const t = text.trim();
  if (t.includes('\n')) {
    const out: string[] = [];
    for (const stanza of t.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)) {
      const lines = stanza.split('\n');
      if (lines.length <= 6) out.push(stanza);
      else for (let i = 0; i < lines.length; i += 4) out.push(lines.slice(i, i + 4).join('\n'));
    }
    return out;
  }
  return t.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean);
}

/** Bu metin alıntı olarak karta sığar mı? */
export function quoteFitsCard(text: string): boolean {
  const ctx = document.createElement('canvas').getContext('2d')!;
  return !!fitQuote(ctx, text);
}
