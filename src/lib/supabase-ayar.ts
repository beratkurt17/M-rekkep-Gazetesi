// Supabase adresi ve herkese açık (anon) anahtar — TEK KAYNAK.
// Site derlemesi, yönetim paneli ve okunma sayacı buradan okur.
// GitHub'a/.env'e elle kopyalanan değerlerde kalabilen boşluk, satır sonu ve tırnaklar temizlenir.

const clean = (v: unknown) => String(v ?? '').trim().replace(/^["']|["']$/g, '').trim();

export const SUPABASE_URL = clean(import.meta.env.PUBLIC_SUPABASE_URL).replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = clean(import.meta.env.PUBLIC_SUPABASE_ANON_KEY);

/** Adres beklenen biçimde mi: https://<proje>.supabase.co */
export const supabaseUrlValid = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(SUPABASE_URL);
