-- Yazılara isteğe bağlı "Instagram alıntısı" alanı ekler (hikâye kartında kullanılır).
-- SQL Editor'de bir kez çalıştır. Tekrar çalıştırmak zararsızdır.
alter table public.articles add column if not exists ig_quote text;
