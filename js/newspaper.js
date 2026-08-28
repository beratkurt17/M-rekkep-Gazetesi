// =============================================
// NEWSPAPER BROADSHEET ENGINE
// =============================================

function getCategoriesList() {
    const builtIn = [
        { id: "siir", name: "Şiir Köşesi" },
        { id: "biyografi", name: "Yazar Biyografileri & Portre" },
        { id: "oyku", name: "Öykü & Anlatı" },
        { id: "deneme", name: "Deneme & Eleştiri" },
        { id: "kitap", name: "Kitaplık & Tahlil" },
        { id: "roportaj", name: "Yazar Röportajı & Söyleşi" },
        { id: "haber", name: "Kültür & Sanat Haberleri" },
        { id: "yarismalar", name: "Yarışmalar & Duyurular" }
    ];
    return [...builtIn, ...customCategories];
}

// IO Functions for User Notifications
let userNotifications = [];

async function loadNotifications() {
    if (!currentUser) {
        userNotifications = [];
        return;
    }
    const key = `notifications_${currentUser.username.toLowerCase().trim()}`;
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', key)
                .maybeSingle();
            if (data && data.value) {
                userNotifications = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                localStorage.setItem(`murekkep_notifications_${currentUser.id}`, JSON.stringify(userNotifications));
                renderNotifications();
                return;
            }
        } catch(e) {
            console.warn("Failed to load notifications from Supabase:", e);
        }
    }
    try {
        const saved = localStorage.getItem(`murekkep_notifications_${currentUser.id}`);
        userNotifications = saved ? JSON.parse(saved) : [];
    } catch(e) {
        userNotifications = [];
    }
    renderNotifications();
}

async function saveNotifications() {
    if (!currentUser) return;
    const key = `notifications_${currentUser.username.toLowerCase().trim()}`;
    try {
        localStorage.setItem(`murekkep_notifications_${currentUser.id}`, JSON.stringify(userNotifications));
    } catch(e) {}
    
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: key, value: userNotifications });
        } catch (e) {
            console.error("Failed to save notifications to Supabase:", e);
        }
    }
    renderNotifications();
}

async function createNotification(targetAuthorName, type, fromUser, text, targetLinkData = {}) {
    if (!targetAuthorName) return;
    const key = `notifications_${targetAuthorName.toLowerCase().trim()}`;
    
    let targetNotifications = [];
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', key)
                .maybeSingle();
            if (data && data.value) {
                targetNotifications = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            }
        } catch(e) {}
    } else {
        try {
            const saved = localStorage.getItem(`murekkep_notifications_${targetAuthorName.toLowerCase().trim()}`);
            if (saved) targetNotifications = JSON.parse(saved);
        } catch(e) {}
    }
    
    const newNotif = {
        id: generateId(),
        type: type,
        fromUser: fromUser,
        text: text,
        date: new Date().toISOString(),
        read: false,
        linkData: targetLinkData
    };
    targetNotifications.unshift(newNotif);
    
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: key, value: targetNotifications });
        } catch(e) {}
    } else {
        try {
            localStorage.setItem(`murekkep_notifications_${targetAuthorName.toLowerCase().trim()}`, JSON.stringify(targetNotifications));
        } catch(e) {}
    }
}

function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    const elapsed = now - past;

    if (elapsed < msPerMinute) {
         return 'şimdi';   
    } else if (elapsed < msPerHour) {
         return Math.round(elapsed / msPerMinute) + ' dk önce';   
    } else if (elapsed < msPerDay ) {
         return Math.round(elapsed / msPerHour ) + ' saat önce';   
    } else {
         return Math.round(elapsed / msPerDay) + ' gün önce';   
    }
}

function initNotifications() {
    const notificationsBtn = document.getElementById("notifications-btn");
    const notificationsMenu = document.getElementById("notifications-dropdown-menu");
    const markAllReadBtn = document.getElementById("mark-all-read-btn");

    if (!notificationsBtn || !notificationsMenu) return;

    notificationsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = notificationsMenu.classList.contains("hidden");
        
        // Close profile dropdown if open
        toggleProfileDropdown(true);
        const searchDropdown = document.getElementById("author-search-results");
        if (searchDropdown) searchDropdown.classList.add("hidden");

        if (isHidden) {
            notificationsMenu.classList.remove("hidden");
            notificationsBtn.setAttribute("aria-expanded", "true");
        } else {
            notificationsMenu.classList.add("hidden");
            notificationsBtn.setAttribute("aria-expanded", "false");
        }
    });

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            userNotifications = userNotifications.map(n => ({ ...n, read: true }));
            saveNotifications();
        });
    }

    document.addEventListener("click", (e) => {
        if (!notificationsMenu.contains(e.target) && !notificationsBtn.contains(e.target)) {
            notificationsMenu.classList.add("hidden");
            notificationsBtn.setAttribute("aria-expanded", "false");
        }
    });
}

function renderNotifications() {
    const listContainer = document.getElementById("notifications-list");
    const badge = document.getElementById("notifications-badge");

    if (!listContainer) return;

    listContainer.innerHTML = "";

    const unreadCount = userNotifications.filter(n => !n.read).length;
    if (badge) {
        if (unreadCount > 0) {
            badge.innerText = unreadCount;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }

    if (userNotifications.length === 0) {
        listContainer.innerHTML = `<div class="notifications-empty">Henüz bir bildiriminiz yok.</div>`;
        return;
    }

    userNotifications.forEach(notif => {
        const item = document.createElement("div");
        item.className = `notification-item ${notif.read ? '' : 'unread'}`;

        const avatarHtml = getAuthorAvatarHtml(notif.fromUser, 30);
        item.innerHTML = `
            ${avatarHtml}
            <div class="notification-item-text">
                <div><strong>${notif.fromUser}</strong> ${notif.text}</div>
                <div class="notification-item-time">${timeAgo(notif.date)}</div>
            </div>
            ${notif.read ? '' : '<div class="notification-item-dot"></div>'}
        `;

        item.addEventListener("click", (e) => {
            e.stopPropagation();
            
            // Mark as read
            notif.read = true;
            saveNotifications();

            // Close dropdown
            const menu = document.getElementById("notifications-dropdown-menu");
            if (menu) menu.classList.add("hidden");
            const btn = document.getElementById("notifications-btn");
            if (btn) btn.setAttribute("aria-expanded", "false");

            // Navigate
            if (notif.type === 'follow') {
                window.openAuthorProfile(notif.fromUser);
            } else if ((notif.type === 'clap' || notif.type === 'comment') && notif.linkData && notif.linkData.articleId) {
                openArticle(notif.linkData.articleId);
            }
        });

        listContainer.appendChild(item);
    });
}

// IO Functions for Custom Author Profiles
let authorProfiles = {};

async function loadAuthorProfiles() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'author_profiles')
                .maybeSingle();
            if (data && data.value) {
                authorProfiles = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                localStorage.setItem("murekkep_author_profiles", JSON.stringify(authorProfiles));
                console.log("Loaded author profiles from Supabase.");
                return;
            }
        } catch (e) {
            console.warn("Failed to load author profiles from Supabase:", e);
        }
    }
    try {
        const saved = localStorage.getItem("murekkep_author_profiles");
        if (saved) {
            authorProfiles = JSON.parse(saved);
            console.log("Loaded author profiles from localStorage.");
            return;
        }
    } catch (e) {}
    authorProfiles = {};
}

async function saveAuthorProfiles() {
    try {
        localStorage.setItem("murekkep_author_profiles", JSON.stringify(authorProfiles));
    } catch (e) {}
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'author_profiles', value: authorProfiles });
            console.log("Saved author profiles to Supabase.");
        } catch (e) {
            console.error("Failed to save author profiles to Supabase:", e);
        }
    }
}

// IO Functions for User Roles and Access Control
const DEFAULT_USER_ROLES = [
    { email: "murekkep@admin.com", username: "Mürekkep", role: "admin" }
];
let userRoles = [];

async function loadUserRoles() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'user_roles')
                .maybeSingle();
            if (data && data.value) {
                userRoles = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                localStorage.setItem("murekkep_user_roles", JSON.stringify(userRoles));
                console.log("Loaded user roles from Supabase.");
                return;
            }
        } catch (e) {
            console.warn("Failed to load user roles from Supabase:", e);
        }
    }
    try {
        const saved = localStorage.getItem("murekkep_user_roles");
        if (saved) {
            userRoles = JSON.parse(saved);
            console.log("Loaded user roles from localStorage.");
            return;
        }
    } catch (e) {}
    
    // Fallback to default user roles
    userRoles = JSON.parse(JSON.stringify(DEFAULT_USER_ROLES));
    try {
        localStorage.setItem("murekkep_user_roles", JSON.stringify(userRoles));
    } catch(e) {}
}

async function saveUserRoles() {
    try {
        localStorage.setItem("murekkep_user_roles", JSON.stringify(userRoles));
    } catch (e) {}
    // Clear frontend grid cache so updates reflect instantly
    localStorage.removeItem("murekkep_supabase_cache");
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'user_roles', value: userRoles });
            console.log("Saved user roles to Supabase.");
        } catch (e) {
            console.error("Failed to save user roles to Supabase:", e);
        }
    }
}

function getUserRole(email) {
    if (!email) return "user";
    const emailNorm = email.toLowerCase().trim();
    if (emailNorm === "murekkep@admin.com") return "admin";
    const match = userRoles.find(u => u.email.toLowerCase().trim() === emailNorm);
    return match ? match.role : "user";
}

async function registerUserInList(email, username) {
    if (!email) return;
    const emailNorm = email.toLowerCase().trim();
    const displayName = username || emailNorm.split("@")[0];
    
    let list = [];
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'registered_users')
                .maybeSingle();
            if (data && data.value) {
                list = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            }
        } catch(e) {}
    } else {
        try {
            list = JSON.parse(localStorage.getItem("murekkep_registered_users") || "[]");
        } catch(e) {}
    }
    
    // Check if already in list
    if (!list.some(u => u.email.toLowerCase().trim() === emailNorm)) {
        list.push({
            email: emailNorm,
            username: displayName,
            date: new Date().toLocaleDateString('tr-TR'),
            role: getUserRole(emailNorm) || 'user'
        });
        
        if (isSupabaseConnected && supabaseClient) {
            try {
                await supabaseClient
                    .from('site_settings')
                    .upsert({ key: 'registered_users', value: list });
                console.log("Registered user appended on Supabase.");
            } catch(e) {
                console.error("Error saving registered users list:", e);
            }
        } else {
            localStorage.setItem("murekkep_registered_users", JSON.stringify(list));
        }
    }
}

// User Management UI & Control Handlers
function renderUsersManagementUI() {
    const listContainer = document.getElementById("admin-users-list-container");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    // Gather all users to show
    let displayUsers = [];

    // Always include pre-defined accounts or those in userRoles
    userRoles.forEach(r => {
        if (!displayUsers.some(u => u.email.toLowerCase().trim() === r.email.toLowerCase().trim())) {
            displayUsers.push({
                email: r.email,
                username: r.username,
                role: r.role
            });
        }
    });

    // In offline mode, also read from murekkep_mock_users
    if (!isSupabaseConnected) {
        try {
            const mockUsers = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
            mockUsers.forEach(m => {
                if (!displayUsers.some(u => u.email.toLowerCase().trim() === m.email.toLowerCase().trim())) {
                    displayUsers.push({
                        email: m.email,
                        username: m.username,
                        role: "user"
                    });
                }
            });
        } catch(e) {}
    }

    if (displayUsers.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 15px; font-size: 0.85rem;">Kayıtlı yetkili bulunmuyor.</p>`;
        return;
    }

    displayUsers.forEach(u => {
        const emailLower = u.email.toLowerCase().trim();
        const isPredefinedAdmin = (emailLower === "murekkep@admin.com");
        
        const row = document.createElement("div");
        row.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid var(--border-light); border-radius: 8px; background: rgba(255,255,255,0.01);";

        // Role select HTML
        let roleOptionsHtml = `
            <select onchange="window.updateUserRoleInAdmin('${u.email}', this.value)" style="font-size:0.75rem; padding:4px; border-radius:4px; background:var(--bg-primary); color:var(--text-primary); border:1px solid var(--border-light);" ${isPredefinedAdmin ? 'disabled' : ''}>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Yönetici</option>
                <option value="editor" ${u.role === 'editor' ? 'selected' : ''}>Editör</option>
                <option value="user" ${u.role === 'user' ? 'selected' : ''}>Yazar/Okur</option>
            </select>
        `;

        row.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${u.username}</span>
                <span style="font-size: 0.72rem; color: var(--text-secondary);">${u.email}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                ${roleOptionsHtml}
                <button onclick="window.deleteUserInAdmin('${u.email}')" 
                        class="btn-editor-action delete" 
                        style="padding: 4px 10px; font-size: 0.7rem; ${isPredefinedAdmin ? 'display:none;' : ''}">
                    Sil
                </button>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

window.updateUserRoleInAdmin = async function(email, newRole) {
    if (!currentUser || !currentUser.isAdmin) {
        showToast("✕ Yetkiniz bulunmamaktadır.");
        return;
    }
    
    const emailNorm = email.toLowerCase().trim();
    if (emailNorm === "murekkep@admin.com") {
        showToast("✕ Ana yöneticinin yetkisi değiştirilemez.");
        return;
    }

    // Remove old role if setting to 'user' (standard user)
    userRoles = userRoles.filter(r => r.email.toLowerCase().trim() !== emailNorm);

    // If new role is admin or editor, add it
    if (newRole === "admin" || newRole === "editor") {
        let username = emailNorm.split("@")[0];
        try {
            if (!isSupabaseConnected) {
                const mockUsers = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
                const mUser = mockUsers.find(u => u.email.toLowerCase().trim() === emailNorm);
                if (mUser) username = mUser.username;
            }
        } catch(e) {}

        userRoles.push({
            email: emailNorm,
            username: username,
            role: newRole
        });
    }

    await saveUserRoles();
    showToast("Yetki başarıyla güncellendi.");
    renderUsersManagementUI();
};

window.deleteUserInAdmin = async function(email) {
    if (!currentUser || !currentUser.isAdmin) {
        showToast("✕ Yetkiniz bulunmamaktadır.");
        return;
    }

    const emailNorm = email.toLowerCase().trim();
    if (emailNorm === "murekkep@admin.com") {
        showToast("✕ Ana yöneticiler silinemez.");
        return;
    }

    let targetUsername = "";
    const roleObj = userRoles.find(r => r.email.toLowerCase().trim() === emailNorm);
    if (roleObj) targetUsername = roleObj.username;

    try {
        const mockUsers = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
        const mUser = mockUsers.find(u => u.email.toLowerCase().trim() === emailNorm);
        if (mUser && !targetUsername) targetUsername = mUser.username;
    } catch(e) {}

    const deleteArticles = confirm(`"${emailNorm}" hesabını silmek istediğinizden emin misiniz?\n\nTamam'a basarsanız yetkisi kaldırılacaktır. Eğer bu yazarın yazdığı tüm yazıları da silmek istiyorsanız, bir sonraki adımda onaylayın.`);
    const deleteAllPosts = deleteArticles ? confirm(`Silinen yazara ait tüm makaleler ve köşe yazıları da kalıcı olarak silinsin mi?`) : false;

    // Remove from userRoles
    userRoles = userRoles.filter(r => r.email.toLowerCase().trim() !== emailNorm);
    await saveUserRoles();

    // Remove from mock users and registered list in all cases
    try {
        let mockUsers = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
        mockUsers = mockUsers.filter(u => u.email.toLowerCase().trim() !== emailNorm);
        localStorage.setItem("murekkep_mock_users", JSON.stringify(mockUsers));
    } catch(e) {}

    try {
        let regUsers = JSON.parse(localStorage.getItem("murekkep_registered_users") || "[]");
        regUsers = regUsers.filter(u => u.email.toLowerCase().trim() !== emailNorm);
        localStorage.setItem("murekkep_registered_users", JSON.stringify(regUsers));
    } catch(e) {}

    // Clear supabase grid cache to reflect updates instantly
    localStorage.removeItem("murekkep_supabase_cache");
    
    if (currentUser && currentUser.email.toLowerCase().trim() === emailNorm) {
        signOutUser();
    }

    // Delete author profile
    if (targetUsername) {
        const key = targetUsername.toLowerCase().trim();
        if (authorProfiles[key]) {
            delete authorProfiles[key];
            await saveAuthorProfiles();
        }
    }

    // Delete articles if requested
    if (deleteAllPosts && targetUsername) {
        articles = articles.filter(art => {
            const match = normalizeTurkishString(art.author) === normalizeTurkishString(targetUsername);
            if (match) {
                if (isSupabaseConnected) {
                    supabaseClient.from('articles').delete().eq('id', art.id).then(({ error }) => {
                        if (error) console.error("Error deleting user article from Supabase:", error);
                    });
                }
            }
            return !match;
        });

        try {
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        } catch (e) {}
        if (isSupabaseConnected) {
            clearSupabaseCache();
        }
        
        if (currentCategoryFilter === "all") {
            renderNewspaperGrid();
        } else {
            renderCategoryFeed(currentCategoryFilter);
        }
    }

    showToast("Kullanıcı başarıyla silindi.");
    renderUsersManagementUI();
};

window.createUserInAdmin = async function() {
    if (!currentUser || !currentUser.isAdmin) {
        showToast("✕ Yetkiniz bulunmamaktadır.");
        return;
    }

    const usernameInput = document.getElementById("admin-new-user-username");
    const emailInput = document.getElementById("admin-new-user-email");
    const passwordInput = document.getElementById("admin-new-user-password");
    const roleSelect = document.getElementById("admin-new-user-role");

    if (!usernameInput || !emailInput || !passwordInput || !roleSelect) return;

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleSelect.value;

    if (!username || !email || !password || !role) {
        showToast("✕ Lütfen tüm alanları doldurun.");
        return;
    }

    const emailNorm = email.toLowerCase().trim();

    if (userRoles.some(r => r.email.toLowerCase().trim() === emailNorm)) {
        showToast("✕ Bu e-posta adresi zaten yetkilendirilmiş.");
        return;
    }

    // Add to userRoles
    userRoles.push({
        email: emailNorm,
        username: username,
        role: role
    });
    await saveUserRoles();

    // If offline, create mock account in murekkep_mock_users
    if (!isSupabaseConnected) {
        try {
            const mockUsers = JSON.parse(localStorage.getItem("murekkep_mock_users") || "[]");
            if (!mockUsers.some(u => u.email.toLowerCase().trim() === emailNorm)) {
                const hashedPw = await hashPassword(password); // Şifreyi hash'le, düz metin kaydetme
                mockUsers.push({
                    id: "u_" + Date.now(),
                    email: emailNorm,
                    password: hashedPw,
                    username: username
                });
                localStorage.setItem("murekkep_mock_users", JSON.stringify(mockUsers));
            }
        } catch(e) {}
    } else {
        showToast("ℹ️ Çevrimiçi mod: Kullanıcı bu e-posta ile kayıt olduğunda yetkileri aktif olacaktır.", "ℹ️");
    }

    // Create empty profile
    const profileKey = username.toLowerCase().trim();
    if (!authorProfiles[profileKey]) {
        authorProfiles[profileKey] = {
            bioVal: "Mürekkep Yazarı",
            avatarType: "initial",
            avatarVal: ""
        };
        await saveAuthorProfiles();
    }

    usernameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";

    showToast("✅ Yetkili hesap başarıyla oluşturuldu.");
    renderUsersManagementUI();
};

// IO Functions for Author Followers (Followings list)
async function loadAuthorFollowers() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'author_followers')
                .maybeSingle();
            if (data && data.value) {
                const followersData = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                localStorage.setItem("murekkep_author_followers", JSON.stringify(followersData));
                console.log("Loaded author followers from Supabase.");
                return;
            }
        } catch (e) {
            console.warn("Failed to load author followers from Supabase:", e);
        }
    }
}

