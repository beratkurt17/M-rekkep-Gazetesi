import os

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    text = f.read()

# In app.backup.js, lines 1 to 9671 is core code, and lines 9672 to 10716 is penpal v5.0
# Let's slice exact core (1 to 9671) and exact penpal (9672 to 10716)
lines = text.split('\n')
core_lines = lines[:9671]
penpal_lines = lines[9671:10716]

print(f"Core lines: {len(core_lines)}, Penpal lines: {len(penpal_lines)}")

# Combine core + penpal
clean_app_code = '\n'.join(core_lines) + "\n\n" + '\n'.join(penpal_lines)

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.js', 'w', encoding='utf-8') as f:
    f.write(clean_app_code)

print(f"Saved clean app.js with {len(clean_app_code.splitlines())} lines (removed 1015 duplicate lines!)")
