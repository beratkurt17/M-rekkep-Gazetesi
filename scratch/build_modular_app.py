import os

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.js', 'r', encoding='utf-8') as f:
    text = f.read()
    lines = text.split('\n')

print(f"Total lines in app.js: {len(lines)}")

# Let's inspect key lines where sections begin and end
# We can create clean files in js/
