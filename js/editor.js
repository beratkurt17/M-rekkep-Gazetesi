// =============================================
// WRITER STUDIO & WYSIWYG EDITOR
// =============================================

// Open Writer Studio Modal (unified handler for header button and slot cards)
function openWriterStudioModal(categoryKey) {
    if (!currentUser) {
        if (typeof openAuthModal === 'function') openAuthModal();
        if (typeof showToast === 'function') showToast("Yazı başvurusu yapmak veya düzenlemek için lütfen giriş yapın.");
        return;
    }
    if (editorOverlay) {
        editorOverlay.classList.remove("hidden");
        editorOverlay.scrollTop = 0;
    }
    if (typeof lockBodyScroll === 'function') lockBodyScroll();
    
    // Prefill the author name to match user profile exactly and lock input
    const authorInput = document.getElementById("post-author");
    if (authorInput) {
        authorInput.value = currentUser.username || (currentUser.email ? currentUser.email.split("@")[0] : "Anonim Yazar");
        authorInput.readOnly = true;
    }

    // Dynamic headers based on user role / editor mode
    const studioTitle = document.querySelector(".editor-studio-header h2");
    const studioDesc = document.querySelector(".editor-studio-header p");
    const submitBtn = document.querySelector(".btn-publish-submit");

    if ((currentUser && currentUser.isEditor) || isEditorModeActive) {
        if (studioTitle) studioTitle.innerText = "Editör Paneli - Gazete Köşe & Eser Girişi";
        if (studioDesc) studioDesc.innerText = "Yayınlamak istediğiniz gazete köşesini seçin ve eseri doğrudan ilgili slota yerleştirin.";
        if (submitBtn) submitBtn.innerText = "Gazetede Doğrudan Yayınla";
    } else {
        if (studioTitle) studioTitle.innerText = "Editöryal Yazı Başvurusu";
        if (studioDesc) studioDesc.innerText = "Eseriniz Mürekkep Yayın Kurulu ve Editör heyetimizce incelenecektir. Onaylanan eserler gazetemizde yayına alınır.";
        if (submitBtn) submitBtn.innerText = "Yayın Kuruluna Başvuru Gönder";
    }

    // Populate and set category select dynamically
    const categorySelect = document.getElementById("post-category");
    if (categorySelect) {
        categorySelect.innerHTML = "";
        let baseOptions = [];

        if ((currentUser && currentUser.isEditor) || isEditorModeActive) {
            baseOptions = [
                { id: "manset", name: "🌟 1. Ana Manşet (Hero Story)" },
                { id: "kose-yazilari", name: "✒️ 2. Köşe Yazısı (Sol 1. Slot)" },
                { id: "deneme", name: "🖋️ 3. Deneme & Eleştiri (Sol 2. Slot)" },
                { id: "gunun-sozu", name: "📜 4. Günün Sözü (Sol 3. Slot)" },
                { id: "genc-kalemler", name: "📖 5. Genç Kalemler & Anlatı (Sol 4. Slot)" },
                { id: "oyku", name: "📖 6. Öykü & Anlatı (Orta Alt Sol Slot)" },
                { id: "kitap", name: "📚 7. Kitaplık & Tenkit (Orta Alt Sağ Slot)" },
                { id: "siir", name: "📜 8. Günün Şiiri (Sağ 1. Slot)" },
                { id: "haber", name: "🏛️ 9. Kültür & Medeniyet (Sağ 2. Slot)" },
                { id: "lugat", name: "📖 10. Edebi Lûgat / Günün Kelimesi (Sağ 3. Slot)" },
                { id: "biyografi", name: "Edebi Portre & Biyografi" },
                { id: "roportaj", name: "Yazar Röportajı / Söyleşi" },
                { id: "yarismalar", name: "Yarışmalar & Duyurular" }
            ];
        } else {
            baseOptions = [
                { id: "kose-yazilari", name: "✒️ Köşe Yazısı (Sol 1. Slot)" },
                { id: "deneme", name: "🖋️ Deneme & Eleştiri (Sol 2. Slot)" },
                { id: "gunun-sozu", name: "📜 Günün Sözü (Sol 3. Slot)" },
                { id: "genc-kalemler", name: "📖 Genç Kalemler & Anlatı (Sol 4. Slot)" },
                { id: "oyku", name: "📖 Öykü & Anlatı (Orta Alt Sol Slot)" },
                { id: "kitap", name: "📚 Kitaplık & Tenkit (Orta Alt Sağ Slot)" },
                { id: "siir", name: "📜 Günün Şiiri (Sağ 1. Slot)" },
                { id: "haber", name: "🏛️ Kültür & Medeniyet (Sağ 2. Slot)" },
                { id: "lugat", name: "📖 Edebi Lûgat / Kelime (Sağ 3. Slot)" },
                { id: "manset", name: "🌟 Ana Manşet Başvurusu" },
                { id: "biyografi", name: "Edebi Portre & Biyografi" },
                { id: "roportaj", name: "Yazar Röportajı / Söyleşi" },
                { id: "yarismalar", name: "Yarışmalar & Duyurular" }
            ];
        }

        if (Array.isArray(customCategories)) {
            customCategories.forEach(cat => {
                if (!baseOptions.some(o => o.id === cat.id)) {
                    baseOptions.push(cat);
                }
            });
        }

        baseOptions.forEach(opt => {
            const el = document.createElement("option");
            el.value = opt.id;
            el.textContent = opt.name;
            categorySelect.appendChild(el);
        });

        const targetCat = categoryKey || ((currentUser && currentUser.isEditor) || isEditorModeActive ? "manset" : "deneme");
        categorySelect.value = targetCat;
        if (typeof updateSlotFormSections === 'function') {
            updateSlotFormSections(categorySelect.value);
        }
    }
}

if (writeToggleBtn) {
    writeToggleBtn.addEventListener("click", () => openWriterStudioModal());
}
window.openWriteModalForCategory = openWriterStudioModal;

closeEditorBtn.addEventListener("click", () => {
    editingArticleId = null;
    const studioTitle = document.querySelector(".editor-studio-header h2");
    if (studioTitle) studioTitle.innerText = "Editöryal Yazı Başvurusu";
    const studioDesc = document.querySelector(".editor-studio-header p");
    if (studioDesc) studioDesc.innerText = "Eseriniz Mürekkep Yayın Kurulu ve Editör heyetimizce incelenecektir. Onaylanan eserler gazetemizde yayına alınır.";
    const submitBtn = document.querySelector(".btn-publish-submit");
    if (submitBtn) submitBtn.innerText = "Yayın Kuruluna Başvuru Gönder";
    publishForm.reset();
    editorOverlay.classList.add("hidden");
    unlockBodyScroll();
});

// ── EDITORIAL SUBMISSIONS / BAŞVURU HAVUZU CONTROLLER ──
function getEditorialSubmissions() {
    try {
        return JSON.parse(localStorage.getItem("murekkep_editorial_submissions") || "[]");
    } catch (e) {
        return [];
    }
}

function saveEditorialSubmissions(subs) {
    try {
        localStorage.setItem("murekkep_editorial_submissions", JSON.stringify(subs));
    } catch (e) {}
}