async function saveAuthorFollowers(followersData) {
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'author_followers', value: followersData });
            console.log("Saved author followers to Supabase.");
        } catch (e) {
            console.error("Failed to save author followers to Supabase:", e);
        }
    }
}

/** Remove a specific follower from the given author's follower list.
 *  Only the profile owner (isOwnProfile) can do this; the UI only shows
 *  the button when applicable, but we double-check here too. */
window.removeFollower = async function(authorName, followerUsername) {
    if (!currentUser) { showToast("❌ Giriş yapmalısınız."); return; }
    if (!currentUser.username || currentUser.username.trim().toLowerCase() !== authorName.trim().toLowerCase()) {
        showToast("❌ Yalnızca kendi profilinizden takipçi çıkarabilirsiniz.");
        return;
    }

    let followersData = {};
    try { followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}"); } catch(e){}

    if (!followersData[authorName]) { showToast("ℹ️ Takipçi bulunamadı."); return; }

    const before = followersData[authorName].length;
    followersData[authorName] = followersData[authorName].filter(f => {
        if (typeof f === 'string') return f !== followerUsername && f !== currentUser.id;
        if (f && typeof f === 'object') return (f.username || "").trim().toLowerCase() !== followerUsername.trim().toLowerCase();
        return true;
    });

    if (followersData[authorName].length === before) {
        showToast("ℹ️ Takipçi zaten listede yok.");
        return;
    }

    localStorage.setItem("murekkep_author_followers", JSON.stringify(followersData));
    await saveAuthorFollowers(followersData);

    showToast(`✅ "${followerUsername}" takipçi listenizden çıkarıldı.`);

    // Refresh the profile modal to reflect the change
    window.openAuthorProfile(authorName, 'followers');
};


async function performUsernameMigration(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;

    if (currentUser) {
        currentUser.username = newName;
    }

    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient.auth.updateUser({ data: { username: newName } });
        } catch (e) {
            console.warn("Could not update username on Supabase:", e);
        }
    }

    try {
        const mockSession = localStorage.getItem("murekkep_mock_session");
        if (mockSession) {
            const parsed = JSON.parse(mockSession);
            parsed.username = newName;
            localStorage.setItem("murekkep_mock_session", JSON.stringify(parsed));
        }
    } catch (e) {}

    try {
        const oldKey = oldName.toLowerCase().trim();
        const newKey = newName.toLowerCase().trim();
        if (authorProfiles[oldKey]) {
            authorProfiles[newKey] = authorProfiles[oldKey];
            delete authorProfiles[oldKey];
            saveAuthorProfiles();
        }
    } catch (e) {}

    try {
        const followersData = JSON.parse(localStorage.getItem("murekkep_author_followers") || "{}");
        const oldKey = oldName.trim();
        const newKey = newName.trim();
        if (followersData[oldKey]) {
            followersData[newKey] = followersData[oldKey];
            delete followersData[oldKey];
        }
        
        Object.keys(followersData).forEach(k => {
            const idx = followersData[k].indexOf(oldKey);
            if (idx !== -1) {
                followersData[k][idx] = newKey;
            }
        });
        localStorage.setItem("murekkep_author_followers", JSON.stringify(followersData));
        await saveAuthorFollowers(followersData);
    } catch (e) {}

    try {
        const localArticles = JSON.parse(localStorage.getItem("murekkep_articles_v2") || "[]");
        localArticles.forEach(art => {
            if (art.author && art.author.trim().toLowerCase() === oldName.trim().toLowerCase()) {
                art.author = newName;
            }
        });
        localStorage.setItem("murekkep_articles_v2", JSON.stringify(localArticles));
        
        articles.forEach(art => {
            if (art.author && art.author.trim().toLowerCase() === oldName.trim().toLowerCase()) {
                art.author = newName;
            }
        });

        if (isSupabaseConnected && supabaseClient) {
            try {
                await supabaseClient
                    .from('articles')
                    .update({ author: newName })
                    .eq('author', oldName);
                console.log(`Successfully migrated Supabase articles author from ${oldName} to ${newName}`);
            } catch(e) {
                console.warn("Could not update article authors on Supabase:", e);
            }
        }
    } catch (e) {}
}


// IO Functions for Custom Categories
async function loadCategories() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'custom_categories')
                .maybeSingle();
            if (data && data.value) {
                customCategories = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                console.log("Loaded custom categories from Supabase.");
                return;
            }
        } catch (e) {
            console.warn("Failed to load custom categories from Supabase:", e);
        }
    }
    try {
        const saved = localStorage.getItem("murekkep_custom_categories");
        if (saved) {
            customCategories = JSON.parse(saved);
            console.log("Loaded custom categories from localStorage.");
            return;
        }
    } catch (e) {}
    customCategories = [];
}

async function saveCategories() {
    try {
        localStorage.setItem("murekkep_custom_categories", JSON.stringify(customCategories));
    } catch (e) {}
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'custom_categories', value: customCategories });
        } catch (e) {}
    }
}

// IO Functions for Layout Config
async function loadLayoutConfig() {
    layoutConfig = JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
    try {
        localStorage.setItem("murekkep_layout_config_v4", JSON.stringify(layoutConfig));
    } catch (e) {}

    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'layout_config_v4', value: layoutConfig });
            console.log("Synced clean DEFAULT_LAYOUT to Supabase.");
        } catch (e) {
            console.warn("Failed to sync layout config to Supabase:", e);
        }
    }
}

async function saveLayoutConfig() {
    if (!layoutConfig) return;
    try {
        localStorage.setItem("murekkep_layout_config_v4", JSON.stringify(layoutConfig));
    } catch (e) {
        console.warn("Failed to save layout config to localStorage:", e);
    }
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { error } = await supabaseClient
                .from('site_settings')
                .upsert({ key: 'layout_config_v4', value: layoutConfig });
            if (error) console.error("Error saving layout config to Supabase:", error);
            else console.log("Saved layout config to Supabase.");
        } catch (e) {
            console.error("Failed to save layout config to Supabase:", e);
        }
    }
}

// IO Functions for Editor's Note
async function loadEditorNoteData() {
    if (isSupabaseConnected && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('site_settings')
                .select('value')
                .eq('key', 'editor_note')
                .maybeSingle();
            if (data && data.value) {
                editorNoteData = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                console.log("Loaded editor note from Supabase.");
                return;
            }
        } catch (e) {}
    }
    try {
        const saved = localStorage.getItem("murekkep_editor_note");
        if (saved) {
            editorNoteData = JSON.parse(saved);
            console.log("Loaded editor note from localStorage.");
            return;
        }
    } catch (e) {}
}

async function saveEditorNoteData() {
    const quoteInput = document.getElementById("settings-editor-note-quote");
    const descInput = document.getElementById("settings-editor-note-desc");
    if (quoteInput && descInput) {
        editorNoteData.quote = quoteInput.value;
        editorNoteData.desc = descInput.value;
    }
    try {
        localStorage.setItem("murekkep_editor_note", JSON.stringify(editorNoteData));
    } catch (e) {}
    if (isSupabaseConnected && supabaseClient) {
        try {
            await supabaseClient
                .from('site_settings')
                .upsert({ key: 'editor_note', value: editorNoteData });
        } catch (e) {}
    }
}

// UI Render Helpers
function renderCategoriesNav() {
    const navUl = document.querySelector(".header-nav ul");
    if (!navUl) return;
    
    let html = `<li><button class="nav-filter active" data-category="all">HEPSİ</button></li>`;
    const cats = getCategoriesList();
    cats.forEach(c => {
        html += `<li><button class="nav-filter" data-category="${c.id}">${c.name.toUpperCase()}</button></li>`;
    });
    html += `<li><button class="nav-filter ${currentUser ? '' : 'hidden'}" data-category="bookmarks" id="bookmarks-tab" style="border-color: var(--accent-color); color: var(--accent-color); font-weight: 700;">KAYDEDİLENLER</button></li>`;
    
    navUl.innerHTML = html;
    
    document.querySelectorAll(".nav-filter").forEach(btn => {
        btn.addEventListener("click", () => {
            const cat = btn.getAttribute("data-category");
            filterCategory(cat);
        });
    });
}

function renderCategoriesDropdown() {
    const select = document.getElementById("post-category");
    if (!select) return;
    
    let html = "";
    const cats = getCategoriesList();
    const isUserAdmin = currentUser && currentUser.isEditor;
    
    cats.forEach(c => {
        // Only admins can write in "yarismalar" (Edebiyat Yarışması) and "haber" (Edebiyat Haberleri)
        if ((c.id === "yarismalar" || c.id === "haber") && !isUserAdmin) {
            return;
        }
        html += `<option value="${c.id}">${c.name}</option>`;
    });
    select.innerHTML = html;
}

function renderCustomCategoriesList() {
    const listEl = document.getElementById("custom-categories-list");
    if (!listEl) return;
    listEl.innerHTML = "";
    
    customCategories.forEach(c => {
        const row = document.createElement("div");
        row.className = "category-item-row";
        row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border:1px solid var(--border-light); border-radius:8px; margin-bottom:6px; background:rgba(255,255,255,0.01);";
        row.innerHTML = `
            <span style="font-family:var(--font-ui); font-size:0.8rem; color:var(--text-primary); font-weight:700;">${c.name}</span>
            <button type="button" onclick="window.removeCustomCategory('${c.id}')" style="background:none; border:none; color:var(--accent-color); cursor:pointer; font-weight:700; font-size:0.8rem;">Kaldır</button>
        `;
        listEl.appendChild(row);
    });
}

function populateEditorSettingsUI() {
    const quoteInput = document.getElementById("settings-editor-note-quote");
    const descInput = document.getElementById("settings-editor-note-desc");
    if (quoteInput && descInput && editorNoteData) {
        quoteInput.value = editorNoteData.quote || "";
        descInput.value = editorNoteData.desc || "";
    }
}

