import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Find major section banners (comments with === or ---)
for i, line in enumerate(lines, 1):
    if ('===' in line or '---' in line or '/**' in line) and len(line.strip()) > 10:
        if any(keyword in line.upper() for keyword in ['SUPABASE', 'AUTH', 'NEWSPAPER', 'READING', 'EDITOR', 'COMMENT', 'PROFILE', 'PENPAL', 'CARD', 'SEARCH', 'NOTIFICATION', 'SOCIAL', 'LAYOUT', 'INIT', 'DOM', 'WYSIWYG', 'MODAL', 'CATEGORY']):
            print(f"Line {i}: {line.strip()[:80]}")
