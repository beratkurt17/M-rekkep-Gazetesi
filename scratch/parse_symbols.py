import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    code = f.read()
    lines = code.split('\n')

print(f"Total lines: {len(lines)}")

# Let's find top-level function declarations and var/let/const declarations
functions = []
for i, line in enumerate(lines):
    # match function foo() or async function foo() or window.foo = function
    m = re.match(r'^(async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(', line)
    if m:
        functions.append((i+1, m.group(2), "function"))
    m2 = re.match(r'^(window\.[a-zA-Z0-9_$]+)\s*=\s*(async\s+)?function', line)
    if m2:
        functions.append((i+1, m2.group(1), "window_func"))
    m3 = re.match(r'^(let|const|var)\s+([a-zA-Z0-9_$]+)\s*=', line)
    if m3:
        functions.append((i+1, m3.group(2), "var"))

print(f"Found {len(functions)} top-level declarations.")
for item in functions[:40]:
    print(f"Line {item[0]:5d}: [{item[2]}] {item[1]}")
