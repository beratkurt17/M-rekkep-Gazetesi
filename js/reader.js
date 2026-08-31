// =============================================
// ARTICLE READER & COMMENTS ENGINE
// =============================================

async function openArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;

    activeArticleId = id;

    // Update SEO tags and schema structure dynamically
    updateSEOMetadata(article);

    // Track article view
    trackPageVisit("Yazı: " + article.title, article.id, article.category);
    
    // Set text contents
    detailCategory.innerText = article.category.replace("-", " ");
    detailTitle.innerText = article.title;
    detailSubtitle.innerText = article.subtitle;
    
    // Render author name with rank badge and bind click handler
    const rankBadge = getAuthorRankBadgeHtml(article.author);
    detailAuthor.innerHTML = `${article.author}${rankBadge}`;
    detailAuthor.style.cursor = "pointer";
    detailAuthor.style.textDecoration = "underline";
    detailAuthor.style.textUnderlineOffset = "2px";
    detailAuthor.onclick = () => { window.openAuthorProfile(article.author); };
    
    // Style avatar and bind click handler
    if (detailAvatarContainer) {
        detailAvatarContainer.onclick = () => { window.openAuthorProfile(article.author); };
    }

    detailDate.innerText = article.date;
    detailClapCount.innerText = article.claps;
    const NO_IMG = 'assets/typewriter_birds.webp';
    if (article.image && article.image !== 'undefined' && article.image !== '' && article.image !== NO_IMG) {
        detailImage.src = article.image;
        detailImage.onerror = function() {
            this.onerror = null;
            this.style.display = 'none';
            if (this.parentElement) this.parentElement.style.display = 'none';
        };
    } else {
        detailImage.style.display = 'none';
        if (detailImage.parentElement) detailImage.parentElement.style.display = 'none';
    }
    
    // Sync Medium sticky top navbar & side rail
    const rtnStickyTitle = document.getElementById("rtn-sticky-title");
    const rtnStickyAuthor = document.getElementById("rtn-sticky-author");
    if (rtnStickyTitle) rtnStickyTitle.innerText = article.title;
    if (rtnStickyAuthor) rtnStickyAuthor.innerText = `• ${article.author}`;

    const sideClapCount = document.getElementById("side-clap-count");
    const sideCommentsCount = document.getElementById("side-comments-count");
    const sideClapBtn = document.getElementById("side-clap-btn");
    if (sideClapCount) sideClapCount.innerText = article.claps || 0;
    if (sideCommentsCount) sideCommentsCount.innerText = (article.comments ? article.comments.length : 0);

    // Check if clapped previously
    const storageKey = currentUser ? `clapped_articles_${currentUser.id}` : null;
    const clappedArticles = storageKey ? JSON.parse(localStorage.getItem(storageKey) || "[]") : [];
    if (clappedArticles.includes(id)) {
        detailClapBtn.classList.add("clapped");
        if (sideClapBtn) sideClapBtn.classList.add("clapped");
    } else {
        detailClapBtn.classList.remove("clapped");
        if (sideClapBtn) sideClapBtn.classList.remove("clapped");
    }

    // Set author avatar dynamically using our customization system
    if (detailAvatarContainer) {
        detailAvatarContainer.innerHTML = getAuthorAvatarHtml(article.author, 44);
    }

    // Update follow button next to author name in reader overlay
    if (typeof updateArticleDetailFollowButton === 'function') {
        updateArticleDetailFollowButton(article.author);
    }

    // Show Overlay with fade/slide animations
    updateDynamicViewport(true);
    readingOverlay.classList.remove("hidden");
    lockBodyScroll(); // lock page scroll
    readingOverlay.scrollTop = 0;
    readingOverlay.scrollLeft = 0;
    window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
    readingProgress.style.width = "0%";

    // Update editor buttons in reader overlay
    const approveBtn = document.getElementById("article-editor-approve-btn");
    const deleteBtn = document.getElementById("article-editor-delete-btn");
    if (approveBtn && deleteBtn) {
        // Günün Sözü ve Kelimesi sahte kartları — sil/onayla butonlarını gösterme
        const isMockCard = (id === 'gunun-sozu-card' || id === 'gunun-kelimesi-card');
        if (isMockCard) {
            approveBtn.classList.add("hidden");
            deleteBtn.classList.add("hidden");
        } else {
            const isOwnArticle = currentUser && currentUser.username &&
                currentUser.username.trim().toLowerCase() === article.author.trim().toLowerCase();

            if (isEditorModeActive) {
                approveBtn.classList.remove("hidden");
                deleteBtn.classList.remove("hidden");
                deleteBtn.innerText = "Kaldır";
            } else if (isOwnArticle) {
                approveBtn.classList.add("hidden");
                deleteBtn.classList.remove("hidden");
                deleteBtn.innerText = "Yazıyı Sil";
            } else {
                approveBtn.classList.add("hidden");
                deleteBtn.classList.add("hidden");
            }
        }
    }

    // Handle article edit button
    if (articleEditorEditBtn) {
        // Günün Sözü ve Kelimesi sahte kartları — düzenle butonu gösterme
        const isMockCard = (id === 'gunun-sozu-card' || id === 'gunun-kelimesi-card');
        if (isMockCard) {
            articleEditorEditBtn.classList.add("hidden");
        } else {
            const isOwnArticle = currentUser && currentUser.username &&
                currentUser.username.trim().toLowerCase() === article.author.trim().toLowerCase();
            const canEdit = isOwnArticle || (currentUser && (currentUser.isEditor || currentUser.isAdmin));
            if (canEdit) {
                articleEditorEditBtn.classList.remove("hidden");
                articleEditorEditBtn.onclick = (e) => { window.editArticleClick(id, e); };
            } else {
                articleEditorEditBtn.classList.add("hidden");
            }
        }
    }

    // Render comments initially (even if article text is loading)
    renderArticleComments(id);

    // Check LocalStorage for article content if not in memory
    if (!article.content) {
        try {
            const saved = localStorage.getItem("murekkep_articles_v2");
            if (saved) {
                const localArts = JSON.parse(saved);
                const localMatch = localArts.find(la => la.id === id);
                if (localMatch && localMatch.content) {
                    article.content = localMatch.content;
                }
            }
        } catch (e) {}
    }

    // Dynamic loading of article body content
    if (isSupabaseConnected && !article.content) {
        if (detailReadtime) detailReadtime.innerText = article.readTime || "...";
        detailContent.innerHTML = `
            <div class="content-loader">
                <div class="spinner"></div>
                <p style="font-family: var(--font-body); font-size: 1.1rem; color: var(--text-secondary);">Yazı içeriği yükleniyor...</p>
            </div>
        `;

        try {
            const { data, error } = await supabaseClient
                .from('articles')
                .select('content, read_time')
                .eq('id', id)
                .maybeSingle();
            
            if (error) throw error;
            if (!data) throw new Error("Makale bulunamadı.");

            article.content = data.content;
            if (data.read_time) {
                article.readTime = data.read_time;
            }
        } catch (err) {
            console.error("Error loading article content from Supabase:", err);
            detailContent.innerHTML = `
                <div style="text-align: center; padding: 40px 0; color: var(--text-secondary); font-family: var(--font-body);">
                    <p style="margin-bottom: 15px;">Yazı içeriği yüklenirken bir hata oluştu.</p>
                    <button onclick="openArticle('${id}')" style="background-color: var(--accent-color); color: #fff; border: none; padding: 8px 16px; border-radius: 20px; font-family: var(--font-ui); cursor: pointer; font-weight: 600;">Tekrar Dene</button>
                </div>
            `;
            return;
        }
    }

    // Update readTime and fill content
    if (detailReadtime) detailReadtime.innerText = article.readTime || calculateReadTime(article.content || '');
    
    // Recommendations / Funnel Retention Box (Bunları da Okumak İster misiniz?)
    const relatedList = articles.filter(a => a.id !== id).slice(0, 3);
    let relatedHTML = "";
    if (relatedList.length > 0) {
        relatedHTML = `
            <div class="related-articles-box">
                <div style="font-family: var(--font-ui); font-size: 0.72rem; font-weight: 800; color: var(--accent-color); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px;">MÜREKKEP EDEBİYAT ARŞİVİ</div>
                <h3 style="font-family: var(--font-header); font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">Bunları da Okumak İster misiniz?</h3>
                <div class="related-articles-grid">
                    ${relatedList.map(ra => `
                        <div class="related-article-card" onclick="window.openArticle('${ra.id}')">
                            <span style="font-size: 0.68rem; font-weight: 800; color: var(--accent-color); text-transform: uppercase;">${(ra.category || 'Edebiyat').toUpperCase()}</span>
                            <h4 style="font-family: var(--font-header); font-size: 1.05rem; font-weight: 800; margin: 4px 0; color: var(--text-primary);">${ra.title}</h4>
                            <span style="font-size: 0.72rem; color: var(--text-secondary); margin-top: auto; padding-top: 6px;">✍️ ${ra.author}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    detailContent.innerHTML = (article.content || '<p style="color: var(--text-secondary);">Yazı içeriği bulunamadı.</p>') + relatedHTML;

    // Update browser URL for deep linking without page reload
    try {
        const newUrl = window.location.pathname + '?article=' + encodeURIComponent(article.id);
        window.history.replaceState({ articleId: article.id }, '', newUrl);
    } catch (e) {}

    // Update bookmark UI state
    updateBookmarkBtnUI();

    // Set reported visual state for the report button in detail overlay
    const articleReportBtn = document.getElementById("article-report-btn");
    if (articleReportBtn) {
        const articleReports = getArticleReports(id);
        if (articleReports > 0) {
            articleReportBtn.classList.add("reported");
        } else {
            articleReportBtn.classList.remove("reported");
        }
    }

    // Prefill and lock commenter name if logged in; show login prompt for guests
    updateCommentFormUI();
}

