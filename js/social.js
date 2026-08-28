// =============================================
// SOCIAL, SHARING & MODERATION
// =============================================

// CONTENT MODERATION & SECURITY SYSTEM
// =============================================

const BANNED_WORDS = [
    "amk", "amına", "göt", "piç", "siktir", "sik", "orospu", "yavşak", "pezevenk", "kahpe", "bok", "çüş", "kaltak", "gerzek", "salak", "aptal", "şerefsiz", "it", "kancık", "götlek", "amcık", "meme", "taşşak", "yarak", "yarrak", "sokayım", "sokam", "sikiş", "sokarım", "pic"
];

function containsProfanity(text) {
    return false;
}

function getArticleReports(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_article_reports") || "{}");
    return reportsMap[id] || 0;
}

function reportArticle(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_article_reports") || "{}");
    reportsMap[id] = (reportsMap[id] || 0) + 1;
    localStorage.setItem("murekkep_article_reports", JSON.stringify(reportsMap));
    return reportsMap[id];
}

function resetArticleReports(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_article_reports") || "{}");
    reportsMap[id] = 0;
    localStorage.setItem("murekkep_article_reports", JSON.stringify(reportsMap));
}

function getCommentReports(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_comment_reports") || "{}");
    return reportsMap[id] || 0;
}

function reportComment(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_comment_reports") || "{}");
    reportsMap[id] = (reportsMap[id] || 0) + 1;
    localStorage.setItem("murekkep_comment_reports", JSON.stringify(reportsMap));
    return reportsMap[id];
}

function resetCommentReports(id) {
    const reportsMap = JSON.parse(localStorage.getItem("murekkep_comment_reports") || "{}");
    reportsMap[id] = 0;
    localStorage.setItem("murekkep_comment_reports", JSON.stringify(reportsMap));
}


function updateEditorBannerUI() {
    const banner = document.getElementById("editor-mode-banner");
    const toggleBtn = document.getElementById("settings-editor-toggle");
    if (isEditorModeActive && currentUser && currentUser.isEditor) {
        if (banner) banner.classList.remove("hidden");
        if (toggleBtn) toggleBtn.classList.add("active");
    } else {
        if (banner) banner.classList.add("hidden");
        if (toggleBtn) toggleBtn.classList.remove("active");
        isEditorModeActive = false;
    }
}

const SUPABASE_URL = "https://xhgtipmmahtoshypngdm.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZ3RpcG1tYWh0b3NoeXBuZ2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDQyMzYsImV4cCI6MjA5Nzc4MDIzNn0.Z1eYqrrU8U62kDf0G8zUEBguXt4h0HviZJBIEJvH588";


const CACHE_KEY = "murekkep_supabase_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

function clearSupabaseCache() {
    localStorage.removeItem(CACHE_KEY);
    console.log("Supabase client cache cleared.");
}

function updateSupabaseUI() {
    const statusText = document.getElementById("supabase-status-text");
    const configBtn = document.getElementById("supabase-config-btn");
    if (!statusText || !configBtn) return;

    if (isSupabaseConnected) {
        statusText.innerText = "Supabase: Bağlı";
        configBtn.style.backgroundColor = "rgba(46, 125, 50, 0.1)";
        configBtn.style.color = "#2e7d32";
        configBtn.style.borderColor = "#2e7d32";
    } else {
        statusText.innerText = "Supabase: Çevrimdışı";
        configBtn.style.backgroundColor = "";
        configBtn.style.color = "";
        configBtn.style.borderColor = "var(--border-color)";
    }
}

// Premium Toast Notification
function showToast(message) {
    const alertDiv = document.createElement("div");
    alertDiv.style.position = "fixed";
    alertDiv.style.bottom = "30px";
    alertDiv.style.right = "30px";
    alertDiv.style.backgroundColor = "var(--accent-color)";
    alertDiv.style.color = "#ffffff";
    alertDiv.style.padding = "16px 24px";
    alertDiv.style.borderRadius = "30px";
    alertDiv.style.fontFamily = "var(--font-ui)";
    alertDiv.style.fontWeight = "600";
    alertDiv.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)";
    alertDiv.style.zIndex = "2000";
    alertDiv.style.animation = "slideUp 0.3s ease";
    alertDiv.innerText = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = "0";
        alertDiv.style.transition = "opacity 0.5s ease";
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

// Authentication Overlay Controls
function openAuthModal() {
    if (authOverlay) {
        authOverlay.classList.remove("hidden");
        lockBodyScroll();
        switchAuthTab('login');
    }
}

function closeAuthModal() {
    if (authOverlay) {
        authOverlay.classList.add("hidden");
        unlockBodyScroll();
    }
}

// =============================================
// SHARE SYSTEM
// =============================================

/** Helper: update the share modal's quote display panel */
function setShareQuote(text) {
    const input   = document.getElementById('share-quote-input');
    if (input)    input.value = text ? text.trim().substring(0, 280) : '';
    renderShareCard(shareCurrentTemplate);
}

/** Populate the Spotify-style sentence selector list dynamically */
function populateShareSentences(article) {
    const listEl = document.getElementById("share-paragraphs-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = article.content;
    const paragraphs = tempDiv.querySelectorAll("p, blockquote");

    const decodeHTMLEntities = (str) => {
        const temp = document.createElement("div");
        temp.innerHTML = str;
        const decoded = temp.textContent || temp.innerText || "";
        return decoded.replace(/\s+/g, ' ').trim();
    };

    const sentences = [];
    if (article.category === 'siir') {
        // For poems, preserve line structure and treat each verse as a selectable item
        const lines = tempDiv.innerHTML
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n")
            .replace(/<\/div>/gi, "\n")
            .replace(/<[^>]*>/g, "")
            .split("\n")
            .map(line => decodeHTMLEntities(line))
            .filter(Boolean);
        lines.forEach(l => sentences.push(l));
    } else {
        // For prose, split into sentences by punctuation
        paragraphs.forEach(p => {
            const text = decodeHTMLEntities(p.textContent);
            if (!text) return;
            
            const matches = text.match(/[^.!?]+[.!?]+(?=\s|$)/g);
            if (matches) {
                matches.forEach(s => {
                    const cleanS = s.trim();
                    if (cleanS) sentences.push(cleanS);
                });
            } else if (text) {
                sentences.push(text);
            }
        });
    }

    if (sentences.length === 0) {
        listEl.innerHTML = `<div style="color:var(--text-secondary); font-size:0.8rem; text-align:center; padding:20px;">Bu makalede seçilebilir cümle bulunamadı.</div>`;
        return;
    }

    sentences.forEach((sentenceText, idx) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "share-paragraph-item"; // uses existing CSS class for paragraph item
        item.textContent = sentenceText;
        item.dataset.index = idx;

        item.addEventListener("click", () => {
            // Toggle selection
            item.classList.toggle("selected");

            // Compile selected items (join with newlines for poems, spaces for other articles)
            const selectedItems = listEl.querySelectorAll(".share-paragraph-item.selected");
            const separator = (shareCurrentArticle && shareCurrentArticle.category === 'siir') ? "\n" : " ";
            const compiledText = Array.from(selectedItems)
                .map(el => el.textContent)
                .join(separator)
                .substring(0, 280);

            const quoteInput = document.getElementById("share-quote-input");
            if (quoteInput) {
                quoteInput.value = compiledText;
                quoteInput.dispatchEvent(new Event("input"));
            }
        });

        listEl.appendChild(item);
    });
}