window.renderLayoutConfigurator = function() {
    if (!layoutConfig) return;
    
    const cats = getCategoriesList();
    const valueOptionsList = [
        { value: "headline", label: "Sistem: Manşet", type: "system" },
        { value: "recent_comments", label: "Sistem: Okur Yorumları", type: "system" },
        { value: "popular_posts", label: "Sistem: Çok Okunanlar", type: "system" },
        { value: "popular_authors", label: "Sistem: Haftanın Yazarları", type: "system" },
        { value: "editor_note", label: "Sistem: Editörün Notu", type: "system" }
    ];
    
    cats.forEach(c => {
        valueOptionsList.push({ value: c.id, label: `Kategori: ${c.name}`, type: "category" });
    });
    
    const styleOptions = [
        { value: "standard", label: "Standart Kart" },
        { value: "headline", label: "Manşet Tasarımı" },
        { value: "editorial", label: "Başyazı Tasarımı" },
        { value: "columnist", label: "Yazar Tasarımı" },
        { value: "poem", label: "Şiir Tasarımı" },
        { value: "list", label: "Liste Tasarımı" }
    ];

    ['col1', 'col2', 'col3'].forEach(colKey => {
        const listEl = document.getElementById(`${colKey}-slots-list`);
        if (!listEl) return;
        listEl.innerHTML = "";
        
        const slots = layoutConfig[colKey] || [];
        slots.forEach((slot, index) => {
            let valueOptions = "";
            valueOptionsList.forEach(opt => {
                const isSelected = slot.value === opt.value;
                valueOptions += `<option value="${opt.value}" ${isSelected ? 'selected' : ''}>${opt.label}</option>`;
            });
            
            let styleOptionsHtml = "";
            styleOptions.forEach(opt => {
                const isSelected = slot.style === opt.value;
                styleOptionsHtml += `<option value="${opt.value}" ${isSelected ? 'selected' : ''}>${opt.label}</option>`;
            });
            
            const styleSelect = `
                <select class="form-control slot-style-select" style="font-size: 0.75rem; padding: 4px 8px; height: 30px; flex: 1; min-width: 100px;" onchange="window.updateSlotStyle('${colKey}', ${index}, this.value)">
                    ${styleOptionsHtml}
                </select>
            `;
            
            const slotSize = slot.size || 'normal';
            const sizeKeys = ['compact', 'normal', 'large'];
            const sizeLabels = { compact: 'S – Kompakt', normal: 'M – Normal', large: 'L – Büyük' };
            let sizeBtnsHtml = '';
            sizeKeys.forEach(sk => {
                const isActive = slotSize === sk;
                sizeBtnsHtml += `<button type="button" onclick="window.updateSlotSize('${colKey}', ${index}, '${sk}')" title="${sizeLabels[sk]}" style="background:${isActive ? 'var(--accent-color)' : 'var(--bg-primary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-light)'}; font-family:var(--font-ui); font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">${sk === 'compact' ? 'S' : sk === 'normal' ? 'M' : 'L'}</button>`;
            });

            const slotW = slot.slotWidth || 1;
            let widthBtnsHtml = '';
            for (let w = 1; w <= 3; w++) {
                const isActive = slotW === w;
                widthBtnsHtml += `<button type="button" onclick="window.updateSlotWidth('${colKey}', ${index}, ${w})" title="${w}x Genişlik" style="background:${isActive ? '#2e7d32' : 'var(--bg-primary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? '#2e7d32' : 'var(--border-light)'}; font-family:var(--font-ui); font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">${w}x</button>`;
            }

            const slotH = slot.slotHeight || 1;
            let heightBtnsHtml = '';
            for (let h = 1; h <= 3; h++) {
                const isActive = slotH === h;
                heightBtnsHtml += `<button type="button" onclick="window.updateSlotHeight('${colKey}', ${index}, ${h})" title="${h}x Yükseklik" style="background:${isActive ? '#1565c0' : 'var(--bg-primary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? '#1565c0' : 'var(--border-light)'}; font-family:var(--font-ui); font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">${h}↕</button>`;
            }

            const slotsInCol = layoutConfig[colKey] || [];
            let upDownBtnsHtml = '';
            if (index > 0) {
                upDownBtnsHtml += `<button type="button" onclick="window.quickMoveSlotUpDown('${colKey}', ${index}, 'up')" title="Yukarı Taşı" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center;"><svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg></button>`;
            }
            if (index < slotsInCol.length - 1) {
                upDownBtnsHtml += `<button type="button" onclick="window.quickMoveSlotUpDown('${colKey}', ${index}, 'down')" title="Aşağı Taşı" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center;"><svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg></button>`;
            }

            const row = document.createElement("div");
            row.className = "layout-slot-row";
            row.style.cssText = "display: flex; flex-direction: column; gap: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); padding: 10px; border-radius: 8px; margin-bottom: 8px; font-family: var(--font-ui);";
            row.innerHTML = `
                <!-- Dropdowns & Delete Row -->
                <div style="display: flex; gap: 6px; align-items: center; width: 100%; flex-wrap: wrap;">
                    <select class="form-control slot-value-select" style="font-size: 0.75rem; padding: 4px 8px; height: 30px; flex: 1.2; min-width: 120px;" onchange="window.updateSlotTypeVal('${colKey}', ${index}, this.value)">
                        ${valueOptions}
                    </select>
                    ${styleSelect}
                    <div style="display: flex; gap: 2px; align-items: center; margin-left: auto;">
                        ${upDownBtnsHtml}
                        <button type="button" onclick="window.removeSlotFromColumn('${colKey}', ${index})" style="background: none; border: none; color: var(--accent-color); cursor: pointer; padding: 4px;" title="Slotu Kaldır">
                            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                    </div>
                </div>
                
                <!-- Editable Slot Label -->
                <div style="display: flex; gap: 6px; align-items: center; width: 100%; margin-top: 2px;">
                    <span style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 700; width: 60px;">KÖŞE ADI:</span>
                    <input type="text" value="${slot.label || ''}" placeholder="Köşe başlığını yazın..." class="form-control" style="font-size: 0.72rem; padding: 4px 8px; height: 26px; flex: 1; border-radius: 4px; border: 1px solid var(--border-light); background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-ui);" oninput="window.updateSlotLabel('${colKey}', ${index}, this.value)">
                </div>
                
                <!-- Sizing Controls Row -->
                <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; font-size: 0.65rem; width: 100%; padding-top: 6px; border-top: 1px dashed var(--border-light);">
                    <!-- Size Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">PUNTO:</span>
                        <div style="display: flex; gap: 2px;">
                            ${sizeBtnsHtml}
                        </div>
                    </div>
                    
                    <!-- Width Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">EN:</span>
                        <div style="display: flex; gap: 2px;">
                            ${widthBtnsHtml}
                        </div>
                    </div>
                    
                    <!-- Height Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">BOY:</span>
                        <div style="display: flex; gap: 2px;">
                            ${heightBtnsHtml}
                        </div>
                    </div>
                </div>
            `;
            listEl.appendChild(row);
        });
    });
};

