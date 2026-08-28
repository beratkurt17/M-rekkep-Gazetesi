// =============================================
// AUTHOR PROFILES & LITERARY JOURNEY
// =============================================

// =============================================
// GLOBAL MODERATION HELPER FUNCTIONS
// =============================================

window.reportArticleClick = function(id) {
    if (!currentUser) {
        openAuthModal();
        showToast("Şikayet etmek için lütfen giriş yapın.");
        return;
    }
    const reports = reportArticle(id);
    showToast("Yazı şikayet edildi. Katkınız için teşekkürler.");
    
    const reportBtn = document.getElementById("article-report-btn");
    if (reportBtn) reportBtn.classList.add("reported");
    
    // Refresh view
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }
};

/** Helper: if the author profile modal is open for a given author, re-render it. */
function refreshOpenProfileModal() {
    const modal = document.getElementById('author-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    const currentName = document.getElementById('author-modal-name')?.innerText;
    if (currentName) {
        // Remember active tab
        const activeTabBtn = document.querySelector('#author-modal .profile-tab-btn.active');
        const activeTab = activeTabBtn ? activeTabBtn.dataset.authorTab : 'articles';
        window.openAuthorProfile(currentName, activeTab);
    }
}

window.approveArticleClick = function(id, event) {
    if (event) event.stopPropagation();
    resetArticleReports(id);
    showToast("✓ Yazı güvenli olarak onaylandı.");

    // Refresh main grid
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }

    // Refresh reading overlay report button if applicable
    if (activeArticleId === id) {
        const reportBtn = document.getElementById("article-report-btn");
        if (reportBtn) reportBtn.classList.remove("reported");
    }

    // Refresh profile modal if open
    refreshOpenProfileModal();
};

window.deleteArticleClick = function(id, event) {
    if (event) event.stopPropagation();

    // Find article author before removing
    const targetArt = articles.find(a => a.id === id);
    if (!targetArt) return;
    const deletedAuthor = targetArt.author;

    // Check permission: must be admin OR the author of this article
    const isOwnArticle = currentUser && currentUser.username &&
        currentUser.username.trim().toLowerCase() === deletedAuthor.trim().toLowerCase();

    if (!isEditorModeActive && !isOwnArticle) {
        showToast("✕ Bu işlemi yapmak için yetkiniz yok.");
        return;
    }

    if (!confirm("Bu yazıyı kalıcı olarak silmek istediğinizden emin misiniz?")) {
        return;
    }

    // Remove from local array
    articles = articles.filter(art => art.id !== id);

    // Always save to LocalStorage immediately
    try {
        localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
    } catch(e) {}

    if (isSupabaseConnected) {
        supabaseClient.from('articles').delete().eq('id', id).then(({ error }) => {
            if (error) console.error("Error deleting article from Supabase:", error);
        });
        clearSupabaseCache();
    }

    showToast("✕ Yazı silindi.");

    // Close reader overlay if deleted article was open
    if (activeArticleId === id) {
        closeArticle();
    }

    // Refresh main grid
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }

    // Refresh profile modal if open (article list count will update)
    refreshOpenProfileModal();
};

window.reportCommentClick = function(id, articleId, event) {
    if (event) event.stopPropagation();
    if (!currentUser) {
        openAuthModal();
        showToast("Şikayet etmek için lütfen giriş yapın.");
        return;
    }
    reportComment(id);
    showToast("Yorum şikayet edildi.");
    renderArticleComments(articleId);
};

window.approveCommentClick = function(id, articleId, event) {
    if (event) event.stopPropagation();
    resetCommentReports(id);
    showToast("Yorum onaylandı.");
    renderArticleComments(articleId);
};

window.deleteCommentClick = function(id, articleId, event) {
    if (event) event.stopPropagation();
    
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    const article = articles.find(a => a.id === articleId);
    
    const isOwnComment = currentUser && (
        comment.author === currentUser.username || 
        comment.author === (currentUser.email ? currentUser.email.split("@")[0] : "")
    );
    
    const isCommentOnOwnArticle = currentUser && article && article.author && (
        normalizeTurkishString(article.author) === normalizeTurkishString(currentUser.username)
    );
    
    const isAdminOrEditor = currentUser && currentUser.isEditor;
    
    if (!isOwnComment && !isCommentOnOwnArticle && !isAdminOrEditor) {
        showToast("✕ Bu yorumu silme yetkiniz bulunmamaktadır.");
        return;
    }
    
    comments = comments.filter(c => c.id !== id);
    
    if (isSupabaseConnected) {
        supabaseClient.from('comments').delete().eq('id', id).then(({ error }) => {
            if (error) console.error("Error deleting comment from Supabase:", error);
        });
        clearSupabaseCache();
    } else {
        localStorage.setItem("murekkep_comments_v2", JSON.stringify(comments));
    }
    
    showToast("Yorum silindi.");
    renderArticleComments(articleId);
};


