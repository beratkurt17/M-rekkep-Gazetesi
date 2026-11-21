-- =====================================================================
-- OTOMATİK YAYIN: Yazı yayınlandığında/güncellendiğinde GitHub'a
-- "siteyi yeniden oluştur" sinyali gönderir.
--
-- ÖNCE schema.sql çalıştırılmış olmalı.
--
-- KURULUM:
--  1) GitHub → Settings → Developer settings → Personal access tokens →
--     Fine-grained tokens → Generate new token
--       Repository access: Only select repositories → M-rekkep-Gazetesi
--       Permissions → Repository permissions → Contents: Read and write
--  2) Bu dosyanın tamamını SQL Editor'de çalıştır.
--  3) En alttaki vault.create_secret satırındaki token'ı kendi token'ınla
--     değiştirip SADECE o satırı çalıştır. Token kodda/GitHub'da durmaz,
--     sadece Supabase'in şifreli kasasında (Vault) saklanır.
-- =====================================================================

create extension if not exists pg_net;

-- GitHub'a sinyal gönderen iç fonksiyon (dışarıdan çağrılamaz)
create or replace function public.trigger_site_build()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  token text;
begin
  select decrypted_secret into token
    from vault.decrypted_secrets
   where name = 'github_token';

  if token is null then
    raise warning 'github_token Vault''ta yok; site yeniden oluşturulmadı.';
    return;
  end if;

  perform net.http_post(
    url := 'https://api.github.com/repos/beratkurt17/M-rekkep-Gazetesi/dispatches',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || token,
      'Accept', 'application/vnd.github+json',
      'User-Agent', 'murekkep-supabase',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('event_type', 'yayin')
  );
end;
$$;

revoke all on function public.trigger_site_build() from public, anon, authenticated;

-- Yönetim panelindeki "Siteyi şimdi güncelle" butonu için
create or replace function public.request_rebuild()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;
  perform public.trigger_site_build();
end;
$$;

revoke all on function public.request_rebuild() from public, anon;
grant execute on function public.request_rebuild() to authenticated;

-- Yazılar: sadece okuyucunun gördüğü bir şey değiştiğinde tetikle.
-- (Okunma sayacının artması siteyi yeniden oluşturmaz.)
create or replace function public.articles_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.status = 'published' then perform public.trigger_site_build(); end if;
    return old;
  end if;

  if tg_op = 'INSERT' then
    if new.status = 'published' then perform public.trigger_site_build(); end if;
    return new;
  end if;

  -- UPDATE
  if (new.status = 'published' or old.status = 'published')
     and (to_jsonb(new) - 'view_count' - 'updated_at')
         is distinct from (to_jsonb(old) - 'view_count' - 'updated_at') then
    perform public.trigger_site_build();
  end if;
  return new;
end;
$$;

drop trigger if exists articles_build on public.articles;
create trigger articles_build
  after insert or update or delete on public.articles
  for each row execute function public.articles_changed();

-- Site ayarları değişince de tetikle
create or replace function public.settings_changed()
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

drop trigger if exists settings_build on public.site_settings;
create trigger settings_build
  after insert or update or delete on public.site_settings
  for each statement execute function public.settings_changed();

-- ---------------------------------------------------------------------
-- GitHub token'ını kasaya koy (sadece bu satırı, token'ını yazarak çalıştır):
-- ---------------------------------------------------------------------
-- select vault.create_secret('github_pat_BURAYA_TOKEN', 'github_token');