function wrapSlotInEditorControls(slot, index, colKey, cardHTML, colWeight) {
    if (!cardHTML.trim()) return "";
    
    // Prepare values list for inline content and design selections
    const cats = getCategoriesList();
    const valueOptionsList = [
        { value: "headline", label: "Manşet", type: "system" },
        { value: "recent_comments", label: "Okur Yorumları", type: "system" },
        { value: "popular_posts", label: "Çok Okunanlar", type: "system" },
        { value: "popular_authors", label: "Haftanın Yazarları", type: "system" },
        { value: "editor_note", label: "Editörün Notu", type: "system" }
    ];
    cats.forEach(c => {
        valueOptionsList.push({ value: c.id, label: c.name, type: "category" });
    });
    
    const styleOptions = [
        { value: "standard", label: "Standart Kart" },
        { value: "headline", label: "Manşet Tasarımı" },
        { value: "editorial", label: "Başyazı Tasarımı" },
        { value: "columnist", label: "Yazar Tasarımı" },
        { value: "poem", label: "Şiir Tasarımı" },
        { value: "list", label: "Liste Tasarımı" }
    ];
 
    const slotLabel = slot.type === 'system' ? 'Sistem' : 'Köşe';
    const currentSize = slot.size || 'normal';
    const currentSlotWidth = slot.slotWidth || 1;
    const currentSlotHeight = slot.slotHeight || 1;
 
    const colLabels = { col1: '◀ Sol', col2: '■ Orta', col3: 'Sağ ▶' };
    let moveButtons = '';
    ['col1', 'col2', 'col3'].forEach(col => {
        if (col !== colKey) {
            moveButtons += `<button type="button" onclick="event.stopPropagation(); window.quickMoveSlot('${colKey}', ${index}, '${col}')" title="${colLabels[col]} Sütuna Taşı" style="background: var(--bg-secondary); border: 1px solid var(--border-light); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.6rem; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-weight: 700;">${colLabels[col]}</button>`;
        }
    });
 
    let upDownButtons = '';
    const slotsInCol = layoutConfig[colKey] || [];
    if (index > 0) {
        upDownButtons += `<button type="button" onclick="event.stopPropagation(); window.quickMoveSlotUpDown('${colKey}', ${index}, 'up')" title="Yukarı Taşı" style="background: var(--bg-secondary); border: 1px solid var(--border-light); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.6rem; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-weight: 700;">▲</button>`;
    }
    if (index < slotsInCol.length - 1) {
        upDownButtons += `<button type="button" onclick="event.stopPropagation(); window.quickMoveSlotUpDown('${colKey}', ${index}, 'down')" title="Aşağı Taşı" style="background: var(--bg-secondary); border: 1px solid var(--border-light); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.6rem; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-weight: 700;">▼</button>`;
    }
 
    const sizeKeys = ['compact', 'normal', 'large'];
    const sizeLabels = { compact: 'S – Kompakt', normal: 'M – Normal', large: 'L – Büyük' };
    let sizeButtons = '';
    sizeKeys.forEach(sk => {
        const isActive = currentSize === sk;
        sizeButtons += `<button type="button" onclick="event.stopPropagation(); window.quickResizeSlot('${colKey}', ${index}, '${sk}')" title="${sizeLabels[sk]}" style="background:${isActive ? 'var(--accent-color)' : 'var(--bg-secondary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-light)'}; font-family: var(--font-ui); font-size: 0.6rem; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-weight: 700;">${sk === 'compact' ? 'S' : sk === 'normal' ? 'M' : 'L'}</button>`;
    });
 
    let widthButtons = '';
    for (let w = 1; w <= 3; w++) {
        const isActive = currentSlotWidth === w;
        widthButtons += `<button type="button" onclick="event.stopPropagation(); window.quickSetSlotWidth('${colKey}', ${index}, ${w})" title="${w}x Genişlik" style="background:${isActive ? '#2e7d32' : 'var(--bg-secondary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? '#2e7d32' : 'var(--border-light)'}; font-family: var(--font-ui); font-size: 0.6rem; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-weight: 700;">${w}x</button>`;
    }
 
    let heightButtons = '';
    for (let h = 1; h <= 3; h++) {
        const isActive = currentSlotHeight === h;
        heightButtons += `<button type="button" onclick="event.stopPropagation(); window.quickSetSlotHeight('${colKey}', ${index}, ${h})" title="${h}x Yükseklik" style="background:${isActive ? '#1565c0' : 'var(--bg-secondary)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'}; border:1px solid ${isActive ? '#1565c0' : 'var(--border-light)'}; font-family: var(--font-ui); font-size: 0.6rem; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-weight: 700;">${h}↕</button>`;
    }
 
    return `
        <div class="editor-slot-wrapper slot-size-${currentSize} slot-height-${currentSlotHeight}" style="grid-column: span ${currentSlotWidth}; grid-row: span ${currentSlotHeight}; min-width: 0; position: relative; border: 2px solid var(--accent-color); margin-bottom: 16px; border-radius: 8px; background: rgba(201, 64, 64, 0.01); display: flex; flex-direction: column; overflow: hidden;">
            <!-- Editor Toolbar -->
            <div class="slot-editor-toolbar" style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-light); padding: 8px 12px; display: flex; flex-direction: column; gap: 8px; font-family: var(--font-ui); z-index: 10;">
                <!-- Toolbar Row 1: Content, Style Selectors and Actions -->
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; width: 100%; gap: 6px;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <!-- Content Selector -->
                        <div style="display: flex; align-items: center; gap: 3px; background: rgba(0,0,0,0.02); padding: 2px 4px; border-radius: 4px; border: 1px solid var(--border-light);">
                            <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.55rem; text-transform: uppercase;">İÇERİK:</span>
                            <select onchange="event.stopPropagation(); window.quickSetSlotValue('${colKey}', ${index}, this.value)" style="font-size: 0.65rem; padding: 1px 4px; border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-light); font-weight: 700; font-family: var(--font-ui); cursor: pointer;">
                                ${valueOptionsList.map(opt => `<option value="${opt.value}" ${slot.value === opt.value ? 'selected' : ''}>${opt.type === 'system' ? '⚙️' : '✒️'} ${opt.label}</option>`).join('')}
                            </select>
                        </div>
                        
                        <!-- Style Selector -->
                        <div style="display: flex; align-items: center; gap: 3px; background: rgba(0,0,0,0.02); padding: 2px 4px; border-radius: 4px; border: 1px solid var(--border-light);">
                            <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.55rem; text-transform: uppercase;">STİL:</span>
                            <select onchange="event.stopPropagation(); window.quickSetSlotStyle('${colKey}', ${index}, this.value)" style="font-size: 0.65rem; padding: 1px 4px; border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-light); font-weight: 700; font-family: var(--font-ui); cursor: pointer;">
                                ${styleOptions.map(opt => `<option value="${opt.value}" ${slot.style === opt.value ? 'selected' : ''}>🎨 ${opt.label}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <button type="button" onclick="event.stopPropagation(); window.quickRemoveSlot('${colKey}', ${index})" title="Slotu Kaldır" style="background: #c94040; border: none; color: #ffffff; font-size: 0.65rem; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: 700; transition: background 0.2s; white-space: nowrap;">✕ Kaldır</button>
                </div>
                
                <!-- Toolbar Row 2: Adjustments -->
                <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 0.65rem; width: 100%;">
                    <!-- Move Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">KONUM:</span>
                        <div style="display: flex; gap: 2px;">
                            ${moveButtons}
                            ${upDownButtons}
                        </div>
                    </div>
                    
                    <!-- Size Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">PUNTO:</span>
                        <div style="display: flex; gap: 2px;">
                            ${sizeButtons}
                        </div>
                    </div>
                    
                    <!-- Width Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">EN:</span>
                        <div style="display: flex; gap: 2px;">
                            ${widthButtons}
                        </div>
                    </div>
                    
                    <!-- Height Control -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.02); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-light);">
                        <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.6rem;">BOY:</span>
                        <div style="display: flex; gap: 2px;">
                            ${heightButtons}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Card Content -->
            <div style="padding: 12px; flex: 1; display: flex; flex-direction: column;">
                ${cardHTML}
            </div>
        </div>
    `;
}

function renderSlotHelper(slot, index, sorted, headlines, recentComments) {
    if (!slot) return "";

    if (slot.type === 'system') {
        if (slot.value === 'headline') {
            const art = headlines[currentPage - 1];
            if (!art) return "";
            return renderSlotCard(art, index, 'headline', 'MANŞET', '');
        }
        
        if (slot.value === 'recent_comments') {
            let commentsHTML = "";
            const activeComments = recentComments.filter(c => c && c.text);
            activeComments.slice(0, 3).forEach((c, idx) => {
                const art = articles.find(a => a.id === c.articleId);
                const articleLinkHtml = art 
                    ? `<span onclick="window.openArticle('${art.id}')" style="font-weight: 500; cursor: pointer; text-decoration: underline; text-underline-offset: 2px;" title="Yazıyı Oku">✍️ ${truncateText(art.title, 20)}</span>`
                    : "";
                const borderStyle = idx === activeComments.slice(0, 3).length - 1 ? "border-bottom: none; padding-bottom: 0; margin-bottom: 0;" : "border-bottom: 1px dotted var(--border-light); padding-bottom: 10px; margin-bottom: 10px;";
                
                commentsHTML += `
                    <div class="reader-quote-item" style="${borderStyle}">
                        <p style="font-family: var(--font-body); font-size: 0.78rem; line-height: 1.4; color: var(--text-primary); font-style: italic; margin-bottom: 4px;">
                            “ ${c.text} ”
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-family: var(--font-ui); font-size: 0.68rem; color: var(--text-secondary); margin-top: 5px;">
                            ${articleLinkHtml}
                            <span class="reader-quote-author" style="font-weight: 700;">— ${c.author}</span>
                        </div>
                    </div>
                `;
            });
            if (!commentsHTML) {
                commentsHTML = `
                    <div style="font-size: 0.75rem; color: var(--text-secondary); text-align: center; font-style: italic; padding: 15px 0;">
                        Henüz okur yorumu bulunmuyor. İlk yorumu siz yazın!
                    </div>
                `;
            }
            return `
                <div class="article-card" style="border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px; cursor: default;" onclick="event.stopPropagation();">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">OKUR YORUMLARI</span>
                    <div class="reader-quotes" style="margin-top: 10px; margin-bottom: 10px;">
                        ${commentsHTML}
                    </div>
                </div>
            `;
        }
        
        if (slot.value === 'editor_note') {
            return `
                <div class="editor-note-box" style="margin-bottom: 20px;">
                    <div class="editor-note-tag">
                        <span>EDİTÖRÜN</span>
                        <span>NOTU</span>
                        <svg viewBox="0 0 24 24"><path d="M14 18.44l-4-4 2.83-2.83 4 4L14 18.44zm-7.66-2.6L12 10.12l-1.41-1.41L4.93 14.43l1.41 1.41zM20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41zM3 21h3.75L17.81 9.94l-3.75-3.75L3 17.25V21z"/></svg>
                    </div>
                    <div class="editor-note-content">
                        <p class="editor-note-quote">“${editorNoteData.quote}”</p>
                        <p class="editor-note-desc">${editorNoteData.desc}</p>
                    </div>
                </div>
            `;
        }
        
        if (slot.value === 'popular_posts') {
            const topArticles = sorted.slice(0, 5);
            let popularHTML = "";
            topArticles.forEach(art => {
                const categoryLabel = art.category ? art.category.replace("-", " ").toUpperCase() : "EDEBİYAT";
                const author = art.author && art.author !== "undefined" ? art.author : "Mürekkep Yazarı";
                popularHTML += `
                    <li class="popular-item" data-id="${art.id}">
                        <div class="popular-item-meta">
                            <span class="popular-item-category">${categoryLabel}</span>
                            <span class="popular-item-claps">
                                <svg viewBox="0 0 24 24"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm-1.78 12.77c-.31.31-.69.43-1.07.43-.38 0-.76-.12-1.07-.43-.59-.59-.59-1.54 0-2.12l4.9-4.9c.59-.59 1.54-.59 2.12 0 .59.59.59 1.54 0 2.12l-4.88 4.9zm4.78-4.78c.31-.31.69-.43 1.07-.43.38 0 .76.12 1.07.43.59.59.59 1.54 0 2.12l-4.9 4.9c-.3.3-.68.44-1.06.44-.38 0-.76-.14-1.06-.44-.59-.59-.59-1.54 0-2.12l4.95-4.91z"/></svg>
                                ${art.claps}
                            </span>
                        </div>
                        <h4 class="popular-item-title">${art.title}</h4>
                        <span class="popular-item-author">${author}</span>
                    </li>
                `;
            });

            return `
                <div class="article-card popular-articles-box" style="margin-bottom: 20px;">
                    <span class="card-category">POPÜLER YAZILAR</span>
                    <ul class="popular-list">
                        ${popularHTML}
                    </ul>
                </div>
            `;
        }
        
        if (slot.value === 'popular_authors') {
            const authorMap = {};
            articles.forEach(art => {
                if (!art.author) return;
                const authorNorm = art.author.trim();
                if (!authorMap[authorNorm]) {
                    authorMap[authorNorm] = {
                        name: authorNorm,
                        claps: 0,
                        avatar: authorNorm.substring(0, 1).toUpperCase()
                    };
                }
                authorMap[authorNorm].claps += (parseInt(art.claps) || 0);
            });
            
            const sortedAuthors = Object.values(authorMap).sort((a, b) => b.claps - a.claps).slice(0, 5);
            
            let authorsHTML = "";
            sortedAuthors.forEach((auth, idx) => {
                const badgeHtml = getAuthorRankBadgeHtml(auth.name);
                authorsHTML += `
                    <li class="popular-item" style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px dashed var(--border-light); cursor: default; margin-bottom: 4px;" onclick="event.stopPropagation();">
                        ${getAuthorAvatarHtml(auth.name, 32)}
                        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
                            <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                                <span onclick="window.openAuthorProfile('${auth.name.replace(/'/g, "\\'")}')" style="font-family: var(--font-ui); font-size: 0.78rem; font-weight: 800; color: var(--text-primary); cursor: pointer; text-decoration: underline; text-underline-offset: 2px; transition: color 0.2s;" onmouseover="this.style.color='var(--accent-color)'" onmouseout="this.style.color='var(--text-primary)'">${auth.name}</span>
                                ${badgeHtml}
                            </div>
                            <span style="font-size: 0.65rem; color: var(--text-secondary);">Edebi Etkileşim: 👏 ${auth.claps} | 👥 ${getAuthorFollowerCount(auth.name)}</span>
                        </div>
                        <div style="font-family: var(--font-header); font-size: 0.95rem; font-weight: 900; color: var(--text-secondary); opacity: 0.5;">#${idx + 1}</div>
                    </li>
                `;
            });

            return `
                <div class="article-card popular-articles-box" style="margin-bottom: 20px;">
                    <span class="card-category">HAFTANIN KALEMLERİ</span>
                    <ul class="popular-list" style="list-style: none; padding: 0; margin: 10px 0 0 0; display: flex; flex-direction: column; gap: 4px;">
                        ${authorsHTML || '<li style="font-size:0.75rem; color:var(--text-secondary); text-align:center; padding:10px 0;">Henüz yazar bulunmuyor.</li>'}
                    </ul>
                </div>
            `;
        }
    } else if (slot.type === 'category') {
        const art = _slotArticleMap[slot.id];
        if (!art) {
            if (isEditorModeActive) {
                return `
                    <div class="empty-slot-placeholder" style="border: 2px dashed var(--border-color); padding: 20px; text-align: center; background: rgba(0,0,0,0.02); border-radius: 8px; margin-bottom: 10px;">
                        <span style="font-family: var(--font-ui); font-size: 0.75rem; font-weight: bold; color: var(--text-secondary);">[BOŞ SLOT: ${slot.label}]</span>
                        <p style="font-size: 0.65rem; color: var(--text-secondary); margin: 4px 0 0 0;">Bu sayfada gösterilecek yazı bulunamadı.</p>
                    </div>
                `;
            }
            // Visitor: neat placeholder
            const isUserLoggedIn = !!currentUser;
            const helperText = isUserLoggedIn
                ? "Yazı eklemek için yukarıdaki Yazı Yaz butonunu kullanabilirsiniz."
                : "Yazı eklemek için giriş yapıp yazabilirsiniz.";
            const actionBtn = isUserLoggedIn
                ? `<button onclick="window.openEditorWithCategory('${slot.value}')" style="margin-top: 10px; background: transparent; border: 1px solid var(--accent-color); color: var(--accent-color); font-family: var(--font-ui); font-size: 0.65rem; font-weight: 700; padding: 5px 12px; border-radius: 15px; cursor: pointer; text-transform: uppercase; transition: all 0.2s;" onmouseover="this.style.background='var(--accent-color)'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='var(--accent-color)';">Yazı Ekle</button>`
                : `<button onclick="document.getElementById('login-toggle').click()" style="margin-top: 10px; background: transparent; border: 1px solid var(--text-primary); color: var(--text-primary); font-family: var(--font-ui); font-size: 0.65rem; font-weight: 700; padding: 5px 12px; border-radius: 15px; cursor: pointer; text-transform: uppercase; transition: all 0.2s;" onmouseover="this.style.background='var(--text-primary)'; this.style.color='var(--bg-primary)';" onmouseout="this.style.background='transparent'; this.style.color='var(--text-primary)';">Giriş Yap</button>`;
            return `
                <div class="article-card empty-slot-card" style="border: 1px dashed var(--border-light); background: var(--bg-secondary); display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 170px; padding: 20px; text-align: center; margin-bottom: 15px; border-radius: 8px; box-shadow: none;">
                    <span class="card-category" style="opacity: 0.4; font-size: 0.65rem; letter-spacing: 0.5px; font-weight: 700;">YAZI EKLE</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); opacity: 0.5; margin: 8px 0 4px 0;">YAZI BEKLENİYOR</h3>
                    <p style="font-size: 0.68rem; color: var(--text-secondary); opacity: 0.5; margin: 0; line-height: 1.3;">${helperText}</p>
                    ${actionBtn}
                </div>
            `;
        }

        // Slot visual style: determined by the ARTICLE's own category (not slot's)
        let styleType = art.category || slot.value;
        if (slot.style === 'headline') styleType = 'headline';
        else if (slot.style === 'editorial') styleType = 'editorial';
        else if (slot.style === 'columnist') styleType = 'kose';
        else if (slot.style === 'poem') styleType = 'siir';
        else if (slot.style === 'list') styleType = 'popular_list';

        const catBadge = (art.corner_name || (art.category ? art.category.replace("-", " ") : slot.label)).toUpperCase();
        return renderSlotCard(art, index, styleType, catBadge, '');
    }
    
    return "";
}

// Editor Action Handlers on Window
window.updateSlotTypeVal = function(colKey, index, value) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    const slot = layoutConfig[colKey][index];
    slot.value = value;
    const systemVals = ["headline", "recent_comments", "popular_posts", "editor_note"];
    slot.type = systemVals.includes(value) ? "system" : "category";
    
    const labels = {
        headline: "Manşet",
        recent_comments: "Okur Yorumları",
        popular_posts: "Çok Okunanlar",
        editor_note: "Editörün Notu"
    };
    if (slot.type === "system") {
        slot.label = labels[value];
    } else {
        const cat = getCategoriesList().find(c => c.id === value);
        slot.label = cat ? cat.name : value;
    }
    renderLayoutConfigurator();
};

window.updateSlotLabel = function(colKey, index, value) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].label = value;
};

window.updateSlotStyle = function(colKey, index, style) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].style = style;
    renderLayoutConfigurator();
};

window.updateSlotSize = function(colKey, index, size) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].size = size;
    renderLayoutConfigurator();
};

window.updateSlotWidth = function(colKey, index, width) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].slotWidth = width;
    renderLayoutConfigurator();
};

window.updateSlotHeight = function(colKey, index, height) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].slotHeight = height;
    renderLayoutConfigurator();
};

window.removeSlotFromColumn = function(colKey, index) {
    if (!layoutConfig || !layoutConfig[colKey]) return;
    layoutConfig[colKey].splice(index, 1);
    renderLayoutConfigurator();
};

window.addSlotToColumn = function(colKey) {
    if (!layoutConfig || !layoutConfig[colKey]) return;
    layoutConfig[colKey].push({
        type: "category",
        value: "kitap",
        label: "Kitap İncelemesi",
        size: "normal",
        slotWidth: 1,
        slotHeight: 1,
        style: "standard"
    });
    renderLayoutConfigurator();
};

window.saveLayoutFromUI = async function() {
    await saveEditorNoteData();
    await saveLayoutConfig();
    showToast("✅ Mizanpaj ve Site Ayarları başarıyla kaydedildi!");
    const modal = document.getElementById("settings-modal");
    if (modal) modal.classList.add("hidden");
    renderNewspaperGrid();
};

window.openEditorWithCategory = function(category) {
    if (!currentUser) {
        openAuthModal();
        showToast("Yazı yayınlamak için lütfen giriş yapın.");
        return;
    }
    const writeBtn = document.getElementById("write-toggle");
    if (writeBtn) {
        writeBtn.click();
    }
    const categorySelect = document.getElementById("post-category");
    if (categorySelect && category) {
        categorySelect.value = category;
    }
};

window.quickAddSlot = function(colKey) {
    if (!layoutConfig || !layoutConfig[colKey]) return;
    layoutConfig[colKey].push({
        type: "category",
        value: "kitap",
        label: "Kitap İncelemesi",
        size: "normal",
        slotWidth: 1,
        slotHeight: 1,
        style: "standard"
    });
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    const colNames = { col1: 'Sol', col2: 'Orta', col3: 'Sağ' };
    showToast(`➕ ${colNames[colKey]} sütuna yeni bir slot eklendi!`);
};

window.quickRemoveSlot = function(colKey, index) {
    if (!layoutConfig || !layoutConfig[colKey]) return;
    layoutConfig[colKey].splice(index, 1);
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    showToast(`✕ Slot kaldırıldı.`);
};

window.quickSetSlotValue = function(colKey, index, val) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    
    // Determine type (system vs category)
    const cats = getCategoriesList();
    const isCategory = cats.some(c => c.id === val);
    
    layoutConfig[colKey][index].type = isCategory ? "category" : "system";
    layoutConfig[colKey][index].value = val;
    
    // Update label
    if (isCategory) {
        const cat = cats.find(c => c.id === val);
        layoutConfig[colKey][index].label = cat ? cat.name : val;
    } else {
        const systemLabels = {
            headline: "Manşet",
            recent_comments: "Okur Yorumları",
            popular_posts: "Çok Okunanlar",
            popular_authors: "Haftanın Yazarları",
            editor_note: "Editörün Notu"
        };
        layoutConfig[colKey][index].label = systemLabels[val] || val;
    }
    
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    showToast(`📝 Slot içeriği güncellendi!`);
};

window.quickSetSlotStyle = function(colKey, index, style) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].style = style;
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    showToast(`🎨 Slot tasarımı güncellendi!`);
};

window.quickSetColWidth = function(colKey, width) {
    if (!layoutConfig) return;
    if (!layoutConfig.colWidths) layoutConfig.colWidths = { col1: 1, col2: 2, col3: 1 };
    layoutConfig.colWidths[colKey] = width;
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    const colNames = { col1: 'Sol Sütun', col2: 'Orta Sütun', col3: 'Sağ Sütun' };
    showToast(`📐 ${colNames[colKey]} genişliği ${width}x olarak ayarlandı!`);
};

window.quickSetSlotWidth = function(colKey, index, width) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].slotWidth = width;
    saveLayoutConfig();
    renderNewspaperGrid();
    const colNames = { col1: 'Sol', col2: 'Orta', col3: 'Sağ' };
    showToast(`↔️ ${colNames[colKey]} sütunu ${index + 1}. slot ${width}x genişliğe ayarlandı!`);
};

window.quickSetSlotHeight = function(colKey, index, height) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].slotHeight = height;
    saveLayoutConfig();
    renderNewspaperGrid();
    const colNames = { col1: 'Sol', col2: 'Orta', col3: 'Sağ' };
    showToast(`↕️ ${colNames[colKey]} sütunu ${index + 1}. slot ${height}x yüksekliğe ayarlandı!`);
};

window.quickResizeSlot = function(colKey, index, size) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    layoutConfig[colKey][index].size = size;
    saveLayoutConfig();
    renderNewspaperGrid();
};

window.quickMoveSlot = function(colKey, index, targetCol) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[targetCol]) return;
    const [slot] = layoutConfig[colKey].splice(index, 1);
    const targetCw = layoutConfig.colWidths[targetCol] || 1;
    if (slot.slotWidth > targetCw) {
        slot.slotWidth = 1;
    }
    layoutConfig[targetCol].push(slot);
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    const colNames = { col1: 'Sol', col2: 'Orta', col3: 'Sağ' };
    showToast(`📦 Slot, ${colNames[colKey]} sütunundan ${colNames[targetCol]} sütununa taşındı!`);
};

window.quickMoveSlotUpDown = function(colKey, index, direction) {
    if (!layoutConfig || !layoutConfig[colKey] || !layoutConfig[colKey][index]) return;
    const slots = layoutConfig[colKey];
    if (direction === 'up' && index > 0) {
        const temp = slots[index];
        slots[index] = slots[index - 1];
        slots[index - 1] = temp;
    } else if (direction === 'down' && index < slots.length - 1) {
        const temp = slots[index];
        slots[index] = slots[index + 1];
        slots[index + 1] = temp;
    } else {
        return;
    }
    saveLayoutConfig();
    renderNewspaperGrid();
    renderLayoutConfigurator();
    const dirLabel = direction === 'up' ? 'yukarı' : 'aşağı';
    const colNames = { col1: 'Sol', col2: 'Orta', col3: 'Sağ' };
    showToast(`↕️ Slot ${colNames[colKey]} sütununda ${dirLabel} taşındı!`);
};

window.addCustomCategory = async function() {
    const input = document.getElementById("new-category-input");
    if (!input || !input.value.trim()) return;
    
    const catName = input.value.trim();
    const catId = "c_" + catName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    
    if (getCategoriesList().some(c => c.id === catId)) {
        showToast("⚠️ Bu kategori zaten mevcut!");
        return;
    }
    
    customCategories.push({ id: catId, name: catName });
    await saveCategories();
    input.value = "";
    
    showToast(`✅ '${catName}' kategorisi başarıyla eklendi!`);
    renderCategoriesNav();
    renderCategoriesDropdown();
    renderCustomCategoriesList();
    renderLayoutConfigurator();
};

window.removeCustomCategory = async function(catId) {
    customCategories = customCategories.filter(c => c.id !== catId);
    await saveCategories();
    showToast("✅ Kategori kaldırıldı.");
    renderCategoriesNav();
    renderCategoriesDropdown();
    renderCustomCategoriesList();
    renderLayoutConfigurator();
};

// =============================================

const mainGrid = document.getElementById("newspaper-main-grid");
const themeToggleBtn = document.getElementById("theme-toggle");
const writeToggleBtn = document.getElementById("write-toggle");
const editorOverlay = document.getElementById("editor-overlay");
const closeEditorBtn = document.getElementById("close-editor");
const publishForm = document.getElementById("publish-form");
const readingOverlay = document.getElementById("reading-overlay");
const closeReadingBtn = document.getElementById("close-reading");
const readingProgress = document.getElementById("reading-progress");

// Article Detail DOM
const detailCategory = document.getElementById("article-detail-category");
const detailTitle = document.getElementById("article-detail-title");
const detailSubtitle = document.getElementById("article-detail-subtitle");
const detailAuthor = document.getElementById("article-detail-author");
const detailAvatarContainer = document.getElementById("article-detail-avatar-container");
const detailDate = document.getElementById("article-detail-date");
const detailReadtime = document.getElementById("article-detail-readtime");
const detailClapCount = document.getElementById("article-clap-count");
const detailClapBtn = document.getElementById("article-clap-btn");
const detailImage = document.getElementById("article-detail-image");
const detailContent = document.getElementById("article-detail-content");
const commentForm = document.getElementById("comment-form");
const commentAuthorInput = document.getElementById("comment-author-input");
const commentTextInput = document.getElementById("comment-text-input");
const commentsListContainer = document.getElementById("comments-list-container");
const commentsTotalCountEl = document.getElementById("comments-total-count");
const commentsDrawer = document.getElementById("comments-drawer");
const commentsDrawerBackdrop = document.getElementById("comments-drawer-backdrop");
const closeCommentsDrawerBtn = document.getElementById("close-comments-drawer");
const commentsTriggerBar = document.getElementById("comments-trigger-bar");
const articleCommentBtn = document.getElementById("article-comment-btn");
const articleEditorEditBtn = document.getElementById("article-editor-edit-btn");
let editingArticleId = null;

// SEO State & Management Helpers
let isAppBooted = false;
let defaultSEO = {
    title: document.title,
    description: "",
    keywords: "",
    author: "",
    ogTitle: "",
    ogDescription: "",
    ogUrl: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    canonicalHref: ""
};

// Backup default SEO tags once DOM is fully loaded or when script runs
function backupDefaultSEO() {
    const descMeta = document.querySelector('meta[name="description"]');
    const keyMeta = document.querySelector('meta[name="keywords"]');
    const authMeta = document.querySelector('meta[name="author"]');
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    const ogDescMeta = document.querySelector('meta[property="og:description"]');
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    const ogImgMeta = document.querySelector('meta[property="og:image"]');
    const twTitleMeta = document.querySelector('meta[name="twitter:title"]');
    const twDescMeta = document.querySelector('meta[name="twitter:description"]');
    const twImgMeta = document.querySelector('meta[name="twitter:image"]');
    const canonicalLink = document.querySelector('link[rel="canonical"]');

    defaultSEO.title = document.title;
    defaultSEO.description = descMeta ? descMeta.getAttribute("content") : "";
    defaultSEO.keywords = keyMeta ? keyMeta.getAttribute("content") : "";
    defaultSEO.author = authMeta ? authMeta.getAttribute("content") : "";
    defaultSEO.ogTitle = ogTitleMeta ? ogTitleMeta.getAttribute("content") : "";
    defaultSEO.ogDescription = ogDescMeta ? ogDescMeta.getAttribute("content") : "";
    defaultSEO.ogUrl = ogUrlMeta ? ogUrlMeta.getAttribute("content") : "";
    defaultSEO.ogImage = ogImgMeta ? ogImgMeta.getAttribute("content") : "";
    defaultSEO.twitterTitle = twTitleMeta ? twTitleMeta.getAttribute("content") : "";
    defaultSEO.twitterDescription = twDescMeta ? twDescMeta.getAttribute("content") : "";
    defaultSEO.twitterImage = twImgMeta ? twImgMeta.getAttribute("content") : "";
    defaultSEO.canonicalHref = canonicalLink ? canonicalLink.getAttribute("href") : "https://murekkepgzt.com";
}

// Call backup function immediately
backupDefaultSEO();

// Check for deep links on initial page load (supporting both query param & hash for social sharing)
function checkDeepLink() {
    const urlParams = new URLSearchParams(window.location.search);
    let targetArticleId = urlParams.get('article');

    if (!targetArticleId && window.location.hash) {
        const hashVal = window.location.hash.replace('#', '').trim();
        if (hashVal.startsWith('art_') || hashVal.startsWith('art-') || hashVal.length > 3) {
            targetArticleId = hashVal;
        }
    }

    if (targetArticleId) {
        setTimeout(() => {
            openArticle(targetArticleId);
        }, 150);
    }
}

function updateSEOMetadata(article) {
    const descMeta = document.querySelector('meta[name="description"]');
    const keyMeta = document.querySelector('meta[name="keywords"]');
    const authMeta = document.querySelector('meta[name="author"]');
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    const ogDescMeta = document.querySelector('meta[property="og:description"]');
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    const ogImgMeta = document.querySelector('meta[property="og:image"]');
    const twTitleMeta = document.querySelector('meta[name="twitter:title"]');
    const twDescMeta = document.querySelector('meta[name="twitter:description"]');
    const twImgMeta = document.querySelector('meta[name="twitter:image"]');
    const canonicalLink = document.querySelector('link[rel="canonical"]');

    if (article) {
        const titleText = `${article.title} - Mürekkep Gazetesi`;
        const descText = article.subtitle || article.title;
        const authorText = article.author;
        const keywordsText = `mürekkep, edebiyat, ${article.category}, ${article.author}, ${article.title.toLowerCase().replace(/[^a-z0-9ıışğçöü ]/gi, '').split(' ').join(', ')}`;
        const articleUrl = `${window.location.origin}${window.location.pathname}?article=${article.id}`;
        
        let absImgUrl = article.image || 'assets/typewriter_birds.webp';
        if (absImgUrl && !absImgUrl.startsWith('http')) {
            absImgUrl = `${window.location.origin}/${absImgUrl}`;
        }

        // Update Document Title
        document.title = titleText;

        // Update standard Meta Tags
        if (descMeta) descMeta.setAttribute("content", descText);
        if (keyMeta) keyMeta.setAttribute("content", keywordsText);
        if (authMeta) authMeta.setAttribute("content", authorText);

        // Update Open Graph (Facebook, WhatsApp, etc.)
        if (ogTitleMeta) ogTitleMeta.setAttribute("content", titleText);
        if (ogDescMeta) ogDescMeta.setAttribute("content", descText);
        if (ogUrlMeta) ogUrlMeta.setAttribute("content", articleUrl);
        if (ogImgMeta) ogImgMeta.setAttribute("content", absImgUrl);

        // Update Twitter Cards
        if (twTitleMeta) twTitleMeta.setAttribute("content", titleText);
        if (twDescMeta) twDescMeta.setAttribute("content", descText);
        if (twImgMeta) twImgMeta.setAttribute("content", absImgUrl);

        // Update Canonical Link
        if (canonicalLink) canonicalLink.setAttribute("href", articleUrl);

        // Update structured data (JSON-LD)
        updateJSONLD(article);
    } else {
        // Restore defaults
        document.title = defaultSEO.title;
        if (descMeta) descMeta.setAttribute("content", defaultSEO.description);
        if (keyMeta) keyMeta.setAttribute("content", defaultSEO.keywords);
        if (authMeta) authMeta.setAttribute("content", defaultSEO.author);
        
        if (ogTitleMeta) ogTitleMeta.setAttribute("content", defaultSEO.ogTitle);
        if (ogDescMeta) ogDescMeta.setAttribute("content", defaultSEO.ogDescription);
        if (ogUrlMeta) ogUrlMeta.setAttribute("content", defaultSEO.ogUrl);
        if (ogImgMeta) ogImgMeta.setAttribute("content", defaultSEO.ogImage);

        if (twTitleMeta) twTitleMeta.setAttribute("content", defaultSEO.twitterTitle);
        if (twDescMeta) twDescMeta.setAttribute("content", defaultSEO.twitterDescription);
        if (twImgMeta) twImgMeta.setAttribute("content", defaultSEO.twitterImage);

        if (canonicalLink) canonicalLink.setAttribute("href", defaultSEO.canonicalHref);

        // Revert to default JSON-LD structure
        updateJSONLD(null);
    }
}

function updateJSONLD(article) {
    let script = document.getElementById('seo-json-ld');
    if (script) script.remove();

    script = document.createElement('script');
    script.id = 'seo-json-ld';
    script.type = 'application/ld+json';

    if (article) {
        let absImgUrl = article.image || 'assets/typewriter_birds.webp';
        if (absImgUrl && !absImgUrl.startsWith('http')) {
            absImgUrl = `${window.location.origin}/${absImgUrl}`;
        }
        
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "description": article.subtitle || article.title,
            "image": [absImgUrl],
            "datePublished": article.date,
            "author": [{
                "@type": "Person",
                "name": article.author,
                "url": `${window.location.origin}/#author-${encodeURIComponent(article.author)}`
            }],
            "publisher": {
                "@type": "Organization",
                "name": "Mürekkep Gazetesi",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${window.location.origin}/assets/logo.jpg`
                }
            },
            "mainEntityOfPage": `${window.location.origin}/?article=${article.id}`
        });
    } else {
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsMediaOrganization",
            "name": "Mürekkep Gazetesi",
            "url": "https://murekkepgzt.com",
            "logo": "https://murekkepgzt.com/assets/logo.jpg",
            "sameAs": [
                "https://twitter.com/murekkepgazetesi",
                "https://instagram.com/murekkepgazetesi"
            ]
        });
    }
    document.head.appendChild(script);
}

// Auth DOM Elements
const authOverlay = document.getElementById("auth-overlay");
const closeAuthBtn = document.getElementById("close-auth");
const loginToggleBtn = document.getElementById("login-toggle");
const logoutBtn = document.getElementById("logout-btn");
const userProfileSection = document.getElementById("user-profile-section");
const userDisplayName = document.getElementById("user-display-name");
const userAvatarCircle = document.getElementById("user-avatar-circle");
const profileAvatarBtn = document.getElementById("profile-avatar-btn");
const profileDropdownMenu = document.getElementById("profile-dropdown-menu");
const dropdownAvatarLarge = document.getElementById("dropdown-avatar-large");
const dropdownUserName = document.getElementById("dropdown-user-name");
const dropdownUserEmail = document.getElementById("dropdown-user-email");
const dropdownBookmarksBtn = document.getElementById("dropdown-bookmarks-btn");
const dropdownSettingsBtn = document.getElementById("dropdown-settings-btn");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const bookmarksTab = document.getElementById("bookmarks-tab");
const articleSaveBtn = document.getElementById("article-save-btn");

// Profile dropdown open/close
function toggleProfileDropdown(forceClose = false) {
    if (!profileDropdownMenu || !profileAvatarBtn) return;
    const isOpen = !profileDropdownMenu.classList.contains("hidden");
    if (forceClose || isOpen) {
        profileDropdownMenu.classList.add("hidden");
        profileAvatarBtn.setAttribute("aria-expanded", "false");
    } else {
        profileDropdownMenu.classList.remove("hidden");
        profileAvatarBtn.setAttribute("aria-expanded", "true");
        
        // Close notifications dropdown if open
        const notifMenu = document.getElementById("notifications-dropdown-menu");
        if (notifMenu) notifMenu.classList.add("hidden");
        const notifBtn = document.getElementById("notifications-btn");
        if (notifBtn) notifBtn.setAttribute("aria-expanded", "false");
    }
}


// Current active article ID inside modal
let activeArticleId = null;
let currentCategoryFilter = "all";
let currentPage = 1;
// Shared state for sequential slot filling
let _slotArticleIdx = 0;
let _pageArticles = [];
let _slotArticleMap = {};

// Function to sort articles by claps descending
function getSortedArticles() {
    return articles.slice().sort((a, b) => b.claps - a.claps);
}

// Visitor and Page statistics tracking
async function trackPageVisit(pageName, articleId = null, category = null) {
    try {
        // 1. Unique Visitor Check
        let visitorUuid = localStorage.getItem("murekkep_visitor_uuid");
        let isAbsoluteUnique = false;
        if (!visitorUuid) {
            visitorUuid = 'visitor_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("murekkep_visitor_uuid", visitorUuid);
            isAbsoluteUnique = true;
        }

        const today = new Date().toISOString().split('T')[0];
        let lastVisitDate = localStorage.getItem("murekkep_last_visit_date");
        let isDailyUnique = false;
        if (lastVisitDate !== today) {
            localStorage.setItem("murekkep_last_visit_date", today);
            isDailyUnique = true;
        }

        // 2. Detect Device
        const ua = navigator.userAgent;
        let device = "desktop";
        if (/Mobi|Android|iPhone|iPad|Windows Phone/i.test(ua)) {
            if (/iPad|tablet/i.test(ua)) {
                device = "tablet";
            } else {
                device = "mobile";
            }
        }

        // 3. Detect Browser
        let browser = "other";
        if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr/i.test(ua)) {
            browser = "chrome";
        } else if (/firefox|iceweasel/i.test(ua)) {
            browser = "firefox";
        } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
            browser = "safari";
        } else if (/edge|edg/i.test(ua)) {
            browser = "edge";
        }



        // 5. Load existing statistics
        let stats = null;
        if (isSupabaseConnected && supabaseClient) {
            try {
                const { data } = await supabaseClient
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'site_statistics')
                    .maybeSingle();
                if (data && data.value) {
                    stats = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                }
            } catch (e) {
                console.warn("Failed to load stats from Supabase:", e);
            }
        }

        if (!stats) {
            try {
                const saved = localStorage.getItem("murekkep_site_statistics");
                if (saved) stats = JSON.parse(saved);
            } catch (e) {}
        }

        // Initialize default stats if not exists
        if (!stats || typeof stats !== 'object') {
            stats = {
                totalPageViews: 0,
                totalUniqueVisitors: 0,
                categoryViews: {
                    manset: 0, siir: 0, oyku: 0, deneme: 0, kitap: 0, roportaj: 0, "kose-yazilari": 0, haber: 0, yarismalar: 0
                },
                articleViews: {},
                deviceStats: { desktop: 0, mobile: 0, tablet: 0 },
                browserStats: { chrome: 0, firefox: 0, safari: 0, edge: 0, other: 0 },
                dailyStats: {},
                recentVisits: []
            };
        }

        // 6. Update Stats Counters
        stats.totalPageViews = (stats.totalPageViews || 0) + 1;
        if (isAbsoluteUnique) {
            stats.totalUniqueVisitors = (stats.totalUniqueVisitors || 0) + 1;
        }

        // Update Device & Browser
        if (!stats.deviceStats) stats.deviceStats = { desktop: 0, mobile: 0, tablet: 0 };
        stats.deviceStats[device] = (stats.deviceStats[device] || 0) + 1;

        if (!stats.browserStats) stats.browserStats = { chrome: 0, firefox: 0, safari: 0, edge: 0, other: 0 };
        stats.browserStats[browser] = (stats.browserStats[browser] || 0) + 1;

        // Category & Article views if specified
        if (category) {
            if (!stats.categoryViews) stats.categoryViews = {};
            stats.categoryViews[category] = (stats.categoryViews[category] || 0) + 1;
        }
        if (articleId) {
            if (!stats.articleViews) stats.articleViews = {};
            stats.articleViews[articleId] = (stats.articleViews[articleId] || 0) + 1;
        }

        // Update Daily stats
        if (!stats.dailyStats) stats.dailyStats = {};
        if (!stats.dailyStats[today]) {
            stats.dailyStats[today] = { pageViews: 0, uniqueVisitors: 0 };
        }
        stats.dailyStats[today].pageViews = (stats.dailyStats[today].pageViews || 0) + 1;
        if (isDailyUnique) {
            stats.dailyStats[today].uniqueVisitors = (stats.dailyStats[today].uniqueVisitors || 0) + 1;
        }

        // Clean up old daily stats (keep last 30 days)
        const dailyKeys = Object.keys(stats.dailyStats).sort();
        if (dailyKeys.length > 30) {
            for (let i = 0; i < dailyKeys.length - 30; i++) {
                delete stats.dailyStats[dailyKeys[i]];
            }
        }

        // Update Recent Visits Log
        if (!stats.recentVisits) stats.recentVisits = [];
        stats.recentVisits.unshift({
            timestamp: new Date().toISOString(),
            page: pageName,
            device: device,
            browser: browser
        });

        // Keep last 50 visits only
        if (stats.recentVisits.length > 50) {
            stats.recentVisits = stats.recentVisits.slice(0, 50);
        }

        // 7. Save Stats
        localStorage.setItem("murekkep_site_statistics", JSON.stringify(stats));

        if (isSupabaseConnected && supabaseClient) {
            try {
                await supabaseClient
                    .from('site_settings')
                    .upsert({ key: 'site_statistics', value: stats });
            } catch (e) {
                console.error("Failed to save stats to Supabase:", e);
            }
        }
    } catch (e) {
        console.error("Error tracking statistics:", e);
    }
}

// Functions

// Helper to truncate text to prevent cards from overflowing in the grid
function truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
}

// Calculate Read Time
function calculateReadTime(text) {
    const wordsPerMinute = 200;
    const cleanText = text.replace(/<[^>]*>/g, ""); // strip HTML
    const wordCount = cleanText.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} dk okuma`;
}

