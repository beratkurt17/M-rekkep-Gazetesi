// =============================================
// AUTHENTICATION & USER MANAGEMENT
// =============================================

function openSettingsModal() {
    const settingsOverlay = document.getElementById("settings-overlay");
    if (!settingsOverlay) return;
    
    // Reset active tab to info
    window.switchProfileTab("info");

    // Populate fields with current user data
    if (currentUser) {
        const displayName = currentUser.username || currentUser.email.split("@")[0];
        const usernameInput = document.getElementById("settings-username-input");
        if (usernameInput) usernameInput.value = displayName;
    }
    
    // Sync theme toggle state
    const themeToggleInSettings = document.getElementById("settings-theme-toggle");
    if (themeToggleInSettings) {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (isDark) {
            themeToggleInSettings.classList.add("active");
        } else {
            themeToggleInSettings.classList.remove("active");
        }
    }

    // Sync editor toggle state
    const editorToggleInSettings = document.getElementById("settings-editor-toggle");
    const editorSection = document.getElementById("settings-editor-section");
    const editorDivider = document.getElementById("settings-editor-divider");
    
    if (currentUser && currentUser.isEditor) {
        if (editorSection) editorSection.classList.remove("hidden");
        if (editorDivider) editorDivider.classList.remove("hidden");
        if (editorToggleInSettings) {
            if (isEditorModeActive) {
                editorToggleInSettings.classList.add("active");
            } else {
                editorToggleInSettings.classList.remove("active");
            }
        }
    } else {
        if (editorSection) editorSection.classList.add("hidden");
        if (editorDivider) editorDivider.classList.add("hidden");
    }

    // Render Profile Tab Content
    renderProfileTabUI();

    settingsOverlay.classList.remove("hidden");
    lockBodyScroll();
}

// Support function: switch profile modal tabs
window.switchProfileTab = function(tabName) {
    const tabBtns = document.querySelectorAll(".profile-tab-btn");
    const tabPanels = document.querySelectorAll(".profile-tab-panel");
    tabBtns.forEach(btn => {
        if (btn.getAttribute("data-tab") === tabName) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    tabPanels.forEach(panel => {
        if (panel.id === `panel-${tabName}`) {
            panel.classList.remove("hidden");
        } else {
            panel.classList.add("hidden");
        }
    });
};

// Support function: get follower count of an author
function getAuthorFollowerCount(authorName) {
    if (!authorName) return 0;
    let followersData = {};
    try {
        followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}");
    } catch(e){}
    return (followersData[authorName] || []).length;
}

// Support function: get list of authors followed by the user
function getFollowingAuthors() {
    if (!currentUser) return [];
    let followersData = {};
    try {
        followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}");
    } catch(e){}
    
    const list = [];
    for (const authorName in followersData) {
        if (Array.isArray(followersData[authorName]) && followersData[authorName].some(f => {
            if (typeof f === 'string') return f === currentUser.id;
            return f && f.id === currentUser.id;
        })) {
            list.push(authorName);
        }
    }
    return list;
}

// Support function: Toggle follow state without opening author modal (for profile listings)
function toggleFollowState(authorName) {
    if (!currentUser) {
        openAuthModal();
        showToast("Yazarları takip edebilmek için lütfen giriş yapın.");
        return false;
    }
    
    let followersData = {};
    try {
        followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}");
    } catch(e){}
    
    if (!followersData[authorName]) {
        followersData[authorName] = [];
    }
    
    const index = followersData[authorName].findIndex(f => {
        if (typeof f === 'string') return f === currentUser.id;
        return f && f.id === currentUser.id;
    });
    const isFollowing = index !== -1;
    
    if (isFollowing) {
        followersData[authorName].splice(index, 1);
        showToast(`🔕 ${authorName} takipten çıkarıldı.`);
    } else {
        followersData[authorName].push({ id: currentUser.id, username: currentUser.username });
        showToast(`🔔 ${authorName} takip ediliyor!`);
        createNotification(authorName, 'follow', currentUser.username, 'sizi takip etmeye başladı.');
    }
    
    localStorage.setItem("murekkep_author_followers", JSON.stringify(followersData));
    saveAuthorFollowers(followersData);
    if (typeof updateArticleDetailFollowButton === 'function') {
        updateArticleDetailFollowButton(authorName);
    }
    return true;
}

// Toggle follow action inside the profile tab
window.toggleFollowFromProfile = function(authorName) {
    if (toggleFollowState(authorName)) {
        renderProfileTabUI();
        
        // If author profile modal is open, refresh it as well to keep in sync
        const authorModal = document.getElementById("author-modal");
        if (authorModal && !authorModal.classList.contains("hidden")) {
            const authorModalName = document.getElementById("author-modal-name");
            if (authorModalName && authorModalName.innerText === authorName) {
                window.openAuthorProfile(authorName);
            }
        }
    }
};

