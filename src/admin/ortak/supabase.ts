// Panelin tek Supabase bağlantısı. app.ts başlangıçta kurar, ekranlar sb() ile kullanır.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function connect(url: string, key: string): SupabaseClient {
  client = createClient(url, key);
  return client;
}

export function sb(): SupabaseClient {
  if (!client) throw new Error('Supabase bağlantısı kurulmadı.');
  return client;
}
