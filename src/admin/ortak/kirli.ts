// "Kaydedilmemiş değişiklik var mı?" durumu — bütün ekranlar için tek yer.
let dirty = false;

export const markDirty = () => { dirty = true; };
export const markClean = () => { dirty = false; };
export const isDirty = () => dirty;

/** Kaydedilmemiş değişiklik varsa kullanıcıya sorar; çıkılabilirse true. */
export const confirmLeave = () => !dirty || confirm('Kaydedilmemiş değişiklikler var. Çıkılsın mı?');