// =============================================
// LITERARY JOURNEY (YAZAR SERÜVENİ) SYSTEM
// =============================================

// Helper: Get Pen Rank based on stats
// Helper: Get Pen Rank based on stats
function getPenRank(totalArticles, totalClaps) {
    const xp = (totalArticles * 50) + (totalClaps * 5);
    const ranks = [
        {
            id: 'drop',
            label: 'Mürekkep Damlası',
            icon: '💧',
            color: '#3498db',
            bgColor: 'rgba(52, 152, 219, 0.08)',
            borderColor: 'rgba(52, 152, 219, 0.2)',
            description: 'Edebiyat dünyasına yeni adım atmış taze bir damla.',
            reqXp: 0,
            reqArticles: 0,
            reqClaps: 0
        },
        {
            id: 'young',
            label: 'Genç Kalem',
            icon: '✒️',
            color: '#2ecc71',
            bgColor: 'rgba(46, 204, 113, 0.08)',
            borderColor: 'rgba(46, 204, 113, 0.2)',
            description: 'İlk eserini vererek kalemini yeşerten hevesli yazar.',
            reqXp: 150,
            reqArticles: 1,
            reqClaps: 10
        },
        {
            id: 'expert',
            label: 'Usta Kalem',
            icon: '🖋️',
            color: '#e67e22',
            bgColor: 'rgba(230, 126, 34, 0.08)',
            borderColor: 'rgba(230, 126, 34, 0.2)',
            description: 'Usta işi yazılarıyla kalitesini kanıtlamış güçlü yazar.',
            reqXp: 800,
            reqArticles: 4,
            reqClaps: 200
        },
        {
            id: 'author',
            label: 'Müellif',
            icon: '📖',
            color: '#9b59b6',
            bgColor: 'rgba(155, 89, 182, 0.08)',
            borderColor: 'rgba(155, 89, 182, 0.2)',
            description: 'Eserleriyle kendi okuyucu kitlesini oluşturmuş üretken müellif.',
            reqXp: 2000,
            reqArticles: 8,
            reqClaps: 800
        },
        {
            id: 'columnist',
            label: 'Köşe Yazarı',
            icon: '📰',
            color: '#1abc9c',
            bgColor: 'rgba(26, 188, 156, 0.08)',
            borderColor: 'rgba(26, 188, 156, 0.2)',
            description: 'Köşe yazılarıyla gazetenin vazgeçilmez seslerinden biri haline gelmiş yazar.',
            reqXp: 4500,
            reqArticles: 15,
            reqClaps: 2250
        },
        {
            id: 'chief',
            label: 'Başyazar',
            icon: '🏛️',
            color: '#e74c3c',
            bgColor: 'rgba(231, 76, 60, 0.08)',
            borderColor: 'rgba(231, 76, 60, 0.2)',
            description: 'Fikirleri ve engin tecrübesiyle yazı kuruluna yön veren başyazar.',
            reqXp: 8500,
            reqArticles: 25,
            reqClaps: 4750
        },
        {
            id: 'literary_master',
            label: 'Edebiyat Ustası',
            icon: '👑',
            color: '#f1c40f',
            bgColor: 'rgba(241, 196, 15, 0.08)',
            borderColor: 'rgba(241, 196, 15, 0.2)',
            description: 'Eserleri klasikleşmeye başlamış, üslup sahibi edebiyat ustası.',
            reqXp: 15000,
            reqArticles: 40,
            reqClaps: 9000
        },
        {
            id: 'legend',
            label: 'Mürekkep Efsanesi',
            icon: '🌟',
            color: '#f39c12',
            bgColor: 'rgba(243, 156, 18, 0.08)',
            borderColor: 'rgba(243, 156, 18, 0.2)',
            description: 'Yazıları nesiller boyu okunacak, Mürekkep tarihine altın harflerle yazılmış efsane.',
            reqXp: 30000,
            reqArticles: 60,
            reqClaps: 21000
        }
    ];

    let currentRank = ranks[0];
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (xp >= ranks[i].reqXp) {
            currentRank = ranks[i];
            break;
        }
    }
    
    // Find next rank for progress calculation
    const currentIdx = ranks.findIndex(r => r.id === currentRank.id);
    const nextRank = currentIdx < ranks.length - 1 ? ranks[currentIdx + 1] : null;

    return {
        ...currentRank,
        xp: xp,
        nextRank: nextRank
    };
}

// ─── Profile Storage & Helpers ──────────────────────────────────────────────

