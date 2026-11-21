-- =====================================================================
-- GÜVENLİK SIKILAŞTIRMASI
-- SQL Editor'de bir kez çalıştır. Tekrar çalıştırmak zararsızdır.
-- (Önce schema.sql ve 2026-11-21-instagram-alintisi.sql çalışmış olmalı.)
-- =====================================================================

-- 1) Yazı alanlarına makul uzunluk sınırları ve kapak görseli kuralı.
--    Bir oturum ele geçirilse bile dev/zararlı veri yazılamaz; kapak görseli
--    yalnızca bu projenin "gorseller" deposundan gelebilir.
do $$
declare
  rules text[][] := array[
    ['articles_title_len',   'char_length(title) between 1 and 300'],
    ['articles_spot_len',    'spot is null or char_length(spot) <= 600'],
    ['articles_label_len',   'label is null or char_length(label) <= 40'],
    ['articles_byline_len',  'byline is null or char_length(byline) <= 120'],
    ['articles_caption_len', 'image_caption is null or char_length(image_caption) <= 300'],
    ['articles_quote_len',   'ig_quote is null or char_length(ig_quote) <= 1500'],
    ['articles_body_len',    'char_length(body) <= 300000'],
    ['articles_cover_src',   'cover_image is null or cover_image ~ ''^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/gorseller/''']
  ];
  r text[];
begin
  foreach r slice 1 in array rules loop
    if not exists (select 1 from pg_constraint where conname = r[1]) then
      execute format('alter table public.articles add constraint %I check (%s)', r[1], r[2]);
    end if;
  end loop;
end $$;

-- 2) Görsel deposu: yalnızca görsel türleri, dosya başına en fazla 5 MB.
--    (Panel görselleri yüklemeden önce zaten WebP'ye çevirip küçültüyor.)
update storage.buckets
   set allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'],
       file_size_limit = 5 * 1024 * 1024
 where id = 'gorseller';

-- 3) Dışarıdan çağrılması gerekmeyen fonksiyonların izinlerini kapat.
--    (Tetikleyici fonksiyonları zaten doğrudan çağrılamaz; bu ek bir kilit.)
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.articles_changed()  from public, anon, authenticated;
revoke all on function public.settings_changed()  from public, anon, authenticated;

-- Kontrol: aşağıdaki sorgu 8 kural ve depo ayarlarını göstermeli
select conname from pg_constraint where conname like 'articles\_%' and contype = 'c' order by 1;
select id, file_size_limit, allowed_mime_types from storage.buckets where id = 'gorseller';
