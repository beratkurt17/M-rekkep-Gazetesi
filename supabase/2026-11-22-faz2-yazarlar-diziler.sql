-- =====================================================================
-- FAZ 2 — Yazarlar ve diziler (tefrika)
-- SQL Editor'de bir kez çalıştır. Tekrar çalıştırmak zararsızdır.
-- Önce: schema.sql, yayin-tetikleyici.sql, 2026-11-21-guvenlik.sql,
--       2026-11-22-faz1-bicim.sql çalışmış olmalı.
--
-- Ne yapar:
--  1) "authors" (yazarlar) ve "series" (diziler) tablolarını kurar.
--  2) Yazılara yazar, dizi ve bölüm numarası alanlarını ekler.
--  3) Mevcut yazılardaki "Yazar" adlarından yazar kayıtları oluşturur ve
--     yazıları bu kayıtlara bağlar (hiçbir ad silinmez).
--  4) Yazar/dizi değişince site kendini yeniden oluşturur.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) YAZARLAR
-- ---------------------------------------------------------------------
create table if not exists public.authors (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       text not null check (char_length(name) between 1 and 120),
  bio        text check (bio is null or char_length(bio) <= 2000),
  photo      text check (photo is null or photo ~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/gorseller/'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) DİZİLER
-- ---------------------------------------------------------------------
create table if not exists public.series (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title       text not null check (char_length(title) between 1 and 200),
  description text check (description is null or char_length(description) <= 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Ortak: güncelleme zamanı, satır düzeyi güvenlik, okuma herkese / yazma yöneticiye
do $$
declare t text;
begin
  foreach t in array array['authors', 'series'] loop
    execute format('drop trigger if exists %1$s_touch on public.%1$I', t);
    execute format('create trigger %1$s_touch before update on public.%1$I
                    for each row execute function public.touch_updated_at()', t);
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "Herkes okur" on public.%I', t);
    execute format('create policy "Herkes okur" on public.%I for select using (true)', t);
    execute format('drop policy if exists "Yönetici ekler" on public.%I', t);
    execute format('create policy "Yönetici ekler" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('drop policy if exists "Yönetici günceller" on public.%I', t);
    execute format('create policy "Yönetici günceller" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop policy if exists "Yönetici siler" on public.%I', t);
    execute format('create policy "Yönetici siler" on public.%I for delete to authenticated using (public.is_admin())', t);

    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 3) YAZILARA YAZAR / DİZİ / BÖLÜM
-- Yazar ya da dizi silinirse yazı silinmez, yalnızca bağlantısı kalkar.
-- ---------------------------------------------------------------------
alter table public.articles add column if not exists author_id uuid references public.authors (id) on delete set null;
alter table public.articles add column if not exists series_id uuid references public.series (id) on delete set null;
alter table public.articles add column if not exists series_part integer;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'articles_series_part_range') then
    alter table public.articles
      add constraint articles_series_part_range check (series_part is null or series_part between 1 and 999);
  end if;
end $$;

create index if not exists articles_author_idx on public.articles (author_id);
create index if not exists articles_series_idx on public.articles (series_id, series_part);

-- ---------------------------------------------------------------------
-- 4) MEVCUT YAZAR ADLARINI KAYDA ÇEVİR
-- "Berat Kurt" → yazar kaydı (adres: berat-kurt), yazılar bu kayda bağlanır.
-- Eski "byline" alanı silinmez; bağlanamayan yazılarda ad yine görünür.
-- ---------------------------------------------------------------------
insert into public.authors (name, slug)
select distinct on (slug) name, slug
  from (
    select trim(byline) as name,
           trim(both '-' from regexp_replace(
             lower(translate(trim(byline), 'ÇĞİIÖŞÜÂÎÛçğıöşüâîû', 'CGIIOSUAIUcgiosuaiu')),
             '[^a-z0-9]+', '-', 'g')) as slug
      from public.articles
     where byline is not null and trim(byline) <> ''
  ) x
 where slug <> ''
 order by slug, name
on conflict (slug) do nothing;

update public.articles a
   set author_id = au.id
  from public.authors au
 where a.author_id is null
   and a.byline is not null
   and trim(a.byline) = au.name;

-- ---------------------------------------------------------------------
-- 5) OTOMATİK YAYIN: yazar/dizi değişince site yeniden oluşturulur
-- (trigger_site_build: yayin-tetikleyici.sql)
-- ---------------------------------------------------------------------
create or replace function public.icerik_degisti()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.trigger_site_build();
  return null;
end;
$$;
revoke all on function public.icerik_degisti() from public, anon, authenticated;

drop trigger if exists authors_build on public.authors;
create trigger authors_build after insert or update or delete on public.authors
  for each statement execute function public.icerik_degisti();

drop trigger if exists series_build on public.series;
create trigger series_build after insert or update or delete on public.series
  for each statement execute function public.icerik_degisti();

-- Supabase'in API'si yeni tabloları/alanları hemen tanısın
notify pgrst, 'reload schema';

-- Kontrol: oluşturulan yazarlar ve kaç yazıya bağlandıkları
select au.name, au.slug, count(a.id) as yazi_sayisi
  from public.authors au
  left join public.articles a on a.author_id = au.id
 group by au.id
 order by au.name;
