-- =====================================================================
-- FAZ 1 — Yazı biçimi (otomatik / düzyazı / şiir)
-- SQL Editor'de bir kez çalıştır. Tekrar çalıştırmak zararsızdır.
--
-- "otomatik": metinde dize sonları varsa şiir, yoksa düzyazı olarak dizilir
--             (mevcut yazılar bu değeri alır; görünümleri değişmez).
-- Dipnotlar için veritabanında değişiklik gerekmez (yazı metninin içinde durur).
-- =====================================================================

alter table public.articles
  add column if not exists bicim text not null default 'otomatik';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'articles_bicim_check') then
    alter table public.articles
      add constraint articles_bicim_check check (bicim in ('otomatik', 'duzyazi', 'siir'));
  end if;
end $$;

-- Supabase'in API'si yeni alanı hemen tanısın
notify pgrst, 'reload schema';

-- Kontrol: "bicim | otomatik" satırı görünmeli
select column_name, column_default from information_schema.columns
 where table_schema = 'public' and table_name = 'articles' and column_name = 'bicim';
