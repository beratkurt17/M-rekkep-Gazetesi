import os

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_block(start_line, end_line):
    # 1-indexed inclusive
    return "".join(lines[start_line-1:end_line])

os.makedirs(r'c:\Users\WOOLF\Desktop\web_newspaper\js', exist_ok=True)

modules = {
    "utils.js": "// =============================================\n// UTILITIES & SECURITY FUNCTIONS\n// =============================================\n\n" + get_block(1, 155),
    "state.js": "// =============================================\n// GLOBAL STATE & DEFAULT DATA\n// =============================================\n\n" + get_block(156, 208),
    "newspaper.js": "// =============================================\n// NEWSPAPER BROADSHEET ENGINE & MIZANPAJ\n// =============================================\n\n" + get_block(209, 1964) + "\n\n" + get_block(4236, 5445),
    "db.js": "// =============================================\n// DATABASE & SUPABASE SYNC ENGINE\n// =============================================\n\n" + get_block(4003, 4235),
    "auth.js": "// =============================================\n// AUTHENTICATION & USER PROFILES\n// =============================================\n\n" + get_block(2796, 4002) + "\n\n" + get_block(7671, 8670),
    "reader.js": "// =============================================\n// ARTICLE READER & INTERACTION ENGINE\n// =============================================\n\n" + get_block(5446, 6051),
    "editor.js": "// =============================================\n// WRITER STUDIO & EDITORIAL INBOX\n// =============================================\n\n" + get_block(6052, 7670) + "\n\n" + get_block(9550, 9671),
    "social.js": "// =============================================\n// SOCIAL, MODERATION, SHARE & NOTIFICATIONS\n// =============================================\n\n" + get_block(1965, 2795) + "\n\n" + get_block(8671, 9362),
    "penpal.js": "// =============================================\n// MÜREKKEP POSTASI / PENPAL MODULE v5.0\n// =============================================\n\n" + get_block(9672, 10716),
    "main.js": "// =============================================\n// MAIN APPLICATION ORCHESTRATOR & ROUTER\n// =============================================\n\n" + get_block(9363, 9549)
}

for name, code in modules.items():
    path = os.path.join(r'c:\Users\WOOLF\Desktop\web_newspaper\js', name)
    with open(path, 'w', encoding='utf-8') as mf:
        mf.write(code)
    print(f"Created js/{name}: {len(code.splitlines())} lines")

# Also bundle clean app.js
app_bundle_code = "\n\n".join([
    modules["utils.js"],
    modules["state.js"],
    modules["newspaper.js"],
    modules["db.js"],
    modules["auth.js"],
    modules["reader.js"],
    modules["editor.js"],
    modules["social.js"],
    modules["penpal.js"],
    modules["main.js"]
])

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.js', 'w', encoding='utf-8') as af:
    af.write(app_bundle_code)

print(f"Created unified clean app.js: {len(app_bundle_code.splitlines())} lines")
