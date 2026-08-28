// =============================================
// DATABASE & SUPABASE SYNC
// =============================================

function initSupabase() {
    const url = SUPABASE_URL || localStorage.getItem("murekkep_supabase_url");
    const key = SUPABASE_ANON_KEY || localStorage.getItem("murekkep_supabase_key");

    if (url && key && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(url, key);
            isSupabaseConnected = true;
            console.log("Supabase connection initialized successfully.");
        } catch (err) {
            console.error("Failed to initialize Supabase client:", err);
            isSupabaseConnected = false;
        }
    } else {
        isSupabaseConnected = false;
        console.warn("Supabase credentials not found. Falling back to LocalStorage.");
    }
    updateSupabaseUI();
}

async function seedSupabase() {
    try {
        if (DEFAULT_ARTICLES.length > 0) {
            // Insert all default articles
            const articlesToInsert = DEFAULT_ARTICLES.map(art => ({
                id: art.id,
                title: art.title,
                subtitle: art.subtitle,
                author: art.author,
                category: art.category,
                image: art.image,
                date: art.date,
                read_time: art.readTime,
                claps: art.claps,
                content: art.content
            }));

            const { error: artError } = await supabaseClient
                .from('articles')
                .insert(articlesToInsert);

            if (artError) throw artError;
        }

        if (DEFAULT_COMMENTS.length > 0) {
            // Insert all default comments
            const commentsToInsert = DEFAULT_COMMENTS.map(c => ({
                id: c.id,
                article_id: c.articleId,
                author: c.author,
                text: c.text,
                date: c.date
            }));

            const { error: commError } = await supabaseClient
                .from('comments')
                .insert(commentsToInsert);

            if (commError) throw commError;
        }

        console.log("Supabase seeding completed successfully.");
    } catch (err) {
        console.error("Error seeding Supabase:", err);
    }
}

let isSeeding = false;
async function loadData() {
    // Clean up old default articles from LocalStorage if they exist
    const testArticleIds = ["manset-1", "kitap-1", "deneme-1", "roportaj-1", "siir-1", "oyku-1", "kose-yazilari-1", "haber-1", "yarismalar-1", "deneme-2", "siir-2", "oyku-2"];
    try {
        const saved = localStorage.getItem("murekkep_articles_v2");
        if (saved) {
            let parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                const filtered = parsed.filter(art => !testArticleIds.includes(art.id));
                if (filtered.length !== parsed.length) {
                    localStorage.setItem("murekkep_articles_v2", JSON.stringify(filtered));
                }
            }
        }
        const cached = localStorage.getItem("murekkep_supabase_cache");
        if (cached) {
            let parsed = JSON.parse(cached);
            if (parsed && parsed.articles && Array.isArray(parsed.articles)) {
                const filtered = parsed.articles.filter(art => !testArticleIds.includes(art.id));
                if (filtered.length !== parsed.articles.length) {
                    parsed.articles = filtered;
                    localStorage.setItem("murekkep_supabase_cache", JSON.stringify(parsed));
                }
            }
        }
    } catch (e) {
        console.warn("Failed to clean up test articles from LocalStorage:", e);
    }

    // Clear stale local articles cache to ensure pure Supabase sync
    try {
        localStorage.removeItem("murekkep_articles_v2");
        localStorage.removeItem("murekkep_supabase_cache");
    } catch (e) {}

    let localArticles = [];

    if (isSupabaseConnected) {
        try {
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Supabase request timeout")), 5000)
            );

            // Fetch all articles from Supabase
            const fetchArticlesPromise = supabaseClient
                .from('articles')
                .select('*')
                .order('created_at', { ascending: true });

            const { data: dbArticles, error: artError } = await Promise.race([
                fetchArticlesPromise, 
                timeoutPromise
            ]);
            
            if (artError) throw artError;

            // Fetch comments
            let dbComments = [];
            try {
                const fetchCommentsPromise = supabaseClient
                    .from('comments')
                    .select('*');

                const { data, error: commError } = await Promise.race([
                    fetchCommentsPromise, 
                    timeoutPromise
                ]);
                if (!commError && data) dbComments = data;
            } catch (e) {
                console.warn("Comments fetch error:", e);
            }

            comments = dbComments.map(c => ({
                id: c.id,
                articleId: c.article_id,
                author: c.author,
                text: c.text,
                date: c.date
            }));

            if (dbArticles && dbArticles.length > 0) {
                articles = dbArticles.map(art => ({
                    id: art.id,
                    title: art.title,
                    subtitle: art.subtitle,
                    author: art.author,
                    author_email: art.author_email || null,
                    user_id: art.user_id || null,
                    category: art.category,
                    image: art.image,
                    date: art.date,
                    created_at: art.created_at || new Date().toISOString(),
                    readTime: art.read_time,
                    claps: art.claps || 0,
                    corner_name: art.corner_name || null,
                    content: art.content || null
                }));
            } else {
                articles = [];
            }

            // Save fresh articles to LocalStorage and Cache
            try {
                localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
                const cachePayload = {
                    timestamp: Date.now(),
                    articles: articles,
                    comments: comments
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
            } catch (e) {}

            console.log(`Loaded ${articles.length} articles and ${comments.length} comments strictly from Supabase.`);
        } catch (err) {
            console.error("Error loading data from Supabase:", err);
            isSupabaseConnected = false;
            updateSupabaseUI();
            loadLocalStorageFallback();
        }
    } else {
        loadLocalStorageFallback();
    }

    // Refresh the newspaper view and pagination
    currentPage = 1;
    if (currentCategoryFilter === "all") {
        renderNewspaperGrid();
    } else {
        renderCategoryFeed(currentCategoryFilter);
    }

    // Check for deep links on initial page load (fetch/fallback)
    checkDeepLink();
}

function loadLocalStorageFallback() {
    try {
        const savedArticles = localStorage.getItem("murekkep_articles_v2");
        if (savedArticles) {
            const parsed = JSON.parse(savedArticles);
            // Filter out old seed test ids
            const testIds = ["art_manset_01", "art_siir_01", "art_bio_01", "art_bio_02", "art_bio_03", "art_oyku_01", "art_kitap_01", "art_haber_01", "manset-1", "kitap-1", "deneme-1", "roportaj-1", "siir-1", "oyku-1", "kose-yazilari-1", "haber-1", "yarismalar-1", "deneme-2", "siir-2", "oyku-2"];
            articles = Array.isArray(parsed) ? parsed.filter(a => !testIds.includes(a.id)) : [];
            localStorage.setItem("murekkep_articles_v2", JSON.stringify(articles));
        } else {
            articles = [];
        }
    } catch (e) {
        articles = [];
    }

    try {
        const savedComments = localStorage.getItem("murekkep_comments_v2");
        if (savedComments) {
            comments = JSON.parse(savedComments);
        } else {
            comments = JSON.parse(JSON.stringify(DEFAULT_COMMENTS || []));
            localStorage.setItem("murekkep_comments_v2", JSON.stringify(comments));
        }
    } catch (e) {
        comments = [];
    }
}

// DOM Elements