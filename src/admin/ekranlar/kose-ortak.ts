// Günün dizesi ve günün kelimesi için ortak tarih yardımcıları.
import { sb } from '../ortak/supabase';
import { todayIso, nextDayIso, formatDay } from '../../lib/format';

/** Yeni kayıt için önerilen gün: son planlanan günün ertesi (geçmişteyse bugün). */
export async function nextFreeDay(table: string): Promise<string> {
  const today = todayIso();
  const { data } = await sb().from(table).select('show_on').order('show_on', { ascending: false }).limit(1);
  const last = data?.[0]?.show_on as string | undefined;
  return last && last >= today ? nextDayIso(last) : today;
}

/** Listede gün bilgisi: "22 Kasım 2026 · Bugün" / "· Planlı" */
export function dayLabel(iso: string): string {
  const today = todayIso();
  const status = iso === today ? ' · Bugün' : iso > today ? ' · Planlı' : '';
  return formatDay(iso) + status;
}
