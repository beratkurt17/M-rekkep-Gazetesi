import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    text = f.read()

penpal_idx = text.find('(function MürekkepliMektupModule()')
core_text = text[:penpal_idx]

lines = core_text.split('\n')
print(f"Total lines in core_text: {len(lines)}")

# Find all function names and their line numbers
funcs = []
for i, line in enumerate(lines, 1):
    m = re.match(r'^(async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(', line)
    if m:
        funcs.append((i, m.group(2)))
    m2 = re.match(r'^(window\.[a-zA-Z0-9_$]+)\s*=\s*(async\s+)?function', line)
    if m2:
        funcs.append((i, m2.group(1)))

print(f"Total functions found: {len(funcs)}")

# Print groups of functions
for i in range(0, len(funcs), 10):
    chunk = funcs[i:i+10]
    names = ", ".join([f"{f[1]}(L{f[0]})" for f in chunk])
    print(f"{i:3d}-{i+len(chunk):3d}: {names}")
