// =============================================
// MÜREKKEP POSTASI / PENPAL MODULE v5.0
// =============================================

// MÜREKKEPLİ MEKTUP MODULE v5.0
// Supabase `letters` tablosu ile tam gerçek kullanıcı sistemi.
// Asimetrik havuz eşleşmesi + thread konuşmaları.
// ===========================================================
(function MürekkepliMektupModule() {
    'use strict';

    // ── State ─────────────────────────────────────────────────
    let myLetters  = [];  // Bu kullanıcıya ait (gönderilen + gelen)
    let myThreads  = {};  // { threadId: { ...bondInfo, messages: [] } }

    let state = {
        paperTheme:    'parchment',
        font:          "'Caveat', cursive",
        inkColor:      '#1a1008',
        stamp:         '🪶',
        sealType:      'image',
        sealImg:       'assets/seals/seal_murekkep_red.jpg',
        sealGradient:  'radial-gradient(circle at 35% 35%, #e53935, #7b1a1a)',
        deliveryDelay: 43200000, // 12h
        replyMode:     null,     // { threadId, recipientId, recipientUsername, hint }
        activeTab:     'studio',
    };

    // Wipe legacy localStorage keys
    ['mml_letters_v1','mml_letters_v2','mml_pool_v1','mml_pool_v2',
     'mml_bonds_v1','mml_bonds_v2','murekkep_penpal_letters_v3',
     'murekkep_penpal_bonds_v3','murekkep_penpal_letters_v4',
     'murekkep_penpal_bonds_v4'].forEach(k => { try { localStorage.removeItem(k); } catch(e){} });

    // ── Supabase Helpers ──────────────────────────────────────
    function hasSupabase() {
        return typeof isSupabaseConnected !== 'undefined' && isSupabaseConnected
            && typeof supabaseClient !== 'undefined' && supabaseClient;
    }

    // ── Current User Identifiers & Matching Helper ────────────
    function getMyIdentifiers() {
        if (!currentUser) return [];
        const ids = [
            currentUser.id,
            currentUser.uid,
            currentUser.email,
            currentUser.username,
            currentUser.user_metadata?.username,
            currentUser.user_metadata?.full_name,
            currentUser.email ? currentUser.email.split('@')[0] : null
        ];
        return ids.filter(Boolean).map(x => String(x).toLowerCase().trim());
    }

    function isMyIdentity(id, username) {
        if (!currentUser) return false;
        const myIds = getMyIdentifiers();
        if (!myIds.length) return false;

        const targetId = String(id || '').toLowerCase().trim();
        const targetName = String(username || '').toLowerCase().trim();

        if (targetId && myIds.includes(targetId)) return true;
        if (targetName && myIds.includes(targetName)) return true;

        // Prefix / partial match for email prefixes vs display names
        if (targetName && myIds.some(x => x && (x === targetName || x.startsWith(targetName) || targetName.startsWith(x)))) {
            return true;
        }
        return false;
    }

    function getCurId() {
        if (!currentUser) return '';
        return String(currentUser.id || currentUser.uid || currentUser.email || currentUser.username || '').trim();
    }
    function getCurName() {
        if (!currentUser) return '';
        return String(currentUser.username || currentUser.email?.split('@')[0] || '').trim();
    }

    // ── Local Storage Cache Helper ────────────────────────────
    function getLocalLetters() {
        const myIds = getMyIdentifiers();
        if (!myIds.length) return [];
        for (const k of myIds) {
            try {
                const saved = localStorage.getItem('mp_letters_cache_' + k);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch(e) {}
        }
        return [];
    }
    function setLocalLetters(arr) {
        const myIds = getMyIdentifiers();
        if (!myIds.length) return;
        try {
            const str = JSON.stringify(arr);
            myIds.forEach(k => localStorage.setItem('mp_letters_cache_' + k, str));
        } catch(e) {}
    }

    // ── Fetch This User's Letters from Supabase ───────────────
    async function fetchMyLetters() {
        if (!currentUser) { myLetters = []; return; }
        const myIds = getMyIdentifiers();
        if (!myIds.length) return;

        // Start with cached local letters
        const local = getLocalLetters();
        if (local.length > 0 && myLetters.length === 0) {
            myLetters = local;
        }

        if (hasSupabase()) {
            try {
                let sentList = [];
                let recvList = [];

                // Fetch by all identifier variations
                for (const ident of myIds) {
                    const { data: s } = await supabaseClient.from('letters').select('*').eq('sender_id', ident);
                    if (s && s.length) sentList.push(...s);

                    const { data: sUser } = await supabaseClient.from('letters').select('*').eq('sender_username', ident);
                    if (sUser && sUser.length) sentList.push(...sUser);

                    const { data: r } = await supabaseClient.from('letters').select('*').eq('recipient_id', ident);
                    if (r && r.length) recvList.push(...r);

                    const { data: rUser } = await supabaseClient.from('letters').select('*').eq('recipient_username', ident);
                    if (rUser && rUser.length) recvList.push(...rUser);
                }

                // Filter out purged/deleted letters
                let purgedIds = [];
                try { purgedIds = JSON.parse(localStorage.getItem('murekkep_purged_letters') || '[]'); } catch(e){}

                // Add remote letters first
                remoteAll.forEach(l => {
                    if (l && l.id && !seen.has(l.id) && !purgedIds.includes(l.id)) {
                        seen.add(l.id);
                        merged.push(l);
                    }
                });

                // Keep local letters that may not have synced yet
                myLetters.forEach(l => {
                    if (l && l.id && !seen.has(l.id) && !purgedIds.includes(l.id)) {
                        seen.add(l.id);
                        merged.push(l);
                    }
                });

                // Filter soft deleted
                myLetters = merged.filter(l => {
                    if (purgedIds.includes(l.id)) return false;
                    const deletedBy = Array.isArray(l.deleted_by) ? l.deleted_by.map(x => String(x).toLowerCase().trim()) : [];
                    return !myIds.some(ident => deletedBy.includes(ident));
                });

                // Update transit → delivered in Supabase
                const now = Date.now();
                for (const l of myLetters) {
                    if (l.status === 'transit' && l.deliver_at <= now) {
                        l.status = 'delivered';
                        supabaseClient.from('letters').update({ status: 'delivered' }).eq('id', l.id);
                    }
                }

                setLocalLetters(myLetters);
                buildThreads();
                return;
            } catch(e) {
                console.error('[MürekkepliMektup] Supabase fetch error:', e);
            }
        }

        buildThreads();
    }

    // ── Anonymity & Hint Helper ──────────────────────────────
    function getAnonDisplay(hint) {
        if (!hint || hint.trim() === '' || hint === 'İmzanız' || hint === 'Kullanıcı') {
            return '🎭 Anonim Edebiyatsever';
        }
        return '✍️ ' + hint.trim();
    }

    // ── Build Thread Map from myLetters ──────────────────────
    function buildThreads() {
        myThreads = {};
        if (!currentUser) return;

        myLetters.forEach(l => {
            const isMe = isMyIdentity(l.sender_id, l.sender_username);

            // Havuzdaki henüz eşleşmemiş mektuplar thread değildir
            if (l.is_pool) return;
            if (!l.thread_id) return;

            if (!myThreads[l.thread_id]) {
                const partnerHint = isMe ? getAnonDisplay(l.recipient_hint || l.recipient_name) : getAnonDisplay(l.sender_hint);
                myThreads[l.thread_id] = {
                    threadId: l.thread_id,
                    partnerId: isMe ? l.recipient_id : l.sender_id,
                    partnerHint: partnerHint,
                    letterCount: 0,
                    lastAt: 0,
                    hasDelivered: false,
                    letters: []
                };
            }
            myThreads[l.thread_id].letters.push(l);
            myThreads[l.thread_id].letterCount++;
            if (l.status === 'delivered') {
                myThreads[l.thread_id].hasDelivered = true;
            }
            if (l.sent_at > myThreads[l.thread_id].lastAt) {
                myThreads[l.thread_id].lastAt = l.sent_at;
            }
        });
    }

    // ── Save a new letter to Supabase ────────────────────────
    async function saveLetter(letterObj) {
        // Save locally first so it never gets lost
        const existingIdx = myLetters.findIndex(l => l.id === letterObj.id);
        if (existingIdx >= 0) myLetters[existingIdx] = letterObj;
        else myLetters.push(letterObj);
        setLocalLetters(myLetters);

        if (hasSupabase()) {
            try {
                const row = {
                    id:                 letterObj.id,
                    thread_id:          letterObj.thread_id,
                    sender_id:          letterObj.sender_id,
                    sender_username:    letterObj.sender_username,
                    sender_hint:        letterObj.sender_hint || '',
                    recipient_id:       letterObj.recipient_id || null,
                    recipient_username: letterObj.recipient_username || null,
                    is_pool:            letterObj.is_pool ?? true,
                    sent_at:            letterObj.sent_at,
                    deliver_at:         letterObj.deliver_at,
                    status:             letterObj.status || 'transit',
                    paper_theme:        letterObj.paper_theme || 'parchment',
                    font:               letterObj.font || "'Caveat', cursive",
                    ink_color:          letterObj.ink_color || '#1a1008',
                    stamp:              letterObj.stamp || '🪶',
                    seal_type:          letterObj.seal_type || 'image',
                    seal_img:           letterObj.seal_img || '',
                    seal_gradient:      letterObj.seal_gradient || '',
                    salutation:         letterObj.salutation || '',
                    body:               letterObj.body || '',
                    closing:            letterObj.closing || '',
                    signature:          letterObj.signature || '',
                    read_by:            [],
                    deleted_by:         []
                };

                const { error } = await supabaseClient.from('letters').insert([row]);
                if (error) {
                    console.error('[MürekkepliMektup] Supabase Insert Error:', error);
                } else {
                    console.log('[MürekkepliMektup] Mektup Supabase\'e başarıyla kaydedildi:', letterObj.id);
                }
            } catch(e) {
                console.error('[MürekkepliMektup] Save exception:', e);
            }
        }
    }

    // ── Update an existing letter row ─────────────────────────
    async function updateLetter(letterId, fields) {
        const localLetter = myLetters.find(l => l.id === letterId);
        if (localLetter) {
            Object.assign(localLetter, fields);
            setLocalLetters(myLetters);
        }
        if (hasSupabase()) {
            try {
                const { error } = await supabaseClient.from('letters').update(fields).eq('id', letterId);
                if (error) console.error('[MürekkepliMektup] Update error:', error);
            } catch(e) {
                console.error('[MürekkepliMektup] Update exception:', e);
            }
        }
    }

    // ── Claim a pool letter for the current user ──────────────
    async function claimPoolLetter(poolLetterId) {
        const curId = getCurId();
        const curName = getCurName();
        if (hasSupabase()) {
            try {
                const { error } = await supabaseClient.from('letters')
                    .update({
                        recipient_id: curId,
                        recipient_username: curName,
                        is_pool: false
                    })
                    .eq('id', poolLetterId);
                if (error) console.error('[MürekkepliMektup] Claim error:', error);
            } catch(e) {
                console.error('[MürekkepliMektup] Claim exception:', e);
            }
        }
    }

    // ── Find an unclaimed pool letter from another user ───────
    async function findPoolLetter() {
        if (!hasSupabase() || !currentUser) return null;
        const myIds = getMyIdentifiers();
        try {
            const { data, error } = await supabaseClient
                .from('letters')
                .select('*')
                .eq('is_pool', true)
                .is('recipient_id', null);

            if (error || !data || !data.length) return null;

            const candidate = data.find(l => {
                // 1. isMyIdentity kontrolü
                if (isMyIdentity(l.sender_id, l.sender_username)) return false;

                // 2. Yerel hafızamdaki mektuplardan biri mi?
                if (myLetters.some(ml => ml.id === l.id)) return false;

                // 3. Tüm kimlik parçalarıyla birebir kıyaslama
                const sId = String(l.sender_id || '').toLowerCase().trim();
                const sName = String(l.sender_username || '').toLowerCase().trim();
                for (const ident of myIds) {
                    if (!ident) continue;
                    if (sId === ident || sName === ident) return false;
                    if (sId.includes(ident) || ident.includes(sId)) return false;
                    if (sName.includes(ident) || ident.includes(sName)) return false;
                }

                return true;
            });

            return candidate || null;
        } catch(e) {
            console.error('[MürekkepliMektup] findPoolLetter error:', e);
            return null;
        }
    }

    // ── Direct Delete a letter (from DB and local) ────────────
    function removeLetterFromAllStorage(letterId) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('mp_letters_') || key.startsWith('mml_') || key.startsWith('murekkep_penpal_'))) {
                try {
                    const val = JSON.parse(localStorage.getItem(key) || '[]');
                    if (Array.isArray(val)) {
                        const filtered = val.filter(l => l && l.id !== letterId);
                        localStorage.setItem(key, JSON.stringify(filtered));
                    }
                } catch(e){}
            }
        }
    }

    async function deleteLetter(letterId) {
        if (!letterId) return;
        // 1. Add to permanent purge blacklist
        try {
            const purged = JSON.parse(localStorage.getItem('murekkep_purged_letters') || '[]');
            if (!purged.includes(letterId)) {
                purged.push(letterId);
                localStorage.setItem('murekkep_purged_letters', JSON.stringify(purged));
            }
        } catch(e){}

        // 2. Immediately remove from local memory and all localStorage keys
        myLetters = myLetters.filter(l => l.id !== letterId);
        removeLetterFromAllStorage(letterId);
        setLocalLetters(myLetters);
        buildThreads();
        renderOutbox();
        renderInbox();
        renderThreads();
        showToast('🗑️ Mektup kalıcı olarak silindi.');

        // 3. Delete permanently from Supabase
        if (hasSupabase()) {
            try {
                const { error } = await supabaseClient.from('letters').delete().eq('id', letterId);
                if (error) {
                    console.error('[MürekkepliMektup] Supabase delete error:', error);
                } else {
                    console.log('[MürekkepliMektup] Mektup Supabase\'den silindi:', letterId);
                }
            } catch(e) {
                console.error('[MürekkepliMektup] Delete exception:', e);
            }
        }
    }

    // ── DOM Helpers ──────────────────────────────────────────
    function qs(id)   { return document.getElementById(id); }
    function qsa(sel) { return document.querySelectorAll(sel); }
    function sanitize(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    // ── Toast ─────────────────────────────────────────────────
    function showToast(msg) {
        let t = document.querySelector('.penpal-toast');
        if (!t) { t = document.createElement('div'); t.className = 'penpal-toast'; document.body.appendChild(t); }
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3400);
    }

    // ── Seal HTML Helper ──────────────────────────────────────
    function getSealHTML(obj, extraClass = '') {
        if (!obj) obj = {};
        const isImg = (obj.seal_type === 'image' || obj.sealType === 'image') && (obj.seal_img || obj.sealImg);
        const imgSrc = obj.seal_img || obj.sealImg;
        if (isImg && imgSrc) {
            return `<div class="seal-avatar-wrapper ${extraClass} has-img">
                <img src="${sanitize(imgSrc)}" alt="Mühür" onerror="this.style.display='none';this.parentNode.classList.remove('has-img');this.parentNode.innerHTML='M';">
            </div>`;
        }
        const bg = obj.seal_gradient || obj.sealGradient || 'radial-gradient(circle at 35% 35%, #e53935, #7b1a1a)';
        return `<div class="seal-avatar-wrapper ${extraClass}" style="background:${bg}">M</div>`;
    }

    // ── Countdown ─────────────────────────────────────────────
    function formatCountdown(deliverAt) {
        const ms = deliverAt - Date.now();
        if (ms <= 0) return '✅ Teslim edildi';
        const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
        if (h > 0) return `⏳ ${h}s ${m}dk`;
        if (m > 0) return `⏳ ${m}dk ${s}sn`;
        return `⏳ ${s}sn`;
    }

    let _cdInterval = null;
    function startCountdowns(container) {
        if (_cdInterval) clearInterval(_cdInterval);
        _cdInterval = setInterval(() => {
            if (!container || !container.isConnected) { clearInterval(_cdInterval); return; }
            let hasChanged = false;
            container.querySelectorAll('.penpal-countdown[data-deliver]').forEach(el => {
                const target = parseInt(el.dataset.deliver);
                el.textContent = formatCountdown(target);
                if (target <= Date.now() && !el.dataset.expired) {
                    el.dataset.expired = "1";
                    hasChanged = true;
                }
            });
            if (hasChanged) {
                fetchMyLetters().then(() => {
                    if (state.activeTab === 'inbox') renderInbox();
                    if (state.activeTab === 'outbox') renderOutbox();
                    if (state.activeTab === 'threads') renderThreads();
                });
            }
        }, 1000);
    }

    // ── Open / Close ──────────────────────────────────────────
    async function openPenpal() {
        const overlay = qs('penpal-overlay');
        if (!overlay) return;
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        await fetchMyLetters();
        renderAll();
    }

    function closePenpal() {
        const overlay = qs('penpal-overlay');
        if (overlay) overlay.classList.add('hidden');
        document.body.style.overflow = '';
        if (_cdInterval) { clearInterval(_cdInterval); _cdInterval = null; }
    }

    // ── Tab Switching ─────────────────────────────────────────
    async function switchTab(tabName) {
        state.activeTab = tabName;
        qsa('.penpal-tab-btn').forEach(b => b.classList.remove('active'));
        qsa('.penpal-panel').forEach(p => p.classList.add('hidden'));
        const btn = qs(`penpal-tab-${tabName}`);
        const panel = qs(`penpal-panel-${tabName}`);
        if (btn) btn.classList.add('active');
        if (panel) panel.classList.remove('hidden');

        if (tabName === 'inbox') {
            renderInbox();
            fetchMyLetters().then(() => renderInbox());
        } else if (tabName === 'outbox') {
            renderOutbox();
            fetchMyLetters().then(() => renderOutbox());
        } else if (tabName === 'threads') {
            renderThreads();
            fetchMyLetters().then(() => renderThreads());
        }
        updateStudioReplyBanner();
        updateStudioAuthNotice();
    }

    // ── Auth Notice in Studio ─────────────────────────────────
    function updateStudioAuthNotice() {
        const previewArea = document.querySelector('.studio-preview-area');
        if (!previewArea) return;
        let noticeEl = qs('penpal-studio-auth-notice');
        if (currentUser) {
            if (noticeEl) noticeEl.classList.add('hidden');
        } else {
            if (!noticeEl) {
                noticeEl = document.createElement('div');
                noticeEl.id = 'penpal-studio-auth-notice';
                noticeEl.className = 'penpal-login-notice';
                noticeEl.innerHTML = `<span>🔒 Mektup gönderebilmek için <strong>giriş yapmalısınız</strong>.</span>
                    <button type="button" class="penpal-login-inline-btn" id="penpal-studio-login-btn">Giriş Yap</button>`;
                const actions = previewArea.querySelector('.studio-actions');
                if (actions) previewArea.insertBefore(noticeEl, actions);
                else previewArea.appendChild(noticeEl);
                qs('penpal-studio-login-btn')?.addEventListener('click', () => { if (typeof openAuthModal === 'function') openAuthModal(); });
            } else {
                noticeEl.classList.remove('hidden');
            }
        }
    }

    // ── Reply Banner ──────────────────────────────────────────
    function updateStudioReplyBanner() {
        const badgeText = document.querySelector('.anon-dispatch-text');
        if (!badgeText) return;
        if (state.replyMode) {
            badgeText.innerHTML = `
                <strong style="color:#1565c0;">↩️ Yanıt Yazılıyor: ${sanitize(state.replyMode.hint)}</strong>
                <span>Bu mektup doğrudan mektup arkadaşınıza iletilecek.
                <button id="cancel-reply-btn" style="background:none;border:none;color:#e53935;font-weight:700;cursor:pointer;text-decoration:underline;padding:0;margin-left:6px;">İptal Et</button></span>`;
            qs('cancel-reply-btn')?.addEventListener('click', cancelReply);
        } else {
            badgeText.innerHTML = `
                <strong>Anonim Mektup Havuzu</strong>
                <span>Mektubunuz rastgele bir edebiyatseverin havuzuna gider. Siz de havuzdan birinin mektubunu alırsınız. Kimse kimseyi bilmez — sadece kelimeler konuşur.</span>`;
        }
    }

    function startReply(threadId, recipientId, recipientUsername, hint) {
        if (!currentUser) {
            showToast('⚠️ Yanıt yazabilmek için giriş yapın.');
            if (typeof openAuthModal === 'function') openAuthModal();
            return;
        }
        state.replyMode = { threadId, recipientId, recipientUsername, hint: hint || '🎭 Anonim Edebiyatsever' };
        updateStudioReplyBanner();
        switchTab('studio');
        showToast(`✍️ ${state.replyMode.hint} için yanıt yazıyorsunuz.`);
    }

    function cancelReply() {
        state.replyMode = null;
        updateStudioReplyBanner();
        showToast('Yanıt modu iptal edildi.');
    }

    // ── Live Preview ──────────────────────────────────────────
    function updatePreview() {
        const preview = qs('penpal-letter-preview');
        if (!preview) return;
        ['paper-parchment','paper-cream','paper-night','paper-straw'].forEach(c => preview.classList.remove(c));
        preview.classList.add(`paper-${state.paperTheme}`);
        preview.querySelectorAll('[contenteditable]').forEach(el => {
            el.style.fontFamily = state.font;
            el.style.color = state.inkColor;
        });
        const sealEl = qs('preview-seal');
        if (sealEl) {
            const isImg = state.sealType === 'image' && state.sealImg;
            if (isImg) {
                sealEl.className = 'letter-seal preview-seal has-img';
                sealEl.style.background = 'transparent';
                sealEl.innerHTML = `<img src="${sanitize(state.sealImg)}" alt="Mühür" onerror="this.style.display='none';this.parentNode.classList.remove('has-img');this.parentNode.style.background='${state.sealGradient}';this.parentNode.innerHTML='M';">`;
            } else {
                sealEl.className = 'letter-seal preview-seal';
                sealEl.style.background = state.sealGradient || 'radial-gradient(circle at 35% 35%, #e53935, #7b1a1a)';
                sealEl.innerHTML = 'M';
            }
        }
        const stampEl = qs('preview-stamp');
        if (stampEl) stampEl.textContent = state.stamp;
    }

    // ── Studio Control Binding ────────────────────────────────
    function bindStudioControls() {
        qsa('#paper-theme-grid .paper-btn').forEach(btn => btn.addEventListener('click', () => {
            qsa('#paper-theme-grid .paper-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); state.paperTheme = btn.dataset.paper; updatePreview();
        }));
        qsa('#font-choice-grid .font-btn').forEach(btn => btn.addEventListener('click', () => {
            qsa('#font-choice-grid .font-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); state.font = btn.dataset.font; updatePreview();
        }));
        qsa('#ink-color-grid .ink-btn').forEach(btn => btn.addEventListener('click', () => {
            qsa('#ink-color-grid .ink-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); state.inkColor = btn.dataset.ink; updatePreview();
        }));
        qsa('#stamp-grid .stamp-btn').forEach(btn => btn.addEventListener('click', () => {
            qsa('#stamp-grid .stamp-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); state.stamp = btn.textContent.trim(); updatePreview();
        }));
        qsa('#seal-grid .seal-btn').forEach(btn => btn.addEventListener('click', () => {
            qsa('#seal-grid .seal-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.sealType = btn.dataset.sealType || 'color';
            if (state.sealType === 'image') state.sealImg = btn.dataset.sealImg || '';
            state.sealGradient = btn.dataset.seal || btn.style.background;
            updatePreview();
        }));
        qsa('#delivery-grid .delivery-btn').forEach(btn => btn.addEventListener('click', () => {
            qsa('#delivery-grid .delivery-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); state.deliveryDelay = parseInt(btn.dataset.delay) || 43200000;
        }));
        const sendBtn = qs('penpal-send-btn');
        if (sendBtn) sendBtn.addEventListener('click', sendLetter);
    }

    // ── Send Letter ───────────────────────────────────────────
    async function sendLetter() {
        if (!currentUser) {
            showToast('⚠️ Mektup gönderebilmek için giriş yapmalısınız!');
            if (typeof openAuthModal === 'function') openAuthModal();
            return;
        }

        const salutation = qs('preview-salutation')?.innerText?.trim() || '';
        const body       = qs('preview-body')?.innerText?.trim()       || '';
        const closing    = qs('preview-closing')?.innerText?.trim()    || '';
        const signature  = qs('preview-signature')?.innerText?.trim()  || '';

        if (!body || body === 'Mektubunuzu buraya yazın...') {
            showToast('⚠️ Mektup içeriği boş olamaz!'); return;
        }

        const now = Date.now();
        const curId   = getCurId();
        const curName = getCurName();
        const hint    = signature || 'Anonim Kalem';
        const deliverAt = now + state.deliveryDelay;

        let letterId   = 'ltr_' + now + '_' + Math.random().toString(36).slice(2,8);
        let threadId, recipientId, recipientUsername, isPool;

        if (state.replyMode) {
            // ── DIRECT REPLY (B -> A): goes straight to the thread partner ──
            threadId          = state.replyMode.threadId;
            recipientId       = state.replyMode.recipientId;
            recipientUsername = state.replyMode.recipientUsername;
            isPool            = false;
        } else {
            // ── NEW POOL LETTER: Goes to public pool ──
            threadId          = 'th_' + now + '_' + Math.random().toString(36).slice(2,7);
            recipientId       = null;
            recipientUsername = null;
            isPool            = true;

            // Biri başka bir kullanıcının havuzdaki mektubunu alacak mı?
            // SADECE ve SADECE başkasına ait gerçek bir havuz mektubu varsa onu al
            const poolLetter = await findPoolLetter();
            if (poolLetter) {
                // Başkasının mektubunu benim için claim et
                await claimPoolLetter(poolLetter.id);
                const claimedLetter = { ...poolLetter,
                    recipient_id: curId,
                    recipient_username: curName,
                    is_pool: false
                };
                // Bu mektup benim gelen kutuma eklenecek
                myLetters.push(claimedLetter);
                setLocalLetters(myLetters);
                showToast('🤝 Havuzdan bir mektup teslim aldınız! Gelen kutunuza eklendi.');
            } else {
                showToast('✉️ Mektubunuz havuza eklendi! Başka bir edebiyatsever mektup gönderene kadar havuzda bekleyecek.');
            }
        }

        const letterObj = {
            id: letterId,
            thread_id: threadId,
            sender_id: curId,
            sender_username: curName,
            sender_hint: hint,
            recipient_id: recipientId,
            recipient_username: recipientUsername,
            is_pool: isPool,
            sent_at: now,
            deliver_at: deliverAt,
            status: 'transit',
            paper_theme: state.paperTheme,
            font: state.font,
            ink_color: state.inkColor,
            stamp: state.stamp,
            seal_type: state.sealType,
            seal_img: state.sealImg,
            seal_gradient: state.sealGradient,
            salutation, body, closing, signature,
            read_by: [],
            deleted_by: []
        };

        await saveLetter(letterObj);
        buildThreads();

        state.replyMode = null;
        updateStudioReplyBanner();
        resetCompose();

        const delay = state.deliveryDelay;
        const timeStr = delay <= 1000 ? '1 saniye' : delay < 3600001 ? '1 saat' : delay < 86400001 ? '12 saat' : '3 gün';
        showToast(`📮 Mektup yola çıktı! (${timeStr})`);
        setTimeout(() => switchTab('outbox'), 600);
    }

    function resetCompose() {
        const sal = qs('preview-salutation'), body = qs('preview-body');
        const cls = qs('preview-closing'),   sig  = qs('preview-signature');
        if (sal)  sal.innerText  = 'Sevgili Mektup Arkadaşım,';
        if (body) body.innerText = 'Mektubunuzu buraya yazın...';
        if (cls)  cls.innerText  = 'Sevgiyle,';
        if (sig)  sig.innerText  = 'İmzanız';
    }

    // ── Render Inbox ──────────────────────────────────────────
    function renderInbox() {
        const list = qs('penpal-inbox-list');
        if (!list) return;

        const incoming = myLetters.filter(l => {
            const sUser = String(l.sender_username || '').toLowerCase();
            const rId = String(l.recipient_id || '').toLowerCase();
            const rUser = String(l.recipient_username || '').toLowerCase();

            const isSender = (curId && sId === curId) || (curName && sUser === curName);
            const isRecipient = (curId && rId === curId) || (curName && rUser === curName);

            if (isSender) return false;
            if (l.is_pool) return false;
            return isRecipient;
        }).sort((a,b) => b.sent_at - a.sent_at);

        const unread = incoming.filter(l => {
            const r = Array.isArray(l.read_by) ? l.read_by.map(x => String(x).toLowerCase()) : [];
            return l.status === 'delivered' && !r.includes(curId) && !r.includes(curName);
        }).length;
        const badge = qs('penpal-inbox-badge');
        if (badge) { badge.textContent = unread; unread > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden'); }

        if (!incoming.length) {
            list.innerHTML = `<div class="letter-list-empty"><span class="empty-icon">📭</span><p>Henüz gelen mektubunuz yok.<br>Havuza bir mektup atın — sistem size bir edebiyatseverin mektubunu getirecek.</p></div>`;
            return;
        }

        list.innerHTML = incoming.map(l => {
            const isTransit = l.status === 'transit';
            const r = Array.isArray(l.read_by) ? l.read_by.map(x => String(x).toLowerCase()) : [];
            const isRead = r.includes(curId) || r.includes(curName);
            const statusBadge = isTransit
                ? `<span class="letter-card-status-badge status-transit">🕊️ Yolda <span class="penpal-countdown" data-deliver="${l.deliver_at}">${formatCountdown(l.deliver_at)}</span></span>`
                : (isRead ? `<span class="letter-card-status-badge status-delivered">✅ Okundu</span>` : `<span class="letter-card-status-badge" style="background:rgba(46,125,50,.12);color:#2e7d32;border:1px solid rgba(46,125,50,.3);">📬 Yeni Mektup</span>`);

            const senderLabel = getAnonDisplay(l.sender_hint);

            return `<div class="penpal-letter-card ${isTransit ? 'letter-in-transit' : ''}" data-letter-id="${l.id}" data-open-letter="1" style="cursor:${isTransit ? 'not-allowed' : 'pointer'}">
                ${getSealHTML(l, 'letter-card-seal')}
                <div class="letter-card-info">
                    <div class="letter-card-sender">${sanitize(senderLabel)}</div>
                    <div class="letter-card-preview">${isTransit ? '📦 Mektup henüz yolda, mühür teslimatta açılabilir...' : sanitize((l.body || '').slice(0,80)) + '…'}</div>
                    <div class="letter-card-time">${new Date(l.sent_at).toLocaleDateString('tr-TR')} ${statusBadge}</div>
                </div>
                <button class="penpal-delete-btn" data-delete-id="${l.id}" title="Mektubu Sil">🗑️</button>
            </div>`;
        }).join('');

        list.querySelectorAll('[data-open-letter]').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.penpal-delete-btn')) return;
                const letterId = card.dataset.letterId;
                const letter = myLetters.find(l => l.id === letterId);
                if (letter) {
                    if (letter.status === 'transit') {
                        showToast(`⏳ Bu mektup henüz yolda! Teslimat süresi: ${formatCountdown(letter.deliver_at)}`);
                    } else {
                        openLetterReader(letter);
                    }
                }
            });
        });

        startCountdowns(list);
    }

    // ── Render Outbox ─────────────────────────────────────────
    function renderOutbox() {
        const list = qs('penpal-outbox-list');
        if (!list) return;
        const curId = getCurId().toLowerCase();
        const curName = getCurName().toLowerCase();

        const outgoing = myLetters.filter(l => {
            const sId = String(l.sender_id || '').toLowerCase();
            const sUser = String(l.sender_username || '').toLowerCase();
            return (curId && sId === curId) || (curName && sUser === curName);
        }).sort((a,b) => b.sent_at - a.sent_at);

        if (!outgoing.length) {
            list.innerHTML = `<div class="letter-list-empty"><span class="empty-icon">📪</span><p>Henüz mektup göndermediniz.<br>İlk mektubunuzu "Mektup Yaz" sekmesinden yazın!</p></div>`;
            return;
        }

        list.innerHTML = outgoing.map(l => {
            const isTransit = l.status === 'transit';
            const isMatched = !l.is_pool && (l.recipient_id || l.recipient_username);
            const recipientLabel = l.is_pool ? '🎭 Anonim Mektup Havuzu — ortak bekleniyor' : '🤝 Mektup Arkadaşı';

            const statusBadge = isTransit
                ? `<span class="letter-card-status-badge status-transit">🕊️ Yolda</span>`
                : `<span class="letter-card-status-badge status-delivered">✅ Ulaştı</span>`;
            const matchBadge = isMatched
                ? `<span class="letter-card-status-badge status-matched">🤝 Eşleşti</span>`
                : (l.is_pool ? `<span class="letter-card-status-badge status-pool">⏳ Ortak Bekleniyor</span>` : '');
            const countdown = isTransit
                ? `<span class="penpal-countdown" data-deliver="${l.deliver_at}">${formatCountdown(l.deliver_at)}</span>`
                : '';

            return `<div class="penpal-letter-card" data-letter-id="${l.id}">
                ${getSealHTML(l, 'letter-card-seal')}
                <div class="letter-card-info">
                    <div class="letter-card-sender">${sanitize(recipientLabel)}</div>
                    <div class="letter-card-preview">${sanitize((l.body || '').slice(0,80))}…</div>
                    <div class="letter-card-time">
                        ${new Date(l.sent_at).toLocaleDateString('tr-TR')}
                        ${statusBadge} ${matchBadge} ${countdown}
                    </div>
                </div>
                <button class="penpal-delete-btn" data-delete-id="${l.id}" title="Mektubu Sil">🗑️</button>
            </div>`;
        }).join('');

        list.querySelectorAll('.penpal-delete-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                if (confirm('Bu mektubu silmek istediğinize emin misiniz?')) {
                    deleteLetter(btn.dataset.deleteId);
                }
            });
        });

        startCountdowns(list);
    }

    // ── Render Threads (Konuşmalar) ───────────────────────────
    function renderThreads() {
        const list = qs('penpal-threads-list');
        if (!list) return;

        // Yalnızca en az bir mektubu teslim edilmiş (delivered) veya aktif mektuplaşması olan thread'leri göster
        const threads = Object.values(myThreads)
            .filter(t => t.hasDelivered || t.letterCount >= 2)
            .sort((a,b) => b.lastAt - a.lastAt);

        const badge = qs('penpal-threads-badge');
        if (badge) { badge.textContent = threads.length; threads.length > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden'); }

        if (!threads.length) {
            list.innerHTML = `<div class="letter-list-empty"><span class="empty-icon">💬</span><p>Henüz aktif bir konuşmanız yok.<br>Gelen bir mektup size ulaştığında ve yanıtlaştığınızda burada listelenir.</p></div>`;
            return;
        }

        list.innerHTML = threads.map(t => {
            const count = t.letterCount || 0;
            const canReveal = count >= 5;
            const dotsHtml = Array.from({length: 5}, (_,i) =>
                `<div class="bond-dot ${i < Math.min(count,5) ? 'filled' : ''}"></div>`
            ).join('');

            return `<div class="thread-card">
                <div class="thread-card-avatar">🎭</div>
                <div class="thread-card-info">
                    <div class="thread-card-partner">${sanitize(t.partnerHint)}</div>
                    <div class="thread-card-progress">
                        <div class="bond-dots">${dotsHtml}</div>
                        <span class="bond-progress-label">${Math.min(count,5)}/5 Mektup</span>
                    </div>
                    <div class="thread-card-date">${t.lastAt ? new Date(t.lastAt).toLocaleDateString('tr-TR') : ''}</div>
                    ${canReveal ? `<div class="bond-reveal-notice">🎉 5 mektuba ulaştınız! Kimliğinizi açabilirsiniz.</div>` : ''}
                </div>
                <div class="thread-card-actions">
                    <button class="thread-reply-btn" data-thread="${t.threadId}" data-partner-id="${t.partnerId || ''}" data-partner="${sanitize(t.partnerHint)}">✍️ Yanıt Yaz</button>
                    ${canReveal ? `<button class="thread-reveal-btn" data-thread="${t.threadId}">✨ Tanış</button>` : ''}
                </div>
            </div>`;
        }).join('');

        list.querySelectorAll('.thread-reply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                startReply(btn.dataset.thread, btn.dataset.partnerId, '', btn.dataset.partner);
            });
        });
    }

    // ── Letter Reader Modal ───────────────────────────────────
    function openLetterReader(letter) {
        const modal   = qs('penpal-reading-modal');
        const envWrap = qs('penpal-envelope-wrapper');
        const opened  = qs('penpal-letter-opened');
        if (!modal || !envWrap || !opened) return;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        envWrap.classList.remove('hidden');
        opened.classList.add('hidden');

        const sealDisplay = qs('envelope-seal-display');
        if (sealDisplay) {
            const isImg = (letter.seal_type === 'image') && letter.seal_img;
            if (isImg) {
                sealDisplay.style.background = 'transparent';
                sealDisplay.innerHTML = `<img src="${sanitize(letter.seal_img)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';">`;
            } else {
                sealDisplay.style.background = letter.seal_gradient || 'radial-gradient(circle at 35% 35%, #e53935, #7b1a1a)';
                sealDisplay.textContent = 'M';
            }
        }

        const breakBtn = qs('break-seal-btn');
        if (breakBtn) {
            const newBreakBtn = breakBtn.cloneNode(true);
            breakBtn.parentNode.replaceChild(newBreakBtn, breakBtn);
            newBreakBtn.addEventListener('click', () => {
                const env = qs('penpal-envelope');
                if (env) env.classList.add('opening');
                setTimeout(() => {
                    envWrap.classList.add('hidden');
                    opened.classList.remove('hidden');
                    renderLetterContent(opened, letter);
                    markAsRead(letter);
                }, 800);
            });
        }
    }

    function renderLetterContent(container, letter) {
        const curId = getCurId();
        const isSelf = letter.sender_id === curId;

        container.innerHTML = `
        <div class="letter-paper paper-${letter.paper_theme || 'parchment'}" style="font-family:${letter.font || "'Caveat', cursive"};color:${letter.ink_color || '#1a1008'};">
            <div class="letter-stamp-display">${letter.stamp || '🪶'}</div>
            <div class="letter-salutation-display">${sanitize(letter.salutation || '')}</div>
            <div class="letter-body-display">${sanitize(letter.body || '').replace(/\n/g,'<br>')}</div>
            <div class="letter-closing-display">${sanitize(letter.closing || '')}</div>
            <div class="letter-signature-display">${sanitize(letter.signature || letter.sender_hint || 'Anonim Kalem')}</div>
            ${getSealHTML(letter, 'letter-seal-display')}
        </div>
        ${!isSelf ? `<div class="penpal-reader-reply-wrapper">
            <button class="penpal-reader-reply-btn" id="reader-reply-btn">✍️ Bu Mektuba Yanıt Yaz</button>
        </div>` : ''}`;

        if (!isSelf) {
            container.querySelector('#reader-reply-btn')?.addEventListener('click', () => {
                closeLetterReader();
                startReply(
                    letter.thread_id,
                    letter.sender_id,
                    letter.sender_username,
                    getAnonDisplay(letter.sender_hint)
                );
            });
        }
    }

    async function markAsRead(letter) {
        const curId = getCurId();
        if (!letter || letter.sender_id === curId) return;
        const readBy = Array.isArray(letter.read_by) ? letter.read_by : [];
        if (readBy.includes(curId)) return;
        readBy.push(curId);
        letter.read_by = readBy;
        await updateLetter(letter.id, { read_by: readBy });
        renderInbox();
    }

    function closeLetterReader() {
        const modal = qs('penpal-reading-modal');
        if (modal) modal.classList.add('hidden');
        document.body.style.overflow = '';
        const env = qs('penpal-envelope');
        if (env) env.classList.remove('opening');
        renderInbox();
    }

    // ── Render All ────────────────────────────────────────────
    function renderAll() {
        updatePreview();
        updateStudioAuthNotice();
        updateStudioReplyBanner();
        switchTab(state.activeTab || 'studio');
    }

    // ── Init ──────────────────────────────────────────────────
    function init() {
        qs('penpal-nav-btn')?.addEventListener('click', openPenpal);
        qs('mp-banner-write-btn')?.addEventListener('click', () => { openPenpal(); setTimeout(() => switchTab('studio'), 300); });
        qs('mp-banner-inbox-btn')?.addEventListener('click', () => { openPenpal(); setTimeout(() => switchTab('inbox'), 300); });

        qs('close-penpal')?.addEventListener('click', closePenpal);
        qs('close-penpal-reading')?.addEventListener('click', closeLetterReader);

        qsa('.penpal-tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.penpalTab)));

        bindStudioControls();
        updatePreview();
        updateStudioAuthNotice();
        console.log('[MürekkepliMektup v5.1] Tam anonimlik ve kararlı render yüklendi.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.MürekkepliMektup = {
        open: openPenpal,
        close: closePenpal,
        refresh: async () => {
            await fetchMyLetters();
            renderAll();
        }
    };

})();