// Helper: Get customized profile data for an author
function getAuthorProfileData(authorName) {
    const defaultProfile = {
        bio: "",
        socialInstagram: "",
        socialTwitter: "",
        socialWeb: "",
        avatarType: "gradient",
        avatarVal: "linear-gradient(135deg, var(--accent-color), #d35400)",
        coverType: "gradient",
        coverVal: "linear-gradient(135deg, var(--accent-color), #2b1111)",
        goalCount: 10
    };
    
    if (!authorName) return defaultProfile;
    const key = authorName.toLowerCase().trim();
    
    // Default initial avatar gradient based on author name hash to keep it colorful
    let defaultGradient = "linear-gradient(135deg, var(--accent-color), #d35400)";
    const hash = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const presets = [
        "linear-gradient(135deg, #5d1a1a, #c94040)",
        "linear-gradient(135deg, #134e5e, #71b280)",
        "linear-gradient(135deg, #0f2027, #2c5364)",
        "linear-gradient(135deg, #e65c00, #F9D423)",
        "linear-gradient(135deg, #6c5ce7, #a29bfe)",
        "linear-gradient(135deg, #d35400, #e67e22)",
        "linear-gradient(135deg, #27ae60, #2ecc71)"
    ];
    defaultGradient = presets[hash % presets.length];

    defaultProfile.avatarVal = defaultGradient;

    return {
        ...defaultProfile,
        ...(authorProfiles[key] || {})
    };
}

// Helper: Save customized profile data for an author
function saveAuthorProfileData(authorName, data) {
    if (!authorName) return;
    const key = authorName.toLowerCase().trim();
    
    authorProfiles[key] = {
        ...(authorProfiles[key] || {}),
        ...data
    };
    
    saveAuthorProfiles();
}

// Helper: Get HTML representation for an author's avatar
function getAuthorAvatarHtml(authorName, size = 32) {
    const profile = getAuthorProfileData(authorName);
    const initial = (authorName || "?").substring(0, 1).toUpperCase();
    const styleString = `width:${size}px; height:${size}px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; font-family:var(--font-header); font-weight:800; font-size:${size * 0.45}px; border:1px solid var(--border-color); box-shadow:var(--shadow-sm); overflow:hidden; vertical-align:middle; text-shadow: 0 1px 2px rgba(0,0,0,0.2);`;

    if (profile.avatarType === "image" && profile.avatarVal) {
        return `<div class="author-custom-avatar-container" style="${styleString} background-image:url('${profile.avatarVal}'); background-size:cover; background-position:center;" title="${authorName}"></div>`;
    } else if (profile.avatarType === "emoji" && profile.avatarVal) {
        return `<div class="author-custom-avatar-container" style="${styleString} background:var(--bg-secondary); border-color:var(--border-light);" title="${authorName}">${profile.avatarVal}</div>`;
    } else {
        // gradient
        const bg = profile.avatarVal || "linear-gradient(135deg, var(--accent-color), #d35400)";
        return `<div class="author-custom-avatar-container" style="${styleString} background:${bg}; color:#ffffff;" title="${authorName}">${initial}</div>`;
    }
}

function normalizeTurkishString(str) {
    if (!str) return "";
    return str.trim()
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ç/g, 'c')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u');
}

// Helper: Get stats and rank for an author
function getAuthorStats(authorName) {
    if (!authorName) return { totalArticles: 0, totalClaps: 0, totalReadTime: 0, rank: getPenRank(0, 0) };
    
    const nameNorm = normalizeTurkishString(authorName);
    const authorArticles = articles.filter(a => a.author && normalizeTurkishString(a.author) === nameNorm);
    
    const totalArticles = authorArticles.length;
    const totalClaps = authorArticles.reduce((sum, a) => sum + (parseInt(a.claps) || 0), 0);
    
    const totalReadTime = authorArticles.reduce((sum, a) => {
        const matches = (a.readTime || '').match(/\d+/);
        return sum + (matches ? parseInt(matches[0]) : 3);
    }, 0);

    const rank = getPenRank(totalArticles, totalClaps);

    return {
        totalArticles,
        totalClaps,
        totalReadTime,
        rank
    };
}

// Helper: Get HTML string for an author's rank badge
function getAuthorRankBadgeHtml(authorName) {
    if (!authorName) return "";
    const norm = normalizeTurkishString(authorName);
    if (norm === "murekkep editoru" || norm === "mürekkep editörü" || norm === "editor" || norm === "editör" || norm === "murekkep yayin kurulu" || norm === "mürekkep yayın kurulu" || norm === "admin") {
        return "";
    }
    const stats = getAuthorStats(authorName);
    const rank = stats.rank;
    return `
        <span class="author-rank-badge" style="background:${rank.bgColor}; color:${rank.color}; border: 1px solid ${rank.borderColor}; font-size:0.58rem; padding: 1px 6px; border-radius: 4px; font-weight:700; margin-left:6px; letter-spacing:0.3px; text-transform:uppercase; font-family:var(--font-ui); display:inline-flex; align-items:center; gap:3px; cursor:help; vertical-align: middle;" title="${rank.description}">
            ${rank.icon} ${rank.label}
        </span>
    `;
}