// Generate unique ID
function generateId() {
    return 'art_' + Math.random().toString(36).substr(2, 9);
}

// Format Date
function formatDate(date) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
}

// Get latest article for a category slot
function getLatestByCategory(cat) {
    const filtered = articles.filter(a => a.category === cat);
    return filtered[filtered.length - 1] || null;
}

// Helper to render dynamic card styles or beautiful placeholder calls
function renderSlotCard(art, slotIndex, styleType, defaultCategoryLabel, pageLabel) {
    if (!art) {
        // Render a beautiful print-style placeholder for empty slot
        return `
            <div class="article-card empty-slot-placeholder" style="border: 1px dashed var(--border-light); padding: 25px; text-align: center; border-radius: 8px; background-color: var(--bg-secondary); margin-bottom: 20px;">
                <span class="card-category" style="color: var(--text-secondary); opacity: 0.7;">BOŞ SÜTUN</span>
                <h4 style="font-family: var(--font-header); font-size: 1.15rem; margin: 15px 0 10px; color: var(--text-secondary);">Yeni Kalemler Aranıyor</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 15px;">Bu sütun boş kalmıştır. Edebiyat hareketine katılmak için hemen bir yazı kaleme alın!</p>
                <button onclick="document.getElementById('write-toggle').click()" style="background-color: transparent; border: 1px solid var(--border-color); color: var(--text-primary); font-family: var(--font-ui); font-size: 0.75rem; font-weight: 700; padding: 6px 12px; border-radius: 15px; cursor: pointer; text-transform: uppercase;">Yazı Ekle</button>
            </div>
        `;
    }

    // Moderation check
    const reports = getArticleReports(art.id);
    if (reports >= 3 && !isEditorModeActive) {
        return `
            <div class="moderated-content-placeholder" style="margin-bottom: 20px;">
                <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: var(--accent-color); margin-bottom: 8px; display: inline-block;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <h4 style="font-family: var(--font-header); font-size: 1rem; margin-bottom: 4px; color: var(--text-primary);">Sütun İncelemede</h4>
                <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; max-width: 300px; margin: 0 auto;">Bu içerik okur şikayetleri sebebiyle geçici olarak editör incelemesine alınmıştır.</p>
            </div>
        `;
    }

    const image = art.image && art.image !== "undefined" ? art.image : "assets/typewriter_birds.webp";
    const subtitle = art.subtitle && art.subtitle !== "undefined" ? art.subtitle : "";
    const author = art.author && art.author !== "undefined" ? art.author : "Mürekkep Yazarı";
    const rankBadge = getAuthorRankBadgeHtml(author);
    const followersVal = getAuthorFollowerCount(author);
    const followersBadge = `<span style="font-size: 0.68rem; font-weight: normal; color: var(--text-secondary); opacity: 0.75; margin-left: 5px; display: inline-flex; align-items: center; gap: 2px;" title="${author} yazarının takipçi sayısı">👥 ${followersVal}</span>`;
    const authorHtml = `<span onclick="event.stopPropagation(); window.openAuthorProfile('${author.replace(/'/g, "\\'")}')" style="cursor: pointer; text-decoration: underline; text-underline-offset: 2px; transition: color 0.2s; display: inline-flex; align-items: center; gap: 2px; flex-wrap: wrap;" onmouseover="this.style.color='var(--accent-color)'" onmouseout="this.style.color=''" title="Yazar Künyesini Göster">${author}${rankBadge}</span>${followersBadge}`;
    const cleanCatName = (art.category || "").trim().toLowerCase();
    const catMap = {
        "siir": "ŞİİR",
        "oyku": "ÖYKÜ",
        "deneme": "DENEME",
        "kitap": "KİTAP İNCELEMESİ",
        "roportaj": "YAZAR RÖPORTAJI",
        "kose-yazilari": "KÖŞE YAZISI",
        "haber": "EDEBİYAT HABERLERİ",
        "yarismalar": "YARIŞMA"
    };
    const categoryLabel = art.corner_name ? art.corner_name.toUpperCase() : (catMap[cleanCatName] || defaultCategoryLabel);

    let cardHTML = "";

    if (styleType === 'headline') {
        const displayLead = truncateText(subtitle, 200);
        cardHTML = `
            <article class="article-card headline-card" data-id="${art.id}" style="display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                <h2 class="card-title" style="font-family: var(--font-header); font-size: 2rem; font-weight: 900; line-height: 1.15; letter-spacing: -0.5px; margin-bottom: 8px; text-align: center;">${art.title}</h2>
                <p class="card-lead" style="font-family: var(--font-body); font-size: 0.95rem; line-height: 1.45; text-align: center; color: var(--text-secondary); margin-bottom: 15px; max-width: 90%; margin-left: auto; margin-right: auto;">${displayLead}</p>
                <div class="card-image-box" style="width: 100%; height: 260px; overflow: hidden; border: 1px solid var(--border-light); border-radius: 4px; margin-bottom: 10px;">
                    <img src="${image}" alt="${art.title}" class="card-image" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src='assets/typewriter_birds.webp';">
                </div>
            </article>
        `;
    } else {
        const displaySubtitle = truncateText(subtitle, 140);

        if (styleType === 'siir' || art.category === 'siir') {
            const poemLines = art.content
                ? art.content
                    .replace(/<br\s*\/?>/gi, "\n")
                    .replace(/<\/p>/gi, "\n")
                    .replace(/<\/div>/gi, "\n")
                    .replace(/<[^>]*>/g, "")
                    .split("\n")
                    .map(line => line.trim())
                    .filter(Boolean)
                    .slice(0, 4)
                    .join("<br>")
                : subtitle;
            const poemImage = art.image && art.image !== "undefined" ? art.image : "assets/poetry_flowers.webp";
            cardHTML = `
                <article class="article-card poem-card" data-id="${art.id}" style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 1.35rem; font-weight: 900; margin: 6px 0 2px 0;">${art.title}</h3>
                    <span class="card-author" style="font-family: var(--font-ui); font-size: 0.75rem; color: var(--text-secondary); display: block; margin-bottom: 12px; font-weight: 500;">${authorHtml}</span>
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; width: 100%;">
                        <div class="poem-excerpt" style="font-family: var(--font-body); font-size: 0.85rem; line-height: 1.45; font-style: italic; color: var(--text-primary); flex: 1;">${poemLines}</div>
                        <div class="card-image-box" style="width: 100px; height: 110px; flex-shrink: 0; border: none; margin: 0; padding: 0;">
                            <img src="${poemImage}" alt="Edebi Görsel" class="card-image" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.onerror=null;this.src='assets/poetry_flowers.webp';">
                        </div>
                    </div>
                    <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; margin-top: auto; display: block; text-align: left; padding-top: 8px;">► OKU</span>
                </article>
            `;
        } else if (styleType === 'roportaj' || art.category === 'roportaj') {
            // Render as horizontal card style
            const roportajImage = art.image && art.image !== "undefined" ? art.image : "assets/author_zeynep.webp";
            cardHTML = `
                <article class="article-card article-card-horizontal" data-id="${art.id}" style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 1.25rem; font-weight: 900; margin: 6px 0 12px 0;">${art.title}</h3>
                    <div style="display: flex; gap: 12px; align-items: flex-start; width: 100%; height: 100%;">
                        <div class="card-image-box" style="width: 80px; height: 90px; flex-shrink: 0; border: 1px solid var(--border-light); margin: 0;">
                            <img src="${roportajImage}" alt="${art.title}" class="card-image" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src='assets/typewriter_birds.webp';">
                        </div>
                        <div class="card-text" style="flex: 1; min-width: 0; display: flex; flex-direction: column; height: 100%;">
                            <p class="card-preview" style="font-size: 0.78rem; color: var(--text-primary); line-height: 1.4; margin: 0 0 6px 0;">${displaySubtitle}</p>
                            <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; display: block; margin-top: auto; padding-top: 8px;">► OKU</span>
                        </div>
                    </div>
                </article>
            `;
        } else if (styleType === 'kose' || art.category === 'kose-yazilari') {
            // Render as columnist card style
            const koseImage = art.image && art.image !== "undefined" ? art.image : "assets/author_mehmet.webp";
            cardHTML = `
                <article class="article-card columnist-card" data-id="${art.id}" style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 1.15rem; font-weight: 900; margin: 6px 0 2px 0;">${art.title}</h3>
                    <span class="card-author" style="font-family: var(--font-ui); font-size: 0.72rem; color: var(--text-secondary); display: block; margin-bottom: 10px; font-weight: 500;">${authorHtml}</span>
                    <div style="display: flex; gap: 10px; align-items: center; width: 100%;">
                        <p class="card-preview" style="font-size: 0.78rem; color: var(--text-primary); line-height: 1.4; flex: 1; margin: 0;">${displaySubtitle}</p>
                        <div class="columnist-avatar-box" style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 1px solid var(--border-light); flex-shrink: 0; margin: 0;">
                            <img src="${koseImage}" alt="${author}" class="columnist-avatar" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    </div>
                    <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; margin-top: auto; display: block; padding-top: 8px;">► OKU</span>
                </article>
            `;
        } else if (styleType === 'haber' || art.category === 'haber') {
            // Render as news item list card
            const newsArticles = articles.filter(a => a.category === 'haber').slice(0, 3);
            let newsItemsHTML = "";
            if (newsArticles.length > 0) {
                newsArticles.forEach(na => {
                    newsItemsHTML += `<div class="news-item" style="font-size: 0.78rem; color: var(--text-primary); font-family: var(--font-body); line-height: 1.4; margin-bottom: 8px; border-bottom: 1px dotted var(--border-light); padding-bottom: 6px; cursor: pointer;" onclick="openArticle('${na.id}')">• ${na.title}</div>`;
                });
            } else {
                newsItemsHTML = `
                    <div class="news-item" style="font-size: 0.78rem; color: var(--text-primary); font-family: var(--font-body); line-height: 1.4; margin-bottom: 6px;">• İstanbul Kitap Fuarı Kapılarını Açtı</div>
                    <div class="news-item" style="font-size: 0.78rem; color: var(--text-primary); font-family: var(--font-body); line-height: 1.4; margin-bottom: 6px;">• 2024 Cevdet Kudret Edebiyat Ödülleri Sahiplerini Buldu</div>
                    <div class="news-item" style="font-size: 0.78rem; color: var(--text-primary); font-family: var(--font-body); line-height: 1.4; margin-bottom: 6px;">• Genç Yazarlar İçin Yeni Fon Desteği</div>
                `;
            }
            cardHTML = `
                <article class="article-card" data-id="${art.id}" style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <div class="news-list" style="margin-top: 10px; margin-bottom: 10px;">
                        ${newsItemsHTML}
                    </div>
                    <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; display: block; margin-top: auto; padding-top: 8px;">► OKU</span>
                </article>
            `;
        } else if (styleType === 'yarisma' || art.category === 'yarismalar') {
            // Render as contest card style
            cardHTML = `
                <article class="article-card contest-card" data-id="${art.id}" style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 1.15rem; font-weight: 900; margin: 6px 0 6px 0;">${art.title}</h3>
                    <div style="display: flex; gap: 10px; align-items: center; width: 100%;">
                        <div style="flex: 1;">
                            <div class="contest-theme" style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--accent-color); letter-spacing: 0.5px; margin-bottom: 4px;">Tema: "Serbest Edebi Eser"</div>
                            <p class="card-preview" style="font-size: 0.78rem; color: var(--text-primary); line-height: 1.4; margin: 0;">${displaySubtitle}</p>
                        </div>
                        <svg class="contest-icon" viewBox="0 0 24 24" style="width: 45px; height: 45px; fill: var(--text-secondary); opacity: 0.6; flex-shrink: 0;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </div>
                    <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; margin-top: auto; display: block; padding-top: 8px;">► OKU</span>
                </article>
            `;
        } else {
            // Default standard card
            const isKitap = art.category === 'kitap';
            cardHTML = `
                <article class="article-card" data-id="${art.id}" style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
                    <span class="card-category" style="color: var(--accent-color); font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${categoryLabel}</span>
                    <h3 class="card-title" style="font-family: var(--font-header); font-size: 1.25rem; font-weight: 900; margin: 6px 0 4px 0;">${art.title}</h3>
                    <span class="card-author" style="font-family: var(--font-ui); font-size: 0.72rem; color: var(--text-secondary); display: block; margin-bottom: 10px; font-weight: 500;">${authorHtml}</span>
                    <div class="card-image-box" style="width: 100%; height: 110px; overflow: hidden; border: 1px solid var(--border-light); margin-bottom: 10px; border-radius: 4px;">
                        <img src="${image}" alt="${art.title}" class="card-image" style="width: 100%; height: 100%; object-fit: ${isKitap ? 'contain' : 'cover'}; background-color: ${isKitap ? 'var(--bg-secondary)' : 'transparent'};" onerror="this.onerror=null;this.src='assets/typewriter_birds.webp';">
                    </div>
                    <p class="card-preview" style="font-size: 0.78rem; color: var(--text-primary); line-height: 1.4; margin-bottom: 8px;">${displaySubtitle}</p>
                    <span class="card-readmore" style="color: var(--accent-color); font-weight: bold; font-size: 0.75rem; display: block; margin-top: auto; padding-top: 8px;">► OKU</span>
                </article>
            `;
        }
    }

    // Inject editor controls if Editor Mode is active
    if (isEditorModeActive) {
        const isFlagged = reports > 0;
        if (isFlagged) {
            cardHTML = cardHTML.replace('class="article-card', 'class="article-card flagged');
            const badgeHTML = `<div class="flag-badge">⚠️ Şikayet: ${reports}</div>`;
            cardHTML = cardHTML.replace(/<article[^>]*>/, match => `${match}\n${badgeHTML}`);
        }
        const controlsHTML = `
            <div class="editor-card-controls" onclick="event.stopPropagation();">
                <button class="btn-editor-action approve" onclick="window.approveArticleClick('${art.id}', event)">Onayla</button>
                <button class="btn-editor-action delete" onclick="window.deleteArticleClick('${art.id}', event)">Kaldır</button>
            </div>
        `;
        cardHTML = cardHTML.replace('</article>', `${controlsHTML}\n</article>`);
    }

    return cardHTML;
}

