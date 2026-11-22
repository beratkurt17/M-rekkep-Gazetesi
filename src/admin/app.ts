// Yönetim paneli girişi: bağlantı, oturum, üst menü ve ekranların kaydı.
// Her ekranın kendi dosyası var: src/admin/ekranlar/
import { $ } from './ortak/dom';
import { connect, sb } from './ortak/supabase';
import { confirmLeave, isDirty } from './ortak/kirli';
import { registerView, showView } from './ortak/gezinme';
import { showToast } from '../scripts/toast';
import { bindYaziListesi, loadList } from './ekranlar/yazi-listesi';
import { bindYaziDuzenle } from './ekranlar/yazi-duzenle';
import { bindYazarlar, showYazarlar } from './ekranlar/yazarlar';
import { bindDiziler, showDiziler } from './ekranlar/diziler';
import { bindAyarlar, loadSettings } from './ekranlar/ayarlar';

export function initAdmin() {
  // Panel başka bir sitenin içine (iframe) gömülürse çalışmasın — tıklama hilesine karşı.
  if (window.top !== window.self) {
    document.body.textContent = 'Bu sayfa başka bir sitenin içinde açılamaz.';
    return;
  }

  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  connect(url, key);

  // Ekranlar: ad ↔ HTML'deki id="view-<ad>"
  registerView('list', { onShow: loadList });
  registerView('edit', { tab: 'list' });
  registerView('authors', { onShow: showYazarlar });
  registerView('series', { onShow: showDiziler });
  registerView('settings', { onShow: loadSettings });

  bindShell();
  bindYaziListesi();
  bindYaziDuzenle();
  bindYazarlar();
  bindDiziler();
  bindAyarlar();

  sb().auth.getSession().then(({ data }) => {
    if (data.session) enterApp(); else showLogin();
  });
}

function showLogin(msg?: string) {
  $('app').hidden = true;
  $('login').hidden = false;
  const err = $('login-error');
  err.hidden = !msg;
  err.textContent = msg ?? '';
}

async function enterApp() {
  const { data: isAdmin, error } = await sb().rpc('is_admin');
  if (error || !isAdmin) {
    await sb().auth.signOut();
    showLogin('Bu hesabın yönetim yetkisi yok.');
    return;
  }
  $('login').hidden = true;
  $('app').hidden = false;
  showView('list');
}

/** Giriş formu, üst menü ve her ekranda geçerli düğmeler. */
function bindShell() {
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target as HTMLFormElement);
    const btn = (e.target as HTMLFormElement).querySelector('button')!;
    btn.disabled = true;
    const { error } = await sb().auth.signInWithPassword({
      email: String(f.get('email')),
      password: String(f.get('password')),
    });
    btn.disabled = false;
    if (error) showLogin('E-posta veya şifre hatalı.');
    else enterApp();
  });

  $('logout-btn').addEventListener('click', async () => {
    if (!confirmLeave()) return;
    await sb().auth.signOut();
    showLogin();
  });

  $('rebuild-btn').addEventListener('click', async () => {
    const { error } = await sb().rpc('request_rebuild');
    showToast(error ? 'Güncelleme isteği gönderilemedi: ' + error.message
                    : 'Site yeniden oluşturuluyor — 1-2 dakika içinde yayında.', 4500);
  });

  document.querySelectorAll<HTMLButtonElement>('.tab').forEach((t) =>
    t.addEventListener('click', () => { if (confirmLeave()) showView(t.dataset.view!); }),
  );

  window.addEventListener('beforeunload', (e) => { if (isDirty()) e.preventDefault(); });
}
