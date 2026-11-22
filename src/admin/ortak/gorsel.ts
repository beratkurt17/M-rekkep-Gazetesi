// Görsel yükleme: önce küçültülür ve WebP'ye çevrilir (depolama kotasını korur),
// sonra "gorseller" deposuna yıl/ay klasörüne yüklenir.
import { sb } from './supabase';
import { showToast } from '../../scripts/toast';

export async function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Görsel dönüştürülemedi'))), 'image/webp', quality),
  );
}

/** Yükler ve herkese açık adresini döndürür; hata olursa uyarı gösterip null döner. */
export async function uploadImage(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) { showToast('Lütfen bir görsel dosyası seç.'); return null; }
  showToast('Görsel yükleniyor…');
  try {
    const blob = await compressImage(file);
    const d = new Date();
    const path = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.webp`;
    const { error } = await sb().storage.from('gorseller').upload(path, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
    });
    if (error) throw error;
    showToast('Görsel yüklendi');
    return sb().storage.from('gorseller').getPublicUrl(path).data.publicUrl;
  } catch (err) {
    showToast('Görsel yüklenemedi: ' + (err as Error).message, 4500);
    return null;
  }
}