// Render full profile tab contents dynamically
function renderProfileTabUI() {
    if (!currentUser) return;
    const displayName = currentUser.username || currentUser.email.split("@")[0];
    const initial = displayName.substring(0, 1).toUpperCase();
    
    // 1. Populate top profile info
    const avatarEl = document.getElementById("profile-avatar-large");
    const nameLabel = document.getElementById("profile-display-name");
    const emailLabel = document.getElementById("profile-display-email");
    
    if (avatarEl) avatarEl.innerText = initial;
    if (nameLabel) nameLabel.innerText = displayName;
    if (emailLabel) emailLabel.innerText = currentUser.email || "";

    // Calculate stats
    // 1.1 Articles or bookmarks
    const stats = getAuthorStats(currentUser.username);
    const isWriter = stats.totalArticles > 0;
    
    let articleCountVal = 0;
    if (isWriter) {
        articleCountVal = stats.totalArticles;
    } else {
        articleCountVal = savedArticleIds.length;
    }
    
    const statBoxArticles = document.getElementById("profile-stat-box-articles");
    const statArticlesVal = document.getElementById("profile-stat-articles-val");
    const statArticlesLabel = statBoxArticles ? statBoxArticles.querySelector("div:last-child") : null;
    
    if (statArticlesVal) statArticlesVal.innerText = articleCountVal;
    if (statArticlesLabel) {
        statArticlesLabel.innerText = isWriter ? "ESERLERİM" : "KAYDEDİLENLER";
    }

    // Bind click to redirect from stats row to relevant tab or view
    if (statBoxArticles) {
        statBoxArticles.onclick = () => {
            if (isWriter) {
                window.switchProfileTab("writer");
            } else {
                closeSettingsModal();
                filterCategory("bookmarks");
            }
        };
    }

    // 1.2 Followers Count
    let followersData = {};
    try {
        followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}");
    } catch(e){}
    
    const userFollowersList = followersData[currentUser.username] || [];
    const statFollowersVal = document.getElementById("profile-stat-followers-val");
    if (statFollowersVal) statFollowersVal.innerText = userFollowersList.length;

    // 1.3 Following Count
    const followingList = getFollowingAuthors();
    const statFollowingVal = document.getElementById("profile-stat-following-val");
    const statBoxFollowing = document.getElementById("profile-stat-box-following");
    if (statFollowingVal) statFollowingVal.innerText = followingList.length;
    if (statBoxFollowing) {
        statBoxFollowing.onclick = () => {
            window.switchProfileTab("following");
        };
    }

    // 2. Tab: Yazar Serüveni Visibility Control
    const writerTabBtn = document.getElementById("profile-tab-writer");
    if (writerTabBtn) {
        if (isWriter) {
            writerTabBtn.style.display = "block";
        } else {
            writerTabBtn.style.display = "none";
            // If the active tab was writer but they are no longer a writer, switch to info
            const activeTab = document.querySelector(".profile-tab-btn.active");
            if (activeTab && activeTab.getAttribute("data-tab") === "writer") {
                window.switchProfileTab("info");
            }
        }
    }

    // 3. Render Following List inside Panel 2
    const followingContainer = document.getElementById("profile-following-list");
    if (followingContainer) {
        followingContainer.innerHTML = "";
        if (followingList.length === 0) {
            followingContainer.innerHTML = `
                <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; font-style: italic; padding: 25px 10px; background: rgba(0,0,0,0.01); border-radius: 8px; border: 1px dashed var(--border-light);">
                    Henüz takip ettiğiniz yazar bulunmuyor. Edebiyatçılarımızın eserlerini kaçırmamak için onları takip edebilirsiniz.
                </div>
            `;
        } else {
            followingList.forEach(author => {
                const item = document.createElement("div");
                item.className = "follow-user-item";
                const authorStats = getAuthorStats(author);
                const authBadge = getAuthorRankBadgeHtml(author);
                const initial = author.substring(0, 1).toUpperCase();
                
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; min-width: 0;" onclick="closeSettingsModal(); window.openAuthorProfile('${author.replace(/'/g, "\\'")}')">
                        ${getAuthorAvatarHtml(author, 36)}
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary); display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                                <span style="text-decoration: underline; text-underline-offset: 2px;">${author}</span> ${authBadge}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 3px;">👏 ${authorStats.totalClaps} Alkış | ${authorStats.totalArticles} Eser</div>
                        </div>
                    </div>
                    <button class="follow-user-btn follow-user-btn-unfollow" onclick="window.toggleFollowFromProfile('${author.replace(/'/g, "\\'")}')">Takipten Çık</button>
                `;
                followingContainer.appendChild(item);
            });
        }
    }

    // 4. Render Recommended Authors
    const recommendedContainer = document.getElementById("profile-recommended-list");
    if (recommendedContainer) {
        recommendedContainer.innerHTML = "";
        
        // Find all unique authors from system articles
        const allAuthors = [];
        articles.forEach(art => {
            if (art.author && !allAuthors.includes(art.author)) {
                allAuthors.push(art.author);
            }
        });

        // Filter out current user and already followed authors
        const recList = allAuthors.filter(author => {
            const isSelf = author.toLowerCase().trim() === currentUser.username.toLowerCase().trim();
            const isAlreadyFollowed = followingList.includes(author);
            return !isSelf && !isAlreadyFollowed;
        });

        // Sort by popularity (total claps)
        const sortedRecs = recList.map(author => {
            const authorStats = getAuthorStats(author);
            return { name: author, stats: authorStats };
        }).sort((a, b) => b.stats.totalClaps - a.stats.totalClaps).slice(0, 4);

        if (sortedRecs.length === 0) {
            recommendedContainer.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; font-style: italic; padding: 15px 0;">Önerilecek yeni yazar bulunamadı.</p>`;
        } else {
            sortedRecs.forEach(rec => {
                const item = document.createElement("div");
                item.className = "follow-user-item";
                const authBadge = getAuthorRankBadgeHtml(rec.name);
                const initial = rec.name.substring(0, 1).toUpperCase();
                
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; min-width: 0;" onclick="closeSettingsModal(); window.openAuthorProfile('${rec.name.replace(/'/g, "\\'")}')">
                        ${getAuthorAvatarHtml(rec.name, 36)}
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary); display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                                <span style="text-decoration: underline; text-underline-offset: 2px;">${rec.name}</span> ${authBadge}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 3px;">👏 ${rec.stats.totalClaps} Alkış | ${rec.stats.totalArticles} Eser</div>
                        </div>
                    </div>
                    <button class="follow-user-btn follow-user-btn-follow" onclick="window.toggleFollowFromProfile('${rec.name.replace(/'/g, "\\'")}')">Takip Et</button>
                `;
                recommendedContainer.appendChild(item);
            });
        }
    }

    // 5. Populate Writer Dashboard Stats if active
    if (isWriter) {
        const statsWriter = getAuthorStats(currentUser.username);
        
        const rankIcon = document.getElementById("writer-rank-icon");
        const rankName = document.getElementById("writer-rank-name");
        const rankDesc = document.getElementById("writer-rank-desc");
        
        const isEditor = (currentUser.isEditor || (currentUser.username && (normalizeTurkishString(currentUser.username) === "murekkep editoru" || normalizeTurkishString(currentUser.username) === "editor" || normalizeTurkishString(currentUser.username) === "editör")));
        const rankCard = document.getElementById("writer-rank-card");
        const rankProgressBox = document.getElementById("writer-rank-progress-box");

        if (isEditor) {
            if (rankCard) rankCard.style.display = "none";
            if (rankProgressBox) rankProgressBox.style.display = "none";
        } else {
            if (rankCard) rankCard.style.display = "flex";
            if (rankProgressBox) rankProgressBox.style.display = "block";

            if (rankIcon) rankIcon.innerText = statsWriter.rank.icon;
            if (rankName) rankName.innerText = statsWriter.rank.label;
            if (rankDesc) rankDesc.innerText = statsWriter.rank.description;
            
            // Progress Bar
            const progressLabel = document.getElementById("writer-progress-label");
            const progressPct = document.getElementById("writer-progress-pct");
            const progressBar = document.getElementById("writer-progress-bar");
            const progressDetails = document.getElementById("writer-progress-details");
            
            if (statsWriter.rank.nextRank) {
                const xpCurrent = statsWriter.rank.xp;
                const xpNext = statsWriter.rank.nextRank.reqXp;
                const xpPrev = statsWriter.rank.reqXp;
                
                const earnedXp = xpCurrent - xpPrev;
                const neededXp = xpNext - xpPrev;
                const pct = Math.min(100, Math.max(0, Math.round((earnedXp / neededXp) * 100)));
                
                if (progressLabel) progressLabel.innerText = `Sonraki Derece: ${statsWriter.rank.nextRank.label}`;
                if (progressPct) progressPct.innerText = `${pct}%`;
                if (progressBar) progressBar.style.width = `${pct}%`;
                if (progressDetails) progressDetails.innerText = `Edebi Puan (XP): ${xpCurrent} / ${xpNext} XP`;
            } else {
                if (progressLabel) progressLabel.innerText = `Zirve Derece: Mürekkep Efsanesi`;
                if (progressPct) progressPct.innerText = `100%`;
                if (progressBar) progressBar.style.width = `100%`;
                if (progressDetails) progressDetails.innerText = `Edebi olgunluğun zirvesine ulaşıldı! (Toplam XP: ${statsWriter.rank.xp})`;
            }
        }
        
        // Stats Grid
        const statArticles = document.getElementById("writer-stat-articles");
        const statClaps = document.getElementById("writer-stat-claps");
        const statReadtime = document.getElementById("writer-stat-readtime");
        
        if (statArticles) statArticles.innerText = statsWriter.totalArticles;
        if (statClaps) statClaps.innerText = statsWriter.totalClaps;
        if (statReadtime) statReadtime.innerText = `${statsWriter.totalReadTime} dk`;
        
        // Goal Sync
        const authorName = currentUser.username || currentUser.email.split("@")[0];
        const profile = getAuthorProfileData(authorName);
        const goalVal = parseInt(profile.goalCount) || 10;
        
        const goalInput = document.getElementById("writer-goal-input");
        if (goalInput) goalInput.value = goalVal;
        
        // Calculate goal progress for last 7 days
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const authorArticles = articles.filter(a => a.author && a.author.trim().toLowerCase() === currentUser.username.trim().toLowerCase());
        
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
        
        const goalLimit = parseInt(goalVal) || 1;
        const goalPct = Math.min(100, Math.round((last7DaysCount / goalLimit) * 100));
        
        const goalStatusEl = document.getElementById("writer-goal-status");
        const goalBarEl = document.getElementById("writer-goal-bar");
        
        if (goalStatusEl) goalStatusEl.innerText = `${last7DaysCount} / ${goalLimit} Eser`;
        if (goalBarEl) goalBarEl.style.width = `${goalPct}%`;
        
        const streakKey = `murekkep_writer_streak_${currentUser.id}`;
        let streak = parseInt(localStorage.getItem(streakKey) || "0");
        if (last7DaysCount >= goalLimit && streak === 0) {
            streak = 1;
            localStorage.setItem(streakKey, "1");
        }
        const streakEl = document.getElementById("writer-goal-streak-val");
        if (streakEl) streakEl.innerText = streak;
    }
}

function closeSettingsModal() {
    const settingsOverlay = document.getElementById("settings-overlay");
    if (settingsOverlay) {
        settingsOverlay.classList.add("hidden");
        unlockBodyScroll();
    }
}

// Switch tabs between login and register inside auth card
window.switchAuthTab = function(tab) {
    const resetForm = document.getElementById("reset-form");
    if (resetForm) resetForm.classList.add("hidden");
    const updatePasswordForm = document.getElementById("update-password-form");
    if (updatePasswordForm) updatePasswordForm.classList.add("hidden");
    const authTabs = document.querySelector(".auth-tabs");
    if (authTabs) authTabs.style.display = "flex";

    if (tab === 'login') {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        
        tabLogin.style.color = "var(--text-primary)";
        tabLogin.style.borderBottomColor = "var(--accent-color)";
        tabRegister.style.color = "var(--text-secondary)";
        tabRegister.style.borderBottomColor = "transparent";
    } else {
        tabLogin.classList.remove("active");
        tabRegister.classList.add("active");
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        
        tabRegister.style.color = "var(--text-primary)";
        tabRegister.style.borderBottomColor = "var(--accent-color)";
        tabLogin.style.color = "var(--text-secondary)";
        tabLogin.style.borderBottomColor = "transparent";
    }
};

// Check and update auth UI state
function updateAuthUI() {
    const editorSection = document.getElementById("settings-editor-section");
    const editorDivider = document.getElementById("settings-editor-divider");
    const configBtn = document.getElementById("supabase-config-btn");
    const notificationsSection = document.getElementById("notifications-section");

    const categoriesSection = document.getElementById("settings-categories-section");
    const categoriesDivider = document.getElementById("settings-categories-divider");
    const layoutSection = document.getElementById("settings-layout-section");
    const layoutDivider = document.getElementById("settings-layout-divider");
    const usersSection = document.getElementById("settings-users-section");
    const usersDivider = document.getElementById("settings-users-divider");

    if (currentUser) {
        // Logged in — show profile dropdown, hide login button
        if (loginToggleBtn) loginToggleBtn.classList.add("hidden");
        if (userProfileSection) {
            userProfileSection.classList.remove("hidden");
        }
        if (notificationsSection) {
            notificationsSection.classList.remove("hidden");
        }
        loadNotifications();
        
        const displayName = currentUser.username || currentUser.email.split("@")[0];
        const initial = displayName.substring(0, 1).toUpperCase();
        
        // Populate dropdown elements
        const profile = getAuthorProfileData(displayName);
        if (userAvatarCircle) {
            userAvatarCircle.innerText = "";
            userAvatarCircle.style.backgroundImage = "";
            userAvatarCircle.style.background = "";
            if (profile.avatarType === "image" && profile.avatarVal) {
                userAvatarCircle.style.backgroundImage = `url('${profile.avatarVal}')`;
                userAvatarCircle.style.backgroundSize = "cover";
                userAvatarCircle.style.backgroundPosition = "center";
            } else if (profile.avatarType === "emoji" && profile.avatarVal) {
                userAvatarCircle.innerText = profile.avatarVal;
                userAvatarCircle.style.background = "var(--bg-secondary)";
            } else {
                userAvatarCircle.innerText = initial;
                userAvatarCircle.style.background = profile.avatarVal || "var(--accent-color)";
            }
        }
        if (userDisplayName)    userDisplayName.innerText    = displayName;
        
        if (dropdownAvatarLarge) {
            dropdownAvatarLarge.innerText = "";
            dropdownAvatarLarge.style.backgroundImage = "";
            dropdownAvatarLarge.style.background = "";
            if (profile.avatarType === "image" && profile.avatarVal) {
                dropdownAvatarLarge.style.backgroundImage = `url('${profile.avatarVal}')`;
                dropdownAvatarLarge.style.backgroundSize = "cover";
                dropdownAvatarLarge.style.backgroundPosition = "center";
            } else if (profile.avatarType === "emoji" && profile.avatarVal) {
                dropdownAvatarLarge.innerText = profile.avatarVal;
                dropdownAvatarLarge.style.background = "var(--bg-secondary)";
            } else {
                dropdownAvatarLarge.innerText = initial;
                dropdownAvatarLarge.style.background = profile.avatarVal || "var(--accent-color)";
            }
        if (dropdownUserName)   dropdownUserName.innerText   = displayName;
        if (dropdownUserEmail)  dropdownUserEmail.innerText  = currentUser.email || "";

        // Sync Mobile Drawer User Info
        const mobileDrawerUserInfo = document.getElementById("mobile-drawer-user-info");
        const mobileDrawerName = document.getElementById("mobile-drawer-name");
        const mobileDrawerEmail = document.getElementById("mobile-drawer-email");
        const mobileDrawerAvatar = document.getElementById("mobile-drawer-avatar");
        const mobileDrawerLoginBtn = document.getElementById("mobile-drawer-login-btn");
        const mobileDrawerLogoutBtn = document.getElementById("mobile-drawer-logout-btn");
        const mobileDrawerProfileBtn = document.getElementById("mobile-drawer-profile-btn");
        const mobileDrawerBookmarksBtn = document.getElementById("mobile-drawer-bookmarks-btn");
        const mobileDrawerNotifsBtn = document.getElementById("mobile-drawer-notifs-btn");

        if (mobileDrawerUserInfo) mobileDrawerUserInfo.classList.remove("hidden");
        if (mobileDrawerName) mobileDrawerName.innerText = displayName;
        if (mobileDrawerEmail) mobileDrawerEmail.innerText = currentUser.email || "";
        if (mobileDrawerLoginBtn) mobileDrawerLoginBtn.classList.add("hidden");
        if (mobileDrawerLogoutBtn) mobileDrawerLogoutBtn.classList.remove("hidden");
        if (mobileDrawerProfileBtn) mobileDrawerProfileBtn.classList.remove("hidden");
        if (mobileDrawerBookmarksBtn) mobileDrawerBookmarksBtn.classList.remove("hidden");
        if (mobileDrawerNotifsBtn) mobileDrawerNotifsBtn.classList.remove("hidden");

        if (mobileDrawerAvatar) {
            mobileDrawerAvatar.innerText = "";
            mobileDrawerAvatar.style.backgroundImage = "";
            mobileDrawerAvatar.style.background = "";
            if (profile.avatarType === "image" && profile.avatarVal) {
                mobileDrawerAvatar.style.backgroundImage = `url('${profile.avatarVal}')`;
                mobileDrawerAvatar.style.backgroundSize = "cover";
                mobileDrawerAvatar.style.backgroundPosition = "center";
            } else if (profile.avatarType === "emoji" && profile.avatarVal) {
                mobileDrawerAvatar.innerText = profile.avatarVal;
                mobileDrawerAvatar.style.background = "var(--bg-secondary)";
            } else {
                mobileDrawerAvatar.innerText = initial;
                mobileDrawerAvatar.style.background = profile.avatarVal || "var(--accent-color)";
            }
        }
        
        // Show Bookmarks Tab
        if (bookmarksTab) bookmarksTab.classList.remove("hidden");

        // Editor panel control
        const editorialInboxToggle = document.getElementById("editorial-inbox-toggle");
        const dropdownEditorialInboxBtn = document.getElementById("dropdown-editorial-inbox-btn");

        if (currentUser.isEditor || currentUser.isAdmin) {
            if (editorSection) editorSection.classList.remove("hidden");
            if (editorDivider) editorDivider.classList.remove("hidden");
            if (editorialInboxToggle) editorialInboxToggle.classList.remove("hidden");
            if (dropdownEditorialInboxBtn) dropdownEditorialInboxBtn.classList.remove("hidden");
            updateEditorialSubmissionsBadge();
        } else {
            if (editorSection) editorSection.classList.add("hidden");
            if (editorDivider) editorDivider.classList.add("hidden");
            if (editorialInboxToggle) editorialInboxToggle.classList.add("hidden");
            if (dropdownEditorialInboxBtn) dropdownEditorialInboxBtn.classList.add("hidden");
            isEditorModeActive = false;
            updateEditorBannerUI();
        }

        // Admin panel control (Categories, Layout, Users, Supabase Config)
        if (currentUser.isAdmin) {
            if (configBtn) configBtn.classList.remove("hidden");
            if (categoriesSection) categoriesSection.classList.remove("hidden");
            if (categoriesDivider) categoriesDivider.classList.remove("hidden");
            if (layoutSection) layoutSection.classList.remove("hidden");
            if (layoutDivider) layoutDivider.classList.remove("hidden");
            if (usersSection) usersSection.classList.remove("hidden");
            if (usersDivider) usersDivider.classList.remove("hidden");
            if (typeof renderUsersManagementUI === 'function') {
                renderUsersManagementUI();
            }
        } else {
            if (configBtn) configBtn.classList.add("hidden");
            if (categoriesSection) categoriesSection.classList.add("hidden");
            if (categoriesDivider) categoriesDivider.classList.add("hidden");
            if (layoutSection) layoutSection.classList.add("hidden");
            if (layoutDivider) layoutDivider.classList.add("hidden");
            if (usersSection) usersSection.classList.add("hidden");
            if (usersDivider) usersDivider.classList.add("hidden");
        }

    } else {
        // Logged out / Guest
        const editorialInboxToggle = document.getElementById("editorial-inbox-toggle");
        const dropdownEditorialInboxBtn = document.getElementById("dropdown-editorial-inbox-btn");
        if (editorialInboxToggle) editorialInboxToggle.classList.add("hidden");
        if (dropdownEditorialInboxBtn) dropdownEditorialInboxBtn.classList.add("hidden");

        if (loginToggleBtn) loginToggleBtn.classList.remove("hidden");
        if (userProfileSection) userProfileSection.classList.add("hidden");
        if (notificationsSection) notificationsSection.classList.add("hidden");
        if (configBtn) configBtn.classList.add("hidden");
        // Close dropdown if open
        toggleProfileDropdown(true);

        // Sync Mobile Drawer for Logged Out state
        const mobileDrawerUserInfo = document.getElementById("mobile-drawer-user-info");
        const mobileDrawerLoginBtn = document.getElementById("mobile-drawer-login-btn");
        const mobileDrawerLogoutBtn = document.getElementById("mobile-drawer-logout-btn");
        const mobileDrawerProfileBtn = document.getElementById("mobile-drawer-profile-btn");
        const mobileDrawerBookmarksBtn = document.getElementById("mobile-drawer-bookmarks-btn");
        const mobileDrawerNotifsBtn = document.getElementById("mobile-drawer-notifs-btn");

        if (mobileDrawerUserInfo) mobileDrawerUserInfo.classList.add("hidden");
        if (mobileDrawerLoginBtn) mobileDrawerLoginBtn.classList.remove("hidden");
        if (mobileDrawerLogoutBtn) mobileDrawerLogoutBtn.classList.add("hidden");
        if (mobileDrawerProfileBtn) mobileDrawerProfileBtn.classList.add("hidden");
        if (mobileDrawerBookmarksBtn) mobileDrawerBookmarksBtn.classList.add("hidden");
        if (mobileDrawerNotifsBtn) mobileDrawerNotifsBtn.classList.add("hidden");
        
        // Hide Bookmarks Tab
        if (bookmarksTab) {
            bookmarksTab.classList.add("hidden");
            if (currentCategoryFilter === "bookmarks") {
                filterCategory("all");
            }
        }

        // Hide admin/editor controls
        if (editorSection) editorSection.classList.add("hidden");
        if (editorDivider) editorDivider.classList.add("hidden");
        if (categoriesSection) categoriesSection.classList.add("hidden");
        if (categoriesDivider) categoriesDivider.classList.add("hidden");
        if (layoutSection) layoutSection.classList.add("hidden");
        if (layoutDivider) layoutDivider.classList.add("hidden");
        if (usersSection) usersSection.classList.add("hidden");
        if (usersDivider) usersDivider.classList.add("hidden");
        isEditorModeActive = false;
        updateEditorBannerUI();
    }
    
    // Refresh the comment form state (show/hide login prompt)
    if (typeof updateCommentFormUI === 'function') {
        updateCommentFormUI();
    }
    // Refresh Mektup Arkadaşlığı state if open
    if (window.MürekkepliMektup && typeof window.MürekkepliMektup.refresh === 'function') {
        window.MürekkepliMektup.refresh();
    }
    renderCategoriesDropdown();

    // Refresh active newspaper grid/feed with the new authentication state
    if (layoutConfig) {
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }
    }
}


// Bookmarking data management
function loadBookmarks() {
    if (!currentUser) return;
    try {
        savedArticleIds = JSON.parse(localStorage.getItem("murekkep_bookmarks_" + currentUser.id) || "[]");
    } catch (e) {
        savedArticleIds = [];
    }
    updateBookmarkBtnUI();
}

function saveBookmarks() {
    if (!currentUser) return;
    try {
        localStorage.setItem("murekkep_bookmarks_" + currentUser.id, JSON.stringify(savedArticleIds));
    } catch (e) {
        console.warn("Failed to save bookmarks locally:", e);
    }
    updateBookmarkBtnUI();
}

function updateBookmarkBtnUI() {
    if (!articleSaveBtn) return;
    if (activeArticleId && savedArticleIds.includes(activeArticleId)) {
        articleSaveBtn.classList.add("saved");
    } else {
        articleSaveBtn.classList.remove("saved");
    }
}

// Initialize Auth Session
async function initAuth() {
    // Admin/Editor mock login bypass
    try {
        const localSession = localStorage.getItem("murekkep_mock_session");
        if (localSession) {
            const parsed = JSON.parse(localSession);
            if (parsed) {
                const role = getUserRole(parsed.email);
                currentUser = parsed;
                currentUser.role = role;
                currentUser.isAdmin = (role === "admin");
                currentUser.isEditor = (role === "admin" || role === "editor");
                loadBookmarks();
                updateAuthUI();
                return;
            }
        }
    } catch (e) {}

    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (session && session.user) {
                const emailLower = (session.user.email || "").toLowerCase().trim();
                currentUser = {
                    id: session.user.id,
                    email: session.user.email,
                    username: emailLower === "murekkep@admin.com" ? "Mürekkep" : (session.user.user_metadata?.username || session.user.email.split("@")[0])
                };
                const role = getUserRole(currentUser.email);
                currentUser.role = role;
                currentUser.isAdmin = (role === "admin");
                currentUser.isEditor = (role === "admin" || role === "editor");
                loadBookmarks();
            } else {
                currentUser = null;
                savedArticleIds = [];
            }
        } catch (e) {
            console.error("Failed to fetch initial Supabase session:", e);
            currentUser = null;
            savedArticleIds = [];
        }
        
        // Listen to auth state changes
        try {
            supabaseClient.auth.onAuthStateChange((event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    if (typeof openUpdatePasswordUI === "function") {
                        openUpdatePasswordUI();
                    }
                }
                if (session && session.user) {
                    const emailLower = (session.user.email || "").toLowerCase().trim();
                    currentUser = {
                        id: session.user.id,
                        email: session.user.email,
                        username: emailLower === "murekkep@admin.com" ? "Mürekkep" : (session.user.user_metadata?.username || session.user.email.split("@")[0])
                    };
                    const role = getUserRole(currentUser.email);
                    currentUser.role = role;
                    currentUser.isAdmin = (role === "admin");
                    currentUser.isEditor = (role === "admin" || role === "editor");
                    loadBookmarks();
                } else {
                    currentUser = null;
                    savedArticleIds = [];
                }
                updateAuthUI();
                
                // Refresh categories grid view if user logged out while viewing bookmarks
                if (currentCategoryFilter === "bookmarks" && !currentUser) {
                    filterCategory("all");
                }
            });
        } catch (e) {
            console.error("Failed to bind Supabase onAuthStateChange listener:", e);
        }
    } else {
        // Offline Mock Auth Initialization
        try {
            const localSession = localStorage.getItem("murekkep_mock_session");
            if (localSession) {
                currentUser = JSON.parse(localSession);
                const role = getUserRole(currentUser.email);
                currentUser.role = role;
                currentUser.isAdmin = (role === "admin");
                currentUser.isEditor = (role === "admin" || role === "editor");
                loadBookmarks();
            } else {
                currentUser = null;
                savedArticleIds = [];
            }
        } catch (e) {
            currentUser = null;
            savedArticleIds = [];
        }
    }
    updateAuthUI();
}

async function deleteCurrentUserAccount() {
    if (!currentUser) return;
    
    if (!confirm("Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz silinir.")) {
        return;
    }

    const emailNorm = currentUser.email.toLowerCase().trim();

    // 1. Remove from registered_users list
    let list = [];
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'registered_users')
                .maybeSingle();
            if (data && data.value) {
                list = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            }
            list = list.filter(u => u.email.toLowerCase().trim() !== emailNorm);
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'registered_users', value: list });
        } catch (e) {
            console.error("Error removing user from Supabase list:", e);
        }
        
        // Log out the user from Supabase auth
        try {
            await supabaseClient.auth.signOut();
        } catch(e) {
            console.error("Error signing out:", e);
        }
    } else {
        try {
            list = JSON.parse(localStorage.getItem("murekkep_registered_users") || "[]");
            list = list.filter(u => u.email.toLowerCase().trim() !== emailNorm);
            localStorage.setItem("murekkep_registered_users", JSON.stringify(list));
        } catch(e) {}
    }

    // 2. Clear local variables and logout
    currentUser = null;
    sessionStorage.clear();
    
    // Clear user-specific locally cached data
    localStorage.removeItem("murekkep_bookmarks");
    
    // Update UI and close modal
    updateAuthUI();
    closeSettingsModal();
    showToast("👋 Hesabınız başarıyla kalıcı olarak silindi.");
}

// User Actions
async function signUpUser(email, password, username) {
    if (email.toLowerCase() === "murekkep@admin.com") {
        showToast("❌ Bu e-posta adresiyle yeni kayıt oluşturulamaz.");
        return;
    }
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });
            if (error) throw error;
            
            if (data.user) {
                // Register user in our public database list
                registerUserInList(data.user.email, username || data.user.user_metadata?.username || data.user.email.split("@")[0]).catch(console.error);

                // If session exists directly (email confirmation disabled)
                if (data.session) {
                    currentUser = {
                        id: data.user.id,
                        email: data.user.email,
                        username: username
                    };
                    loadBookmarks();
                    updateAuthUI();
                    closeAuthModal();
                    showToast("Aramıza hoş geldiniz, " + username + "! 🎉");
                } else {
                    // Email confirmation is enabled - try to auto sign in anyway
                    // (works if user already exists or confirmation is disabled)
                    const { data: signInData, error: signInErr } = await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });
                    
                    if (!signInErr && signInData?.user) {
                        currentUser = {
                            id: signInData.user.id,
                            email: signInData.user.email,
                            username: username
                        };
                        loadBookmarks();
                        updateAuthUI();
                        closeAuthModal();
                        showToast("Aramıza hoş geldiniz, " + username + "! 🎉");
                    } else {
                        // Truly needs email confirmation
                        showToast("✉️ Kayıt başarılı! " + email + " adresine onay maili gönderildi.");
                        switchAuthTab('login');
                        document.getElementById("login-email").value = email;
                    }
                }
            }
        } catch (err) {
            console.error("Sign up error:", err);
            // User-friendly Turkish error messages
            let msg = "Kayıt hatası oluştu.";
            if (err.message.includes("already registered") || err.message.includes("already been registered")) {
                msg = "Bu e-posta adresi zaten kayıtlı! Giriş yapmayı deneyin.";
            } else if (err.message.includes("Password should be") || err.message.includes("password")) {
                msg = "Şifre en az 6 karakter olmalıdır.";
            } else if (err.message.includes("Invalid email")) {
                msg = "Geçersiz e-posta adresi.";
            } else if (err.message) {
                msg = err.message;
            }
            showToast("❌ " + msg);
        }
    } else {
        // Offline Mock Sign Up — şifreyi hash'le, düz metin kaydetme
        try {
            const users = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
            if (users.some(u => u.email === email)) {
                showToast("Bu e-posta adresi zaten kayıtlı!");
                return;
            }
            const hashedPw = await hashPassword(password);
            const newUser = { id: "u_" + Date.now(), email, password: hashedPw, username };
            users.push(newUser);
            localStorage.setItem("murekkep_mock_users", JSON.stringify(users));
            showToast("Kayıt başarılı! Giriş yapabilirsiniz.");
            switchAuthTab('login');
            document.getElementById("login-email").value = email;
        } catch (e) {
            showToast("Kayıt sırasında hata oluştu.");
        }
    }
}

async function signInUser(email, password) {
    const emailNorm = (email || "").toLowerCase().trim();

    // ── Brute-force koruması: çok fazla başarısız denemeyi engelle ───────────
    const rlCheck = checkLoginRateLimit(emailNorm);
    if (!rlCheck.allowed) {
        showToast(`❌ Çok fazla hatalı giriş denemesi. Lütfen ${rlCheck.minutesLeft} dakika bekleyin.`);
        return;
    }

    // ── Secure Admin login: compare SHA-256 hash, never store plaintext ───────
    if (emailNorm === "murekkep@admin.com") {
        try {
            const encoder = new TextEncoder();
            // Hash the raw input (preserve original casing/encoding)
            const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
            // Stored hash — never reveals the actual password
            const ADMIN_HASH = "9dd011ad8a68de979cbe26a535ce0f19f7cd26e0f5e3c8b057fe3bd56ba4081e";
            if (hashHex === ADMIN_HASH) {
                resetLoginRateLimit(emailNorm); // Başarılı girişte sayacı sıfırla
                currentUser = {
                    id: "admin_murekkep",
                    email: "murekkep@admin.com",
                    username: "Mürekkep",
                    role: "admin",
                    isAdmin: true,
                    isEditor: true
                };
                localStorage.setItem("murekkep_mock_session", JSON.stringify(currentUser));
                loadBookmarks();
                updateAuthUI();
                closeAuthModal();
                showToast("👋 Yönetici olarak giriş yapıldı. Editör Modu aktif edilebilir.");
                return;
            }
        } catch(e) { console.warn("Hash error:", e); }
        // Wrong password for admin email → fall through to Supabase or show error
        showToast("❌ Hatalı şifre.");
        return;
    }

    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (error) throw error;
            
            if (data.user) {
                resetLoginRateLimit(emailNorm); // Başarılı girişte sayacı sıfırla
                const emailLower = (data.user.email || "").toLowerCase().trim();
                currentUser = {
                    id: data.user.id,
                    email: data.user.email,
                    username: emailLower === "murekkep@admin.com" ? "Mürekkep" : (data.user.user_metadata?.username || data.user.email.split("@")[0])
                };
                registerUserInList(currentUser.email, currentUser.username).catch(console.error);
                
                const role = getUserRole(currentUser.email);
                currentUser.role = role;
                currentUser.isAdmin = (role === "admin");
                currentUser.isEditor = (role === "admin" || role === "editor");
                
                loadBookmarks();
                updateAuthUI();
                closeAuthModal();
                showToast("👋 Hoş geldiniz, " + currentUser.username + "!");
            }
        } catch (err) {
            console.error("Sign in error:", err);
            // User-friendly Turkish error messages
            let msg = "Giriş hatası oluştu.";
            if (err.message.includes("Invalid login") || err.message.includes("invalid_credentials") || err.message.includes("Email not confirmed")) {
                msg = "E-posta veya şifre hatalı. Lütfen tekrar deneyin.";
            } else if (err.message.includes("Email not confirmed")) {
                msg = "E-posta adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol edin.";
            } else if (err.message) {
                msg = err.message;
            }
            showToast("❌ " + msg);
        }
    } else {
        // Offline Mock Sign In — şifreler hash ile karşılaştırılır
        try {
            const users = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
            const inputHash = await hashPassword(password);
            const user = users.find(u => {
                if (u.email !== email) return false;
                // Hash'lenmiş şifre ile karşılaştır; geriye dönük uyumluluk için
                // eski düz-metin kayıtları da kabul et (ilk girişte hash'e dönüştürülür)
                return u.password === inputHash || u.password === password;
            });
            if (user) {
                // Eski düz-metin şifre varsa hash'e yükselt
                if (user.password === password && user.password !== inputHash) {
                    user.password = inputHash;
                    try {
                        localStorage.setItem("murekkep_mock_users", JSON.stringify(users));
                    } catch(e) {}
                }
                resetLoginRateLimit(emailNorm); // Başarılı girişte sayacı sıfırla
                currentUser = {
                    id: user.id,
                    email: user.email,
                    username: user.username
                };
                const role = getUserRole(currentUser.email);
                currentUser.role = role;
                currentUser.isAdmin = (role === "admin");
                currentUser.isEditor = (role === "admin" || role === "editor");
                
                localStorage.setItem("murekkep_mock_session", JSON.stringify(currentUser));
                loadBookmarks();
                updateAuthUI();
                closeAuthModal();
                showToast("Giriş başarılı! (Çevrimdışı)");
            } else {
                showToast("E-posta veya şifre hatalı!");
            }
        } catch (e) {
            showToast("Giriş hatası.");
        }
    }
}


async function signOutUser() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
        } catch (err) {
            console.error("Sign out error:", err);
        }
    }
    // Clear mock session
    localStorage.removeItem("murekkep_mock_session");
    currentUser = null;
    savedArticleIds = [];
    updateAuthUI();
    
    // Refresh page / view
    if (currentCategoryFilter === "bookmarks") {
        filterCategory("all");
    } else {
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }
    }
    
    showToast("Çıkış yapıldı.");
}

async function sendPasswordReset(email) {
    if (!email || !email.includes('@')) {
        showToast("❌ Lütfen geçerli bir e-posta adresi girin.");
        return;
    }
    if (!isSupabaseConnected || !supabaseClient) {
        showToast("❌ Şifre sıfırlama için internet bağlantısı gereklidir.");
        return;
    }
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname
        });
        if (error) throw error;
        showToast("✉️ Sıfırlama bağlantısı gönderildi! Lütfen e-posta kutunuzu kontrol edin.");
        // Switch back to login tab
        const resetForm = document.getElementById('reset-form');
        const loginForm = document.getElementById('login-form');
        if (resetForm) resetForm.classList.add('hidden');
        if (loginForm) loginForm.classList.remove('hidden');
    } catch (err) {
        console.error("Password reset error:", err);
        let msg = err.message || "Sıfırlama e-postası gönderilemedi.";
        if (err.message && err.message.includes('rate limit')) msg = "Lütfen birkaç dakika bekleyip tekrar deneyin.";
        showToast("❌ " + msg);
    }
}

// Open password update UI
function openUpdatePasswordUI() {
    const authOverlayEl = document.getElementById("auth-overlay");
    if (authOverlayEl) {
        authOverlayEl.classList.remove("hidden");
        lockBodyScroll();
    }
    
    const loginFormEl = document.getElementById("login-form");
    if (loginFormEl) loginFormEl.classList.add("hidden");
    
    const registerFormEl = document.getElementById("register-form");
    if (registerFormEl) registerFormEl.classList.add("hidden");
    
    const resetForm = document.getElementById("reset-form");
    if (resetForm) resetForm.classList.add("hidden");
    
    const authTabs = document.querySelector(".auth-tabs");
    if (authTabs) authTabs.style.display = "none";
    
    const updateForm = document.getElementById("update-password-form");
    if (updateForm) {
        updateForm.classList.remove("hidden");
        const newPassInput = document.getElementById("update-password");
        if (newPassInput) newPassInput.focus();
    }
}

// Check URL for authentication errors (like expired reset links)
function checkUrlForAuthErrors() {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    
    let errorDesc = "";
    let errorCode = "";
    
    // Parse params from hash or search
    const rawParams = hash.startsWith("#") ? hash.substring(1) : (search.startsWith("?") ? search.substring(1) : hash + search);
    if (rawParams) {
        try {
            const params = new URLSearchParams(rawParams);
            errorDesc = params.get("error_description");
            errorCode = params.get("error_code");
        } catch (e) {}
    }
    
    if (errorDesc || errorCode) {
        // Clear hash/search so refresh does not show error again
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, "", window.location.pathname);
        }
        
        let friendlyMessage = "❌ Bir hata oluştu.";
        if (errorCode === "otp_expired" || (errorDesc && (errorDesc.toLowerCase().includes("expired") || errorDesc.toLowerCase().includes("invalid")))) {
            friendlyMessage = "❌ Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama e-postası isteyin.";
        } else if (errorDesc) {
            friendlyMessage = "❌ Hata: " + decodeURIComponent(errorDesc.replace(/\+/g, " "));
        }
        
        setTimeout(() => {
            showToast(friendlyMessage);
        }, 500);
        return true;
    }
    return false;
}

// Handle returning from password reset link
function handlePasswordRecovery() {
    if (isSupabaseConnected && supabaseClient) {
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                openUpdatePasswordUI();
            }
        });
    }

    // Check URL parameters or hash immediately as the event might have already fired before this listener registered
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    if (hash.includes("type=recovery") || search.includes("type=recovery") || hash.includes("recovery") || search.includes("recovery")) {
        setTimeout(() => {
            openUpdatePasswordUI();
        }, 300);
    }
}

