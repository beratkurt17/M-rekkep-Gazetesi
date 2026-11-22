// SADECE YEREL GELİŞTİRME İÇİN ÖRNEK İÇERİK (PUBLIC_SAMPLE_DATA=1 ya da Supabase yokken).
// Sıra, teslim kontrolündeki senaryoyu kurar: manşetten sonra kapaksız iki şiir,
// üç satırlık başlıklı bir deneme ve görselli bir yazı art arda gelir.
import type { Article, Author, Issue, Series, SiteSettings } from './types';

/** Fotoğraf yerine geçen sade örnek görsel (SVG). */
const foto = (a: string, b: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/></svg>`,
  );

const p = (...paragraphs: string[]) => paragraphs.map((t) => `<p>${t}</p>`).join('\n');
const LOREM =
  'Bu metin, sayfa düzenini görebilmek için konmuş örnek bir paragraftır. Gerçek yazılar yönetim panelinden yayımlandığında burada onların içeriği yer alacak. Satır uzunluğu, harf aralığı ve paragraf boşlukları okuma rahatlığı gözetilerek ayarlandı.';

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

const base = { image_caption: null, view_count: 0, ig_quote: null, bicim: 'otomatik', series: null, issue: null } as const;

const YAZILAR: Omit<Article, 'author'>[] = [
  {
    ...base, id: '1', issue: { number: 1, order: 1 }, slug: 'ornek-manset', placement: 'manset',
    title: 'Şehrin Kitapçıları Kapanırken Okurlar Nereye Gidiyor?',
    spot: 'Son beş yılda kapanan bağımsız kitapçıların ardından okurların alışkanlıkları nasıl değişti? Sahaflar, kütüphaneler ve dijital raflar arasında bir yolculuk.',
    label: 'Dosya', byline: 'Berat Kurt',
    cover_image: foto('#8d8577', '#5f584f'), image_caption: 'Fotoğraf: örnek görsel',
    body: p(LOREM + '<sup data-not="Örnek dipnot: kaynak ya da kısa bir açıklama burada görünür.">*</sup>', LOREM, LOREM), published_at: hoursAgo(2), view_count: 120,
  },
  {
    ...base, id: '2', issue: { number: 1, order: 3 }, slug: 'ornek-siir-1', placement: 'normal',
    title: 'Kıyıda Bekleyen',
    spot: null, label: 'Şiir', byline: 'Mehmet Demir', cover_image: null,
    body: '<p>dalga geri çekilirken<br>adını bıraktı kuma<br>ben okuyamadan</p>\n<p>sonra rüzgâr geldi<br>    bir harf aldı, bir harf bıraktı<br>kıyıda yalnız ğ kaldı</p>',
    ig_quote: 'dalga geri çekilirken\nadını bıraktı kuma\nben okuyamadan',
    published_at: hoursAgo(3), view_count: 45,
  },
  {
    ...base, id: '3', slug: 'ornek-siir-2', placement: 'normal',
    title: 'Eylül Defteri',
    spot: null, label: 'Şiir', byline: 'Ayşe Yılmaz', cover_image: null,
    body: '<p>eylül bir defter açar<br>ilk sayfası hep boştur<br>ikinci sayfada sen</p>\n<p>kurşunkalemle yazılmış<br>silinmeye hazır bir ad</p>',
    published_at: hoursAgo(4), view_count: 30,
  },
  {
    ...base, id: '4', issue: { number: 1, order: 2 }, slug: 'ornek-deneme', placement: 'normal', series: { slug: 'okuma-uzerine', title: 'Okuma Üzerine', part: 1 },
    title: 'Yavaş Okumanın Savunusu: Hız Çağında Bir Sayfada Uzun Süre Kalmak ve Dikkati Yeniden Kazanmak Üzerine',
    spot: 'Bildirimlerin, kaydırmanın ve özetlerin çağında bir paragrafın içinde oyalanmak neden hâlâ değerli?',
    label: 'Deneme', byline: 'Ayşe Yılmaz', cover_image: null,
    body: p(LOREM, LOREM, LOREM), published_at: hoursAgo(6), view_count: 150,
  },
  {
    ...base, id: '5', issue: { number: 1, order: 4 }, slug: 'ornek-kitap', placement: 'normal', series: { slug: 'okuma-uzerine', title: 'Okuma Üzerine', part: 2 },
    title: 'Unutulmuş Bir Romanı Yeniden Okumak',
    spot: 'Yayımlandığı yıl fark edilmeyen bir roman, bugün neden bu kadar güncel?',
    label: 'Kitap', byline: 'Berat Kurt', cover_image: foto('#a59d8d', '#7d7466'),
    body: p(LOREM, LOREM, LOREM, LOREM), published_at: hoursAgo(8), view_count: 200,
  },
  {
    ...base, id: '6', slug: 'ornek-haber', placement: 'normal',
    title: 'Edebiyat Festivali Bu Yıl Üç Şehirde Birden Yapılacak',
    spot: 'Program, söyleşiler ve atölyelerle iki hafta sürecek.',
    label: null, byline: null, cover_image: null,
    body: p(LOREM), published_at: hoursAgo(26), view_count: 60,
  },
  {
    ...base, id: '7', slug: 'ornek-oyku', placement: 'normal',
    title: 'Yağmurdan Sonra',
    spot: null, label: 'Öykü', byline: 'Ayşe Yılmaz', cover_image: null,
    body: p(
      'Merdivenin üçüncü basamağında durdu; ıslak ayakkabılarının bıraktığı izlere baktı. Apartmanın ışığı yine yanmıyordu ve bu kez bunu bir işaret saymaya karar verdi.',
      LOREM, LOREM,
    ),
    // Bilerek uzun: karta sığmayınca okura kısa bölüm seçtirme davranışını gösterir.
    ig_quote: 'Merdivenin üçüncü basamağında durdu; ıslak ayakkabılarının bıraktığı izlere baktı. Apartmanın ışığı yine yanmıyordu ve bu kez bunu bir işaret saymaya karar verdi. Yukarıdan bir kapının açıldığını, sonra yavaşça kapandığını duydu; kimse inmedi, kimse çıkmadı. Elindeki zarfı bir kez daha çevirdi, adresi yeniden okudu, harflerin her birinin üzerinden parmağını geçirdi. Yağmur dinmişti ama saçaklardan damlayan su hâlâ bir şeyleri sayıyordu: bir, iki, üç, sanki onun adına karar veriyormuş gibi. Sonunda zarfı cebine koydu ve basamakları birer birer çıkmaya başladı; her katta biraz daha yavaşladı, her kapının önünde biraz daha bekledi. Dördüncü kata geldiğinde ışık birden yandı ve o, yıllardır ilk kez, kapıyı çalmadan önce kendi adını yüksek sesle söyledi.',
    published_at: hoursAgo(30), view_count: 80,
  },
  {
    ...base, id: '8', slug: 'ornek-soylesi', placement: 'normal',
    title: '“Her Romana Bir Defterle Başlarım”',
    spot: 'Yeni romanı raflarda yerini alan yazarla yazma alışkanlıklarını konuştuk.',
    label: 'Söyleşi', byline: null, cover_image: foto('#9a8f86', '#6d635b'),
    body: p(LOREM, LOREM, LOREM), published_at: hoursAgo(50), view_count: 95,
  },
];

export const ORNEK_AYARLAR: SiteSettings = {
  editor_note: {
    title: 'Editörden',
    text: 'Bu alan yönetim panelinden düzenlenecek kısa bir not içindir.',
  },
  daily_word: { word: 'Hicran', meaning: 'Ayrılık; ayrılığın verdiği acı.' },
};

export const ORNEK_YAZARLAR: Author[] = [
  { id: 'y1', slug: 'berat-kurt', name: 'Berat Kurt', bio: 'Mürekkep\'in kurucusu ve editörü. Deneme ve eleştiri yazıyor.', photo: null },
  { id: 'y2', slug: 'mehmet-demir', name: 'Mehmet Demir', bio: null, photo: null },
  { id: 'y3', slug: 'ayse-yilmaz', name: 'Ayşe Yılmaz', bio: 'Şiir ve öykü yazıyor. İlk kitabı hazırlık aşamasında.', photo: null },
];

export const ORNEK_DIZILER: Series[] = [
  { id: 'd1', slug: 'okuma-uzerine', title: 'Okuma Üzerine', description: 'Okuma alışkanlıkları ve kitaplarla kurduğumuz ilişki üzerine bir yazı dizisi.' },
];

/** Örnek yazılardaki yazar adlarını örnek yazar kayıtlarına bağlar. */
export const ORNEK_YAZILAR: Article[] = YAZILAR.map((a) => {
  const au = ORNEK_YAZARLAR.find((y) => y.name === a.byline);
  return { ...a, author: au ? { slug: au.slug, name: au.name } : null };
});

export const ORNEK_SAYILAR: Issue[] = [
  {
    id: 's1', number: 1, theme: 'Okumak',
    intro: 'Kitapçılar kapanırken, bildirimler çoğalırken okumak ne demek? Bu sayının dosyasında okumanın hâlini, yavaşlığını ve direncini konuşuyoruz.\n\nDosyada bir deneme dizisinin ilk iki bölümü, bir şiir ve kitapçıların hikâyesi var.',
    published_at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
  },
];
