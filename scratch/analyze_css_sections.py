with open(r'c:\Users\WOOLF\Desktop\web_newspaper\style.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in style.css: {len(lines)}")

for i, line in enumerate(lines, 1):
    stripped = line.strip()
    if (stripped.startswith('/*') or stripped.startswith('//')) and len(stripped) > 5:
        if any(w in stripped.upper() for w in ['ROOT', 'RESET', 'HEADER', 'BROADSHEET', 'NEWSPAPER', 'OVERLAY', 'READING', 'MEDIUM', 'STUDIO', 'EDITOR', 'MODAL', 'PENPAL', 'LETTER', 'RESPONSIVE', 'MEDIA', 'COMMENT', 'PROFILE', 'SHARE', 'DRAWER', 'UTILITY', 'CARD']):
            print(f"Line {i:5d}: {stripped[:80]}")
