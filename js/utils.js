// =============================================
// UTILITIES & SECURITY FUNCTIONS
// =============================================

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








window.addEventListener('DOMContentLoaded', () => {
    forceUnlockAllOverlays();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        forceUnlockAllOverlays();
    }
});

// Application State & Seed Data