function openShareModal(articleId, preselectedText) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    shareCurrentArticle = article;
    shareIsCustomMode = false;

    const overlay = document.getElementById('share-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    lockBodyScroll();

    // Toggle custom fields visibility
    const customFieldsSection = document.getElementById("share-custom-inputs-section");
    if (customFieldsSection) customFieldsSection.classList.add("hidden");

    const paragraphPickerSection = overlay.querySelector(".share-paragraph-picker-section");
    if (paragraphPickerSection) paragraphPickerSection.classList.remove("hidden");

    const modalTitle = overlay.querySelector('.share-modal-title');
    if (modalTitle) modalTitle.textContent = "Paylaş";

    const quoteLabel = overlay.querySelector('.share-quote-display label');
    if (quoteLabel) quoteLabel.textContent = "Paylaşılacak Alıntı (İsteğe Bağlı):";

    const quoteInput = document.getElementById("share-quote-input");
    if (quoteInput) quoteInput.placeholder = "Yukarıdan cümle seçebilir veya alıntıyı buraya kendiniz de yazabilirsiniz...";

    // Populate sentences list
    populateShareSentences(article);

    // Populate quote: from preselected text only (no auto-fill from subtitle)
    setShareQuote(preselectedText || '');

    // Auto-select sentence containing the preselected text
    if (preselectedText) {
        const cleanPre = preselectedText.trim().toLowerCase();
        const items = document.querySelectorAll('.share-paragraph-item');
        items.forEach(item => {
            if (item.textContent.toLowerCase().includes(cleanPre) || cleanPre.includes(item.textContent.toLowerCase())) {
                item.classList.add('selected');
            }
        });
    }
}

function openCustomShareModal() {
    shareIsCustomMode = true;
    shareCurrentArticle = {
        title: "Yeni Bir Başlangıç",
        author: "Kalem Sahibi",
        category: "deneme"
    };

    const overlay = document.getElementById('share-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    lockBodyScroll();

    // Toggle custom fields visibility
    const customFieldsSection = document.getElementById("share-custom-inputs-section");
    if (customFieldsSection) customFieldsSection.classList.remove("hidden");

    const paragraphPickerSection = overlay.querySelector(".share-paragraph-picker-section");
    if (paragraphPickerSection) paragraphPickerSection.classList.add("hidden");

    const modalTitle = overlay.querySelector('.share-modal-title');
    if (modalTitle) modalTitle.textContent = "Sosyal Medya Kartı Oluştur";

    const quoteLabel = overlay.querySelector('.share-quote-display label');
    if (quoteLabel) quoteLabel.textContent = "Kart Üzerindeki Metin / Alıntı:";

    const quoteInput = document.getElementById("share-quote-input");
    if (quoteInput) quoteInput.placeholder = "Kart üzerinde görünmesini istediğiniz cümleyi yazın...";

    // Populate input values to match default mock article
    const customAuthorInput = document.getElementById("share-custom-author-input");
    const customCategorySelect = document.getElementById("share-custom-category-input");
    const customTitleInput = document.getElementById("share-custom-title-input");

    if (customAuthorInput) customAuthorInput.value = shareCurrentArticle.author;
    if (customCategorySelect) customCategorySelect.value = shareCurrentArticle.category;
    if (customTitleInput) customTitleInput.value = shareCurrentArticle.title;

    setShareQuote("Kendi cümlenizi buraya yazıp, yukarıdan şablon seçerek sosyal medya kartınızı anında oluşturun.");
}

function closeShareModal() {
    const overlay = document.getElementById("share-overlay");
    if (overlay) {
        overlay.classList.add("hidden");
        unlockBodyScroll();
    }
}

// Canvas text wrapping helper that respects explicit newlines
function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const sourceLines = text.split('\n');
    let currentY = y;
    const lines = [];

    sourceLines.forEach(srcLine => {
        const words = srcLine.split(' ');
        let line = '';
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push({ text: line.trim(), y: currentY });
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        lines.push({ text: line.trim(), y: currentY });
        currentY += lineHeight;
    });

    lines.forEach(l => ctx.fillText(l.text, x, l.y));
    return currentY;
}

