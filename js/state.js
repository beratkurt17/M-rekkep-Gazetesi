// =============================================
// GLOBAL STATE & DATA DECLARATIONS
// =============================================

var DEFAULT_ARTICLES = [];
var DEFAULT_COMMENTS = [];
var articles = [];
var comments = [];
var layoutConfig = null;
var customCategories = [];
var editorNoteData = {};
var dailyWordData = {};
var userNotifications = [];
var authorProfiles = {};
var DEFAULT_USER_ROLES = [
    { email: "murekkep@admin.com", username: "Mürekkep", role: "admin" }
];
var userRoles = [];
var followersData = {};
var currentUser = null;
var isEditorModeActive = false;
var activeArticleId = null;
var isAppBooted = false;
var savedArticleIds = [];
var currentCategoryFilter = "all";
var activeProfileAuthor = null;
var shareCurrentTemplate = 'gece';
var shareCurrentArticle = null;
var shareIsCustomMode = false;
var isSupabaseConnected = false;
var supabaseClient = null;

// =============================================
// ADMIN LAYOUT, CUSTOM CATEGORIES & SETTINGS
// =============================================

var DEFAULT_LAYOUT = {
    colWidths: { col1: 1, col2: 3, col3: 1 },
    col1: [
        { id: "slot_col1_popular", type: "system", value: "popular_posts", label: "Çok Okunanlar", size: "normal", slotWidth: 1, slotHeight: 1, style: "list" },
        { id: "slot_col1_art1", type: "category", value: "oyku", label: "Öykü", size: "normal", slotWidth: 1, slotHeight: 1, style: "standard" }
    ],
    col2: [
        { id: "slot_col2_headline", type: "system", value: "headline", label: "Manşet", size: "large", slotWidth: 6, slotHeight: 2, style: "headline" },
        { id: "slot_col2_row1_1", type: "category", value: "siir", label: "Şiir", size: "normal", slotWidth: 3, slotHeight: 1, style: "standard" },
        { id: "slot_col2_row1_2", type: "category", value: "siir", label: "Şiir", size: "normal", slotWidth: 3, slotHeight: 1, style: "standard" },
        { id: "slot_col2_row2_1", type: "category", value: "kitap", label: "Kitap İncelemesi", size: "normal", slotWidth: 2, slotHeight: 1, style: "standard" },
        { id: "slot_col2_row2_2", type: "category", value: "siir", label: "Şiir", size: "normal", slotWidth: 2, slotHeight: 1, style: "standard" },
        { id: "slot_col2_row2_3", type: "category", value: "oyku", label: "Öykü", size: "normal", slotWidth: 2, slotHeight: 1, style: "standard" }
    ],
    col3: [
        { id: "slot_col3_art1", type: "category", value: "siir", label: "Şiir", size: "normal", slotWidth: 1, slotHeight: 1, style: "standard" },
        { id: "slot_col3_comments", type: "system", value: "recent_comments", label: "Okur Yorumları", size: "normal", slotWidth: 1, slotHeight: 1, style: "standard" },
        { id: "slot_col3_art2", type: "category", value: "kose-yazilari", label: "Köşe Yazısı", size: "normal", slotWidth: 1, slotHeight: 1, style: "columnist" }
    ]
};

layoutConfig = null;
customCategories = [];
editorNoteData = {
    quote: "Bir dizesi eksik kalmış bir şiir gibi gezinir insan; ta ki hakikatin kelimesini bulana kadar.",
    desc: "Ahmet Hamdi Tanpınar"
};

dailyWordData = {
    word: "Tahassür",
    origin: "[Arapça • İsim]",
    meaning: "Kavuşulması istenen şeye veya geçmişe duyulan derin özlem, hasret ve hüzünlü iç çekiş.",
    example: "“Gözlerinde eski günlerin tahassürü, dilinde yarım kalmış bir türkü vardı.”"
};

try {
    const savedWord = localStorage.getItem("murekkep_daily_word");
    if (savedWord) dailyWordData = JSON.parse(savedWord);
} catch(e) {}

// Category helper list (built-in + custom)