// SADECE YEREL GELİŞTİRME İÇİN ÖRNEK İÇERİK.
// Supabase bilgileri .env dosyasına girildiğinde bu veriler hiç kullanılmaz.
import type { Article, SiteSettings } from './types';

/** Görsel yerine geçen düz renkli örnek kapak (SVG). */
const kapak = (renk: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="${renk}"/></svg>`,
  );

const p = (...paragraphs: string[]) => paragraphs.map((t) => `<p>${t}</p>`).join('\n');
const LOREM =
  'Bu metin, sayfa düzenini görebilmek için konmuş örnek bir paragraftır. Gerçek yazılar yönetim panelinden yayınlandığında burada onların içeriği yer alacak. Satır uzunluğu, harf aralığı ve paragraf boşlukları okuma rahatlığı gözetilerek ayarlandı.';

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

export const ORNEK_YAZILAR: Article[] = [
  {
    id: '1', slug: 'ornek-manset-yazisi', placement: 'manset',
    title: 'Şehrin Kitapçıları Kapanırken Okurlar Nereye Gidiyor?',
    spot: 'Son beş yılda kapanan bağımsız kitapçıların ardından okurların alışkanlıkları nasıl değişti? Sahaflar, kütüphaneler ve dijital raflar arasında bir yolculuk.',
    label: 'Dosya', byline: null, cover_image: kapak('#8c8a84'), image_caption: 'Fotoğraf: örnek görsel',
    body: p(LOREM, LOREM, LOREM), published_at: hoursAgo(2), view_count: 120,
  },
  {
    id: '2', slug: 'ornek-oyku', placement: 'surmanset',
    title: 'Yağmurdan Sonra',
    spot: 'Eski bir apartmanın merdivenlerinde geçen kısa bir karşılaşma.',
    label: 'Öykü', byline: 'Ayşe Yılmaz', cover_image: null, image_caption: null,
    body: p(LOREM, LOREM), published_at: hoursAgo(5), view_count: 80,
  },
  {
    id: '3', slug: 'ornek-siir', placement: 'surmanset',
    title: 'Kıyıda Bekleyen',
    spot: null,
    label: 'Şiir', byline: 'Mehmet Demir', cover_image: null, image_caption: null,
    body: '<p>dalga geri çekilirken<br>adını bıraktı kuma<br>ben okuyamadan</p>',
    published_at: hoursAgo(9), view_count: 45,
  },
  {
    id: '4', slug: 'ornek-kitap-incelemesi', placement: 'surmanset',
    title: 'Unutulmuş Bir Romanı Yeniden Okumak',
    spot: 'Yayımlandığı yıl fark edilmeyen bir roman, bugün neden bu kadar güncel?',
    label: 'Kitap', byline: null, cover_image: kapak('#a59d8d'), image_caption: null,
    body: p(LOREM, LOREM, LOREM, LOREM), published_at: hoursAgo(20), view_count: 200,
  },
  {
    id: '5', slug: 'ornek-haber-1', placement: 'normal',
    title: 'Edebiyat Festivali Bu Yıl Üç Şehirde Birden Yapılacak',
    spot: 'Program, söyleşiler ve atölyelerle iki hafta sürecek.',
    label: null, byline: null, cover_image: null, image_caption: null,
    body: p(LOREM), published_at: hoursAgo(26), view_count: 60,
  },
  {
    id: '6', slug: 'ornek-deneme', placement: 'normal',
    title: 'Yavaş Okumanın Savunusu',
    spot: 'Hız çağında bir sayfada uzun süre kalmak üzerine.',
    label: 'Deneme', byline: 'Ayşe Yılmaz', cover_image: null, image_caption: null,
    body: p(LOREM, LOREM, LOREM), published_at: hoursAgo(30), view_count: 150,
  },
  {
    id: '7', slug: 'ornek-haber-2', placement: 'normal',
    title: 'Çeviri Ödülleri Sahiplerini Buldu',
    spot: 'Bu yıl ilk kez şiir çevirisi kategorisinde de ödül verildi.',
    label: null, byline: null, cover_image: null, image_caption: null,
    body: p(LOREM), published_at: hoursAgo(48), view_count: 30,
  },
  {
    id: '8', slug: 'ornek-roportaj', placement: 'normal',
    title: '“Her Romana Bir Defterle Başlarım”',
    spot: 'Yeni romanı raflarda yerini alan yazarla yazma alışkanlıklarını konuştuk.',
    label: 'Söyleşi', byline: null, cover_image: kapak('#9a8f86'), image_caption: null,
    body: p(LOREM, LOREM, LOREM), published_at: hoursAgo(72), view_count: 95,
  },
];

export const ORNEK_AYARLAR: SiteSettings = {
  editor_note: {
    title: 'Editörden',
    text: 'Bu alan yönetim panelinden düzenlenecek kısa bir not içindir. Haftanın gündemini, yeni bir dosyayı ya da okura söylemek istediğin bir şeyi buraya yazabilirsin.',
  },
  daily_word: { word: 'Hicran', meaning: 'Ayrılık; ayrılığın verdiği acı.' },
};
