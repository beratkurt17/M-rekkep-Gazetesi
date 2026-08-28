import os
import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect the sections of core_code (0 to ~9670)
penpal_idx = text.find('// ===========================================================\n// MÜREKKEPLİ MEKTUP MODULE v5.0')
if penpal_idx == -1:
    penpal_idx = text.find('MÜREKKEPLİ MEKTUP MODULE v5.0')

core = text[:penpal_idx]

# Let's define the section delimiters in core:
# 1. utils: from start to line 163 (up to "const DEFAULT_ARTICLES = ...")
idx_state = core.find('const DEFAULT_ARTICLES = [')
utils_code = core[:idx_state]

# 2. state: from DEFAULT_ARTICLES to getCategoriesList
idx_cat_list = core.find('function getCategoriesList()')
state_code = core[idx_state:idx_cat_list]

# 3. newspaper & layout: from getCategoriesList() to "// --- Moderation" or "// CONTENT MODERATION"
idx_moderation = core.find('// =============================================\n// CONTENT MODERATION')
if idx_moderation == -1:
    idx_moderation = core.find('CONTENT MODERATION & SECURITY SYSTEM')
newspaper_layout_code = core[idx_cat_list:idx_moderation]

# 4. db & moderation: from CONTENT MODERATION to "// SHARE SYSTEM"
idx_share = core.find('// =============================================\n// SHARE SYSTEM')
if idx_share == -1:
    idx_share = core.find('// SHARE SYSTEM\n// =============================================')
db_moderation_code = core[idx_moderation:idx_share]

# 5. social & share: from SHARE SYSTEM to "// Author rankings" or "let activeProfileAuthor"
idx_profile = core.find('// Author rankings and journey levels data model')
if idx_profile == -1:
    idx_profile = core.find('const AUTHOR_RANKS = [')
if idx_profile == -1:
    idx_profile = core.find('AUTHOR_RANKS')
social_share_code = core[idx_share:idx_profile]

# 6. profile & auth model: from AUTHOR_RANKS to "function initAuth()" or "function initSupabase"
idx_auth_db = core.find('function initSupabase(')
if idx_auth_db == -1:
    idx_auth_db = core.find('// Supabase Client Initialization')
profile_auth_code = core[idx_profile:idx_auth_db]

# 7. auth & supabase sync: from initSupabase to "const mainGrid = document.getElementById"
idx_dom = core.find('const mainGrid = document.getElementById("newspaper-main-grid");')
auth_db_code = core[idx_auth_db:idx_dom]

# 8. newspaper grid renderer: from mainGrid to "async function openArticle"
idx_reader = core.find('async function openArticle(')
newspaper_grid_code = core[idx_dom:idx_reader]

# 9. reader: from openArticle to "writeToggleBtn.addEventListener" or "openEditorialInboxOverlay"
idx_editor = core.find('writeToggleBtn.addEventListener("click"')
if idx_editor == -1:
    idx_editor = core.find('// Article Submission / Writer Studio Form Logic')
if idx_editor == -1:
    idx_editor = core.find('// Article Submission Form Handling')
if idx_editor == -1:
    idx_editor = core.find('publishForm.addEventListener("submit"')
reader_code = core[idx_reader:idx_editor]

# 10. editor: from idx_editor to "// LITERARY JOURNEY" or "getPenRank"
idx_journey = core.find('// =============================================\n// LITERARY JOURNEY')
if idx_journey == -1:
    idx_journey = core.find('LITERARY JOURNEY (YAZAR SERÜVENİ) SYSTEM')
if idx_journey == -1:
    idx_journey = core.find('function getPenRank(')
editor_code = core[idx_editor:idx_journey]

# 11. journey & customizer: from idx_journey to "function initDynamicViewport"
idx_main = core.find('function updateDynamicViewport(')
if idx_main == -1:
    idx_main = core.find('function initDynamicViewport()')
journey_code = core[idx_journey:idx_main]

# 12. main: from initDynamicViewport to end of core
main_code = core[idx_main:]

print(f"Utils length: {len(utils_code)}")
print(f"State length: {len(state_code)}")
print(f"Newspaper layout length: {len(newspaper_layout_code)}")
print(f"Db moderation length: {len(db_moderation_code)}")
print(f"Social share length: {len(social_share_code)}")
print(f"Profile auth length: {len(profile_auth_code)}")
print(f"Auth db length: {len(auth_db_code)}")
print(f"Newspaper grid length: {len(newspaper_grid_code)}")
print(f"Reader length: {len(reader_code)}")
print(f"Editor length: {len(editor_code)}")
print(f"Journey length: {len(journey_code)}")
print(f"Main length: {len(main_code)}")

# Check that total matches core
total_extracted = len(utils_code) + len(state_code) + len(newspaper_layout_code) + len(db_moderation_code) + len(social_share_code) + len(profile_auth_code) + len(auth_db_code) + len(newspaper_grid_code) + len(reader_code) + len(editor_code) + len(journey_code) + len(main_code)
print(f"Total extracted: {total_extracted} / Core total: {len(core)}")
assert total_extracted == len(core), "Mismatch in slicing!"

print("Extraction is 100% PERFECT without a single byte missing!")