function updateCommentFormUI() {
    const commentFormEl = document.getElementById("comment-form");
    const existingPrompt = document.getElementById("comment-login-prompt");
    
    if (currentUser) {
        // Logged in: show form, remove prompt
        if (commentFormEl) commentFormEl.style.display = "";
        if (existingPrompt) existingPrompt.remove();
        commentAuthorInput.value = currentUser.username || currentUser.email.split("@")[0];
        commentAuthorInput.disabled = true;
    } else {
        // Guest: hide form, show premium login prompt
        if (commentFormEl) commentFormEl.style.display = "none";
        if (!existingPrompt) {
            const prompt = document.createElement("div");
            prompt.id = "comment-login-prompt";
            prompt.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 14px;
                padding: 28px 24px;
                border: 1px solid var(--border-light);
                border-radius: 12px;
                background: var(--bg-secondary);
                text-align: center;
                margin-bottom: 20px;
            `;
            prompt.innerHTML = `
                <svg style="width:32px;height:32px;fill:var(--accent-color);opacity:0.8;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                <p style="font-family:var(--font-body);font-size:1rem;color:var(--text-secondary);line-height:1.5;">Yorum yapabilmek için topluluğumuza katılın.</p>
                <div style="display:flex;gap:10px;">
                    <button onclick="openAuthModal();switchAuthTab('login');" style="background-color:var(--accent-color);color:#fff;border:none;padding:10px 22px;border-radius:20px;font-family:var(--font-ui);font-size:0.85rem;font-weight:700;cursor:pointer;transition:background-color 0.2s;">Giriş Yap</button>
                    <button onclick="openAuthModal();switchAuthTab('register');" style="background-color:transparent;color:var(--text-primary);border:1px solid var(--border-color);padding:10px 22px;border-radius:20px;font-family:var(--font-ui);font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.2s;">Kayıt Ol</button>
                </div>
            `;
            if (commentFormEl) {
                commentFormEl.parentNode.insertBefore(prompt, commentFormEl);
            }
        }
        commentAuthorInput.disabled = false;
    }
}



// Close Medium Reader Modal
function closeArticle() {
    readingOverlay.classList.add("hidden");
    if (commentsDrawer && !commentsDrawer.classList.contains("hidden")) {
        commentsDrawer.classList.add("hidden");
        unlockBodyScroll();
    }
    unlockBodyScroll(); // restore page scroll
    activeArticleId = null;

    // Restore clean URL
    try {
        window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {}

    // Restore default SEO tags
    updateSEOMetadata(null);
}

// Update the follow button in the open article detail overlay
function updateArticleDetailFollowButton(authorName) {
    const detailFollowBtn = document.querySelector(".btn-follow");
    if (!detailFollowBtn) return;
    
    const readingOverlay = document.getElementById("reading-overlay");
    if (!readingOverlay || readingOverlay.classList.contains("hidden") || !activeArticleId) return;
    const article = articles.find(a => a.id === activeArticleId);
    if (!article || article.author !== authorName) return;
    
    const isOwnArticle = currentUser && currentUser.username &&
        currentUser.username.trim().toLowerCase() === authorName.trim().toLowerCase();
        
    if (isOwnArticle) {
        detailFollowBtn.style.display = 'none';
    } else {
        detailFollowBtn.style.display = '';
        
        let followersData = {};
        try { followersData = JSON.parse(localStorage.getItem('murekkep_author_followers') || '{}'); } catch(e){}
        const followersList = followersData[authorName] || [];
        
        const isFollowing = currentUser && followersList.some(f => {
            if (typeof f === 'string') return f === currentUser.id;
            return f && f.id === currentUser.id;
        });
        
        if (isFollowing) {
            detailFollowBtn.textContent = '✓ Takip Ediliyor';
        } else {
            detailFollowBtn.textContent = 'Takip Et';
        }
        
        const newFollowBtn = detailFollowBtn.cloneNode(true);
        detailFollowBtn.parentNode.replaceChild(newFollowBtn, detailFollowBtn);
        newFollowBtn.addEventListener('click', () => window.toggleFollowFromArticle(authorName));
    }
}

window.toggleFollowFromArticle = function(authorName) {
    if (toggleFollowState(authorName)) {
        const authorModal = document.getElementById("author-modal");
        if (authorModal && !authorModal.classList.contains("hidden")) {
            const authorModalName = document.getElementById("author-modal-name");
            if (authorModalName && authorModalName.innerText === authorName) {
                window.openAuthorProfile(authorName);
            }
        }
    }
};

// RENDER COMMENTS FOR ARTICLE
function renderArticleComments(articleId) {
    const articleComments = comments.filter(c => c.articleId === articleId);
    const count = articleComments.length;

    if (commentsTotalCountEl) commentsTotalCountEl.innerText = count;
    
    const articleCommentsCountEl = document.getElementById("article-comments-count");
    if (articleCommentsCountEl) articleCommentsCountEl.innerText = count;
    
    const commentsDrawerCountEl = document.getElementById("comments-drawer-count");
    if (commentsDrawerCountEl) commentsDrawerCountEl.innerText = count;

    let commentsHTML = "";
    articleComments.slice().reverse().forEach(c => {
        const reports = getCommentReports(c.id);
        if (reports >= 3 && !isEditorModeActive) {
            commentsHTML += `
                <div class="comment-card" style="opacity: 0.6; padding: 15px; text-align: center; border: 1px dashed var(--border-light); background: var(--bg-secondary); margin-bottom: 15px;">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); font-style: italic;">⚠️ Bu yorum uygunsuz içerik bildirimleri nedeniyle gizlenmiştir.</p>
                </div>
            `;
            return;
        }

        const isOwnComment = currentUser && (
            c.author === currentUser.username || 
            c.author === (currentUser.email ? currentUser.email.split("@")[0] : "")
        );

        const article = articles.find(a => a.id === articleId);
        const isCommentOnOwnArticle = currentUser && article && article.author && (
            normalizeTurkishString(article.author) === normalizeTurkishString(currentUser.username)
        );

        const canDelete = isOwnComment || isCommentOnOwnArticle || (currentUser && currentUser.isEditor);

        let actionControlHtml = "";
        if (isEditorModeActive) {
            actionControlHtml = `
                <div style="display: flex; gap: 8px;">
                    <button class="btn-editor-action approve" style="padding: 4px 10px; font-size: 0.7rem;" onclick="window.approveCommentClick('${c.id}', '${articleId}', event)">Onayla</button>
                    <button class="btn-editor-action delete" style="padding: 4px 10px; font-size: 0.7rem;" onclick="window.deleteCommentClick('${c.id}', '${articleId}', event)">Sil</button>
                </div>
            `;
        } else {
            let buttons = [];
            if (isOwnComment) {
                buttons.push(`<button class="btn-editor-action edit" style="padding: 4px 10px; font-size: 0.7rem; background-color: var(--border-light); color: var(--text-primary);" onclick="window.editCommentInline('${c.id}', '${articleId}', event)">Düzenle</button>`);
            }
            if (canDelete) {
                buttons.push(`<button class="btn-editor-action delete" style="padding: 4px 10px; font-size: 0.7rem;" onclick="window.deleteCommentClick('${c.id}', '${articleId}', event)">Sil</button>`);
            }
            if (buttons.length > 0) {
                actionControlHtml = `<div style="display: flex; gap: 8px;">${buttons.join("")}</div>`;
            }
        }

        commentsHTML += `
            <div class="comment-card ${reports > 0 ? 'flagged' : ''}" id="comment-${c.id}" style="position: relative; padding: 16px; margin-bottom: 15px;">
                ${(reports > 0 && isEditorModeActive) ? `<div class="flag-badge" style="top: 10px; right: 10px;">⚠️ Şikayet: ${reports}</div>` : ''}
                <div class="comment-header" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span class="commenter-name" style="font-weight: 700;">${c.author}</span>
                    <span class="comment-date" style="font-size: 0.75rem; color: var(--text-secondary);">${c.date}</span>
                </div>
                <p class="comment-body" style="font-family: var(--font-body); line-height: 1.5; color: var(--text-primary);">${c.text}</p>
                <div class="comment-report-row" style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px solid var(--border-light); padding-top: 8px;">
                    <button class="btn-comment-report ${reports > 0 ? 'reported' : ''}" onclick="window.reportCommentClick('${c.id}', '${articleId}', event)">
                        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; fill: currentColor; margin-right: 4px; display: inline-block; vertical-align: middle;"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/></svg>
                        <span style="font-size: 0.75rem; font-weight: 600;">${reports > 0 ? 'Şikayet Edildi (' + reports + ')' : 'Şikayet Et'}</span>
                    </button>
                    ${actionControlHtml}
                </div>
            </div>
        `;
    });

    commentsListContainer.innerHTML = commentsHTML || `<p style="color: var(--text-secondary); text-align: center; padding: 20px 0;">Bu yazıya henüz yorum yazılmamış. İlk yorumu siz yazın!</p>`;
}

// ── COMMENT INLINE EDITING ──────────────────────────────────
window.editCommentInline = function(id, articleId, event) {
    if (event) event.stopPropagation();
    const commentEl = document.getElementById(`comment-${id}`);
    if (!commentEl) return;
    
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    // Check if already editing
    if (commentEl.querySelector('.comment-edit-textarea')) return;
    
    const bodyEl = commentEl.querySelector('.comment-body');
    const originalText = comment.text;
    
    bodyEl.innerHTML = `
        <textarea class="comment-edit-textarea comment-input" style="width: 100%; margin-top: 8px;" rows="2">${originalText}</textarea>
        <div style="display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end;">
            <button class="btn-editor-action approve" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.saveCommentInline('${id}', '${articleId}', event)">Kaydet</button>
            <button class="btn-editor-action delete" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.cancelCommentInline('${id}', '${articleId}', event)">İptal</button>
        </div>
    `;
};

window.saveCommentInline = async function(id, articleId, event) {
    if (event) event.stopPropagation();
    const commentEl = document.getElementById(`comment-${id}`);
    if (!commentEl) return;
    
    const textarea = commentEl.querySelector('.comment-edit-textarea');
    if (!textarea) return;
    
    const newText = textarea.value.trim();
    if (!newText) {
        showToast("Yorum alanı boş bırakılamaz.");
        return;
    }
    
    if (containsProfanity(newText)) {
        showToast("❌ Yorumunuz topluluk kurallarına aykırı ifadeler içermektedir.");
        return;
    }
    
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    comment.text = newText;
    
    if (isSupabaseConnected) {
        try {
            await supabaseClient
                .from('comments')
                .update({ text: newText })
                .eq('id', id);
        } catch (err) {
            console.error("Error updating comment on Supabase:", err);
        }
        clearSupabaseCache();
    } else {
        localStorage.setItem("murekkep_comments_v2", JSON.stringify(comments));
    }
    
    showToast("Yorum güncellendi.");
    renderArticleComments(articleId);
};

window.cancelCommentInline = function(id, articleId, event) {
    if (event) event.stopPropagation();
    renderArticleComments(articleId);
};

// ── ARTICLE EDITING ─────────────────────────────────────────
function convertHtmlToRawText(html) {
    if (!html) return "";
    let text = html;
    text = text.replace(/<\/p>\s*<p>/gi, "\n\n");
    text = text.replace(/<\/?p>/gi, "");
    text = text.replace(/<br\s*\/?>/gi, "\n");
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    return tempDiv.textContent || tempDiv.innerText || text;
}

window.editArticleClick = function(id, event) {
    if (event) event.stopPropagation();
    const article = articles.find(a => a.id === id);
    if (!article) return;
    
    editingArticleId = id;
    
    // Fill the Writer Studio forms
    document.getElementById("post-title").value = article.title;
    document.getElementById("post-subtitle").value = article.subtitle;
    const authorInput = document.getElementById("post-author");
    if (authorInput) {
        authorInput.value = article.author;
        authorInput.readOnly = true;
    }
    document.getElementById("post-category").value = article.category;
    
    const cornerNameInput = document.getElementById("post-corner-name");
    if (cornerNameInput) {
        cornerNameInput.value = article.corner_name || "";
    }
    
    // Select the image
    const imgInput = document.querySelector(`input[name="post-image"][value="${article.image}"]`);
    if (imgInput) imgInput.checked = true;
    
    // Populate rich text editor or fall back to textarea
    const editorDiv = document.getElementById("post-editor");
    if (editorDiv) {
        editorDiv.innerHTML = article.content || "";
        document.getElementById("post-content").value = article.content || "";
    } else {
        document.getElementById("post-content").value = convertHtmlToRawText(article.content);
    }
    
    // Change UI titles
    const studioTitle = document.querySelector(".editor-studio-header h2");
    if (studioTitle) studioTitle.innerText = "Yazı Düzenle";
    
    const studioDesc = document.querySelector(".editor-studio-header p");
    if (studioDesc) studioDesc.innerText = "Yazınız üzerinde değişiklikleri yapın ve güncelleyin.";
    
    const submitBtn = document.querySelector(".btn-publish-submit");
    if (submitBtn) submitBtn.innerText = "Değişiklikleri Kaydet";
    
    // Open editor overlay
    const editorOverlay = document.getElementById("editor-overlay");
    if (editorOverlay) {
        editorOverlay.classList.remove("hidden");
        lockBodyScroll();
    }
};

// ── COMMENTS DRAWER CONTROLS ────────────────────────────────
function openCommentsDrawer() {
    if (commentsDrawer) {
        commentsDrawer.classList.remove("hidden");
        lockBodyScroll();
        if (activeArticleId) {
            renderArticleComments(activeArticleId);
        }
    }
}

function closeCommentsDrawer() {
    if (commentsDrawer) {
        commentsDrawer.classList.add("hidden");
        unlockBodyScroll();
    }
}

// EVENT LISTENERS

// Side Rail Action Button Wiring
const sideClapBtnEl = document.getElementById("side-clap-btn");
const sideCommentBtnEl = document.getElementById("side-comment-btn");
const sideSaveBtnEl = document.getElementById("side-save-btn");
const sideShareBtnEl = document.getElementById("side-share-btn");

sideClapBtnEl?.addEventListener("click", () => {
    detailClapBtn?.click();
    const sideClapCountEl = document.getElementById("side-clap-count");
    if (sideClapCountEl && detailClapCount) sideClapCountEl.innerText = detailClapCount.innerText;
    if (detailClapBtn && detailClapBtn.classList.contains("clapped")) {
        sideClapBtnEl.classList.add("clapped");
    } else {
        sideClapBtnEl.classList.remove("clapped");
    }
});

sideCommentBtnEl?.addEventListener("click", openCommentsDrawer);

sideSaveBtnEl?.addEventListener("click", () => {
    document.getElementById("article-save-btn")?.click();
});

sideShareBtnEl?.addEventListener("click", () => {
    document.getElementById("article-share-btn")?.click();
});

// Comments Drawer Toggles
commentsTriggerBar?.addEventListener("click", openCommentsDrawer);
articleCommentBtn?.addEventListener("click", openCommentsDrawer);

closeCommentsDrawerBtn?.addEventListener("click", closeCommentsDrawer);
closeCommentsDrawerBtn?.addEventListener("touchstart", (e) => {
    e.preventDefault();
    closeCommentsDrawer();
}, { passive: false });

commentsDrawerBackdrop?.addEventListener("click", closeCommentsDrawer);
commentsDrawerBackdrop?.addEventListener("touchstart", (e) => {
    if (e.target === commentsDrawerBackdrop) {
        e.preventDefault();
        closeCommentsDrawer();
    }
}, { passive: false });

// Reading Overlay Scroll Progress & Top Sticky Navbar Title Toggle
readingOverlay.addEventListener("scroll", () => {
    const scrollTop = readingOverlay.scrollTop;
    const scrollHeight = readingOverlay.scrollHeight;
    const clientHeight = readingOverlay.clientHeight;
    
    if (scrollHeight - clientHeight > 0) {
        const percentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        readingProgress.style.width = `${percentage}%`;
    }

    const rtnCenterTitle = document.getElementById("rtn-center-title");
    if (rtnCenterTitle) {
        if (scrollTop > 220) {
            rtnCenterTitle.classList.add("visible");
        } else {
            rtnCenterTitle.classList.remove("visible");
        }
    }
});

// Theme Switcher (Light / Dark)
themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("murekkep_theme", newTheme);
    
    // Toggle sun / moon icons
    document.querySelector(".icon-sun").classList.toggle("hidden");
    document.querySelector(".icon-moon").classList.toggle("hidden");
});

// Initialize Theme
const savedTheme = localStorage.getItem("murekkep_theme") || "light";
if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.querySelector(".icon-sun").classList.remove("hidden");
    document.querySelector(".icon-moon").classList.add("hidden");
}

// Editorial Submission / Writer Studio Overlay Toggle — requires login