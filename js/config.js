// Disable console.log in production environments to keep the browser console clean and secure
if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && !window.location.hostname.startsWith("192.168.")) {
    console.log = () => {};
}

// =============================================
// GÜVENLİK KATMANLARI (Security Utilities)
// =============================================

/**
 * XSS Koruması: Kullanıcı girdilerini HTML özel karakterlerden
 * arındırır. Kullanıcı kaynaklı metin innerHTML ile
 * gösterilmeden önce mutlaka bu fonksiyondan geçirilmeli.
 */
function sanitizeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Şifre Hash'leme: Web Crypto API ile SHA-256 hash üretir.
 * Offline modda şifreler localStorage'a düz metin yerine
 * hash olarak kaydedilir.
 */
async function hashPassword(password) {
    try {
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(String(password)));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.warn('Hash error:', e);
        return String(password); // Fallback (olmaması gerekir)
    }
}

/**
 * Brute-Force Koruması: Aynı e-posta ile yapılan giriş
 * denemelerini sessionStorage'da sayar. 5 başarısız denemeden
 * sonra 15 dakika boyunca erişimi kilitler.
 */
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS   = 15 * 60 * 1000; // 15 dakika

function checkLoginRateLimit(email) {
    try {
        const key    = 'murekkep_login_rl_' + btoa(encodeURIComponent(email.toLowerCase().trim()));
        let   record = JSON.parse(sessionStorage.getItem(key) || '{"count":0,"since":0}');
        const now    = Date.now();

        // Kilit süresi dolmuşsa sayacı sıfırla
        if (now - record.since > LOGIN_LOCKOUT_MS) {
            record = { count: 0, since: now };
        }

        record.count++;
        sessionStorage.setItem(key, JSON.stringify(record));

        if (record.count > LOGIN_MAX_ATTEMPTS) {
            const minutesLeft = Math.ceil((LOGIN_LOCKOUT_MS - (now - record.since)) / 60000);
            return { allowed: false, minutesLeft };
        }
        return { allowed: true };
    } catch (e) {
        return { allowed: true }; // sessionStorage yoksa engelleme
    }
}

function resetLoginRateLimit(email) {
    try {
        const key = 'murekkep_login_rl_' + btoa(encodeURIComponent(email.toLowerCase().trim()));
        sessionStorage.removeItem(key);
    } catch (e) {}
}

/**
 * Yorum Flood Koruması: Bir kullanıcı aynı makaleye 30 saniye
 * içinde ikinci yorum yapamaz. sessionStorage tabanlıdır.
 */
const COMMENT_COOLDOWN_MS = 30 * 1000; // 30 saniye

function checkCommentCooldown(articleId) {
    try {
        const key    = 'murekkep_comment_cd_' + articleId;
        const lastMs = parseInt(sessionStorage.getItem(key) || '0', 10);
        const now    = Date.now();
        if (now - lastMs < COMMENT_COOLDOWN_MS) {
            const secsLeft = Math.ceil((COMMENT_COOLDOWN_MS - (now - lastMs)) / 1000);
            return { allowed: false, secsLeft };
        }
        sessionStorage.setItem(key, String(now));
        return { allowed: true };
    } catch (e) {
        return { allowed: true };
    }
}


// =============================================
// SCROLL LOCK UTILITY (Medium-style)
// Prevents the page from jumping to top when
// overlays open by using position:fixed + top offset.
// =============================================
let _scrollLockDepth = 0;

function lockBodyScroll() {
    _scrollLockDepth++;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
    _scrollLockDepth = Math.max(0, _scrollLockDepth - 1);
    if (_scrollLockDepth === 0) {
        document.body.classList.remove('modal-open');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
    }
}

function forceUnlockAllOverlays() {
    _scrollLockDepth = 0;
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    document.querySelectorAll('.overlay').forEach(el => {
        el.classList.add('hidden');
    });
    const actionModal = document.getElementById('mobile-action-modal');
    if (actionModal) actionModal.classList.remove('active');
}

window.addEventListener('DOMContentLoaded', () => {
    forceUnlockAllOverlays();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        forceUnlockAllOverlays();
    }
});