// ─── Tabbed Author / Profile Modal ─────────────────────────────────────────

/** Switch a tab inside the author/profile modal */
function switchAuthorModalTab(tabId) {
    const panels = ['articles','followers','following'];
    panels.forEach(p => {
        const panel = document.getElementById(`author-panel-${p}`);
        const btn   = document.getElementById(`author-tab-${p}`);
        if (!panel || !btn) return;
        if (p === tabId) {
            panel.classList.remove('hidden');
            btn.classList.add('active');
        } else {
            panel.classList.add('hidden');
            btn.classList.remove('active');
        }
    });
}

/** Build a person-card element and return it */
function buildPersonCard(name, subText, onClickFn, removeBtnHtml) {
    const card = document.createElement('div');
    card.className = 'person-card';
    card.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;background:var(--bg-secondary);border:1px solid var(--border-light);transition:background 0.18s;cursor:pointer;position:relative;';
    const av = document.createElement('div');
    av.className = 'person-card-avatar';
    av.textContent = name.substring(0,1).toUpperCase();
    const info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0;';
    info.innerHTML = `<div class="person-card-name">${name}</div><div class="person-card-sub">${subText}</div>`;
    card.appendChild(av);
    card.appendChild(info);
    if (removeBtnHtml) {
        const btnWrap = document.createElement('div');
        btnWrap.innerHTML = removeBtnHtml;
        btnWrap.addEventListener('click', e => e.stopPropagation());
        card.appendChild(btnWrap);
    }
    card.addEventListener('click', onClickFn);
    return card;
}

// Restore default authors for built-in seed articles if modified
function restoreDefaultArticlesAuthors() {
    const defaultAuthorMap = {
        "manset-1": "Mürekkep Yayın Kurulu",
        "kitap-1": "Selim Çetin",
        "deneme-1": "Can Özkan",
        "roportaj-1": "Mürekkep Röportaj",
        "siir-1": "Melike Nur Özkan",
        "oyku-1": "Elif Su Yıldız",
        "kose-yazilari-1": "Mehmet Ali Demir",
        "haber-1": "Mürekkep Kültür Haber",
        "yarismalar-1": "Mürekkep Yarışma Kurulu",
        "deneme-2": "Hakan Yılmaz",
        "siir-2": "Esra Demir",
        "oyku-2": "Murat Can"
    };

    let modified = false;
    articles.forEach(art => {
        if (defaultAuthorMap[art.id]) {
            if (art.author !== defaultAuthorMap[art.id]) {
                art.author = defaultAuthorMap[art.id];
                delete art.author_email;
                delete art.user_id;
                modified = true;
            }
        }
    });

    if (modified) {
        try {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        } catch(e) {}
        if (isSupabaseConnected && supabaseClient) {
            clearSupabaseCache();
        }
    }
}

// Auto-merge pen name variations (e.g. "Berat" account with "Berat Kurt" articles)
function autoMergeUserPenName() {
    if (!currentUser) return;
    const currentName = currentUser.username ? currentUser.username.trim() : "";
    if (!currentName) return;

    const defaultAuthorNames = [
        "mürekkep yayın kurulu", "murekkep yayin kurulu", "selim çetin", "selim cetin",
        "can özkan", "can ozkan", "mürekkep röportaj", "murekkep roportaj",
        "melike nur özkan", "melike nur ozkan", "elif su yıldız", "elif su yildiz",
        "mehmet ali demir", "mürekkep kültür haber", "murekkep kultur haber",
        "mürekkep yarışma kurulu", "murekkep yarisma kurulu", "hakan yılmaz", "hakan yilmaz",
        "esra demir", "murat can"
    ];

    const matchingArticle = articles.find(a => {
        if (!a.author) return false;
        const artAuthor = a.author.trim();
        const artAuthorLower = artAuthor.toLowerCase();
        const currentNameLower = currentName.toLowerCase();
        
        if (artAuthorLower === currentNameLower) return false;
        if (defaultAuthorNames.includes(artAuthorLower)) return false;

        const matchesEmail = a.author_email && currentUser.email && a.author_email.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
        const matchesUserId = a.user_id && currentUser.id && a.user_id === currentUser.id;
        const startsWithUser = artAuthorLower.startsWith(currentNameLower + " ");

        return matchesEmail || matchesUserId || startsWithUser;
    });

    if (matchingArticle) {
        const fullPenName = matchingArticle.author.trim();
        performUsernameMigration(currentName, fullPenName);
    }
}