function updateEditorialSubmissionsBadge() {
    const subs = getEditorialSubmissions().filter(s => s.status !== 'rejected');
    const count = subs.length;
    
    const badge = document.getElementById("editorial-inbox-badge");
    const dropdownBadge = document.getElementById("editorial-badge-count");
    
    if (badge) {
        badge.innerText = count;
        badge.style.display = count > 0 ? "inline-block" : "none";
    }
    if (dropdownBadge) {
        dropdownBadge.innerText = count;
        dropdownBadge.style.display = count > 0 ? "inline-block" : "none";
    }
}

function openEditorialInboxOverlay() {
    const overlay = document.getElementById("editorial-inbox-overlay");
    if (!overlay) return;
    renderEditorialSubmissionsList();
    overlay.classList.remove("hidden");
    lockBodyScroll();
}

function closeEditorialInboxOverlay() {
    const overlay = document.getElementById("editorial-inbox-overlay");
    if (!overlay) return;
    overlay.classList.add("hidden");
    unlockBodyScroll();
}

function renderEditorialSubmissionsList() {
    const listContainer = document.getElementById("editorial-submissions-list");
    if (!listContainer) return;
    
    const subs = getEditorialSubmissions();
    updateEditorialSubmissionsBadge();
    
    if (subs.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: var(--bg-primary); border: 1.5px dashed var(--border-color); border-radius: 6px;">
                <span style="font-size: 2.2rem; display: block; margin-bottom: 10px;">📭</span>
                <strong style="font-family: var(--font-header); font-size: 1.1rem; color: var(--text-primary); display: block;">Bekleyen Başvuru Bulunmuyor</strong>
                <p style="font-family: var(--font-body); font-size: 0.85rem; color: var(--text-secondary); margin-top: 6px;">Yazarlar 'Editöryal Başvuru' yaptıklarında incelemeniz için bu havuza düşecektir.</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = subs.map(sub => {
        const catLabels = {
            siir: "Şiir",
            oyku: "Öykü",
            deneme: "Deneme",
            kitap: "Kitap İncelemesi",
            roportaj: "Röportaj",
            "kose-yazilari": "Köşe Yazısı",
            haber: "Haber",
            yarismalar: "Yarışmalar"
        };
        const catName = catLabels[sub.category] || sub.category || "Edebi Eser";
        
        return `
            <div class="editorial-submission-item" style="background: var(--bg-primary); border: 1.5px solid var(--border-color); border-top: 4px solid var(--accent-color); padding: 16px 18px; border-radius: 4px; box-shadow: 0 2px 8px var(--shadow-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid var(--border-light); padding-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                    <span style="font-family: var(--font-ui); font-size: 0.72rem; font-weight: 800; color: var(--accent-color); text-transform: uppercase;">
                        🏷️ ${catName} • ${sub.date || 'Yeni Başvuru'}
                    </span>
                    <span style="font-family: var(--font-ui); font-size: 0.72rem; color: var(--text-secondary);">
                        Yazar: <strong style="color: var(--text-primary);">${sub.author}</strong> ${sub.author_email ? `(${sub.author_email})` : ''}
                    </span>
                </div>
                
                <h3 style="font-family: var(--font-header); font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 6px 0 4px;">
                    ${sub.title}
                </h3>
                ${sub.subtitle ? `<p style="font-family: var(--font-body); font-size: 0.88rem; font-style: italic; color: var(--text-secondary); margin-bottom: 8px;">${sub.subtitle}</p>` : ''}
                
                <div style="background: var(--bg-secondary); padding: 12px; border-radius: 4px; border: 1px solid var(--border-light); font-family: var(--font-body); font-size: 0.86rem; line-height: 1.55; color: var(--text-primary); max-height: 160px; overflow-y: auto; margin-bottom: 12px;">
                    ${sub.content}
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
                    <button onclick="rejectEditorialSubmission('${sub.id}')" style="background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 7px 14px; border-radius: 20px; font-family: var(--font-ui); font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                        ✕ Başvuruyu Reddet / Sil
                    </button>
                    <button onclick="approveEditorialSubmission('${sub.id}')" style="background: var(--accent-color); border: 1px solid var(--accent-color); color: #fff; padding: 7px 18px; border-radius: 20px; font-family: var(--font-ui); font-size: 0.75rem; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 6px rgba(93, 26, 26, 0.3);">
                        ✓ Onayla ve Gazetede Yayınla
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

window.approveEditorialSubmission = async function(subId) {
    let subs = getEditorialSubmissions();
    const sub = subs.find(s => s.id === subId);
    if (!sub) return;
    
    // Create live article
    const newArt = {
        id: generateId(),
        title: sub.title,
        subtitle: sub.subtitle || "",
        author: sub.author,
        author_email: sub.author_email || null,
        user_id: sub.user_id || null,
        category: sub.category || "deneme",
        image: sub.image || "assets/typewriter_birds.webp",
        date: sub.date || formatDate(new Date()),
        readTime: sub.readTime || calculateReadTime(sub.content),
        claps: 0,
        comments: [],
        content: sub.content,
        corner_name: sub.corner_name || null
    };
    
    articles.push(newArt);
    try {
        localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
    } catch(e) {}
    
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient.from('articles').insert(newArt);
            await supabaseClient.from('editorial_submissions').delete().eq('id', subId);
        } catch(e) {
            console.warn("Supabase sync warning:", e);
        }
        clearSupabaseCache();
    }
    
    // Remove from local submissions
    subs = subs.filter(s => s.id !== subId);
    saveEditorialSubmissions(subs);
    
    showToast("✓ Eser onaylandı ve gazetede yayına alındı!");
    renderEditorialSubmissionsList();
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }
};

window.rejectEditorialSubmission = async function(subId) {
    let subs = getEditorialSubmissions();
    subs = subs.filter(s => s.id !== subId);
    saveEditorialSubmissions(subs);
    
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient.from('editorial_submissions').delete().eq('id', subId);
        } catch(e) {}
    }
    
    showToast("Başvuru silindi.");
    renderEditorialSubmissionsList();
};

// Event listeners for editorial inbox
document.getElementById("editorial-inbox-toggle")?.addEventListener("click", openEditorialInboxOverlay);
document.getElementById("dropdown-editorial-inbox-btn")?.addEventListener("click", () => {
    toggleProfileDropdown(true);
    openEditorialInboxOverlay();
});
document.getElementById("close-editorial-inbox")?.addEventListener("click", closeEditorialInboxOverlay);

// Close Reading modal on back button
closeReadingBtn.addEventListener("click", closeArticle);

// Supabase Configuration Overlay Elements
const supabaseOverlay = document.getElementById("supabase-overlay");
const closeSupabaseBtn = document.getElementById("close-supabase");
const supabaseConfigForm = document.getElementById("supabase-config-form");
const sbUrlInput = document.getElementById("sb-url");
const sbKeyInput = document.getElementById("sb-key");
const sbDisconnectBtn = document.getElementById("sb-disconnect-btn");
const supabaseConfigBtn = document.getElementById("supabase-config-btn");

console.log("Supabase config btn element:", supabaseConfigBtn);
console.log("Supabase overlay element:", supabaseOverlay);

if (supabaseConfigBtn && supabaseOverlay) {
    supabaseConfigBtn.addEventListener("click", () => {
        console.log("Supabase config button clicked!");
        // Populate inputs with current stored values
        sbUrlInput.value = localStorage.getItem("murekkep_supabase_url") || "";
        sbKeyInput.value = localStorage.getItem("murekkep_supabase_key") || "";
        
        // Show modal overlay
        supabaseOverlay.classList.remove("hidden");
        lockBodyScroll();
    });
}

if (closeSupabaseBtn && supabaseOverlay) {
    closeSupabaseBtn.addEventListener("click", () => {
        supabaseOverlay.classList.add("hidden");
        unlockBodyScroll();
    });
}

if (supabaseConfigForm) {
    supabaseConfigForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newUrl = sbUrlInput.value.trim();
        const newKey = sbKeyInput.value.trim();

        if (newUrl && newKey) {
            localStorage.setItem("murekkep_supabase_url", newUrl);
            localStorage.setItem("murekkep_supabase_key", newKey);
            clearSupabaseCache();
            
            // Re-initialize and reload
            initSupabase();
            loadData();

            // Close modal
            supabaseOverlay.classList.add("hidden");
            unlockBodyScroll();
        }
    });
}

if (sbDisconnectBtn) {
    sbDisconnectBtn.addEventListener("click", () => {
        // Clear stored credentials
        localStorage.removeItem("murekkep_supabase_url");
        localStorage.removeItem("murekkep_supabase_key");
        clearSupabaseCache();
        
        supabaseClient = null;
        isSupabaseConnected = false;
        updateSupabaseUI();
        loadLocalStorageFallback();
        
        currentPage = 1;
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }

        // Close modal
        supabaseOverlay.classList.add("hidden");
        unlockBodyScroll();
    });
}

// Article Clapping interaction
detailClapBtn.addEventListener("click", async () => {
    if (!currentUser) {
        openAuthModal();
        showToast("Alkışlamak için lütfen giriş yapın.");
        return;
    }
    if (!activeArticleId) return;

    const storageKey = `clapped_articles_${currentUser.id}`;
    let clappedArticles = JSON.parse(localStorage.getItem(storageKey) || "[]");
    
    let updatedClaps = 0;
    const clappedIndex = clappedArticles.indexOf(activeArticleId);

    if (clappedIndex === -1) {
        // Increment claps
        articles = articles.map(art => {
            if (art.id === activeArticleId) {
                art.claps += 1;
                updatedClaps = art.claps;
                detailClapCount.innerText = art.claps;
            }
            return art;
        });

        clappedArticles.push(activeArticleId);
        localStorage.setItem(storageKey, JSON.stringify(clappedArticles));

        if (isSupabaseConnected) {
            try {
                await supabaseClient
                    .from('articles')
                    .update({ claps: updatedClaps })
                    .eq('id', activeArticleId);
            } catch (err) {
                console.error("Error updating claps on Supabase:", err);
            }
            clearSupabaseCache();
        } else {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        }

        detailClapBtn.classList.add("clapped");
        
        // Clap notification trigger
        const clappedArt = articles.find(a => a.id === activeArticleId);
        if (clappedArt && clappedArt.author) {
            createNotification(clappedArt.author, 'clap', currentUser.username, `"${clappedArt.title}" isimli eserinizi alkışladı.`, { articleId: clappedArt.id });
        }
    } else {
        // Withdraw/Undo clap
        articles = articles.map(art => {
            if (art.id === activeArticleId) {
                art.claps = Math.max(0, art.claps - 1);
                updatedClaps = art.claps;
                detailClapCount.innerText = art.claps;
            }
            return art;
        });

        clappedArticles.splice(clappedIndex, 1);
        localStorage.setItem(storageKey, JSON.stringify(clappedArticles));

        if (isSupabaseConnected) {
            try {
                await supabaseClient
                    .from('articles')
                    .update({ claps: updatedClaps })
                    .eq('id', activeArticleId);
            } catch (err) {
                console.error("Error updating claps on Supabase:", err);
            }
            clearSupabaseCache();
        } else {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        }

        detailClapBtn.classList.remove("clapped");
        showToast("Alkış geri çekildi.");
    }

    // Dynamic feed refresh if in list view, or dynamic grid refresh
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }
});

// Submit Reader Comment
commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) {
        openAuthModal();
        showToast("Yorum yapabilmek için lütfen giriş yapın.");
        return;
    }
    if (!activeArticleId) return;

    const authorName = commentAuthorInput.value.trim();
    const commentText = commentTextInput.value.trim();
    
    if (!authorName || !commentText) return;

    // Profanity check
    let hasError = false;
    commentAuthorInput.classList.remove("profanity-error");
    commentTextInput.classList.remove("profanity-error");

    if (containsProfanity(authorName)) {
        commentAuthorInput.classList.add("profanity-error");
        hasError = true;
    }
    if (containsProfanity(commentText)) {
        commentTextInput.classList.add("profanity-error");
        hasError = true;
    }

    if (hasError) {
        showToast("❌ Yorumunuz veya kalem isminiz uygunsuz ifadeler (küfür/argo) içermektedir.");
        return;
    }

    // Yorum flood koruması: aynı makaleye 30 saniye içinde ikinci yorum yapılamaz
    const cdCheck = checkCommentCooldown(activeArticleId);
    if (!cdCheck.allowed) {
        showToast(`⏳ Yorum göndermek için ${cdCheck.secsLeft} saniye daha bekleyin.`);
        return;
    }


    const newComment = {
        id: "c_" + Date.now(),
        articleId: activeArticleId,
        author: authorName,
        text: commentText,
        date: formatDate(new Date())
    };

    comments.push(newComment);

    if (isSupabaseConnected) {
        try {
            await supabaseClient
                .from('comments')
                .insert({
                    id: newComment.id,
                    article_id: newComment.articleId,
                    author: newComment.author,
                    text: newComment.text,
                    date: newComment.date
                });
        } catch (err) {
            console.error("Error inserting comment on Supabase:", err);
        }
        clearSupabaseCache();
    } else {
        localStorage.setItem("murekkep_comments_v2", JSON.stringify(comments));
    }

    // Comment notification trigger
    const commentArt = articles.find(a => a.id === activeArticleId);
    if (commentArt && commentArt.author) {
        createNotification(commentArt.author, 'comment', currentUser.username, `"${commentArt.title}" isimli eserinize yorum yaptı.`, { articleId: commentArt.id });
    }

    // Reset inputs
    commentAuthorInput.value = "";
    commentTextInput.value = "";

    // Refresh views
    renderArticleComments(activeArticleId);
    
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }
});

// Publish New Article / Slot Content from Writer's Studio
publishForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const category = document.getElementById("post-category").value;
    const authorInput = document.getElementById("post-author");
    const author = currentUser ? (currentUser.username || (currentUser.email ? currentUser.email.split("@")[0] : "Anonim Yazar")) : (authorInput ? authorInput.value.trim() || "Anonim Yazar" : "Anonim Yazar");
    const editorOverlay = document.getElementById("editor-overlay");

    // 1. GÜNÜN SÖZÜ HANDLER
    if (category === "gunun-sozu") {
        const qTextInput = document.getElementById("quote-text-input");
        const qAuthInput = document.getElementById("quote-author-input");
        const quote = (qTextInput ? qTextInput.value.trim() : "") || document.getElementById("post-title")?.value.trim() || "";
        const quoteAuthor = (qAuthInput ? qAuthInput.value.trim() : "") || document.getElementById("post-subtitle")?.value.trim() || "Ahmet Hamdi Tanpınar";

        if (!quote) {
            showToast("⚠️ Lütfen günün sözünü / alıntısını yazın.");
            return;
        }

        if (containsProfanity(quote) || containsProfanity(quoteAuthor)) {
            showToast("❌ Girdiğiniz metin uygunsuz ifadeler içermektedir.");
            return;
        }

        editorNoteData = {
            quote: quote,
            desc: quoteAuthor
        };
        localStorage.setItem("murekkep_editor_note", JSON.stringify(editorNoteData));
        if (isSupabaseConnected && supabaseClient) {
            try {
                await supabaseClient.from('site_settings').upsert({ key: 'editor_note', value: editorNoteData });
            } catch(e) {
                console.warn("Error saving editor note to Supabase:", e);
            }
        }
        showToast("✓ Günün Sözü gazetede başarıyla güncellendi!");
        publishForm.reset();
        editorOverlay.classList.add("hidden");
        unlockBodyScroll();
        renderNewspaperGrid();
        return;
    }

    // 2. EDEBİ LÛGAT • GÜNÜN KELİMESİ HANDLER
    if (category === "lugat") {
        const wTitle = document.getElementById("word-title-input")?.value.trim() || document.getElementById("post-title")?.value.trim() || "";
        const wOrigin = document.getElementById("word-origin-input")?.value.trim() || document.getElementById("post-subtitle")?.value.trim() || "[Arapça • İsim]";
        const wMeaning = document.getElementById("word-meaning-input")?.value.trim() || document.getElementById("post-content")?.value.trim() || "";
        const wExample = document.getElementById("word-example-input")?.value.trim() || document.getElementById("post-corner-name")?.value.trim() || "";

        if (!wTitle || !wMeaning) {
            showToast("⚠️ Lütfen günün kelimesini ve anlamını eksiksiz yazın.");
            return;
        }

        if (containsProfanity(wTitle) || containsProfanity(wMeaning) || containsProfanity(wExample)) {
            showToast("❌ Girdiğiniz kelime veya izah uygunsuz ifadeler içermektedir.");
            return;
        }

        dailyWordData = {
            word: wTitle,
            origin: wOrigin,
            meaning: wMeaning,
            example: wExample ? (wExample.startsWith("“") ? wExample : `“${wExample}”`) : "“Gözlerinde eski günlerin tahassürü vardı...”"
        };
        localStorage.setItem("murekkep_daily_word", JSON.stringify(dailyWordData));
        if (isSupabaseConnected && supabaseClient) {
            try {
                await supabaseClient.from('site_settings').upsert({ key: 'daily_word', value: dailyWordData });
            } catch(e) {
                console.warn("Error saving daily word to Supabase:", e);
            }
        }
        showToast("✓ Edebi Lûgat / Günün Kelimesi güncellendi!");
        publishForm.reset();
        editorOverlay.classList.add("hidden");
        unlockBodyScroll();
        renderNewspaperGrid();
        return;
    }

    // 3. GÜNÜN ŞİİRİ HANDLER
    if (category === "siir") {
        const pTitle = document.getElementById("poem-title-input")?.value.trim() || document.getElementById("post-title")?.value.trim() || "";
        const pPoet = document.getElementById("poem-poet-input")?.value.trim() || author;
        const pContent = document.getElementById("poem-content-input")?.value.trim() || document.getElementById("post-content")?.value.trim() || "";

        if (!pTitle || !pContent) {
            showToast("⚠️ Lütfen şiirin başlığını ve dizelerini yazın.");
            return;
        }

        if (containsProfanity(pTitle) || containsProfanity(pPoet) || containsProfanity(pContent)) {
            showToast("❌ Şiiriniz uygunsuz ifadeler içermektedir.");
            return;
        }

        const formattedPoem = pContent
            .split(/\n\s*\n/)
            .map(stanza => `<p style="font-style: italic; margin-bottom: 16px; line-height: 1.8;">${stanza.replace(/\n/g, "<br>")}</p>`)
            .join("\n");

        const poemArticle = {
            id: generateId(),
            title: pTitle,
            subtitle: `${pPoet} • Günün Şiiri`,
            author: pPoet,
            author_email: currentUser ? currentUser.email : null,
            user_id: currentUser ? currentUser.id : null,
            category: "siir",
            image: "assets/typewriter_birds.webp",
            date: formatDate(new Date()),
            readTime: "2 dk",
            claps: 0,
            comments: [],
            content: formattedPoem,
            corner_name: "GÜNÜN ŞİİRİ"
        };

        articles.push(poemArticle);
        try {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        } catch(e) {}

        if (isSupabaseConnected) {
            try {
                await supabaseClient.from('articles').insert({
                    id: poemArticle.id,
                    title: poemArticle.title,
                    subtitle: poemArticle.subtitle,
                    author: poemArticle.author,
                    author_email: poemArticle.author_email,
                    user_id: poemArticle.user_id,
                    category: poemArticle.category,
                    image: poemArticle.image,
                    date: poemArticle.date,
                    read_time: poemArticle.readTime,
                    claps: poemArticle.claps,
                    content: poemArticle.content,
                    corner_name: poemArticle.corner_name
                });
            } catch(e) {}
        }

        showToast("✓ Günün Şiiri gazetede yayınlandı!");
        publishForm.reset();
        editorOverlay.classList.add("hidden");
        unlockBodyScroll();
        renderNewspaperGrid();
        return;
    }

    // 4. STANDART YAZI HANDLER (MANŞET, KÖŞE YAZISI, DENEME, GENÇ KALEMLER, ÖYKÜ, KİTAPLIK, KÜLTÜR-SANAT)
    const titleInput = document.getElementById("post-title");
    const subtitleInput = document.getElementById("post-subtitle");
    const contentInput = document.getElementById("post-content");
    const cornerNameInput = document.getElementById("post-corner-name");

    const title = titleInput ? titleInput.value.trim() : "";
    const subtitle = subtitleInput ? subtitleInput.value.trim() : "";
    const contentText = contentInput ? contentInput.value.trim() : "";
    const cornerName = cornerNameInput ? cornerNameInput.value.trim() : "";
    const image = (editingArticleId && articles.find(a => a.id === editingArticleId)?.image) || "assets/typewriter_birds.webp";

    if (!title || !subtitle || !contentText) {
        showToast("⚠️ Lütfen başlık, özet ve yazı içeriğini doldurun.");
        return;
    }

    // Reset previous error markings
    if (titleInput) titleInput.classList.remove("profanity-error");
    if (subtitleInput) subtitleInput.classList.remove("profanity-error");
    if (contentInput) contentInput.classList.remove("profanity-error");
    const editorWrapper = document.getElementById("post-editor-wrapper");
    if (editorWrapper) editorWrapper.classList.remove("profanity-error");
    if (cornerNameInput) cornerNameInput.classList.remove("profanity-error");

    let hasError = false;
    if (containsProfanity(title)) {
        if (titleInput) titleInput.classList.add("profanity-error");
        hasError = true;
    }
    if (containsProfanity(subtitle)) {
        if (subtitleInput) subtitleInput.classList.add("profanity-error");
        hasError = true;
    }
    if (containsProfanity(author)) {
        hasError = true;
    }
    
    const plainTextForFilter = contentText.replace(/<[^>]*>/g, "");
    if (containsProfanity(plainTextForFilter)) {
        if (contentInput) contentInput.classList.add("profanity-error");
        if (editorWrapper) editorWrapper.classList.add("profanity-error");
        hasError = true;
    }
    if (cornerName && containsProfanity(cornerName)) {
        if (cornerNameInput) cornerNameInput.classList.add("profanity-error");
        hasError = true;
    }

    if (hasError) {
        showToast("❌ Yazınız topluluk kurallarına aykırı ifadeler (küfür/argo) içermektedir. Lütfen kelimelerinizi gözden geçirin.");
        return;
    }

    let contentHTML = contentText;
    if (!contentHTML.includes("<p>") && !contentHTML.includes("<div") && !contentHTML.includes("<span")) {
        contentHTML = contentText
            .split(/\n\s*\n/)
            .map(para => `<p>${para.replace(/\n/g, "<br>")}</p>`)
            .join("\n");
    }

    if (editingArticleId) {
        const article = articles.find(a => a.id === editingArticleId);
        if (!article) return;
        
        article.title = title;
        article.subtitle = subtitle;
        article.author = author;
        if (currentUser && currentUser.email) article.author_email = currentUser.email;
        if (currentUser && currentUser.id) article.user_id = currentUser.id;
        article.category = category;
        article.image = image;
        article.content = contentHTML;
        article.corner_name = cornerName || null;
        article.readTime = calculateReadTime(contentHTML);
        
        // Always save to LocalStorage immediately
        try {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        } catch (e) {}

        if (isSupabaseConnected) {
            try {
                const { error } = await supabaseClient
                    .from('articles')
                    .update({
                        title: article.title,
                        subtitle: article.subtitle,
                        author: article.author,
                        author_email: article.author_email || null,
                        user_id: article.user_id || null,
                        category: article.category,
                        image: article.image,
                        content: article.content,
                        corner_name: article.corner_name,
                        read_time: article.readTime
                    })
                    .eq('id', editingArticleId);
                if (error) console.warn("Supabase article update warning:", error);
            } catch (err) {
                console.error("Error updating article on Supabase:", err);
            }
            clearSupabaseCache();
        }
        
        showToast("Yazı başarıyla güncellendi.");
        editingArticleId = null;
        
        // Reset overlay titles
        const studioTitle = document.querySelector(".editor-studio-header h2");
        if (studioTitle) studioTitle.innerText = "Yazarlık Stüdyosu";
        const studioDesc = document.querySelector(".editor-studio-header p");
        if (studioDesc) studioDesc.innerText = "Edebiyat hareketinin bir parçası olun. Yazınızı kaleme alın ve Mürekkep sayfalarında yayınlayın.";
        const submitBtn = document.querySelector(".btn-publish-submit");
        if (submitBtn) submitBtn.innerText = "Gazetede Yayınla";
        
        publishForm.reset();
        editorOverlay.classList.add("hidden");
        unlockBodyScroll();
        
        // Refresh reading view and grid
        openArticle(article.id);
        
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }
        return;
    }

    const isEditorAction = isEditorModeActive || (currentUser && currentUser.isEditor);

    if (!isEditorAction) {
        // Save as pending editorial submission
        const submission = {
            id: 'sub_' + Date.now(),
            title: title,
            subtitle: subtitle,
            author: author,
            author_email: currentUser ? currentUser.email : null,
            user_id: currentUser ? currentUser.id : null,
            category: category,
            image: image,
            date: formatDate(new Date()),
            readTime: calculateReadTime(contentHTML),
            content: contentHTML,
            corner_name: cornerName || null,
            status: 'pending'
        };

        try {
            const subs = JSON.parse(localStorage.getItem("murekkep_editorial_submissions") || "[]");
            subs.push(submission);
            localStorage.setItem("murekkep_editorial_submissions", JSON.stringify(subs));
        } catch (e) {}

        if (isSupabaseConnected && supabaseClient) {
            try {
                await supabaseClient.from('editorial_submissions').insert(submission);
            } catch (err) {
                console.warn("Could not insert submission to Supabase:", err);
            }
        }

        showToast("🖋️ Başvurunuz Yayın Kuruluna iletildi. Editör incelemesi ve onayından sonra gazetede yayınlanacaktır.");
        publishForm.reset();
        editorOverlay.classList.add("hidden");
        unlockBodyScroll();
        return;
    }

    // Direct publishing by Editor
    const newArticle = {
        id: generateId(),
        title: title,
        subtitle: subtitle,
        author: author,
        author_email: currentUser ? currentUser.email : null,
        user_id: currentUser ? currentUser.id : null,
        category: category,
        image: image,
        date: formatDate(new Date()),
        readTime: calculateReadTime(contentHTML),
        claps: 0,
        comments: [],
        content: contentHTML,
        corner_name: cornerName || (category === 'manset' ? "EDEBİYAT & DÜŞÜNCE • HAFTANIN MANŞETİ" : null)
    };

    articles.push(newArticle);

    try {
        localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
    } catch (e) {}

    if (isSupabaseConnected) {
        try {
            const fullPayload = {
                id: newArticle.id,
                title: newArticle.title,
                subtitle: newArticle.subtitle,
                author: newArticle.author,
                author_email: newArticle.author_email,
                user_id: newArticle.user_id,
                category: newArticle.category,
                image: newArticle.image,
                date: newArticle.date,
                read_time: newArticle.readTime,
                claps: newArticle.claps,
                content: newArticle.content,
                corner_name: newArticle.corner_name
            };
            const { error } = await supabaseClient
                .from('articles')
                .insert(fullPayload);
            if (error) {
                console.warn("Supabase article insert warning, trying core fields fallback:", error);
                const corePayload = {
                    id: newArticle.id,
                    title: newArticle.title,
                    subtitle: newArticle.subtitle,
                    author: newArticle.author,
                    category: newArticle.category,
                    image: newArticle.image,
                    date: newArticle.date,
                    read_time: newArticle.readTime,
                    claps: newArticle.claps,
                    content: newArticle.content
                };
                await supabaseClient
                    .from('articles')
                    .insert(corePayload);
            }
        } catch (err) {
            console.error("Error inserting article on Supabase:", err);
        }
        clearSupabaseCache();
    }

    showToast("✓ Eser editör yetkisiyle doğrudan yayına alındı.");

    // Reset and hide form
    publishForm.reset();
    editorOverlay.classList.add("hidden");
    unlockBodyScroll();

    // Navigate to the page where the new article appears
    // New model: position in overall clap-sorted list / slots per page = page number
    if (currentCategoryFilter === "all") {
        const sortedNow = getSortedArticles();
        const allSlots = [
            ...(layoutConfig.col1 || []),
            ...(layoutConfig.col2 || []),
            ...(layoutConfig.col3 || [])
        ];
        const slotCount = Math.max(1, allSlots.filter(s => s.type === 'category').length);
        const artGlobalIdx = sortedNow.findIndex(a => a.id === newArticle.id);
        const targetPage = artGlobalIdx >= 0 ? Math.floor(artGlobalIdx / slotCount) + 1 : 1;
        currentPage = targetPage;
        renderNewspaperGrid();
    }

    updateAuthUI();

    // Dynamic alert/toast
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
    alertDiv.innerText = "Yazınız Mürekkep Gazetesi'nde başarıyla yayınlandı!";
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = "0";
        alertDiv.style.transition = "opacity 0.5s ease";
        setTimeout(() => alertDiv.remove(), 500);
    }, 4000);
});

// Global Category Navigation logic
function filterCategory(cat) {
    currentCategoryFilter = cat;
    currentPage = 1; // Reset to page 1 on category filter changes

    // Track category/home page view
    if (cat === "all") {
        trackPageVisit("Ana Sayfa");
    } else {
        trackPageVisit("Kategori: " + cat, null, cat);
    }
    
    document.querySelectorAll(".nav-filter").forEach(btn => {
        if (btn.getAttribute("data-category") === cat) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    const paginationEl = document.getElementById("newspaper-pagination");

    if (cat === "all") {
        renderNewspaperGrid();
    } else {
        if (paginationEl) paginationEl.classList.add("hidden");
        renderCategoryFeed(cat);
    }
}

// Boot Application
async function bootApp() {
    // ── PRIORITY: Check for any authentication errors in URL (e.g. expired OTP links)
    let _hasError = false;
    if (typeof checkUrlForAuthErrors === "function") {
        _hasError = checkUrlForAuthErrors();
    }

    if (_hasError) {
        initSupabase();
    } else {
        // ── PRIORITY: Detect Supabase password recovery redirect ──────────────────
        // The PASSWORD_RECOVERY event fires during Supabase client init (very early),
        // so we check the URL hash directly here, before any listeners are set up.
        const _recoveryHash = window.location.hash || "";
        const _recoverySearch = window.location.search || "";
        const _isRecoveryMode = (
            _recoveryHash.includes("type=recovery") ||
            _recoverySearch.includes("type=recovery") ||
            // Supabase v2 puts tokens in the fragment
            (_recoveryHash.includes("access_token") && _recoveryHash.includes("recovery"))
        );

        // Initialize Supabase FIRST so async load functions can use it
        initSupabase();

        if (_isRecoveryMode) {
            setTimeout(() => {
                if (typeof openUpdatePasswordUI === "function") {
                    openUpdatePasswordUI();
                }
            }, 300);
        }
    }

    // One-time cleanup to remove cached/mock users as requested by the administrator
    if (!localStorage.getItem("murekkep_cleanup_v1")) {
        localStorage.removeItem("murekkep_mock_users");
        localStorage.removeItem("murekkep_registered_users");
        localStorage.removeItem("murekkep_user_roles");
        localStorage.removeItem("murekkep_supabase_cache");
        localStorage.setItem("murekkep_cleanup_v1", "true");
    }

    // Reset layout config helper if URL contains ?reset_layout=true or ?clear_cache=true
    if (window.location.search.includes("reset_layout=true") || window.location.search.includes("clear_cache=true")) {
        try {
            // Remove all local storage keys containing "murekkep" to completely clear cache and fallback data
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.includes("murekkep")) {
                    localStorage.removeItem(key);
                }
            }
            layoutConfig = JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
            if (isSupabaseConnected && supabaseClient && window.location.search.includes("reset_layout=true")) {
                await supabaseClient.from('site_settings').upsert({ key: 'layout_config_v4', value: DEFAULT_LAYOUT });
            }
            console.log("All Mürekkep localStorage keys cleared and layout reset successfully.");
        } catch (e) {
            console.error("Failed to reset/clear layout:", e);
        }
        window.location.href = window.location.origin + window.location.pathname;
        return;
    }

    // Now load site settings (Supabase-first, localStorage fallback)
    await Promise.all([
        loadCategories(),
        loadLayoutConfig(),
        loadEditorNoteData(),
        loadAuthorProfiles(),
        loadAuthorFollowers(),
        loadUserRoles()
    ]);

    await initAuth();

    renderCategoriesNav();
    renderCategoriesDropdown();
    renderCustomCategoriesList();
    populateEditorSettingsUI();
    renderLayoutConfigurator();

    const addCatBtn = document.getElementById("add-category-btn");
    if (addCatBtn) {
        addCatBtn.addEventListener("click", window.addCustomCategory);
    }

    const adminCreateUserBtn = document.getElementById("admin-create-user-btn");
    if (adminCreateUserBtn) {
        adminCreateUserBtn.addEventListener("click", window.createUserInAdmin);
    }

    const saveLayBtn = document.getElementById("save-layout-btn");
    if (saveLayBtn) {
        saveLayBtn.addEventListener("click", window.saveLayoutFromUI);
    }

    loadData();
    trackPageVisit("Ana Sayfa");
    initProfileCustomizer();
    initAuthorSearch();
    initNotifications();
    
    // Category Navigation Click Listeners
    document.querySelectorAll(".nav-filter").forEach(btn => {
        btn.addEventListener("click", () => {
            const cat = btn.getAttribute("data-category");
            filterCategory(cat);
        });
    });

    // Auth Event Listeners
    if (loginToggleBtn) {
        loginToggleBtn.addEventListener("click", openAuthModal);
    }
    if (closeAuthBtn) {
        closeAuthBtn.addEventListener("click", closeAuthModal);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            toggleProfileDropdown(true);
            signOutUser();
        });
    }

    // Legal Modal Event Listeners (Sekmeli Yasal Belgeler)
    const legalOverlay = document.getElementById("legal-overlay");
    const closeLegalModal = document.getElementById("close-legal-modal");
    const legalAcceptBtn = document.getElementById("legal-accept-btn");
    const legalTabBtns = document.querySelectorAll(".legal-tab-btn");
    const legalPanels = document.querySelectorAll(".legal-panel");

    // Open legal modal with specific tab active
    function openLegalModal(tabName) {
        if (!legalOverlay) return;
        legalOverlay.classList.remove("hidden");
        
        // Activate specified tab
        legalTabBtns.forEach(btn => {
            if (btn.getAttribute("data-legal-tab") === tabName) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // Show specified panel
        legalPanels.forEach(panel => {
            if (panel.id === `legal-panel-${tabName}`) {
                panel.classList.remove("hidden");
            } else {
                panel.classList.add("hidden");
            }
        });
    }

    // Attach listeners to all legal trigger links (footer and register form)
    document.querySelectorAll(".legal-trigger").forEach(trigger => {
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tabName = trigger.getAttribute("data-tab") || "terms";
            openLegalModal(tabName);
        });
    });

    // Tab switching functionality
    legalTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-legal-tab");
            
            legalTabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            legalPanels.forEach(p => {
                if (p.id === `legal-panel-${targetTab}`) {
                    p.classList.remove("hidden");
                } else {
                    p.classList.add("hidden");
                }
            });
        });
    });

    // Close buttons
    if (closeLegalModal) {
        closeLegalModal.addEventListener("click", () => {
            if (legalOverlay) legalOverlay.classList.add("hidden");
        });
    }

    if (legalAcceptBtn) {
        legalAcceptBtn.addEventListener("click", () => {
            if (legalOverlay) legalOverlay.classList.add("hidden");
            // Auto check the registration KVKK checkbox if user accepted
            const kvkkCheckbox = document.getElementById("register-kvkk");
            if (kvkkCheckbox) kvkkCheckbox.checked = true;
        });
    }

    if (legalOverlay) {
        legalOverlay.addEventListener("click", (e) => {
            if (e.target === legalOverlay) {
                legalOverlay.classList.add("hidden");
            }
        });
    }

    // ESC key closes the legal modal
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && legalOverlay && !legalOverlay.classList.contains("hidden")) {
            legalOverlay.classList.add("hidden");
        }
    });

    // Forgot Password flow
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const sendResetBtn = document.getElementById("send-reset-btn");
    const backToLoginBtn = document.getElementById("back-to-login-btn");

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", () => {
            const loginForm = document.getElementById("login-form");
            const resetForm = document.getElementById("reset-form");
            const loginEmail = document.getElementById("login-email");
            const resetEmail = document.getElementById("reset-email");
            if (loginForm) loginForm.classList.add("hidden");
            if (resetForm) resetForm.classList.remove("hidden");
            // Pre-fill email if already typed
            if (resetEmail && loginEmail && loginEmail.value) {
                resetEmail.value = loginEmail.value;
            }
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener("click", () => {
            const loginForm = document.getElementById("login-form");
            const resetForm = document.getElementById("reset-form");
            if (resetForm) resetForm.classList.add("hidden");
            if (loginForm) loginForm.classList.remove("hidden");
        });
    }

    if (sendResetBtn) {
        sendResetBtn.addEventListener("click", () => {
            const resetEmail = document.getElementById("reset-email");
            if (resetEmail) sendPasswordReset(resetEmail.value.trim());
        });
    }

    // Handle password recovery redirect (when user clicks email link)
    handlePasswordRecovery();

    // Profile Dropdown toggle
    if (profileAvatarBtn) {
        profileAvatarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleProfileDropdown();
        });
    }

    // Dropdown: Kaydedilenler
    if (dropdownBookmarksBtn) {
        dropdownBookmarksBtn.addEventListener("click", () => {
            toggleProfileDropdown(true);
            filterCategory("bookmarks");
        });
    }

    // Dropdown: Ayarlar
    if (dropdownSettingsBtn) {
        dropdownSettingsBtn.addEventListener("click", () => {
            toggleProfileDropdown(true);
            openSettingsModal();
        });
    }

    // Close dropdown when clicking anywhere outside
    document.addEventListener("click", (e) => {
        if (profileDropdownMenu && !profileDropdownMenu.classList.contains("hidden")) {
            if (!userProfileSection.contains(e.target)) {
                toggleProfileDropdown(true);
            }
        }
    });

    // Close dropdown on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            toggleProfileDropdown(true);
        }
    });

    // Tab switching inside auth modal
    if (tabLogin) {
        tabLogin.addEventListener("click", () => switchAuthTab('login'));
    }
    if (tabRegister) {
        tabRegister.addEventListener("click", () => switchAuthTab('register'));
    }

    // Close auth modal when clicking the dark backdrop
    if (authOverlay) {
        authOverlay.addEventListener("click", (e) => {
            if (e.target === authOverlay) closeAuthModal();
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value.trim();
            if (email && password) {
                signInUser(email, password);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const kvkkCheckbox = document.getElementById("register-kvkk");
            if (kvkkCheckbox && !kvkkCheckbox.checked) {
                showToast("⚠️ Lütfen yasal sözleşmeleri ve KVKK metnini onaylayın.");
                return;
            }

            const username = document.getElementById("register-username").value.trim();
            const email = document.getElementById("register-email").value.trim();
            const password = document.getElementById("register-password").value.trim();
            if (username && email && password) {
                signUpUser(email, password, username);
            }
        });
    }

    const updatePasswordForm = document.getElementById("update-password-form");
    if (updatePasswordForm) {
        updatePasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newPass = document.getElementById("update-password").value;
            const newPassConfirm = document.getElementById("update-password-confirm").value;

            if (newPass.length < 6) {
                showToast("❌ Şifre en az 6 karakter olmalıdır.");
                return;
            }

            if (newPass !== newPassConfirm) {
                showToast("❌ Girdiğiniz şifreler birbiriyle eşleşmiyor.");
                return;
            }

            if (!isSupabaseConnected || !supabaseClient) {
                showToast("❌ Şifre sıfırlama için internet bağlantısı gereklidir.");
                return;
            }

            try {
                const { error } = await supabaseClient.auth.updateUser({ password: newPass });
                if (error) throw error;

                showToast("✅ Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.");
                
                // Reset fields
                document.getElementById("update-password").value = "";
                document.getElementById("update-password-confirm").value = "";

                // Close and transition to login
                updatePasswordForm.classList.add("hidden");
                const authTabs = document.querySelector(".auth-tabs");
                if (authTabs) authTabs.style.display = "flex";
                
                const loginForm = document.getElementById("login-form");
                if (loginForm) loginForm.classList.remove("hidden");
                switchAuthTab("login");
                
                // Clear the hash and query parameters from the URL so reload doesn't trigger recovery again
                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, "", window.location.pathname);
                }

                await supabaseClient.auth.signOut();
                updateAuthUI();
                closeAuthModal();
            } catch (err) {
                console.error("Password update error:", err);
                showToast("❌ Şifre güncellenemedi: " + (err.message || "Bilinmeyen hata"));
            }
        });
    }

    if (articleSaveBtn) {
        articleSaveBtn.addEventListener("click", () => {
            if (!currentUser) {
                openAuthModal();
                showToast("Yazıyı kaydetmek için lütfen giriş yapın.");
                return;
            }
            if (!activeArticleId) return;

            const idx = savedArticleIds.indexOf(activeArticleId);
            if (idx === -1) {
                savedArticleIds.push(activeArticleId);
                showToast("Yazı kaydedildi!");
            } else {
                savedArticleIds.splice(idx, 1);
                showToast("Yazı kaydedilenlerden çıkarıldı.");
            }
            saveBookmarks();
        });
    }

    // Article Share Button
    const articleShareBtn = document.getElementById("article-share-btn");
    if (articleShareBtn) {
        articleShareBtn.addEventListener("click", () => {
            if (activeArticleId) {
                openShareModal(activeArticleId);
            }
        });
    }

    // Article Editor Buttons in Reader Overlay
    const articleEditorApproveBtn = document.getElementById("article-editor-approve-btn");
    if (articleEditorApproveBtn) {
        articleEditorApproveBtn.addEventListener("click", (e) => {
            if (activeArticleId) {
                window.approveArticleClick(activeArticleId, e);
            }
        });
    }
    const articleEditorDeleteBtn = document.getElementById("article-editor-delete-btn");
    if (articleEditorDeleteBtn) {
        articleEditorDeleteBtn.addEventListener("click", (e) => {
            if (activeArticleId) {
                window.deleteArticleClick(activeArticleId, e);
            }
        });
    }

    // Initialize Share Overlay
    initShareOverlay();

    // Initialize Spotify-style text selection popup
    initTextSelectionPopup();

    // Settings Overlay Event Listeners

    const settingsOverlay = document.getElementById("settings-overlay");
    const closeSettingsBtn = document.getElementById("close-settings");
    const settingsThemeToggle = document.getElementById("settings-theme-toggle");
    const settingsSaveNameBtn = document.getElementById("settings-save-name-btn");
    const settingsBookmarksBtn = document.getElementById("settings-bookmarks-btn");
    const settingsLogoutBtn = document.getElementById("settings-logout-btn");

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener("click", closeSettingsModal);
    }
    if (settingsOverlay) {
        settingsOverlay.addEventListener("click", (e) => {
            if (e.target === settingsOverlay) closeSettingsModal();
        });
    }

    // Profile Tab Switching Event Listeners
    const profileTabBtns = document.querySelectorAll(".profile-tab-btn");
    profileTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.getAttribute("data-tab");
            window.switchProfileTab(tabName);
        });
    });

    // Theme toggle inside settings (synced with main theme button)
    if (settingsThemeToggle) {
        settingsThemeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            const newTheme = currentTheme === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("murekkep_theme", newTheme);
            // Sync icons on main theme button
            const sunIcon = document.querySelector(".icon-sun");
            const moonIcon = document.querySelector(".icon-moon");
            if (newTheme === "dark") {
                if (sunIcon) sunIcon.classList.remove("hidden");
                if (moonIcon) moonIcon.classList.add("hidden");
                settingsThemeToggle.classList.add("active");
            } else {
                if (sunIcon) sunIcon.classList.add("hidden");
                if (moonIcon) moonIcon.classList.remove("hidden");
                settingsThemeToggle.classList.remove("active");
            }
        });
    }

    // Username update
    if (settingsSaveNameBtn) {
        settingsSaveNameBtn.addEventListener("click", async () => {
            const input = document.getElementById("settings-username-input");
            if (!input || !currentUser) return;
            const newName = input.value.trim();
            if (!newName) return;

            const oldName = currentUser.username;
            await performUsernameMigration(oldName, newName);

            updateAuthUI();
            // Re-populate profile labels and stats
            renderProfileTabUI();

            showToast("✅ Kalem isminiz güncellendi!");
        });
    }

    // Go to bookmarks from settings
    if (settingsBookmarksBtn) {
        settingsBookmarksBtn.addEventListener("click", () => {
            closeSettingsModal();
            filterCategory("bookmarks");
        });
    }

    // Logout from settings
    if (settingsLogoutBtn) {
        settingsLogoutBtn.addEventListener("click", () => {
            closeSettingsModal();
            signOutUser();
        });
    }

    // Delete account permanently
    const settingsDeleteAccountBtn = document.getElementById("settings-delete-account-btn");
    if (settingsDeleteAccountBtn) {
        settingsDeleteAccountBtn.addEventListener("click", () => {
            deleteCurrentUserAccount();
        });
    }

    // Editor Mode toggle switch in settings modal
    const settingsEditorToggle = document.getElementById("settings-editor-toggle");
    if (settingsEditorToggle) {
        settingsEditorToggle.addEventListener("click", () => {
            if (currentUser && currentUser.isEditor) {
                isEditorModeActive = !isEditorModeActive;
                updateEditorBannerUI();
                
                // Refresh active view to show/hide moderation controls
                if (currentCategoryFilter === "all") {
                    renderNewspaperGrid();
                } else {
                    renderCategoryFeed(currentCategoryFilter);
                }

                // Refresh active profile modal if open
                refreshOpenProfileModal();

                // Refresh reader overlay buttons if open
                if (activeArticleId) {
                    const approveBtn = document.getElementById("article-editor-approve-btn");
                    const deleteBtn = document.getElementById("article-editor-delete-btn");
                    if (approveBtn && deleteBtn) {
                        if (isEditorModeActive) {
                            approveBtn.classList.remove("hidden");
                            deleteBtn.classList.remove("hidden");
                        } else {
                            approveBtn.classList.add("hidden");
                            deleteBtn.classList.add("hidden");
                        }
                    }
                }
                
                showToast(isEditorModeActive ? "🛡️ Editör Modu Aktif" : "Editör Modu Kapatıldı");
            }
        });
    }

    // Article Report Button in reader overlay
    const articleReportBtn = document.getElementById("article-report-btn");
    if (articleReportBtn) {
        articleReportBtn.addEventListener("click", () => {
            if (activeArticleId) {
                window.reportArticleClick(activeArticleId);
            }
        });
    }

    // Set app booted flag for SEO routing cleanup safety
    isAppBooted = true;
}


// ── RICH TEXT WYSIWYG EDITOR INITIALIZATION ──────────────────
function initWysiwygEditor() {
    const editor = document.getElementById("post-editor");
    const textarea = document.getElementById("post-content");
    const wrapper = document.getElementById("post-editor-wrapper");
    const publishForm = document.getElementById("publish-form");
    const fontSelect = document.getElementById("editor-font-family");
    
    if (!editor || !textarea) return;

    // Helper to sync editor content to hidden textarea
    function syncEditorContent() {
        textarea.value = editor.innerHTML;
    }

    // Input events to update the hidden textarea in real-time
    editor.addEventListener("input", syncEditorContent);
    editor.addEventListener("blur", syncEditorContent);

    // Sync form resets (clears editor div as well)
    if (publishForm) {
        publishForm.addEventListener("reset", () => {
            editor.innerHTML = "";
            textarea.value = "";
            if (wrapper) wrapper.classList.remove("profanity-error");
            updateToolbarButtonStates();
        });
    }

    // Font Family dropdown selection
    if (fontSelect) {
        fontSelect.addEventListener("change", function () {
            const font = this.value;
            editor.focus();
            document.execCommand("fontName", false, font);
            syncEditorContent();
        });
    }

    // Toolbar formatting buttons
    document.querySelectorAll(".editor-toolbar .toolbar-btn").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const command = this.getAttribute("data-command");
            if (!command) return;

            editor.focus();

            if (command === "removeFormat") {
                document.execCommand("removeFormat", false, null);
                // Reset to default font-family Lora
                document.execCommand("fontName", false, "'Lora', Georgia, serif");
                if (fontSelect) fontSelect.selectedIndex = 0;
            } else {
                document.execCommand(command, false, null);
            }

            updateToolbarButtonStates();
            syncEditorContent();
        });
    });

    // Update active toolbar button states based on text selection
    function updateToolbarButtonStates() {
        document.querySelectorAll(".editor-toolbar .toolbar-btn[data-command]").forEach(btn => {
            const command = btn.getAttribute("data-command");
            if (command === "removeFormat") return;
            try {
                if (document.queryCommandState(command)) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            } catch (e) {}
        });

        // Update selected option in font-family dropdown
        if (fontSelect) {
            try {
                const fontName = document.queryCommandValue("fontName");
                if (fontName) {
                    const cleanFont = fontName.replace(/['"]/g, "").trim().toLowerCase();
                    let matched = false;
                    for (let option of fontSelect.options) {
                        const optVal = option.value.replace(/['"]/g, "").trim().toLowerCase();
                        if (optVal.includes(cleanFont) || cleanFont.includes(optVal)) {
                            fontSelect.value = option.value;
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        fontSelect.selectedIndex = 0; // Fallback to Lora
                    }
                }
            } catch (e) {}
        }
    }

    // Listeners for selection & focus changes to update toolbar state dynamically
    editor.addEventListener("keyup", updateToolbarButtonStates);
    editor.addEventListener("mouseup", updateToolbarButtonStates);
    editor.addEventListener("focus", updateToolbarButtonStates);

    // Listen for category selection changes to show slot-specific form sections
    const catSelect = document.getElementById("post-category");
    if (catSelect) {
        catSelect.addEventListener("change", function() {
            updateSlotFormSections(this.value);
        });
        updateSlotFormSections(catSelect.value);
    }
}


// ===========================================================