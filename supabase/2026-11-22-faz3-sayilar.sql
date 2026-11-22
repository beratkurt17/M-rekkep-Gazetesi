-- =====================================================================
-- FAZ 3 — Sayı sistemi ve dosya konusu
-- SQL Editor'de bir kez çalıştır. Tekrar çalıştırmak zararsızdır.
-- Önce: 2026-11-22-faz2-yazarlar-diziler.sql çalışmış olmalı.
--
-- Ne yapar:
--  1) "issues" (sayılar) tablosunu kurar: numara, dosya konusu, dosya girişi,
--     yayın tarihi, durum (taslak/yayında).
--  2) Yazılara sayı ve sayı içindeki sıra alanlarını ekler.
--  3) Sayı değişince site kendini yeniden oluşturur.
-- Mevcut yazılar hiçbir sayıya bağlanmaz; sayısız yazılar eskisi gibi yayında kalır.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) SAYILAR
-- ---------------------------------------------------------------------
create table if not exists public.issues (
  id           uuid primary key default gen_random_uuid(),
  number       integer not null unique check (number between 1 and 99999),
  theme        text check (theme is null or char_length(theme) <= 120),     -- dosya konusu
  intro        text check (intro is null or char_length(intro) <= 4000),   -- dosya girişi
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,          -- sayının tarihi; ileri tarihse o gün görünür
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists issues_touch on public.issues;
create trigger issues_touch before update on public.issues
  for each row execute function public.touch_updated_at();

alter table public.issues enable row level security;

-- Okur yalnızca yayındaki ve tarihi gelmiş sayıları görür; yönetici hepsini.
drop policy if exists "Yayındaki sayıları herkes okur" on public.issues;
create policy "Yayındaki sayıları herkes okur" on public.issues
  for select using (status = 'published' and published_at is not null and published_at <= now());

drop policy if exists "Yönetici her şeyi okur" on public.issues;
create policy "Yönetici her şeyi okur" on public.issues
  for select to authenticated using (public.is_admin());

drop policy if exists "Yönetici ekler" on public.issues;
create policy "Yönetici ekler" on public.issues
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Yönetici günceller" on public.issues;
create policy "Yönetici günceller" on public.issues
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Yönetici siler" on public.issues;
create policy "Yönetici siler" on public.issues
  for delete to authenticated using (public.is_admin());

grant select on public.issues to anon, authenticated;
grant insert, update, delete on public.issues to authenticated;

-- ---------------------------------------------------------------------
-- 2) YAZILARA SAYI VE SIRA
-- Sayı silinirse yazılar silinmez, yalnızca sayıdan çıkar.
-- ---------------------------------------------------------------------
alter table public.articles add column if not exists issue_id uuid references public.issues (id) on delete set null;
alter table public.articles add column if not exists issue_order integer;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'articles_issue_order_range') then
    alter table public.articles
      add constraint articles_issue_order_range check (issue_order is null or issue_order between 1 and 999);
  end if;
end $$;

create index if not exists articles_issue_idx on public.articles (issue_id, issue_order);

-- ---------------------------------------------------------------------
-- 3) OTOMATİK YAYIN (icerik_degisti: faz2 dosyasında da tanımlı; burada güvence)
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

drop trigger if exists issues_build on public.issues;
create trigger issues_build after insert or update or delete on public.issues
  for each statement execute function public.icerik_degisti();

notify pgrst, 'reload schema';

-- Kontrol: "issues" tablosu ve yazılardaki yeni alanlar görünmeli
select table_name, column_name from information_schema.columns
 where table_schema = 'public'
   and ((table_name = 'issues' and column_name = 'number')
     or (table_name = 'articles' and column_name in ('issue_id', 'issue_order')));