// Render a share card on canvas
function renderShareCard(template) {
    const canvas = document.getElementById("share-canvas");
    if (!canvas || !shareCurrentArticle) return;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;

    const quoteInput = document.getElementById("share-quote-input");
    const quoteText = (quoteInput && quoteInput.value.trim()) ? quoteInput.value.trim() : "";
    
    let articleTitle = "";
    let authorName = "";
    let categoryName = "";

    if (shareIsCustomMode) {
        const customTitleInput = document.getElementById("share-custom-title-input");
        const customAuthorInput = document.getElementById("share-custom-author-input");
        const customCategorySelect = document.getElementById("share-custom-category-input");

        articleTitle = (customTitleInput && customTitleInput.value.trim()) ? customTitleInput.value.trim() : "Yeni Bir Başlangıç";
        authorName = (customAuthorInput && customAuthorInput.value.trim()) ? customAuthorInput.value.trim() : "Kalem Sahibi";
        categoryName = (customCategorySelect && customCategorySelect.value) ? customCategorySelect.value : "deneme";

        // Keep shareCurrentArticle synced so other components (social sharing etc) get correct values
        shareCurrentArticle.title = articleTitle;
        shareCurrentArticle.author = authorName;
        shareCurrentArticle.category = categoryName;
    } else {
        articleTitle = shareCurrentArticle.title || "";
        authorName = shareCurrentArticle.author || "Mürekkep";
        categoryName = shareCurrentArticle.category || "deneme";
    }

    // Template definitions
    const templates = {
        gece: {
            bgColors: ['#0f0f0f', '#1a1a1a'],
            angle: 0,
            textColor: '#e2ddd5',
            accentColor: '#c94040',
            logoColor: '#e2ddd5',
            subtleColor: '#666666',
            borderColor: '#333333',
            quoteMarkColor: 'rgba(93,26,26,0.6)',
        },
        sabah: {
            bgColors: ['#faf8f5', '#f0ebe0'],
            angle: 0,
            textColor: '#111111',
            accentColor: '#5d1a1a',
            logoColor: '#111111',
            subtleColor: '#888888',
            borderColor: '#d8d2c4',
            quoteMarkColor: 'rgba(93,26,26,0.15)',
        },
        gazete: {
            bgColors: ['#f3efe6', '#e8e0cc'],
            angle: 0,
            textColor: '#2c1a00',
            accentColor: '#2c1a00',
            logoColor: '#2c1a00',
            subtleColor: '#8a7560',
            borderColor: '#c8b898',
            quoteMarkColor: 'rgba(44,26,0,0.12)',
            italic: true,
        },
        yangin: {
            bgColors: ['#1a0000', '#6b0f0f', '#c0390f'],
            angle: 135,
            textColor: '#fff8e1',
            accentColor: '#ff6b35',
            logoColor: '#fff8e1',
            subtleColor: '#ff9a70',
            borderColor: '#ff4500',
            quoteMarkColor: 'rgba(255,107,53,0.25)',
        },
        okyanus: {
            bgColors: ['#0d1b2a', '#1b4f72', '#2471a3'],
            angle: 135,
            textColor: '#e8f4f8',
            accentColor: '#5dade2',
            logoColor: '#e8f4f8',
            subtleColor: '#85c1e9',
            borderColor: '#2980b9',
            quoteMarkColor: 'rgba(93,173,226,0.25)',
        }
    };

    const t = templates[template] || templates.gece;
    const pad = 90;

    // ── Background ──
    if (t.bgColors.length > 1) {
        let grad;
        if (t.angle === 135) {
            grad = ctx.createLinearGradient(0, 0, W, H);
        } else {
            grad = ctx.createLinearGradient(0, 0, 0, H);
        }
        t.bgColors.forEach((c, i) => grad.addColorStop(i / (t.bgColors.length - 1), c));
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = t.bgColors[0];
    }
    ctx.fillRect(0, 0, W, H);

    // ── Top border line ──
    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, 130);
    ctx.lineTo(W - pad, 130);
    ctx.stroke();

    // ── Logo / Title ──
    ctx.fillStyle = t.logoColor;
    ctx.font = `900 72px 'Cinzel', Georgia, serif`;
    if (t.italic) ctx.font = `italic 900 72px 'Cinzel', Georgia, serif`;
    ctx.fillText('MÜREKKEP', pad, 110);

    let lastY = H - 240;

    if (quoteText) {
        // ── Decorative quote mark (large ❝) ──
        ctx.fillStyle = t.quoteMarkColor;
        ctx.font = 'bold 500px serif';
        ctx.fillText('"', pad - 30, 420);

        // ── Quote text ──
        ctx.fillStyle = t.textColor;
        const fontSize = quoteText.length > 120 ? 46 : quoteText.length > 80 ? 54 : 62;
        ctx.font = `${t.italic ? 'italic ' : ''}${fontSize}px 'Playfair Display', Georgia, serif`;
        ctx.textBaseline = 'top';
        lastY = wrapCanvasText(ctx, `"${quoteText}"`, pad, 220, W - pad * 2, fontSize * 1.5);
    } else {
        // ── Draw Article Poster/Cover layout in the middle ──
        ctx.textAlign = 'center';
        
        // Category Tag
        ctx.fillStyle = t.accentColor;
        ctx.font = `700 32px 'Inter', sans-serif`;
        ctx.fillText(shareCurrentArticle.category.replace("-", " ").toUpperCase(), W / 2, 360);
        
        // Article Title
        ctx.fillStyle = t.textColor;
        const titleFontSize = articleTitle.length > 50 ? 52 : articleTitle.length > 30 ? 60 : 70;
        ctx.font = `900 ${titleFontSize}px 'Cinzel', Georgia, serif`;
        const titleY = 430;
        const endTitleY = wrapCanvasText(ctx, articleTitle, W / 2, titleY, W - pad * 2.5, titleFontSize * 1.4);
        
        // Subtitle (if fits and space allows)
        const subtitleText = shareCurrentArticle.subtitle || "";
        if (subtitleText && endTitleY < 720) {
            ctx.fillStyle = t.subtleColor;
            const subFontSize = 36;
            ctx.font = `italic ${subFontSize}px 'Playfair Display', Georgia, serif`;
            wrapCanvasText(ctx, subtitleText, W / 2, endTitleY + 30, W - pad * 3, subFontSize * 1.4);
        }
        
        ctx.textAlign = 'left'; // Restore alignment
        lastY = H - 240;
    }

    // ── Bottom border line ──
    const bottomBorderY = Math.min(lastY + 60, H - 220);
    ctx.strokeStyle = t.borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, bottomBorderY);
    ctx.lineTo(W - pad, bottomBorderY);
    ctx.stroke();

    // ── Accent line ──
    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(pad, bottomBorderY + 10);
    ctx.lineTo(pad + 120, bottomBorderY + 10);
    ctx.stroke();

    // ── Author name ──
    ctx.fillStyle = t.subtleColor;
    ctx.font = `italic 500 36px 'Playfair Display', Georgia, serif`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`— ${authorName}`, pad, bottomBorderY + 60);

    // ── Article title (smaller, below author) ──
    ctx.fillStyle = t.subtleColor;
    ctx.font = `400 30px 'Lora', Georgia, serif`;
    const shortTitle = articleTitle.length > 55 ? articleTitle.substring(0, 55) + '…' : articleTitle;
    ctx.fillText(shortTitle, pad, bottomBorderY + 108);

    // ── Bottom site tag ──
    ctx.fillStyle = t.accentColor;
    ctx.font = `700 28px 'Inter', sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText('Devamı ► murekkepgzt.com', W - pad, H - pad);
    ctx.textAlign = 'left';
}

// =============================================
// SPOTIFY-STYLE TEXT SELECTION POPUP
// =============================================

function initTextSelectionPopup() {
    const popup = document.getElementById('text-selection-popup');
    const previewEl = document.getElementById('tsp-preview-text');
    const shareBtn = document.getElementById('tsp-share-btn');
    const copyBtn = document.getElementById('tsp-copy-btn');
    const tweetBtn = document.getElementById('tsp-tweet-btn');
    if (!popup) return;

    let lastSelectedText = '';
    let hideTimeout = null;

    function showPopup(selectedText, rect) {
        lastSelectedText = selectedText.trim();
        if (!lastSelectedText || lastSelectedText.length < 3) { hidePopup(); return; }

        // Truncate preview to ~80 chars
        previewEl.textContent = lastSelectedText.length > 80
            ? '"' + lastSelectedText.substring(0, 80) + '…"'
            : '"' + lastSelectedText + '"';

        popup.classList.remove('hidden');

        // Position: centered above the selection, clamped inside viewport
        // popup is position:fixed → use viewport (rect) coords directly
        const POPUP_W = Math.min(340, window.innerWidth - 24);
        const POPUP_H = 92;
        const ARROW_H = 10;

        let left = rect.left + rect.width / 2 - POPUP_W / 2;
        let top  = rect.top - POPUP_H - ARROW_H;

        // If there's not enough room above, flip below
        if (top < 8) {
            top = rect.bottom + ARROW_H;
        }

        // Clamp horizontally & vertically
        left = Math.max(12, Math.min(left, window.innerWidth - POPUP_W - 12));
        top  = Math.max(8, top);

        popup.style.left = left + 'px';
        popup.style.top  = top + 'px';
        popup.style.width = POPUP_W + 'px';
    }

    function hidePopup() {
        popup.classList.add('hidden');
        lastSelectedText = '';
    }

    // ── Listen for selections inside the reading overlay ──────────────────
    const readingOverlay = document.getElementById('reading-overlay');
    if (!readingOverlay) return;

    function handleSelectionChange() {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || !sel.toString().trim()) {
                hidePopup();
                return;
            }

            // Only trigger if selection is inside the reading overlay
            const anchorNode = sel.anchorNode;
            if (!readingOverlay.contains(anchorNode)) { hidePopup(); return; }

            try {
                const range = sel.getRangeAt(0);
                const rect  = range.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) { hidePopup(); return; }
                showPopup(sel.toString(), rect);
            } catch(e) { hidePopup(); }
        }, 50);
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    readingOverlay.addEventListener('scroll', handleSelectionChange);

    // Hide on clicking elsewhere (but not on the popup itself)
    document.addEventListener('mousedown', (e) => {
        if (!popup.contains(e.target)) hidePopup();
    });
    document.addEventListener('touchstart', (e) => {
        if (!popup.contains(e.target)) hidePopup();
    });

    // ESC key hides
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hidePopup();
    });

    // ── SHARE button → open share modal with selected text ────────────────
    shareBtn?.addEventListener('click', () => {
        if (!lastSelectedText) return;
        const selectedText = lastSelectedText;
        hidePopup();
        window.getSelection()?.removeAllRanges();

        if (!activeArticleId) return;
        // Open share modal and inject selected text
        openShareModal(activeArticleId, selectedText);
    });

    // ── COPY button ───────────────────────────────────────────────────────
    copyBtn?.addEventListener('click', () => {
        if (!lastSelectedText) return;
        const textToCopy = `"${lastSelectedText}"`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => showToast('📋 Alıntı kopyalandı!'))
            .catch(() => showToast('Kopyalama başarısız.'));
        hidePopup();
        window.getSelection()?.removeAllRanges();
    });

    // ── TWEET button ──────────────────────────────────────────────────────
    tweetBtn?.addEventListener('click', () => {
        if (!lastSelectedText) return;
        const art = articles.find(a => a.id === activeArticleId);
        const author = art ? `— ${art.author}` : '';
        const tweet = `"${lastSelectedText.substring(0, 200)}" ${author} #Mürekkep\nmurekkepgzt.com`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank');
        hidePopup();
        window.getSelection()?.removeAllRanges();
    });
}