// Function to handle page flips
function changePage(page) {
    currentPage = page;
    
    // Add flip transition animation to main grid
    mainGrid.classList.add("page-fade-transition");
    
    // Smooth scroll back to top of the newspaper
    document.querySelector(".newspaper-header").scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        renderNewspaperGrid();
        mainGrid.classList.remove("page-fade-transition");
    }, 300);
}

function ensureLayoutSlotIds() {
    if (!layoutConfig) return;
    let changed = false;
    ['col1', 'col2', 'col3'].forEach(colKey => {
        if (layoutConfig[colKey]) {
            layoutConfig[colKey].forEach((slot, idx) => {
                if (!slot.id) {
                    slot.id = `slot_${colKey}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                    changed = true;
                }
            });
        }
    });
    if (changed) {
        saveLayoutConfig();
    }
}

function updateHeaderMeta() {
    const headerDateIndicator = document.getElementById("header-date-indicator");
    const pageIndicator = document.getElementById("header-page-indicator");
    
    // Calculate dynamically
    const baseDate = new Date("2026-07-13");
    const now = new Date();
    
    // 1. Calculate Issue Number (Sayı) - increases every week
    const diffTime = Math.max(0, now - baseDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const issueNum = Math.floor(diffDays / 7) + 1;
    const issueStr = String(issueNum).padStart(2, '0');
    
    // 2. Calculate Turkish Month & Year
    const TurkishMonths = [
        "OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN",
        "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK"
    ];
    const monthName = TurkishMonths[now.getMonth()];
    const year = now.getFullYear();
    
    if (headerDateIndicator) {
        headerDateIndicator.innerText = `${monthName} ${year}`;
    }
    
    if (pageIndicator) {
        pageIndicator.innerText = `SAYI: ${issueStr} / SAYFA: ${String(currentPage).padStart(2, '0')}`;
    }
}

// RENDER NEWSPAPER FRONT-PAGE GRID (EDITORIAL BROADSIDE LAYOUT)
// Helper: Open write modal pre-selected for a specific category
// Helper: Update dynamic slot form sections based on selected category
function updateSlotFormSections(categoryKey) {
    const secGununSozu = document.getElementById("slot-section-gunun-sozu");
    const secLugat = document.getElementById("slot-section-lugat");
    const secSiir = document.getElementById("slot-section-siir");
    const secStandard = document.getElementById("slot-section-standard");

    [secGununSozu, secLugat, secSiir, secStandard].forEach(s => {
        if (s) s.classList.add("hidden");
    });

    const studioHeader = document.querySelector(".editor-studio-header h2");
    const studioDesc = document.querySelector(".editor-studio-header p");

    if (categoryKey === "gunun-sozu") {
        if (secGununSozu) secGununSozu.classList.remove("hidden");
        if (studioHeader) studioHeader.innerText = "📜 Günün Sözü / Vecize Yayınla";
        if (studioDesc) studioDesc.innerText = "Gazetenin sol sütunundaki Günün Sözü kutusunda yayınlanacak vecizeyi ve sahibini yazın.";
        
        const qText = document.getElementById("quote-text-input");
        const qAuth = document.getElementById("quote-author-input");
        if (qText && !qText.value && editorNoteData.quote) qText.value = editorNoteData.quote;
        if (qAuth && !qAuth.value && editorNoteData.desc) qAuth.value = editorNoteData.desc;
    } else if (categoryKey === "lugat") {
        if (secLugat) secLugat.classList.remove("hidden");
        if (studioHeader) studioHeader.innerText = "📖 Edebi Lûgat • Günün Kelimesi";
        if (studioDesc) studioDesc.innerText = "Gazetenin sağ sütunundaki Günün Kelimesi ve köken izahını güncelleyin.";
        
        const wTitle = document.getElementById("word-title-input");
        const wOrigin = document.getElementById("word-origin-input");
        const wMean = document.getElementById("word-meaning-input");
        const wEx = document.getElementById("word-example-input");
        if (wTitle && !wTitle.value && dailyWordData.word) wTitle.value = dailyWordData.word;
        if (wOrigin && !wOrigin.value && dailyWordData.origin) wOrigin.value = dailyWordData.origin;
        if (wMean && !wMean.value && dailyWordData.meaning) wMean.value = dailyWordData.meaning;
        if (wEx && !wEx.value && dailyWordData.example) wEx.value = dailyWordData.example;
    } else if (categoryKey === "siir") {
        if (secSiir) secSiir.classList.remove("hidden");
        if (studioHeader) studioHeader.innerText = "📜 Günün Şiiri Yayınla";
        if (studioDesc) studioDesc.innerText = "Gazetenin sağ sütunundaki Günün Şiiri kutusunda yayınlanacak şiiri yazın.";
    } else {
        if (secStandard) secStandard.classList.remove("hidden");
        if (studioHeader) studioHeader.innerText = categoryKey === "manset" ? "🌟 Ana Manşet Haberi Yaz" : "🖋️ Editöryal Yazı Yayınla";
        if (studioDesc) studioDesc.innerText = "Eserinizi kaleme alın ve Mürekkep gazetesinin seçtiğiniz slotunda yayınlayın.";
    }
}

// RENDER NEWSPAPER FRONT-PAGE GRID (EDITORIAL BROADSIDE LAYOUT)
// Helper: Open write modal pre-selected for a specific category
window.openWriteModalForCategory = function(categoryKey) {
    const writeToggle = document.getElementById("write-toggle");
    if (writeToggle) writeToggle.click();
    const catSelect = document.getElementById("post-category");
    if (catSelect && categoryKey) {
        catSelect.value = categoryKey;
    }
    updateSlotFormSections(categoryKey || (catSelect ? catSelect.value : "deneme"));

    const editorOverlay = document.getElementById("editor-overlay");
    if (editorOverlay) {
        editorOverlay.scrollTop = 0;
    }
};

// RENDER NEWSPAPER FRONT-PAGE GRID (MÜREKKEP PROFESYONEL MİZANPAJ)
function renderNewspaperGrid() {
    mainGrid.className = "newspaper-grid";
    mainGrid.style.display = "block";

    reconcileUserArticles();
    updateHeaderMeta();

    const allArts = getSortedArticles();

    // 1. Identify Main Lead Story (Ana Manşet)
    let leadArt = allArts.find(a => a.category === "manset" || a.corner_name === "MANŞET" || a.corner_name === "Haftanın Manşeti" || a.corner_name === "Kapak Dosyası")
               || allArts.find(a => a.category === "deneme" || a.category === "haber")
               || allArts[0]
               || null;

    // 2. Identify categorized corners without duplicating lead
    const usedIds = new Set();
    if (leadArt) usedIds.add(leadArt.id);

    let essayArt1 = allArts.find(a => (a.category === "kose-yazilari" || a.category === "deneme") && !usedIds.has(a.id));
    if (essayArt1) usedIds.add(essayArt1.id);

    let essayArt2 = allArts.find(a => (a.category === "deneme" || a.category === "biyografi") && !usedIds.has(a.id));
    if (essayArt2) usedIds.add(essayArt2.id);

    let youthArt = allArts.find(a => (a.category === "oyku" || a.category === "deneme" || a.category === "genc-kalemler") && !usedIds.has(a.id));
    if (youthArt) usedIds.add(youthArt.id);

    let storyArt = allArts.find(a => a.category === "oyku" && !usedIds.has(a.id));
    if (storyArt) usedIds.add(storyArt.id);

    let bookArt = allArts.find(a => a.category === "kitap" && !usedIds.has(a.id));
    if (bookArt) usedIds.add(bookArt.id);

    let poemArt = allArts.find(a => a.category === "siir" && !usedIds.has(a.id));
    if (poemArt) usedIds.add(poemArt.id);

    let cultureMedeniyetArt = allArts.find(a => (a.category === "haber" || a.category === "biyografi" || a.category === "roportaj") && !usedIds.has(a.id));
    if (cultureMedeniyetArt) usedIds.add(cultureMedeniyetArt.id);

    let artEstetikArt = allArts.find(a => (a.category === "haber" || a.category === "yarismalar" || a.category === "deneme") && !usedIds.has(a.id));
    if (artEstetikArt) usedIds.add(artEstetikArt.id);

    // ─── A. SOL SÜTUN (KÖŞE YAZILARI, GÜNÜN SÖZÜ & GENÇ KALEMLER) ───
    const colLeftHTML = `
        <aside class="broadsheet-col-left">
            <div class="editorial-slot-card" ${essayArt1 ? `data-id="${essayArt1.id}"` : `onclick="window.openWriteModalForCategory('kose-yazilari')"`}>
                <span class="slot-kicker">✒️ KÖŞE YAZISI</span>
                <h3 class="slot-title">${essayArt1 ? essayArt1.title : 'Edebiyatta Samimiyet ve Üslup'}</h3>
                <p class="slot-excerpt">${essayArt1 ? truncateText(essayArt1.subtitle || (essayArt1.content ? essayArt1.content.replace(/<[^>]*>/g, '') : ''), 125) : 'Kelimelerin ardındaki samimiyet, yazarın ruhunu okura açtığı en şeffaf aynadır.'}</p>
                <div class="slot-byline">
                    <span>✍️ ${essayArt1 ? essayArt1.author : 'Yayın Kurulu'}</span>
                    <span>${essayArt1 ? (essayArt1.date || 'Ağustos 2026') : 'Mürekkep'}</span>
                </div>
            </div>

            <div class="editorial-slot-card" ${essayArt2 ? `data-id="${essayArt2.id}"` : `onclick="window.openWriteModalForCategory('deneme')"`}>
                <span class="slot-kicker">🖋️ DENEME & ELEŞTİRİ</span>
                <h3 class="slot-title">${essayArt2 ? essayArt2.title : 'Sanatın Gayesi ve Anlam Arayışı'}</h3>
                <p class="slot-excerpt">${essayArt2 ? truncateText(essayArt2.subtitle || (essayArt2.content ? essayArt2.content.replace(/<[^>]*>/g, '') : ''), 125) : 'Felsefe ile edebiyatın kesiştiği noktada varoluşsal sancıların sözcüklerle dindirilmesi.'}</p>
                <div class="slot-byline">
                    <span>✍️ ${essayArt2 ? essayArt2.author : 'Mürekkep Tenkit'}</span>
                    <span>${essayArt2 ? (essayArt2.date || 'Ağustos 2026') : 'İnceleme'}</span>
                </div>
            </div>

            <!-- Günün Sözü Kartı (Editörler Tıklayıp Değiştirebilir) -->
            <div class="editorial-slot-card" style="background: var(--bg-secondary); border-top: 4px solid var(--accent-color);" onclick="window.openWriteModalForCategory('gunun-sozu')">
                <span class="slot-kicker">📜 GÜNÜN SÖZÜ</span>
                <p class="slot-quote-text">“${editorNoteData.quote || 'Bir dizesi eksik kalmış bir şiir gibi gezinir insan; ta ki hakikatin kelimesini bulana kadar.'}”</p>
                <div class="slot-byline">
                    <span>— ${editorNoteData.desc || 'Ahmet Hamdi Tanpınar'}</span>
                    <span style="font-size: 0.68rem; color: var(--accent-color); font-weight: 800;">EDEBİ HAFIZA</span>
                </div>
            </div>

            <!-- Günün Sözünün Altındaki Ek Slot: Genç Kalemler & Anlatı -->
            <div class="editorial-slot-card" ${youthArt ? `data-id="${youthArt.id}"` : `onclick="window.openWriteModalForCategory('genc-kalemler')"`}>
                <span class="slot-kicker">📖 GENÇ KALEMLER & ANLATI</span>
                <h3 class="slot-title">${youthArt ? youthArt.title : 'Kuşların Kanadında Saklı Şehir'}</h3>
                <p class="slot-excerpt">${youthArt ? truncateText(youthArt.subtitle || (youthArt.content ? youthArt.content.replace(/<[^>]*>/g, '') : ''), 120) : 'Taş sokakların yankısında büyüyen düşler, genç bir yazarın satırlarında yeniden hayat buluyor.'}</p>
                <div class="slot-byline">
                    <span>✍️ ${youthArt ? youthArt.author : 'Genç Yazar'}</span>
                    <span>${youthArt ? (youthArt.date || 'Ağustos 2026') : '+ Yazı Gönder'}</span>
                </div>
            </div>
        </aside>
    `;

    // ─── B. ORTA SÜTUN (TEK VE GÜÇLÜ ANA MANŞET + ALT İKİLİ IZGARA) ───
    let mainLeadHTML = "";
    if (leadArt) {
        const leadImg = leadArt.image || "assets/typewriter_birds.webp";
        const leadKicker = leadArt.corner_name || "EDEBİYAT & DÜŞÜNCE • HAFTANIN MANŞETİ";
        const leadSubdeck = leadArt.subtitle || "İnsanlığın derin sancısı ve edebiyatın ruhu; hakikati kelimelere dökebilme cesaretinde yatar.";
        const leadTextRaw = leadArt.content ? leadArt.content.replace(/<[^>]*>/g, ' ') : leadSubdeck;
        const textCol1 = truncateText(leadTextRaw, 220);
        const textCol2 = truncateText(leadTextRaw.slice(220) || leadSubdeck, 200);

        mainLeadHTML = `
            <article class="lead-headline-box" data-id="${leadArt.id}">
                <span class="lead-kicker-tag">${leadKicker}</span>
                <h2 class="lead-main-title">${leadArt.title}</h2>
                <div class="lead-byline-bar">
                    <span>YAZAR: ${leadArt.author.toUpperCase()} — İSTANBUL</span> • <span>${leadArt.date || 'AĞUSTOS 2026'}</span>
                </div>
                
                <div class="lead-image-frame">
                    <img src="${leadImg}" alt="${leadArt.title}" onerror="this.onerror=null;this.src='assets/typewriter_birds.webp';">
                </div>
                <span class="lead-image-caption">Fotoğraf: Mürekkep Arşivi • Kelimelerin ve edebiyatın ebedi tınısı çağları aşıyor.</span>

                <div class="lead-columns-text">
                    <p class="drop-cap-text">${textCol1}</p>
                    <div>
                        <p>${textCol2}</p>
                        <span class="lead-readmore">► Yazının Tamamını Oku</span>
                    </div>
                </div>
            </article>
        `;
    } else {
        mainLeadHTML = `
            <article class="lead-headline-box" onclick="window.openWriteModalForCategory('manset')">
                <span class="lead-kicker-tag">EDEBİYAT & DÜŞÜNCE • HAFTANIN MANŞETİ</span>
                <h2 class="lead-main-title">YAPAY ZEKA ÇAĞINDA İNSAN, EDEBİYAT VE ANLAM ARAYIŞI</h2>
                <div class="lead-byline-bar">
                    <span>MÜREKKEP EDEBİ HEYETİ — İSTANBUL</span> • <span>AĞUSTOS 2026</span>
                </div>
                
                <div class="lead-image-frame">
                    <img src="assets/typewriter_birds.webp" alt="Mürekkep Manşet">
                </div>
                <span class="lead-image-caption">Fotoğraf: Mürekkep Matbuatı • Kelimelerin hafızası çağa direniyor.</span>

                <div class="lead-columns-text">
                    <p class="drop-cap-text">Zamanın yıpratıcı ve aceleci akışına karşı direnen tek sığınak, kelimelerin ebedi tınısıdır. Sayfalar arasında kaybolan her dize insan ruhuna açılan bir kapıdır.</p>
                    <div>
                        <p>Mürekkep Gazetesi'nin bu sayısında genç kalemlerin fikir tahlillerini okurlarımızla buluşturuyoruz.</p>
                        <span class="lead-readmore">+ Manşet Yazısı Yayınla</span>
                    </div>
                </div>
            </article>
        `;
    }

    const subleadHTML = `
        <div class="sublead-grid-row">
            <div class="editorial-slot-card" ${storyArt ? `data-id="${storyArt.id}"` : `onclick="window.openWriteModalForCategory('oyku')"`}>
                <span class="slot-kicker">📖 ÖYKÜ & ANLATI</span>
                <h3 class="slot-title">${storyArt ? storyArt.title : 'Karanfil ve Yağmur Kokusu'}</h3>
                <p class="slot-excerpt">${storyArt ? truncateText(storyArt.subtitle || (storyArt.content ? storyArt.content.replace(/<[^>]*>/g, '') : ''), 120) : 'Eski bir konağın gıcırdayan merdivenlerinde durdu ihtiyar. Sararmış mektuba son kez baktı...'}</p>
                <div class="slot-byline">
                    <span>Yazan: ${storyArt ? storyArt.author : 'Mürekkep Yazar'}</span>
                </div>
            </div>

            <div class="editorial-slot-card" ${bookArt ? `data-id="${bookArt.id}"` : `onclick="window.openWriteModalForCategory('kitap')"`}>
                <span class="slot-kicker">📚 KİTAPLIK & TENKİT</span>
                <h3 class="slot-title">${bookArt ? bookArt.title : 'Kuyucaklı Yusuf Tahlili'}</h3>
                <p class="slot-excerpt">${bookArt ? truncateText(bookArt.subtitle || (bookArt.content ? bookArt.content.replace(/<[^>]*>/g, '') : ''), 120) : 'Anadolu insanının saf ve hırçın doğasını ustalıkla işleyen eserin edebi tahlili.'}</p>
                <div class="slot-byline">
                    <span>İnceleyen: ${bookArt ? bookArt.author : 'Mürekkep Tenkit'}</span>
                </div>
            </div>
        </div>
    `;

    const colCenterHTML = `
        <main class="broadsheet-col-center">
            ${mainLeadHTML}
            ${subleadHTML}
        </main>
    `;

    // ─── C. SAĞ SÜTUN (GÜNÜN ŞİİRİ, KÜLTÜR & MEDENİYET, LÛGAT) ───
    const colRightHTML = `
        <aside class="broadsheet-col-right">
            <div class="poem-slot-card" ${poemArt ? `data-id="${poemArt.id}"` : `onclick="window.openWriteModalForCategory('siir')"`}>
                <span class="slot-kicker" style="justify-content: center;">📜 GÜNÜN ŞİİRİ</span>
                <strong class="poem-title">${poemArt ? poemArt.title : 'Kelimelerin Sükûtu'}</strong>
                <div class="poem-stanzas">
                    ${poemArt ? (poemArt.content ? poemArt.content.replace(/<[^>]*>/g, '\n').split('\n').filter(Boolean).slice(0, 5).join('<br>') : poemArt.subtitle) : 'Kelimeler yorulur, susar geceler,<br>Yalnızlığın kıyısında açar bir çiçek.<br>Ne giden döner geri, ne kalan kalır,<br>Yalnızca bir şiir kalır yadigar.'}
                </div>
                <span class="poem-poet">${poemArt ? `ŞAİR: ${poemArt.author}` : '+ Şiir Başvurusu Yap'}</span>
            </div>

            <!-- Edebiyat Söyleşileri yerine Kültür & Medeniyet Slotu -->
            <div class="editorial-slot-card" ${cultureMedeniyetArt ? `data-id="${cultureMedeniyetArt.id}"` : `onclick="window.openWriteModalForCategory('haber')"`}>
                <span class="slot-kicker">🏛️ KÜLTÜR & MEDENİYET</span>
                <h3 class="slot-title">${cultureMedeniyetArt ? cultureMedeniyetArt.title : 'Mazi ile İstikbal Arasında Türk Şiiri'}</h3>
                <p class="slot-excerpt">${cultureMedeniyetArt ? truncateText(cultureMedeniyetArt.subtitle || (cultureMedeniyetArt.content ? cultureMedeniyetArt.content.replace(/<[^>]*>/g, '') : ''), 120) : '“Kültürel hafızamızın kökleri, klasik metinlerimiz ile çağdaş düşüncenin sentezinde yeşeriyor.”'}</p>
                <div class="slot-byline">
                    <span>${cultureMedeniyetArt ? `Hazırlayan: ${cultureMedeniyetArt.author}` : 'Mürekkep Kültür Servisi'}</span>
                </div>
            </div>

            <!-- Edebi Lûgat / Anlamını Bilmediğimiz Kelimeler Köşesi (Editörler Değiştirebilir) -->
            <div class="editorial-slot-card" style="background: var(--bg-secondary); border-top: 4px solid var(--accent-color);" onclick="window.openWriteModalForCategory('lugat')">
                <span class="slot-kicker">📖 EDEBİ LÛGAT • GÜNÜN KELİMESİ</span>
                <div style="display: flex; align-items: baseline; justify-content: space-between; margin: 4px 0 2px;">
                    <h3 class="slot-title" style="font-size: 1.22rem; letter-spacing: 0.5px; color: var(--accent-color); margin: 0;">${dailyWordData.word || 'Tahassür'}</h3>
                    <span style="font-family: var(--font-ui); font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">${dailyWordData.origin || '[Arapça • İsim]'}</span>
                </div>
                <p class="slot-excerpt" style="-webkit-line-clamp: 2; margin-bottom: 4px; font-weight: 600; color: var(--text-primary);">
                    ${dailyWordData.meaning || 'Kavuşulması istenen şeye veya geçmişe duyulan derin özlem, hasret ve hüzünlü iç çekiş.'}
                </p>
                <p class="slot-excerpt" style="-webkit-line-clamp: 2; font-style: italic; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px;">
                    ${dailyWordData.example || '“Gözlerinde eski günlerin tahassürü, dilinde yarım kalmış bir türkü vardı.”'}
                </p>
                <div class="slot-byline">
                    <span>Lûgat-ı Mürekkep</span>
                    <span style="font-size: 0.68rem; color: var(--accent-color); font-weight: 800;">HAFTALIK KELİME</span>
                </div>
            </div>
        </aside>
    `;

    // Assembly Complete Broadsheet Layout
    mainGrid.innerHTML = `
        <div class="broadsheet-layout-container">
            ${colLeftHTML}
            ${colCenterHTML}
            ${colRightHTML}
        </div>
    `;

    // Attach click handlers to all actionable items - Directly opens article
    mainGrid.querySelectorAll("[data-id]").forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const articleId = item.getAttribute("data-id");
            if (articleId) openArticle(articleId);
        });
    });
}

// Mobile Quick Action Modal Handlers (Smart iPhone Pop-up)
let activeMobileArticleId = null;

function openMobileActionModal(articleId) {
    activeMobileArticleId = articleId;
    const modal = document.getElementById("mobile-action-modal");
    if (modal) modal.classList.add("active");
}

function closeMobileActionModal(e) {
    if (e) e.stopPropagation();
    const modal = document.getElementById("mobile-action-modal");
    if (modal) modal.classList.remove("active");
}

// Bind mobile action buttons
document.addEventListener("DOMContentLoaded", () => {
    const actShare = document.getElementById("mobile-act-share");
    const actPdf = document.getElementById("mobile-act-pdf");
    const actListen = document.getElementById("mobile-act-listen");
    const actComment = document.getElementById("mobile-act-comment");

    if (actShare) {
        actShare.addEventListener("click", () => {
            closeMobileActionModal();
            if (activeMobileArticleId) {
                openArticle(activeMobileArticleId);
                setTimeout(() => {
                    if (window.openCustomShareModal) window.openCustomShareModal();
                }, 300);
            }
        });
    }

    if (actPdf) {
        actPdf.addEventListener("click", () => {
            closeMobileActionModal();
            window.print();
        });
    }

    if (actListen) {
        actListen.addEventListener("click", () => {
            closeMobileActionModal();
            if (activeMobileArticleId) {
                openArticle(activeMobileArticleId);
                setTimeout(() => {
                    const audioBtn = document.getElementById("audio-toggle-btn");
                    if (audioBtn) audioBtn.click();
                }, 300);
            }
        });
    }

    if (actComment) {
        actComment.addEventListener("click", () => {
            closeMobileActionModal();
            if (activeMobileArticleId) {
                openArticle(activeMobileArticleId);
                setTimeout(() => {
                    const commentBtn = document.getElementById("detail-comment-btn");
                    if (commentBtn) commentBtn.click();
                }, 300);
            }
        });
    }
});


// RENDER FEED LIST VIEW FOR CATEGORIES
function renderCategoryFeed(category) {
    mainGrid.className = "newspaper-grid feed-view-active";
    mainGrid.style.display = "block";

    reconcileUserArticles();

    // Map category aliases
    let filteredArticles = [];
    if (category === "bookmarks") {
        filteredArticles = articles.filter(a => savedArticleIds.includes(a.id));
    } else if (category === "biyografi") {
        filteredArticles = articles.filter(a => a.category === "biyografi" || a.category === "kose-yazilari");
    } else if (category === "kose-yazilari") {
        filteredArticles = articles.filter(a => a.category === "kose-yazilari" || a.category === "biyografi");
    } else {
        filteredArticles = articles.filter(a => a.category === category);
    }

    const catTitles = {
        "siir": "ŞİİR KÖŞESİ",
        "biyografi": "YAZAR BİYOGRAFİLERİ & EDEBİ PORTRELER",
        "kose-yazilari": "YAZAR BİYOGRAFİLERİ & EDEBİ PORTRELER",
        "oyku": "ÖYKÜ & ANLATI",
        "deneme": "DENEME & ELEŞTİRİ",
        "kitap": "KİTAPLIK & TAHLİL",
        "roportaj": "SÖYLEŞİ & RÖPORTAJ",
        "haber": "KÜLTÜR-SANAT GÜNDEMİ",
        "yarismalar": "YARIŞMALAR & DUYURULAR",
        "bookmarks": "KAYDEDİLENLER"
    };

    const displayTitle = catTitles[category] || category.toUpperCase();

    if (filteredArticles.length === 0) {
        mainGrid.innerHTML = `
            <div class="category-feed-container" style="max-width: 860px; margin: 0 auto; width: 100%; padding: 40px 0;">
                <header style="border-bottom: 2px solid var(--border-color); padding-bottom: 15px; margin-bottom: 30px; text-align: center;">
                    <h2 style="font-family: var(--font-header); font-size: 2.2rem; font-weight: 800; text-transform: uppercase;">${displayTitle}</h2>
                </header>
                <div style="text-align: center; padding: 40px 20px; font-family: var(--font-body);">
                    <p style="color: var(--text-secondary); font-size: 1.1rem;">Bu köşede henüz yayınlanmış bir eser bulunmamaktadır.</p>
                    <button onclick="document.getElementById('write-toggle').click()" style="margin-top: 20px; background-color: var(--accent-color); color: #fff; border: none; padding: 10px 24px; border-radius: 20px; font-family: var(--font-ui); font-weight: 600; cursor: pointer;">Yayın Kuruluna Yazı Gönder</button>
                </div>
            </div>
        `;
        return;
    }

    let listHTML = "";
    filteredArticles.slice().reverse().forEach(art => {
        const artImg = art.image || "assets/typewriter_birds.webp";
        const excerpt = truncateText(art.subtitle || (art.content ? art.content.replace(/<[^>]*>/g, '') : ''), 200);

        listHTML += `
            <article class="feed-item-card" data-id="${art.id}" style="display: flex; gap: 24px; border-bottom: 1px solid var(--border-light); padding: 24px 0; cursor: pointer; align-items: center; transition: transform 0.2s ease;">
                <div style="flex: 1;">
                    <span style="font-family: var(--font-ui); font-size: 0.72rem; font-weight: 800; color: var(--accent-color); text-transform: uppercase; letter-spacing: 1px;">${displayTitle}</span>
                    <h3 style="font-family: var(--font-header); font-size: 1.65rem; font-weight: 800; line-height: 1.25; margin: 6px 0 8px 0; color: var(--text-primary);">${art.title}</h3>
                    <p style="font-family: var(--font-body); font-size: 0.95rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 12px;">${excerpt}</p>
                    <div style="display: flex; gap: 12px; align-items: center; font-size: 0.76rem; color: var(--text-secondary);">
                        <span style="font-weight: 700; color: var(--text-primary);">✍️ ${art.author}</span>
                        <span>•</span>
                        <span>${art.date || 'Ağustos 2026'}</span>
                        <span>•</span>
                        <span>👏 ${art.claps || 0} Alkış</span>
                    </div>
                </div>
                <div style="width: 140px; height: 110px; border: 1px solid var(--border-light); padding: 2px; background: var(--bg-primary); flex-shrink: 0; border-radius: 4px; overflow: hidden;">
                    <img src="${artImg}" alt="${art.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src='assets/typewriter_birds.webp';">
                </div>
            </article>
        `;
    });

    mainGrid.innerHTML = `
        <div class="category-feed-container" style="max-width: 900px; margin: 0 auto; width: 100%;">
            <header style="border-bottom: 2px solid var(--border-color); padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="font-family: var(--font-header); font-size: 2rem; font-weight: 900; text-transform: uppercase;">${displayTitle}</h2>
                <button onclick="window.filterCategory('all')" style="background: none; border: 1px solid var(--border-color); font-family: var(--font-ui); font-size: 0.75rem; font-weight: 700; padding: 6px 14px; border-radius: 16px; cursor: pointer; color: var(--text-primary);">◀ Gazeteye Dön</button>
            </header>
            <div class="feed-list">${listHTML}</div>
        </div>
    `;

    mainGrid.querySelectorAll("[data-id]").forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const articleId = item.getAttribute("data-id");
            if (articleId) openArticle(articleId);
        });
    });
}

// Open Medium Reader Modal