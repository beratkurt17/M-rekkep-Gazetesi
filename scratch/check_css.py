import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\style.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Check common VS Code CSS warnings:
# 1. Unknown properties / typos
# 2. font-family without generic fallback
# 3. Duplicate properties within same rule
# 4. -webkit-box-orient / line-clamp issues
# 5. Unknown pseudo-elements / selectors

for i, line in enumerate(lines, 1):
    # Check duplicate properties or weird syntax
    # e.g., missing semicolons, double semicolons
    if ';;' in line:
        print(f"Line {i}: double semicolon: {line.strip()}")
    
    # Check vendor prefix issues like -webkit-line-clamp without -webkit-box-orient
    if '-webkit-line-clamp' in line:
        # check surrounding lines
        surrounding = "".join(lines[max(0, i-5):min(len(lines), i+5)])
        if '-webkit-box-orient' not in surrounding:
            print(f"Line {i}: -webkit-line-clamp without -webkit-box-orient: {line.strip()}")

    # Check font-family without generic fallback
    if 'font-family:' in line and not line.strip().startswith('/*'):
        val = line.split('font-family:')[1].split(';')[0].strip()
        generics = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'inherit', 'initial', 'unset', 'var(']
        if not any(g in val for g in generics):
            print(f"Line {i}: font-family missing generic fallback: {line.strip()}")

    # Check invalid units or NaN
    if re.search(r'\b(undefined|NaN)\b', line):
        print(f"Line {i}: undefined/NaN: {line.strip()}")

    # Check empty rules
    if re.search(r'\{\s*\}', line):
        print(f"Line {i}: empty rule: {line.strip()}")
