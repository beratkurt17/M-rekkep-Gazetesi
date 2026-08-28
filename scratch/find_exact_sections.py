with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in app.backup.js: {len(lines)}")

# Let's search for specific functions in lines:
targets = [
    ("DEFAULT_ARTICLES", "const DEFAULT_ARTICLES = ["),
    ("getCategoriesList", "function getCategoriesList()"),
    ("CONTENT_MODERATION", "CONTENT MODERATION & SECURITY SYSTEM"),
    ("SHARE_SYSTEM", "SHARE SYSTEM"),
    ("SPOTIFY_POPUP", "SPOTIFY-STYLE TEXT SELECTION POPUP"),
    ("SETTINGS_MODAL", "openSettingsModal"),
    ("SUPABASE_CLIENT", "initSupabase"),
    ("DOM_ELEMENTS", "newspaper-main-grid"),
    ("RENDER_NEWSPAPER_GRID", "function renderNewspaperGrid()"),
    ("OPEN_ARTICLE", "async function openArticle("),
    ("ARTICLE_SUBMISSION", "writeToggleBtn"),
    ("LITERARY_JOURNEY", "LITERARY JOURNEY"),
    ("MAIN_VIEWPORT", "updateDynamicViewport"),
    ("PENPAL_MODULE", "MÜREKKEPLİ MEKTUP MODULE")
]

for name, query in targets:
    found = []
    for idx, l in enumerate(lines, 1):
        if query in l:
            found.append(idx)
    print(f"{name:25s}: found at lines {found}")
