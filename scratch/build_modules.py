import os
import re

APP_PATH = r'c:\Users\WOOLF\Desktop\web_newspaper\app.js'
JS_DIR = r'c:\Users\WOOLF\Desktop\web_newspaper\js'

with open(APP_PATH, 'r', encoding='utf-8') as f:
    code = f.read()
    lines = code.split('\n')

print(f"Total lines: {len(lines)}")

# Let's inspect landmarks
# 1. Config & Defaults: lines 1 to ~163 (Security, utilities, scroll locks)
# 2. Categories & Layout config: lines 164 to ~1963
# 3. Moderation: 1964 to 2103
# 4. Social & Sharing & Popup: 2104 to 2657
# 5. Profile & Ranks: 2658 to 3400
# 6. Supabase & Auth: 3401 to 4234
# 7. Core DOM & SEO & Categories: 4235 to 5043
# 8. Newspaper Broadsheet: 5044 to 5449
# 9. Reader: 5450 to 6050
# 10. Editor & WYSIWYG & Submissions: 6051 to 7670
# 11. Global helpers & Journey: 7671 to 8670
# 12. Search & Settings & Legal: 8671 to 9359
# 13. Dynamic viewport, popstate, init: 9360 to 9670
# 14. Penpal module: 9671 to 10716 (and discard duplicate 10723-11731)

# Let's create logical module buckets:

# Module 1: js/config.js (Defaults, security, profanity, constants, scroll lock)
config_lines = lines[0:163]

# Module 2: js/db.js (Supabase config, sync, offline storage, moderation reports)
# Lines 1964:2103 (Moderation) + 3401:4234 (Supabase init & sync) + 7671:7842 (Global moderation helpers)
db_lines = lines[3400:4234] + ["\n// --- Moderation & Security System ---\n"] + lines[1963:2103] + lines[7670:7842]

# Module 3: js/auth.js (Authentication, login, register, profile, ranks, streaks, bookmarks)
# Lines 2658:3400 (Profile & ranks) + lines 7843:8670 (Literary journey & author profile modal)
auth_lines = lines[2657:3400] + ["\n// --- Author Profiles & Literary Journey ---\n"] + lines[7842:8670]

# Module 4: js/newspaper.js (Categories nav, layout configurator, broadsheet mizanpaj, pagination, header meta)
# Lines 164:1963 (Admin layout, custom categories, renderCategoriesNav) + 4235:4350 (SEO & deep links) + 5044:5449 (renderNewspaperGrid)
newspaper_lines = lines[163:1963] + ["\n// --- Broadsheet Front-Page Grid & Mizanpaj ---\n"] + lines[5043:5449]

# Module 5: js/reader.js (Medium reader overlay, font & size switcher, claps, comments drawer & comments system)
# Lines 5449:6050 (openArticle, closeArticle, claps, comments) + 2527:2657 (Spotify text selection popup)
reader_lines = lines[5449:6050] + ["\n// --- Spotify-style Text Selection & Quote Popup ---\n"] + lines[2526:2657]

# Module 6: js/editor.js (Writing studio #editor-overlay, WYSIWYG editor, category slot form, editorial review pool #editorial-inbox-overlay)
# Lines 6050:7670 (Publish form, WYSIWYG, editorial review pool) + 9463:9670 (WYSIWYG init & reading settings controller)
editor_lines = lines[6050:7670] + ["\n// --- WYSIWYG Editor Initialization ---\n"] + lines[9462:9670]

# Module 7: js/social.js (Global author search, notifications, legal modals, settings modal, share modals, card generator)
# Lines 2104:2526 (Share system & card generator) + 8670:9359 (Search dropdown, visitor bar, legal modals, settings)
social_lines = lines[2103:2526] + ["\n// --- Author Search, Notifications & Modals ---\n"] + lines[8670:9359]

# Module 8: js/penpal.js (Mürekkepli Mektup Module v5.0)
# Lines 9670:10716
penpal_lines = lines[9670:10716]

# Module 9: js/main.js (Dynamic viewport manager, popstate history manager, app boot orchestrator)
# Lines 9360:9462 + boot helpers + checkDeepLink
main_lines = [
    "// =============================================",
    "// MÜREKKEP GAZETESİ - MAIN ENTRY POINT",
    "// Bootstraps all modules and manages routing",
    "// =============================================",
    ""
] + lines[9360:9462] + [
    "",
    "// Global Application Initializer",
    "document.addEventListener('DOMContentLoaded', () => {",
    "    console.log('🏛️ Mürekkep Gazetesi modüler sistemi başarıyla yüklendi.');",
    "    isAppBooted = true;",
    "    checkDeepLink();",
    "});"
]

modules = {
    'config.js': '\n'.join(config_lines),
    'db.js': '\n'.join(db_lines),
    'auth.js': '\n'.join(auth_lines),
    'newspaper.js': '\n'.join(newspaper_lines),
    'reader.js': '\n'.join(reader_lines),
    'editor.js': '\n'.join(editor_lines),
    'social.js': '\n'.join(social_lines),
    'penpal.js': '\n'.join(penpal_lines),
    'main.js': '\n'.join(main_lines)
}

for name, content in modules.items():
    file_path = os.path.join(JS_DIR, name)
    with open(file_path, 'w', encoding='utf-8') as mf:
        mf.write(content)
    print(f"Created js/{name} ({len(content.splitlines())} lines)")

print("All modules created successfully!")
