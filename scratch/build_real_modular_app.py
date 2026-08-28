import os
import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's slice core logic (lines 1 to 9671) and penpal logic (lines 9672 to 10716)
lines = text.split('\n')

def get_lines(start, end):
    return '\n'.join(lines[start-1:end])

# Let's create:
# 1. js/state.js
# 2. js/utils.js
# 3. js/db.js
# 4. js/auth.js
# 5. js/profile.js
# 6. js/newspaper.js
# 7. js/reader.js
# 8. js/editor.js
# 9. js/social.js
# 10. js/penpal.js
# 11. js/main.js

# In state.js, declare all globals with var / window so they are globally accessible across all scripts:
state_js = """// =============================================
// GLOBAL STATE & DATA DECLARATIONS
// =============================================

var DEFAULT_ARTICLES = [];
var DEFAULT_COMMENTS = [];
var DEFAULT_LAYOUT = {};
var articles = [];
var comments = [];
var layoutConfig = null;
var customCategories = [];
var editorNoteData = {};
var dailyWordData = {};
var userNotifications = [];
var authorProfiles = {};
var DEFAULT_USER_ROLES = {};
var userRoles = {};
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

""" + get_lines(156, 208)

# utils.js: lines 1-155
utils_js = "// =============================================\n// UTILITIES & SECURITY FUNCTIONS\n// =============================================\n\n" + get_lines(1, 155)

# newspaper.js: lines 209-1964 + lines 4236-5445
newspaper_js = "// =============================================\n// NEWSPAPER BROADSHEET ENGINE\n// =============================================\n\n" + get_lines(209, 1964) + "\n\n" + get_lines(4236, 5445)

# db.js: lines 4003-4235
db_js = "// =============================================\n// DATABASE & SUPABASE SYNC\n// =============================================\n\n" + get_lines(4003, 4235)

# auth.js: lines 2796-4002
auth_js = "// =============================================\n// AUTHENTICATION & USER MANAGEMENT\n// =============================================\n\n" + get_lines(2796, 4002)

# profile.js: lines 7671-8670
profile_js = "// =============================================\n// AUTHOR PROFILES & LITERARY JOURNEY\n// =============================================\n\n" + get_lines(7671, 8670)

# reader.js: lines 5446-6051
reader_js = "// =============================================\n// ARTICLE READER & COMMENTS ENGINE\n// =============================================\n\n" + get_lines(5446, 6051)

# editor.js: lines 6052-7670 + lines 9556-9671
editor_js = "// =============================================\n// WRITER STUDIO & WYSIWYG EDITOR\n// =============================================\n\n" + get_lines(6052, 7670) + "\n\n" + get_lines(9556, 9671)

# social.js: lines 1965-2795 + lines 8671-9349
social_js = "// =============================================\n// SOCIAL, SHARING & MODERATION\n// =============================================\n\n" + get_lines(1965, 2795) + "\n\n" + get_lines(8671, 9349)

# penpal.js: lines 9672-10716
penpal_js = "// =============================================\n// MÜREKKEP POSTASI / PENPAL MODULE v5.0\n// =============================================\n\n" + get_lines(9672, 10716)

# main.js: lines 9350-9555
main_js = "// =============================================\n// MAIN APPLICATION ROUTER & BOOTSTRAP\n// =============================================\n\n" + get_lines(9350, 9555)

modules = {
    "state.js": state_js,
    "utils.js": utils_js,
    "db.js": db_js,
    "auth.js": auth_js,
    "profile.js": profile_js,
    "newspaper.js": newspaper_js,
    "reader.js": reader_js,
    "editor.js": editor_js,
    "social.js": social_js,
    "penpal.js": penpal_js,
    "main.js": main_js
}

os.makedirs(r'c:\Users\WOOLF\Desktop\web_newspaper\js', exist_ok=True)

for name, code in modules.items():
    p = os.path.join(r'c:\Users\WOOLF\Desktop\web_newspaper\js', name)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Written js/{name}: {len(code.splitlines())} lines")

print("All real JS modules created!")