// =============================================
// SHARE SYSTEM
// =============================================

function initShareOverlay() {
    const overlay = document.getElementById("share-overlay");
    const closeBtn = document.getElementById("close-share");
    const quoteInput = document.getElementById("share-quote-input");
    const thumbs = document.querySelectorAll(".share-template-thumb");

    // Close button
    if (closeBtn) closeBtn.addEventListener("click", closeShareModal);

    // Backdrop click
    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeShareModal();
        });
    }

    // Clear quote button
    document.getElementById('share-quote-clear')?.addEventListener('click', () => {
        setShareQuote('');
    });

    // Template thumb selection
    thumbs.forEach(thumb => {
        thumb.addEventListener("click", () => {
            thumbs.forEach(t => t.classList.remove("active"));
            thumb.classList.add("active");
            shareCurrentTemplate = thumb.getAttribute("data-template");
            renderShareCard(shareCurrentTemplate);
        });
    });

    // Live re-render as user edits quote
    if (quoteInput) {
        quoteInput.addEventListener("input", () => {
            renderShareCard(shareCurrentTemplate);
        });
    }

    // Live re-render for custom card inputs
    const customAuthorInput = document.getElementById("share-custom-author-input");
    const customTitleInput = document.getElementById("share-custom-title-input");
    const customCategorySelect = document.getElementById("share-custom-category-input");

    [customAuthorInput, customTitleInput].forEach(input => {
        if (input) {
            input.addEventListener("input", () => {
                if (shareIsCustomMode) renderShareCard(shareCurrentTemplate);
            });
        }
    });

    if (customCategorySelect) {
        customCategorySelect.addEventListener("change", () => {
            if (shareIsCustomMode) renderShareCard(shareCurrentTemplate);
        });
    }

    // Connect trigger buttons for custom card creator
    document.getElementById("create-card-toggle")?.addEventListener("click", () => {
        openCustomShareModal();
    });

    document.getElementById("footer-create-card-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        openCustomShareModal();
    });

    // WhatsApp share
    document.getElementById("share-whatsapp")?.addEventListener("click", () => {
        if (!shareCurrentArticle) return;
        const q = quoteInput?.value.trim() || shareCurrentArticle.subtitle || shareCurrentArticle.title;
        const text = `"${q}"\n\n— ${shareCurrentArticle.author}\n📖 ${shareCurrentArticle.title}\n\nmurekkepgzt.com`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    });

    // Twitter/X share
    document.getElementById("share-twitter")?.addEventListener("click", () => {
        if (!shareCurrentArticle) return;
        const q = quoteInput?.value.trim() || shareCurrentArticle.subtitle || shareCurrentArticle.title;
        const text = `"${q}"\n\n— ${shareCurrentArticle.author} | #Mürekkep`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    });

    // Instagram — download image
    document.getElementById("share-instagram")?.addEventListener("click", () => {
        const canvas = document.getElementById("share-canvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `murekkep-paylasim.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("📥 Görsel indirildi! Instagram'da paylaşabilirsiniz.");
    });

    // Copy link
    document.getElementById("share-copy-link")?.addEventListener("click", () => {
        const url = window.location.href.split("?")[0];
        navigator.clipboard.writeText(url).then(() => {
            showToast("🔗 Link kopyalandı!");
        }).catch(() => {
            showToast("Link: " + url);
        });
    });

    // Native share image
    document.getElementById("share-native-image")?.addEventListener("click", () => {
        const canvas = document.getElementById("share-canvas");
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], 'murekkep-paylasim.png', { type: 'image/png' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: 'Mürekkep Alıntı',
                    text: 'Mürekkep Gazetesi\'nden edebi bir alıntı paylaştı.'
                }).catch(err => {
                    console.log("Paylaşım iptal edildi veya hata oluştu:", err);
                });
            } else {
                // Fallback: Download the image
                const link = document.createElement("a");
                link.download = `murekkep-paylasim.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
                showToast("📥 Cihazınız doğrudan görsel paylaşımını desteklemediği için indirildi.");
            }
        }, 'image/png');
    });
}

// Helper: Calculate weekly writing streak based on consecutive weeks of published articles
function calculateAuthorStreak(authorName) {
    if (!authorName) return 0;
    const authorArticles = articles.filter(a => a.author && a.author.toLowerCase().trim() === authorName.toLowerCase().trim());
    if (authorArticles.length === 0) return 0;

    // Parse dates
    const dates = authorArticles.map(a => {
        const dt = a.created_at ? new Date(a.created_at) : (a.date ? new Date(a.date) : new Date());
        return dt;
    }).filter(d => !isNaN(d.getTime()));

    if (dates.length === 0) return 0;

    // Sort dates descending (newest first)
    dates.sort((a, b) => b - a);

    // Helper to get start of the week (Monday)
    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
        const start = new Date(d.setDate(diff));
        start.setHours(0,0,0,0);
        return start;
    }

    const todayStartOfWeek = getStartOfWeek(new Date());
    
    // Group dates by week start date (in milliseconds for easy comparison)
    const weekStarts = new Set();
    dates.forEach(d => {
        weekStarts.add(getStartOfWeek(d).getTime());
    });

    // Check if they published this week or last week (otherwise streak is broken / 0)
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const thisWeekTime = todayStartOfWeek.getTime();
    const lastWeekTime = thisWeekTime - oneWeekMs;

    if (!weekStarts.has(thisWeekTime) && !weekStarts.has(lastWeekTime)) {
        return 0;
    }

    // Count back consecutive weeks
    let streak = 0;
    let currentCheckWeek = weekStarts.has(thisWeekTime) ? thisWeekTime : lastWeekTime;

    while (weekStarts.has(currentCheckWeek)) {
        streak++;
        currentCheckWeek -= oneWeekMs;
    }

    return streak;
}

// Dynamic Dashboard Sync in Profile Modal
function syncDashboardInProfile() {
    if (!currentUser) return;
    const statsWriter = getAuthorStats(currentUser.username);
    
    const rankIcon = document.getElementById("author-modal-rank-icon");
    const rankName = document.getElementById("author-modal-rank-name");
    const rankDesc = document.getElementById("author-modal-rank-desc");
    
    const isEditor = (currentUser.isEditor || (currentUser.username && (normalizeTurkishString(currentUser.username) === "murekkep editoru" || normalizeTurkishString(currentUser.username) === "editor" || normalizeTurkishString(normalizeTurkishString(currentUser.username)) === "editör")));
    const rankDetailsBox = document.getElementById("author-modal-rank-details-box");
    const rankProgressBox = document.getElementById("author-modal-rank-progress-box");

    if (isEditor) {
        if (rankDetailsBox) rankDetailsBox.style.display = "none";
        if (rankProgressBox) rankProgressBox.style.display = "none";
    } else {
        if (rankDetailsBox) rankDetailsBox.style.display = "flex";
        if (rankProgressBox) rankProgressBox.style.display = "block";

        if (rankIcon) rankIcon.innerText = statsWriter.rank.icon;
        if (rankName) rankName.innerText = statsWriter.rank.label;
        if (rankDesc) rankDesc.innerText = statsWriter.rank.description;

        // Rank Progress Bar
        const progressLabel = document.getElementById("author-modal-progress-label");
        const progressPct = document.getElementById("author-modal-progress-pct");
        const progressBar = document.getElementById("author-modal-progress-bar");
        const progressDetails = document.getElementById("author-modal-progress-details");

        const currentRank = statsWriter.rank;
        const nextRank = currentRank.nextRank;

        if (nextRank) {
            if (progressLabel) progressLabel.innerText = `Sonraki Derece: ${nextRank.label}`;
            
            const xpCurrent = statsWriter.rank.xp;
            const xpNext = nextRank.reqXp;
            const xpPrev = currentRank.reqXp;
            
            const earnedXp = xpCurrent - xpPrev;
            const neededXp = xpNext - xpPrev;
            const progressVal = Math.min(100, Math.max(0, Math.round((earnedXp / neededXp) * 100)));
            
            if (progressPct) progressPct.innerText = `${progressVal}%`;
            if (progressBar) progressBar.style.width = `${progressVal}%`;
            if (progressDetails) progressDetails.innerText = `Edebi Puan (XP): ${xpCurrent} / ${xpNext} XP`;
        } else {
            if (progressLabel) progressLabel.innerText = "Derece Serüveni Tamamlandı! En yüksek rütbedesiniz.";
            if (progressPct) progressPct.innerText = "100%";
            if (progressBar) progressBar.style.width = "100%";
            if (progressDetails) progressDetails.innerText = `Toplam Edebi Puan (XP): ${currentRank.xp} XP`;
        }
    }

    // Goal Progress (reads from Supabase profile)
    const authorName = currentUser.username || currentUser.email.split("@")[0];
    const profile = getAuthorProfileData(authorName);
    const goalVal = parseInt(profile.goalCount) || 10;
    
    // Count all user's published articles
    const ownArticles = articles.filter(a => a.author && a.author.trim().toLowerCase() === authorName.trim().toLowerCase());
    const publishedCount = ownArticles.length;

    const goalPct = Math.min((publishedCount / goalVal) * 100, 100);
    const currentEl = document.getElementById("author-modal-goal-current");
    const inputEl = document.getElementById("author-modal-goal-input");
    const goalBarEl = document.getElementById("author-modal-goal-bar");
    
    if (currentEl) currentEl.innerText = publishedCount;
    if (inputEl) {
        inputEl.value = goalVal;
        
        // Remove existing listener to prevent duplicate attachments, and add new one
        const clone = inputEl.cloneNode(true);
        inputEl.parentNode.replaceChild(clone, inputEl);
        
        clone.addEventListener("change", (e) => {
            const newVal = parseInt(e.target.value) || 10;
            saveAuthorProfileData(authorName, { goalCount: newVal });
            
            // Re-sync progress bar and other UI targets
            const newPct = Math.min((publishedCount / newVal) * 100, 100);
            if (goalBarEl) goalBarEl.style.width = `${newPct}%`;
            
            const mainGoalInput = document.getElementById("writer-goal-input");
            if (mainGoalInput) mainGoalInput.value = newVal;
            
            const popoverGoalInput = document.getElementById("profile-goal-count-input");
            if (popoverGoalInput) popoverGoalInput.value = newVal;
            
            showToast(`🎯 Hedefiniz ${newVal} Eser olarak güncellendi!`);
        });
    }
    
    if (goalBarEl) goalBarEl.style.width = `${goalPct}%`;

    // Streak
    const streak = calculateAuthorStreak(authorName);
    const streakEl = document.getElementById("author-modal-streak-val");
    if (streakEl) streakEl.innerText = streak;
}

// Global state variables for customizations
let selectedAvatarGradient = "";
let selectedAvatarEmoji = "✍️";
let selectedCoverVal = "";

// Initialize Profile Customize Popover Event Handlers
function initProfileCustomizer() {
    const popover = document.getElementById('profile-editor-popover');
    const popoverBackdrop = document.getElementById('profile-editor-popover-backdrop');
    const closeBtn = document.getElementById('close-profile-popover');
    
    function closeProfilePopover() {
        if (popover) popover.classList.add('hidden');
        if (popoverBackdrop) popoverBackdrop.classList.add('hidden');
    }

    // Popover Close click & backdrop click
    if (closeBtn) closeBtn.addEventListener('click', closeProfilePopover);
    if (popoverBackdrop) popoverBackdrop.addEventListener('click', closeProfilePopover);

    // Tab buttons event listeners
    const popTabBtns = document.querySelectorAll('.profile-popover-tab-btn');
    popTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            popTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Toggle panels
            const panels = document.querySelectorAll('.popover-panel');
            panels.forEach(p => p.classList.add('hidden'));
            
            if (btn.id === 'popover-tab-avatar-btn') {
                document.getElementById('popover-panel-avatar').classList.remove('hidden');
            } else if (btn.id === 'popover-tab-cover-btn') {
                document.getElementById('popover-panel-cover').classList.remove('hidden');
            } else if (btn.id === 'popover-tab-socials-btn') {
                document.getElementById('popover-panel-socials').classList.remove('hidden');
            }
        });
    });

    // Avatar Type dropdown change
    const avatarTypeSelect = document.getElementById('avatar-type-select');
    if (avatarTypeSelect) {
        avatarTypeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            document.getElementById('avatar-sub-gradient').classList.add('hidden');
            document.getElementById('avatar-sub-emoji').classList.add('hidden');
            document.getElementById('avatar-sub-image').classList.add('hidden');
            
            if (val === 'gradient') {
                document.getElementById('avatar-sub-gradient').classList.remove('hidden');
            } else if (val === 'emoji') {
                document.getElementById('avatar-sub-emoji').classList.remove('hidden');
            } else if (val === 'image') {
                document.getElementById('avatar-sub-image').classList.remove('hidden');
            }
        });
    }

    // Preset Gradient select clicks
    const gradCards = document.querySelectorAll('#avatar-sub-gradient .preset-card');
    gradCards.forEach(card => {
        card.addEventListener('click', () => {
            gradCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedAvatarGradient = card.getAttribute('data-gradient');
        });
    });

    // Preset Emoji select clicks
    const emojiCircles = document.querySelectorAll('.preset-emoji-circle');
    emojiCircles.forEach(circle => {
        circle.addEventListener('click', () => {
            emojiCircles.forEach(c => c.classList.remove('active'));
            circle.classList.add('active');
            selectedAvatarEmoji = circle.getAttribute('data-emoji');
        });
    });

    // Cover Type dropdown change
    const coverTypeSelect = document.getElementById('cover-type-select');
    if (coverTypeSelect) {
        coverTypeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            document.getElementById('cover-sub-gradient').classList.add('hidden');
            document.getElementById('cover-sub-image').classList.add('hidden');
            if (val === 'gradient') {
                document.getElementById('cover-sub-gradient').classList.remove('hidden');
            } else if (val === 'image') {
                document.getElementById('cover-sub-image').classList.remove('hidden');
            }
        });
    }

    // Preset Cover select clicks
    const coverCards = document.querySelectorAll('#cover-sub-gradient .preset-card');
    coverCards.forEach(card => {
        card.addEventListener('click', () => {
            coverCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedCoverVal = card.getAttribute('data-cover');
        });
    });

    // Save profile customizations popover
    const saveCustomBtn = document.getElementById('save-profile-customizations');
    if (saveCustomBtn) {
        saveCustomBtn.addEventListener('click', () => {
            if (!currentUser) return;
            const authorName = currentUser.username || currentUser.email.split("@")[0];
            const type = avatarTypeSelect.value;
            
            let val = "";
            if (type === 'gradient') {
                val = selectedAvatarGradient || "linear-gradient(135deg, var(--accent-color), #d35400)";
            } else if (type === 'emoji') {
                val = selectedAvatarEmoji || "✍️";
            } else if (type === 'image') {
                val = document.getElementById('avatar-image-url-input').value.trim() || "";
            }

            const coverType = coverTypeSelect ? coverTypeSelect.value : 'gradient';
            let coverVal = "";
            if (coverType === 'gradient') {
                coverVal = selectedCoverVal || "linear-gradient(135deg, var(--accent-color), #2b1111)";
            } else if (coverType === 'image') {
                const urlVal = document.getElementById('cover-image-url-input').value.trim();
                coverVal = urlVal ? `url('${urlVal}')` : "linear-gradient(135deg, var(--accent-color), #2b1111)";
            }
            
            const goalInput = document.getElementById('profile-goal-count-input');
            const goalCount = goalInput ? parseInt(goalInput.value) || 10 : 10;

            saveAuthorProfileData(authorName, {
                avatarType: type,
                avatarVal: val,
                coverType: coverType,
                coverVal: coverVal,
                bio: document.getElementById('profile-bio-input').value.trim(),
                goalCount: goalCount,
                socialInstagram: document.getElementById('social-instagram-input').value.trim(),
                socialTwitter: document.getElementById('social-twitter-input').value.trim(),
                socialWeb: document.getElementById('social-web-input').value.trim()
            });

            // Close popover and backdrop
            popover.classList.add('hidden');
            const popoverBackdrop = document.getElementById('profile-editor-popover-backdrop');
            if (popoverBackdrop) popoverBackdrop.classList.add('hidden');
            showToast("✨ Profil görünümünüz başarıyla güncellendi!");
            
            // Reload views
            window.openAuthorProfile(authorName);
            updateAuthUI();
        });
    }

    // Cover edit button handler inside profile modal → opens popover near edit button
    const editCoverBtn = document.getElementById('profile-edit-cover-btn');
    if (editCoverBtn) {
        editCoverBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openPopoverNear(editCoverBtn, 'cover');
        });
    }

    // Avatar wrapper click handler inside profile modal
    const avatarWrapper = document.getElementById('profile-avatar-wrapper-el');
    if (avatarWrapper) {
        avatarWrapper.addEventListener('click', (e) => {
            if (avatarWrapper.classList.contains('profile-avatar-editable')) {
                e.stopPropagation();
                openPopoverNear(avatarWrapper, 'avatar');
            }
        });
    }

    // Inline rename edit button
    const renameTrigger = document.getElementById('author-modal-name-edit-trigger');
    if (renameTrigger) {
        renameTrigger.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!currentUser) return;
            
            const currentName = currentUser.username || currentUser.email.split("@")[0];
            
            // Prompt styling or beautiful replacement
            const newNameInput = prompt("Yeni kalem isminizi (yazar adınızı) girin:", currentName);
            if (newNameInput === null) return;
            const newName = newNameInput.trim();
            if (!newName || newName === currentName) return;

            const oldName = currentUser.username;
            await performUsernameMigration(oldName, newName);

            updateAuthUI();
            window.openAuthorProfile(newName);
            showToast("✅ Kalem isminiz başarıyla güncellendi!");
        });
    }

    // Inline Biography editing
    const bioTrigger = document.getElementById('author-modal-bio-edit-trigger');
    const bioTextEl = document.getElementById('author-modal-bio');
    if (bioTrigger && bioTextEl) {
        bioTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!currentUser) return;
            const authorName = currentUser.username || currentUser.email.split("@")[0];
            const profile = getAuthorProfileData(authorName);

            // Turn bioTextEl into an editor
            if (bioTrigger.getAttribute('data-editing') === 'true') {
                // Save Bio
                const textarea = bioTextEl.querySelector('textarea');
                if (textarea) {
                    const newBio = textarea.value.trim();
                    saveAuthorProfileData(authorName, { bio: newBio });
                    bioTextEl.innerHTML = "";
                    bioTextEl.innerText = newBio || "Kendinizden bahsedin...";
                    if (!newBio) bioTextEl.classList.add('profile-bio-empty'); else bioTextEl.classList.remove('profile-bio-empty');
                    
                    bioTrigger.innerText = "✍️ Biyografiyi Düzenle";
                    bioTrigger.removeAttribute('data-editing');
                    showToast("✅ Biyografiniz başarıyla güncellendi!");
                }
            } else {
                // Open Editor
                const currentBio = profile.bio || "";
                bioTextEl.innerHTML = `<textarea class="form-control profile-bio-edit-area" rows="3" style="width:100%; border-radius:8px; padding:10px; margin-top:5px; font-family:var(--font-body); font-size:0.92rem; background:var(--bg-secondary); border:1px solid var(--border-color); color:var(--text-primary); resize:vertical;" placeholder="Kendinizden bahsedin...">${currentBio}</textarea>`;
                const textarea = bioTextEl.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                    // Prevent closing overlay on clicking inside textarea
                    textarea.addEventListener('click', (ev) => ev.stopPropagation());
                }
                bioTrigger.innerText = "💾 Biyografiyi Kaydet";
                bioTrigger.setAttribute('data-editing', 'true');
            }
        });
    }

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        if (popover && !popover.classList.contains('hidden')) {
            if (!popover.contains(e.target) && 
                !e.target.closest('#profile-edit-cover-btn') && 
                !e.target.closest('#profile-avatar-wrapper-el')) {
                popover.classList.add('hidden');
            }
        }
    });
}

// Position and open popover helper
function openPopoverNear(element, defaultTab = 'avatar') {
    const popover = document.getElementById('profile-editor-popover');
    if (!popover || !currentUser) return;
    
    const authorName = currentUser.username || currentUser.email.split("@")[0];
    const profile = getAuthorProfileData(authorName);

    // Set initial values from profile
    const avatarTypeSelect = document.getElementById('avatar-type-select');
    if (avatarTypeSelect) avatarTypeSelect.value = profile.avatarType;
    
    // Toggle sub-panels correctly
    document.getElementById('avatar-sub-gradient').classList.add('hidden');
    document.getElementById('avatar-sub-emoji').classList.add('hidden');
    document.getElementById('avatar-sub-image').classList.add('hidden');
    
    if (profile.avatarType === 'gradient') {
        document.getElementById('avatar-sub-gradient').classList.remove('hidden');
        // Highlight active gradient preset card
        const presetCards = document.querySelectorAll('#avatar-sub-gradient .preset-card');
        let hasActiveGrad = false;
        presetCards.forEach(c => {
            if (profile.avatarVal && c.getAttribute('data-gradient') === profile.avatarVal) {
                c.classList.add('active');
                hasActiveGrad = true;
            } else {
                c.classList.remove('active');
            }
        });
        if (!hasActiveGrad && presetCards.length > 0) {
            presetCards[0].classList.add('active');
            selectedAvatarGradient = presetCards[0].getAttribute('data-gradient');
        } else {
            selectedAvatarGradient = profile.avatarVal;
        }
    } else if (profile.avatarType === 'emoji') {
        document.getElementById('avatar-sub-emoji').classList.remove('hidden');
        const emojiCircles = document.querySelectorAll('.preset-emoji-circle');
        let hasActiveEmoji = false;
        emojiCircles.forEach(c => {
            if (profile.avatarVal && c.getAttribute('data-emoji') === profile.avatarVal) {
                c.classList.add('active');
                hasActiveEmoji = true;
            } else {
                c.classList.remove('active');
            }
        });
        if (!hasActiveEmoji && emojiCircles.length > 0) {
            emojiCircles[0].classList.add('active');
            selectedAvatarEmoji = emojiCircles[0].getAttribute('data-emoji');
        } else {
            selectedAvatarEmoji = profile.avatarVal;
        }
    } else if (profile.avatarType === 'image') {
        document.getElementById('avatar-sub-image').classList.remove('hidden');
        document.getElementById('avatar-image-url-input').value = profile.avatarVal || "";
    }

    // Set Cover presets
    const coverTypeSelect = document.getElementById('cover-type-select');
    if (coverTypeSelect) coverTypeSelect.value = profile.coverType || 'gradient';

    document.getElementById('cover-sub-gradient').classList.add('hidden');
    document.getElementById('cover-sub-image').classList.add('hidden');

    if ((profile.coverType || 'gradient') === 'gradient') {
        document.getElementById('cover-sub-gradient').classList.remove('hidden');
        const coverCards = document.querySelectorAll('#cover-sub-gradient .preset-card');
        let hasActiveCover = false;
        coverCards.forEach(c => {
            if (profile.coverVal && c.getAttribute('data-cover') === profile.coverVal) {
                c.classList.add('active');
                hasActiveCover = true;
            } else {
                c.classList.remove('active');
            }
        });
        if (!hasActiveCover && coverCards.length > 0) {
            coverCards[0].classList.add('active');
            selectedCoverVal = coverCards[0].getAttribute('data-cover');
        } else {
            selectedCoverVal = profile.coverVal;
        }
    } else {
        document.getElementById('cover-sub-image').classList.remove('hidden');
        const rawUrl = (profile.coverVal && profile.coverVal.startsWith('url('))
            ? profile.coverVal.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '')
            : profile.coverVal || '';
        document.getElementById('cover-image-url-input').value = rawUrl;
    }

    // Set Social link inputs, bio input and goal input
    document.getElementById('profile-bio-input').value = profile.bio || "";
    document.getElementById('social-instagram-input').value = profile.socialInstagram || "";
    document.getElementById('social-twitter-input').value = profile.socialTwitter || "";
    document.getElementById('social-web-input').value = profile.socialWeb || "";
    const goalInput = document.getElementById('profile-goal-count-input');
    if (goalInput) goalInput.value = profile.goalCount || 10;

    // Reset Popover Tab display
    const popTabBtns = document.querySelectorAll('.profile-popover-tab-btn');
    popTabBtns.forEach(btn => btn.classList.remove('active'));
    
    const panels = document.querySelectorAll('.popover-panel');
    panels.forEach(p => p.classList.add('hidden'));

    if (defaultTab === 'avatar') {
        document.getElementById('popover-tab-avatar-btn').classList.add('active');
        document.getElementById('popover-panel-avatar').classList.remove('hidden');
    } else if (defaultTab === 'cover') {
        document.getElementById('popover-tab-cover-btn').classList.add('active');
        document.getElementById('popover-panel-cover').classList.remove('hidden');
    } else if (defaultTab === 'socials') {
        document.getElementById('popover-tab-socials-btn').classList.add('active');
        document.getElementById('popover-panel-socials').classList.remove('hidden');
    }

    // Show fixed centered popover modal with backdrop
    const popoverBackdrop = document.getElementById('profile-editor-popover-backdrop');
    if (popoverBackdrop) popoverBackdrop.classList.remove('hidden');
    popover.classList.remove('hidden');
}

// Initialize Autocomplete Writer Search Box
function initAuthorSearch() {
    const searchInput = document.getElementById("global-author-search-input");
    const resultsDropdown = document.getElementById("author-search-results");
    
    if (!searchInput || !resultsDropdown) return;

    // Handle typing queries
    searchInput.addEventListener("input", () => {
        const query = normalizeTurkishString(searchInput.value);
        if (!query) {
            resultsDropdown.innerHTML = "";
            resultsDropdown.classList.add("hidden");
            return;
        }

        // Get unique authors from platform database
        const uniqueAuthors = [...new Set(articles.map(a => a.author).filter(Boolean))];
        // Include logged in user if not present
        if (currentUser && currentUser.username && !uniqueAuthors.includes(currentUser.username)) {
            uniqueAuthors.push(currentUser.username);
        }

        // Filter authors matching normalized name query
        const matches = uniqueAuthors.filter(name => {
            return normalizeTurkishString(name).includes(query);
        });

        resultsDropdown.innerHTML = "";
        
        if (matches.length === 0) {
            resultsDropdown.innerHTML = `<div class="author-search-no-results">Eşleşen yazar bulunamadı.</div>`;
        } else {
            matches.forEach(name => {
                const stats = getAuthorStats(name);
                const item = document.createElement("div");
                item.className = "author-search-item";
                
                const avatarHtml = getAuthorAvatarHtml(name, 28);
                item.innerHTML = `
                    ${avatarHtml}
                    <div class="author-search-item-info">
                        <span class="author-search-item-name">${name}</span>
                        <span class="author-search-item-sub">${stats.rank.label} • ${stats.totalArticles} Eser</span>
                    </div>
                `;
                
                item.addEventListener("click", () => {
                    window.openAuthorProfile(name);
                    searchInput.value = "";
                    resultsDropdown.innerHTML = "";
                    resultsDropdown.classList.add("hidden");
                });
                
                resultsDropdown.appendChild(item);
            });
        }
        
        resultsDropdown.classList.remove("hidden");
    });

    // Close results when clicking outside search bar
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !resultsDropdown.contains(e.target)) {
            resultsDropdown.classList.add("hidden");
        }
    });

    // Show results again when input is focused if it contains query
    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim()) {
            resultsDropdown.classList.remove("hidden");
        }
    });
}

window.toggleFollowAuthor = function(authorName) {
    if (toggleFollowState(authorName)) {
        window.openAuthorProfile(authorName);
    }
};

// Handle Goal Updates from UI
window.updateWriterGoal = function(goal) {
    if (!currentUser) return;
    const authorName = currentUser.username || currentUser.email.split("@")[0];
    const goalVal = parseInt(goal) || 10;
    
    // Save to profile customizer (updates memory and Supabase)
    saveAuthorProfileData(authorName, { goalCount: goalVal });
    
    // Sync UI elements
    const stats = getAuthorStats(authorName);
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const authorArticles = articles.filter(a => a.author && a.author.trim().toLowerCase() === authorName.trim().toLowerCase());
    
    let last7DaysCount = 0;
    const months = {
        "Ocak": 0, "Şubat": 1, "Mart": 2, "Nisan": 3, "Mayıs": 4, "Haziran": 5,
        "Temmuz": 6, "Ağustos": 7, "Eylül": 8, "Ekim": 9, "Kasım": 10, "Aralık": 11
    };
    
    authorArticles.forEach(art => {
        const parts = art.date.split(" ");
        if (parts.length >= 3) {
            const day = parseInt(parts[0]);
            const monthStr = parts[1];
            const year = parseInt(parts[2]);
            const month = months[monthStr] !== undefined ? months[monthStr] : 5;
            const artDate = new Date(year, month, day);
            const diffDays = Math.round(Math.abs((now - artDate) / oneDay));
            if (diffDays <= 7) {
                last7DaysCount++;
            }
        }
    });
    
    const progressPct = Math.min(100, Math.round((last7DaysCount / goalVal) * 100));
    
    const goalStatusEl = document.getElementById("writer-goal-status");
    const goalBarEl = document.getElementById("writer-goal-bar");
    
    if (goalStatusEl) goalStatusEl.innerText = `${last7DaysCount} / ${goalVal} Eser`;
    if (goalBarEl) goalBarEl.style.width = `${progressPct}%`;
    
    // Streak
    const streak = calculateAuthorStreak(authorName);
    const streakEl = document.getElementById("writer-goal-streak-val");
    if (streakEl) streakEl.innerText = streak;
    
    showToast(`🎯 Yazım hedefi güncellendi: ${goalVal} Eser!`);
};

// Bind close button for author modal
document.getElementById("close-author-modal")?.addEventListener("click", () => {
    const modal = document.getElementById("author-modal");
    if (modal) {
        modal.classList.add("hidden");
        unlockBodyScroll();
    }
});

// "Profilim" dropdown button → open own profile modal
document.getElementById("dropdown-profile-btn")?.addEventListener("click", () => {
    // Close the dropdown first
    const dropdown = document.getElementById("profile-dropdown-menu");
    if (dropdown) dropdown.classList.add("hidden");

    if (!currentUser) {
        showToast("Profilinizi görmek için giriş yapmalısınız.");
        return;
    }
    window.openAuthorProfile(currentUser.username || currentUser.email || "Ben");
});

