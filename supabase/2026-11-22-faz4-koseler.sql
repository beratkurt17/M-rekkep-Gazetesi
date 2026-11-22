-- =====================================================================
-- FAZ 4 — Köşeler: günün dizesi, günün kelimesi, edebiyat takvimi
-- SQL Editor'de bir kez çalıştır. Tekrar çalıştırmak zararsızdır.
-- Önce: 2026-11-22-faz3-sayilar.sql çalışmış olmalı.
--
-- Ne yapar:
--  1) "quotes"   — günün dizesi/alıntısı (her gün için bir kayıt, önceden girilebilir)
--  2) "words"    — günün kelimesi (aynı mantık; mevcut kelime ilk kayıt olur)
--  3) "calendar" — edebiyat takvimi (gün/ay; her yıl tekrarlanır)
--  4) Değişince site kendini yeniden oluşturur.
-- Takvimin başlangıç verisi ayrı dosyada: 2026-11-22-faz4-takvim-verisi.sql
-- "Bugün" her zaman Türkiye saatine göredir.
-- =====================================================================

create or replace function public.bugun_tr()
returns date
language sql
stable
as $$ select (now() at time zone 'Europe/Istanbul')::date $$;

-- ---------------------------------------------------------------------
-- 1) GÜNÜN DİZESİ / ALINTISI
-- ---------------------------------------------------------------------
create table if not exists public.quotes (
  id         uuid primary key default gen_random_uuid(),
  show_on    date not null unique,                                        -- hangi gün görünecek
  body       text not null check (char_length(body) between 1 and 1200),  -- dize sonları \n
  author     text check (author is null or char_length(author) <= 120),
  source     text check (source is null or char_length(source) <= 200),   -- kitap, yıl…
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) GÜNÜN KELİMESİ
-- ---------------------------------------------------------------------
create table if not exists public.words (
  id         uuid primary key default gen_random_uuid(),
  show_on    date not null unique,
  word       text not null check (char_length(word) between 1 and 60),
  meaning    text not null check (char_length(meaning) between 1 and 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3) EDEBİYAT TAKVİMİ
-- ---------------------------------------------------------------------
create table if not exists public.calendar (
  id         uuid primary key default gen_random_uuid(),
  month      smallint not null check (month between 1 and 12),
  day        smallint not null check (day between 1 and 31),
  year       smallint check (year is null or year between 1 and 2100),
  kind       text not null default 'dogum' check (kind in ('dogum', 'olum', 'diger')),
  person     text not null check (char_length(person) between 1 and 120),
  note       text check (note is null or char_length(note) <= 300),     -- okura görünen kısa bilgi
  source     text check (source is null or char_length(source) <= 300), -- doğrulama kaynağı (yalnızca panelde)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 31 Şubat gibi olmayan günler girilemesin (29 Şubat serbest)
  constraint calendar_valid_day check (
    day <= case month when 2 then 29 when 4 then 30 when 6 then 30 when 9 then 30 when 11 then 30 else 31 end
  ),
  constraint calendar_unique unique (month, day, person, kind)
);
create index if not exists calendar_day_idx on public.calendar (month, day);

-- ---------------------------------------------------------------------
-- Ortak: güncelleme zamanı, güvenlik, izinler, otomatik yayın
-- Okur: günün dizesi ve kelimesinde yalnızca tarihi gelmiş kayıtlar (planlananlar gizli);
--       takvimin tamamı. Yönetici her şeyi okur ve yazar.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['quotes', 'words', 'calendar'] loop
    execute format('drop trigger if exists %1$s_touch on public.%1$I', t);
    execute format('create trigger %1$s_touch before update on public.%1$I
                    for each row execute function public.touch_updated_at()', t);
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "Herkes okur" on public.%I', t);
    if t = 'calendar' then
      execute format('create policy "Herkes okur" on public.%I for select using (true)', t);
    else
      execute format('create policy "Herkes okur" on public.%I for select using (show_on <= public.bugun_tr())', t);
    end if;
    execute format('drop policy if exists "Yönetici her şeyi okur" on public.%I', t);
    execute format('create policy "Yönetici her şeyi okur" on public.%I for select to authenticated using (public.is_admin())', t);
    execute format('drop policy if exists "Yönetici ekler" on public.%I', t);
    execute format('create policy "Yönetici ekler" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('drop policy if exists "Yönetici günceller" on public.%I', t);
    execute format('create policy "Yönetici günceller" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop policy if exists "Yönetici siler" on public.%I', t);
    execute format('create policy "Yönetici siler" on public.%I for delete to authenticated using (public.is_admin())', t);

    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);

    execute format('drop trigger if exists %1$s_build on public.%1$I', t);
    execute format('create trigger %1$s_build after insert or update or delete on public.%1$I
                    for each statement execute function public.icerik_degisti()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 4) MEVCUT "GÜNÜN KELİMESİ" AYARINI LİSTEYE TAŞI (bugünün kaydı olarak)
-- Eski ayar silinmez; site artık listeyi kullanır.
-- ---------------------------------------------------------------------
insert into public.words (show_on, word, meaning)
select public.bugun_tr(), trim(value->>'word'), trim(value->>'meaning')
  from public.site_settings
 where key = 'daily_word'
   and coalesce(trim(value->>'word'), '') <> ''
   and coalesce(trim(value->>'meaning'), '') <> ''
on conflict (show_on) do nothing;

notify pgrst, 'reload schema';

-- Kontrol: üç tablo görünmeli
select table_name from information_schema.tables
 where table_schema = 'public' and table_name in ('quotes', 'words', 'calendar')
 order by 1;
