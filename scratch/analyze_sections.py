import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.js', 'r', encoding='utf-8') as f:
    text = f.read()
    lines = text.split('\n')

print(f"Total lines: {len(lines)}")

# Let's find major comment blocks
for i, line in enumerate(lines, 1):
    stripped = line.strip()
    if (stripped.startswith('// ===') or stripped.startswith('/* ===') or stripped.startswith('// ---')) and len(stripped) > 8:
        # get next non-empty line
        title = stripped
        if i < len(lines):
            next_l = lines[i].strip()
            if next_l: title += " | " + next_l
        print(f"Line {i:5d}: {title}")