// Auto-reconcile articles that belong to logged in user account
function reconcileUserArticles() {
    restoreDefaultArticlesAuthors();
    autoMergeUserPenName();

    if (!currentUser) return false;
    const currentUsername = currentUser.username || (currentUser.email ? currentUser.email.split("@")[0] : "");
    const currentUserEmail = currentUser.email ? currentUser.email.toLowerCase().trim() : "";
    if (!currentUsername) return false;

    let modified = false;
    articles.forEach(art => {
        const authorLower = (art.author || "").toLowerCase().trim();
        const userLower = currentUsername.toLowerCase().trim();

        const matchesEmail = art.author_email && currentUserEmail && art.author_email.toLowerCase().trim() === currentUserEmail;
        const matchesUserId = art.user_id && currentUser.id && art.user_id === currentUser.id;
        const matchesPenNamePrefix = authorLower.startsWith(userLower + " ") || userLower.startsWith(authorLower + " ");

        if (matchesEmail || matchesUserId || matchesPenNamePrefix) {
            if (art.author !== currentUsername) {
                art.author = currentUsername;
                if (currentUser.email) art.author_email = currentUser.email;
                if (currentUser.id) art.user_id = currentUser.id;
                modified = true;
            }
        }
    });

    if (modified) {
        try {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        } catch(e) {}
        if (isSupabaseConnected && supabaseClient) {
            clearSupabaseCache();
        }
    }
    return modified;
}

// Migrate all articles when a user renames their pen name
async function performUsernameMigration(oldName, newName) {
    if (!newName || newName.trim() === "") return;
    const newNameClean = newName.trim();
    
    // Update currentUser object
    if (currentUser) {
        currentUser.username = newNameClean;
        const storedUser = localStorage.getItem("murekkep_current_user");
        if (storedUser) {
            try {
                const uObj = JSON.parse(storedUser);
                uObj.username = newNameClean;
                localStorage.setItem("murekkep_current_user", JSON.stringify(uObj));
            } catch(e) {}
        }
    }

    let articlesUpdated = 0;
    const userEmail = currentUser ? (currentUser.email ? currentUser.email.toLowerCase().trim() : "") : "";
    
    articles.forEach(art => {
        const matchesOldName = oldName && art.author && art.author.trim().toLowerCase() === oldName.trim().toLowerCase();
        const matchesEmail = userEmail && art.author_email && art.author_email.toLowerCase().trim() === userEmail;
        
        if (matchesOldName || matchesEmail) {
            art.author = newNameClean;
            if (currentUser && currentUser.email) art.author_email = currentUser.email;
            if (currentUser && currentUser.id) art.user_id = currentUser.id;
            articlesUpdated++;
        }
    });

    if (articlesUpdated > 0) {
        try {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        } catch(e) {}
        if (isSupabaseConnected && supabaseClient) {
            try {
                if (oldName) {
                    await supabaseClient
                        .from('articles')
                        .update({ author: newNameClean })
                        .ilike('author', oldName);
                }
                if (userEmail) {
                    await supabaseClient
                        .from('articles')
                        .update({ author: newNameClean })
                        .eq('author_email', userEmail);
                }
            } catch(e) {
                console.error("Supabase migration error:", e);
            }
            clearSupabaseCache();
        }
    }

    if (oldName && authorProfiles[oldName]) {
        authorProfiles[newNameClean] = authorProfiles[oldName];
        delete authorProfiles[oldName];
        saveAuthorProfiles();
    }
}

/** Open / refresh the profile modal for the given author name.
 *  If authorName equals the logged-in user, it renders in "own profile" mode. */
