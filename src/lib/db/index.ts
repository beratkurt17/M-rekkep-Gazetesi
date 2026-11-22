// Sitenin veri katmanı — her içerik türü kendi dosyasında.
// Sayfalar yalnızca buradan içe aktarır: import { … } from '../lib/db';
export { usingSampleData } from './istemci';
export { getArticles, getFrontPage } from './yazilar';
export { getSettings } from './ayarlar';
