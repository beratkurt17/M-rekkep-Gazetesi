-- =====================================================================
-- MÜREKKEP GAZETESİ — VERİTABANI ŞEMASI
-- Yeni Supabase projesinde: SQL Editor → bu dosyanın tamamını yapıştır → Run
-- Tekrar çalıştırılabilir (mevcut nesneleri bozmaz).
-- Sonra sırayla: yayin-tetikleyici.sql, 2026-11-21-instagram-alintisi.sql,
--                2026-11-21-guvenlik.sql, 2026-11-22-faz1-bicim.sql,
--                2026-11-22-faz2-yazarlar-diziler.sql, 2026-11-22-faz3-sayilar.sql,
--                2026-11-22-faz4-koseler.sql, 2026-11-22-faz4-takvim-verisi.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) YÖNETİCİLER
-- Yazma yetkisi sadece bu tabloda kayıtlı kullanıcılara açıktır.
-- Kendi kullanıcını ekledikten sonra en alttaki INSERT satırını çalıştır.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- admins tablosuna hiçbir politika yok: dışarıdan okunamaz, yazılamaz.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- 2) YAZILAR
-- ---------------------------------------------------------------------
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title         text not null,
  spot          text,                 -- başlık altı özet
  body          text not null default '',  -- HTML içerik
  label         text,                 -- isteğe bağlı üst etiket: "Öykü", "Şiir"...
  byline        text,                 -- isteğe bağlı yazar adı; boşsa gösterilmez
  cover_image   text,
  image_caption text,
  placement     text not null default 'normal'
                  check (placement in ('manset', 'surmanset', 'normal')),
  status        text not null default 'draft'
                  check (status in ('draft', 'published')),
  published_at  timestamptz,          -- ileri tarih verilirse o saatte yayına girer
  view_count    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Sonradan eklenen alanlar (mevcut tabloya da eklenir)
alter table public.articles add column if not exists ig_quote text; -- hikâye kartı alıntısı
-- bicim: supabase/2026-11-22-faz1-bicim.sql (otomatik / duzyazi / siir)

create index if not exists articles_published_idx
  on public.articles (status, published_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();

alter table public.articles enable row level security;

drop policy if exists "Yayındaki yazıları herkes okur" on public.articles;
create policy "Yayındaki yazıları herkes okur" on public.articles
  for select using (
    status = 'published' and published_at is not null and published_at <= now()
  );

drop policy if exists "Yönetici her şeyi okur" on public.articles;
create policy "Yönetici her şeyi okur" on public.articles
  for select to authenticated using (public.is_admin());

drop policy if exists "Yönetici ekler" on public.articles;
create policy "Yönetici ekler" on public.articles
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Yönetici günceller" on public.articles;
create policy "Yönetici günceller" on public.articles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Yönetici siler" on public.articles;
create policy "Yönetici siler" on public.articles
  for delete to authenticated using (public.is_admin());

-- Okunma sayacı: ziyaretçi sadece sayacı 1 artırabilir, başka hiçbir alana dokunamaz.
create or replace function public.increment_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.articles
     set view_count = view_count + 1
   where slug = p_slug
     and status = 'published'
     and published_at <= now();
$$;

revoke all on function public.increment_view(text) from public;
grant execute on function public.increment_view(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3) SİTE AYARLARI (editörün notu, günün kelimesi vb.)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Ayarları herkes okur" on public.site_settings;
create policy "Ayarları herkes okur" on public.site_settings
  for select using (true);

drop policy if exists "Ayarları yönetici yazar" on public.site_settings;
create policy "Ayarları yönetici yazar" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 4) GÖRSELLER (Storage)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('gorseller', 'gorseller', true)
on conflict (id) do nothing;

drop policy if exists "Görselleri herkes görür" on storage.objects;
create policy "Görselleri herkes görür" on storage.objects
  for select using (bucket_id = 'gorseller');

drop policy if exists "Görselleri yönetici yükler" on storage.objects;
create policy "Görselleri yönetici yükler" on storage.objects
  for insert to authenticated with check (bucket_id = 'gorseller' and public.is_admin());

drop policy if exists "Görselleri yönetici günceller" on storage.objects;
create policy "Görselleri yönetici günceller" on storage.objects
  for update to authenticated using (bucket_id = 'gorseller' and public.is_admin());

drop policy if exists "Görselleri yönetici siler" on storage.objects;
create policy "Görselleri yönetici siler" on storage.objects
  for delete to authenticated using (bucket_id = 'gorseller' and public.is_admin());

-- ---------------------------------------------------------------------
-- 5) TABLO ERİŞİM İZİNLERİ
-- Yeni Supabase projeleri tablolara otomatik izin vermez. Hangi satırın
-- görülebileceğini/değiştirilebileceğini yukarıdaki RLS kuralları belirler.
-- admins tablosuna bilerek izin verilmez.
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

-- ---------------------------------------------------------------------
-- 6) KENDİNİ YÖNETİCİ YAP
-- Authentication → Users'ta kendi kullanıcını oluşturduktan sonra
-- e-postanı yazıp sadece bu satırı çalıştır:
-- ---------------------------------------------------------------------
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'SENIN@EPOSTAN.com';
