with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    text = f.read()

penpal_idx = text.find('// ===========================================================\n// MÜREKKEPLİ MEKTUP MODULE v5.0')
if penpal_idx == -1:
    penpal_idx = text.find('MÜREKKEPLİ MEKTUP MODULE v5.0')

core = text[:penpal_idx]

# Let's find clean cut points
cut_markers = [
    ("js/utils.js", 0),
    ("js/state.js", "const DEFAULT_ARTICLES = ["),
    ("js/newspaper.js", "function getCategoriesList()"),
    ("js/db.js", "// =============================================\n// CONTENT MODERATION & SECURITY SYSTEM"),
    ("js/social.js", "// =============================================\n// SHARE SYSTEM"),
    ("js/auth.js", "// Open Settings Modal (Profile edit, password, dark mode)"),
    ("js/reader.js", "const mainGrid = document.getElementById(\"newspaper-main-grid\");"),
    ("js/editor.js", 'writeToggleBtn.addEventListener("click"'),
    ("js/profile.js", "// =============================================\n// LITERARY JOURNEY (YAZAR SERÜVENİ) SYSTEM"),
    ("js/main.js", "function updateDynamicViewport(")
]

offsets = [0]
for name, marker in cut_markers[1:]:
    if isinstance(marker, int):
        pos = marker
    else:
        pos = core.find(marker, offsets[-1])
        if pos == -1:
            print(f"Marker not found: {marker[:40]}")
    offsets.append(pos)

offsets.append(len(core))

for i in range(len(cut_markers)):
    filename = cut_markers[i][0]
    start = offsets[i]
    end = offsets[i+1]
    chunk = core[start:end]
    print(f"{filename:18s}: {start:7d} to {end:7d} ({len(chunk):7d} chars, {len(chunk.splitlines()):5d} lines)")

total = sum(offsets[i+1] - offsets[i] for i in range(len(cut_markers)))
print(f"Total: {total} / Core: {len(core)}")
