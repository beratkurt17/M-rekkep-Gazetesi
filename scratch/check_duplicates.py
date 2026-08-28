import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find blocks inside {...}
# and look for duplicate properties in the same block

lines = content.split('\n')

# Check block by block
in_rule = False
current_selector = ""
current_props = {}
block_start_line = 0

for line_idx, line in enumerate(lines, 1):
    stripped = line.strip()
    if stripped.startswith('/*') and stripped.endswith('*/'):
        continue
    
    if '{' in line:
        current_selector = line.split('{')[0].strip()
        current_props = {}
        block_start_line = line_idx
        in_rule = True
    
    if in_rule and ':' in line and not line.strip().startswith('/*') and not '@' in line:
        # extract prop name
        parts = line.split(':')
        prop = parts[0].strip()
        if prop.startswith('*') or prop.startswith('/'):
            continue
        if prop in current_props:
            print(f"Line {line_idx} (Selector: {current_selector}): Duplicate property '{prop}', previous at line {current_props[prop]}")
        else:
            current_props[prop] = line_idx
            
    if '}' in line:
        in_rule = False
        current_props = {}