window.openAuthorProfile = function(authorName, startTab) {
    if (!authorName) return;
    const modal = document.getElementById('author-modal');
    if (!modal) return;

    const isOwnProfile = currentUser && currentUser.username &&
        currentUser.username.trim().toLowerCase() === authorName.trim().toLowerCase();

    if (isOwnProfile) {
        reconcileUserArticles();
    }

    const stats = getAuthorStats(authorName);
    const authorArticles = articles
        .filter(a => a.author && a.author.trim().toLowerCase() === authorName.trim().toLowerCase())
        .reverse();

    // ── Read follow data ────────────────────────────────────────────────────
    let followersData = {};
    try { followersData = JSON.parse(localStorage.getItem('murekkep_author_followers') || '{}'); } catch(e){}

    // followersList: array of user-IDs who follow authorName
    const followersList = followersData[authorName] || [];

    // followingNames: array of author names that the current user (if own profile) follows
    let followingNames = [];
    if (isOwnProfile && currentUser) {
        followingNames = Object.keys(followersData).filter(name =>
            followersData[name] && followersData[name].some(f => {
                if (typeof f === 'string') return f === currentUser.id;
                return f && f.id === currentUser.id;
            })
        );
    }

    // ── Load Custom Profile details ──────────────────────────────────────────
    const profile = getAuthorProfileData(authorName);

    // Apply Cover
    const coverEl = document.getElementById('author-modal-cover');
    if (coverEl) {
        const bgVal = profile.coverVal || "linear-gradient(135deg, var(--accent-color), #2b1111)";
        coverEl.style.background = bgVal;
        coverEl.style.backgroundImage = bgVal;
        if (profile.coverType === 'image' || bgVal.startsWith('url(')) {
            coverEl.style.backgroundSize = "cover";
            coverEl.style.backgroundPosition = "center";
        } else {
            coverEl.style.backgroundSize = "";
            coverEl.style.backgroundPosition = "";
        }
    }

    // Apply Avatar
    const avatarEl = document.getElementById('author-modal-avatar');
    if (avatarEl) {
        avatarEl.style.backgroundImage = "";
        avatarEl.style.background = "";
        avatarEl.textContent = "";
        
        if (profile.avatarType === 'image' && profile.avatarVal) {
            avatarEl.style.backgroundImage = `url('${profile.avatarVal}')`;
            avatarEl.style.backgroundSize = "cover";
            avatarEl.style.backgroundPosition = "center";
        } else if (profile.avatarType === 'emoji' && profile.avatarVal) {
            avatarEl.textContent = profile.avatarVal;
            avatarEl.style.background = "var(--bg-secondary)";
        } else {
            avatarEl.textContent = authorName.substring(0,1).toUpperCase();
            avatarEl.style.background = profile.avatarVal || "linear-gradient(135deg, var(--accent-color), #d35400)";
        }
    }

    // ── Header info ──────────────────────────────────────────────────────────
    document.getElementById('author-modal-name').innerText = authorName;

    const badgePlaceholder = document.getElementById('author-modal-badge-placeholder');
    if (badgePlaceholder) badgePlaceholder.innerHTML = getAuthorRankBadgeHtml(authorName);

    // Apply Biography
    const bioEl = document.getElementById('author-modal-bio');
    const bioTrigger = document.getElementById('author-modal-bio-edit-trigger');
    if (bioEl) {
        bioEl.innerHTML = "";
        if (profile.bio) {
            bioEl.innerText = profile.bio;
            bioEl.classList.remove('profile-bio-empty');
        } else {
            bioEl.innerText = isOwnProfile ? "Kendinizden bahsedin... (Biyografinizi yazmak için düzenle butonuna tıklayın.)" : "Bu yazar henüz bir biyografi eklememiş.";
            bioEl.classList.add('profile-bio-empty');
        }
    }
    if (bioTrigger) {
        bioTrigger.innerText = "✍️ Biyografiyi Düzenle";
        bioTrigger.removeAttribute('data-editing');
    }

    // Apply Social Links
    const socialsEl = document.getElementById('author-modal-socials');
    if (socialsEl) {
        socialsEl.innerHTML = "";
        
        // Instagram
        if (profile.socialInstagram) {
            socialsEl.innerHTML += `
                <a href="https://instagram.com/${profile.socialInstagram}" target="_blank" class="profile-social-btn" title="Instagram: @${profile.socialInstagram}">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>`;
        } else if (isOwnProfile) {
            socialsEl.innerHTML += `
                <a href="javascript:void(0)" onclick="openPopoverNear(this, 'socials')" class="profile-social-btn" style="opacity: 0.5;" title="Instagram Hesabı Ekle">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>`;
        }

        // Twitter / X
        if (profile.socialTwitter) {
            socialsEl.innerHTML += `
                <a href="https://twitter.com/${profile.socialTwitter}" target="_blank" class="profile-social-btn" title="Twitter/X: @${profile.socialTwitter}">
                    <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>`;
        } else if (isOwnProfile) {
            socialsEl.innerHTML += `
                <a href="javascript:void(0)" onclick="openPopoverNear(this, 'socials')" class="profile-social-btn" style="opacity: 0.5;" title="Twitter/X Hesabı Ekle">
                    <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>`;
        }

        // Website
        if (profile.socialWeb) {
            socialsEl.innerHTML += `
                <a href="${profile.socialWeb}" target="_blank" class="profile-social-btn" title="Kişisel Web Sitesi: ${profile.socialWeb}">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                </a>`;
        } else if (isOwnProfile) {
            socialsEl.innerHTML += `
                <a href="javascript:void(0)" onclick="openPopoverNear(this, 'socials')" class="profile-social-btn" style="opacity: 0.5;" title="Kişisel Web Sitesi Ekle">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                </a>`;
        }
    }

    // ── Setup Role based views and edit triggers ────────────────────────────
    const renameTrigger = document.getElementById('author-modal-name-edit-trigger');
    const editCoverBtn = document.getElementById('profile-edit-cover-btn');
    const avatarWrapper = document.getElementById('profile-avatar-wrapper-el');
    const dashboardCard = document.getElementById('author-modal-studio-dashboard');
    const statsRow = document.getElementById('author-modal-stats-row');

    if (isOwnProfile) {
        if (renameTrigger) renameTrigger.classList.remove('hidden');
        if (bioTrigger) bioTrigger.classList.remove('hidden');
        if (editCoverBtn) editCoverBtn.classList.remove('hidden');
        if (avatarWrapper) avatarWrapper.classList.add('profile-avatar-editable');
        if (dashboardCard) {
            dashboardCard.classList.remove('hidden');
            syncDashboardInProfile();
        }
        if (statsRow) statsRow.classList.add('hidden');
    } else {
        if (renameTrigger) renameTrigger.classList.add('hidden');
        if (bioTrigger) bioTrigger.classList.add('hidden');
        if (editCoverBtn) editCoverBtn.classList.add('hidden');
        if (avatarWrapper) avatarWrapper.classList.remove('profile-avatar-editable');
        if (dashboardCard) dashboardCard.classList.add('hidden');
        if (statsRow) {
            statsRow.classList.remove('hidden');
            document.getElementById('author-modal-stat-articles').innerText  = stats.totalArticles;
            document.getElementById('author-modal-stat-followers').innerText = followersList.length;
            document.getElementById('author-modal-stat-following').innerText = '—';
        }
    }

    // Make stat boxes clickable → jump to tab (only in public view)
    const statBoxArticles  = document.getElementById('author-modal-stat-box-articles');
    const statBoxFollowers = document.getElementById('author-modal-stat-box-followers');
    const statBoxFollowing = document.getElementById('author-modal-stat-box-following');
    const cloneAndBind = (el, tabId) => {
        if (!el) return el;
        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
        clone.addEventListener('click', () => switchAuthorModalTab(tabId));
        return clone;
    };
    cloneAndBind(statBoxArticles,  'articles');
    cloneAndBind(statBoxFollowers, 'followers');
    if (!isOwnProfile) cloneAndBind(statBoxFollowing, 'following');

    // ── Follow button ──────────────────────────────────────────────────────
    const followBtnEl = document.getElementById('author-modal-follow-btn');
    if (followBtnEl) {
        if (isOwnProfile) {
            followBtnEl.style.display = 'none';
        } else {
            followBtnEl.style.display = '';
            const newBtn = followBtnEl.cloneNode(true);
            followBtnEl.parentNode.replaceChild(newBtn, followBtnEl);
            const isFollowing = currentUser && followersList.some(f => {
                if (typeof f === 'string') return f === currentUser.id;
                return f && f.id === currentUser.id;
            });
            if (isFollowing) {
                newBtn.textContent = '✓ Takip Ediliyor';
                newBtn.style.cssText = 'background:transparent;color:var(--text-primary);border:1px solid var(--border-color);padding:7px 22px;border-radius:20px;font-family:var(--font-ui);font-weight:700;font-size:0.82rem;cursor:pointer;transition:all 0.2s;';
            } else {
                newBtn.textContent = 'Takip Et';
                newBtn.style.cssText = 'background:var(--accent-color);color:#fff;border:none;padding:7px 22px;border-radius:20px;font-family:var(--font-ui);font-weight:700;font-size:0.82rem;cursor:pointer;transition:all 0.2s;box-shadow:var(--shadow-sm);';
            }
            newBtn.addEventListener('click', () => window.toggleFollowAuthor(authorName));
        }
    }

    // ── Tab: Articles ──────────────────────────────────────────────────────
    const articlesContainer = document.getElementById('author-modal-articles-list');
    if (articlesContainer) {
        articlesContainer.innerHTML = '';
        if (authorArticles.length === 0) {
            articlesContainer.innerHTML = `<p style="font-size:0.82rem;color:var(--text-secondary);text-align:center;font-style:italic;padding:24px 0;">Henüz yayınlanmış eser bulunmuyor.</p>`;
        } else {
            authorArticles.forEach(art => {
                const reports = getArticleReports(art.id);
                const isFlagged = reports > 0 && isEditorModeActive;

                const item = document.createElement('div');
                item.style.cssText = `background:var(--bg-secondary);border:1px solid ${isFlagged ? '#c0392b' : 'var(--border-light)'};padding:14px;border-radius:10px;transition:all 0.18s;position:relative;`;
                item.className = 'author-article-item';

                // Flag badge for editor mode
                const flagBadge = isFlagged
                    ? `<div style="display:inline-flex;align-items:center;gap:4px;background:#c0392b;color:#fff;font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:4px;margin-bottom:6px;">⚠️ Şikayet: ${reports}</div>`
                    : '';

                // Editor/Owner action buttons
                let editorControls = '';
                if (isEditorModeActive) {
                    editorControls = `
                        <div class="profile-editor-controls" onclick="event.stopPropagation();">
                            <button class="btn-editor-action approve" onclick="window.approveArticleClick('${art.id}', event)">✓ Onayla</button>
                            <button class="btn-editor-action delete" onclick="window.deleteArticleClick('${art.id}', event)">✕ Kaldır</button>
                        </div>`;
                } else if (isOwnProfile) {
                    editorControls = `
                        <div class="profile-editor-controls" onclick="event.stopPropagation();" style="display:flex; justify-content:flex-end; margin-top:8px;">
                            <button class="btn-editor-action delete" style="background:#e53935; color:#fff; border:none; padding:4px 10px; border-radius:4px; font-family:var(--font-ui); font-size:0.68rem; font-weight:700; cursor:pointer;" onclick="window.deleteArticleClick('${art.id}', event)">✕ Yazıyı Sil</button>
                        </div>`;
                }

                item.innerHTML = `
                    ${flagBadge}
                    <div style="font-size:0.68rem;font-weight:700;color:var(--accent-color);text-transform:uppercase;margin-bottom:5px;letter-spacing:0.4px;">${art.category.replace('-',' ')}</div>
                    <h4 style="font-family:var(--font-header);font-size:1.05rem;font-weight:800;margin-bottom:4px;color:var(--text-primary);line-height:1.25;">${art.title}</h4>
                    <p style="font-size:0.76rem;color:var(--text-secondary);line-height:1.4;margin-bottom:8px;">${art.subtitle}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.65rem;color:var(--text-secondary);">
                        <span>${art.date}</span><span>👏 ${art.claps}</span>
                    </div>
                    ${editorControls}`;

                // Clicking on the card body opens the article (but not on editor controls)
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.profile-editor-controls')) return;
                    modal.classList.add('hidden');
                    unlockBodyScroll();
                    openArticle(art.id);
                });
                articlesContainer.appendChild(item);
            });
        }
    }

    // ── Tab: Followers ─────────────────────────────────────────────────────
    const followersContainer = document.getElementById('author-modal-followers-list');
    if (followersContainer) {
        followersContainer.innerHTML = '';
        if (followersList.length === 0) {
            followersContainer.innerHTML = `<p style="font-size:0.82rem;color:var(--text-secondary);text-align:center;font-style:italic;padding:24px 0;">Henüz takipçi yok.</p>`;
        } else {
            followersList.forEach(f => {
                let displayName = "";
                let openTarget = "";
                if (typeof f === 'string') {
                    displayName = f;
                    openTarget = f;
                } else if (f && typeof f === 'object') {
                    displayName = f.username || f.id;
                    openTarget = f.username || f.id;
                }
                // Show remove button only on own profile
                const removeBtn = isOwnProfile
                    ? `<button onclick="window.removeFollower('${authorName}', '${displayName.replace(/'/g, "\\'")}')"
                        style="background:#c0392b;color:#fff;border:none;padding:4px 12px;border-radius:6px;font-size:0.72rem;font-weight:700;cursor:pointer;white-space:nowrap;transition:background 0.2s;"
                        onmouseover="this.style.background='#e74c3c'" onmouseout="this.style.background='#c0392b'"
                        title="Bu takipçiyi çıkar">✕ Çıkar</button>`
                    : null;
                const card = buildPersonCard(displayName, 'Takipçi', () => {
                    window.openAuthorProfile(openTarget);
                }, removeBtn);
                followersContainer.appendChild(card);
            });
        }
    }

    // ── Tab: Following (own profile only) ─────────────────────────────────
    const followingContainer = document.getElementById('author-modal-following-list');
    if (followingContainer) {
        followingContainer.innerHTML = '';
        if (!isOwnProfile) {
            followingContainer.innerHTML = `<p style="font-size:0.82rem;color:var(--text-secondary);text-align:center;font-style:italic;padding:24px 0;">Bu bilgi yalnızca profil sahibine gösterilir.</p>`;
        } else if (followingNames.length === 0) {
            followingContainer.innerHTML = `<p style="font-size:0.82rem;color:var(--text-secondary);text-align:center;font-style:italic;padding:24px 0;">Henüz kimseyi takip etmiyorsun.</p>`;
        } else {
            followingNames.forEach(name => {
                const nameStats = getAuthorStats(name);
                const card = buildPersonCard(name, `${nameStats.totalArticles} Eser`, () => {
                    window.openAuthorProfile(name);
                });
                followingContainer.appendChild(card);
            });
        }
    }

    // ── Tab nav event wiring ───────────────────────────────────────────────
    ['articles','followers','following'].forEach(tabId => {
        const btn = document.getElementById(`author-tab-${tabId}`);
        if (!btn) return;
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        clone.addEventListener('click', () => switchAuthorModalTab(tabId));
    });

    // Restore to requested tab (default: articles)
    switchAuthorModalTab(startTab || 'articles');

    // Show modal
    modal.classList.remove('hidden');
    lockBodyScroll();
};

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