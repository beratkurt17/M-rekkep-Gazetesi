// Panel ekranları arasında geçiş. Her ekran app.ts'de bir kez kaydedilir;
// HTML'de karşılığı id="view-<ad>" olan bir <main> öğesidir.
import { $ } from './dom';
import { markClean } from './kirli';

export interface Ekran {
  /** Ekran her açıldığında çalışır (ör. listeyi yeniden yükle). */
  onShow?: () => void;
  /** Üst menüde hangi sekme seçili görünsün (varsayılan: ekranın kendi adı). */
  tab?: string;
}

const ekranlar = new Map<string, Ekran>();

export function registerView(name: string, ekran: Ekran = {}) {
  ekranlar.set(name, ekran);
}

export function showView(name: string) {
  const ekran = ekranlar.get(name);
  if (!ekran) throw new Error(`Bilinmeyen ekran: ${name}`);
  for (const n of ekranlar.keys()) $(`view-${n}`).hidden = n !== name;
  const tab = ekran.tab ?? name;
  document.querySelectorAll<HTMLButtonElement>('.tab').forEach((t) =>
    t.classList.toggle('active', t.dataset.view === tab),
  );
  document.body.dataset.view = name; // CSS: yazı düzenlerken telefondaki alt menü gizlenir
  markClean();
  ekran.onShow?.();
  scrollTo(0, 0);
}
