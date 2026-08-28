import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    text = f.read()

penpal_idx = text.find('// ===========================================================\n// MÜREKKEPLİ MEKTUP MODULE v5.0')
if penpal_idx == -1:
    penpal_idx = text.find('MÜREKKEPLİ MEKTUP MODULE v5.0')

core = text[:penpal_idx]

markers = [
    ("utils", 0),
    ("state", "const DEFAULT_ARTICLES = ["),
    ("layout_categories", "function getCategoriesList()"),
    ("moderation", "CONTENT MODERATION & SECURITY SYSTEM"),
    ("share_cards", "SHARE SYSTEM"),
    ("spotify_popup", "SPOTIFY-STYLE TEXT SELECTION POPUP"),
    ("profile_auth_model", "const AUTHOR_RANKS = ["),
    ("supabase_auth", "function initSupabase("),
    ("newspaper_grid", 'const mainGrid = document.getElementById("newspaper-main-grid");'),
    ("reader", "async function openArticle("),
    ("editor_submissions", 'writeToggleBtn.addEventListener("click"'),
    ("literary_journey", "LITERARY JOURNEY (YAZAR SERÜVENİ) SYSTEM"),
    ("main_boot", "function updateDynamicViewport(")
]

offsets = [0]
for name, marker in markers[1:]:
    pos = core.find(marker, offsets[-1])
    if pos == -1:
        print(f"ERROR: Marker not found: {name} ({marker})")
    else:
        offsets.append(pos)
        print(f"Found {name:20s} at offset {pos:7d}")

offsets.append(len(core))

chunks = {}
for i in range(len(markers)):
    name = markers[i][0]
    start = offsets[i]
    end = offsets[i+1]
    chunk = core[start:end]
    chunks[name] = chunk
    print(f"Chunk {name:20s}: {start:7d} to {end:7d} ({len(chunk):7d} chars)")

total_len = sum(len(c) for c in chunks.values())
print(f"\nTotal length of all chunks: {total_len} / Core: {len(core)}")
assert total_len == len(core), "Mismatch!"
print("100% PERFECT SEQUENTIAL MATCH!")
