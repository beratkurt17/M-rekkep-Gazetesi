import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Core code: from start up to first Penpal IIFE
penpal_idx = text.find('(function MürekkepliMektupModule()')
core_text = text[:penpal_idx]
penpal_text = text[penpal_idx:]
# Only take the first penpal module (up to the second IIFE if any)
second_penpal = penpal_text.find('(function MürekkepliMektupModule()', 100)
if second_penpal != -1:
    penpal_text = penpal_text[:second_penpal]

print(f"Core length: {len(core_text)}, Penpal length: {len(penpal_text)}")

# Let's save penpal.js cleanly
with open(r'c:\Users\WOOLF\Desktop\web_newspaper\js\penpal.js', 'w', encoding='utf-8') as f:
    f.write("// =============================================\n")
    f.write("// MÜREKKEP POSTASI / PENPAL MODULE v5.0\n")
    f.write("// =============================================\n\n")
    f.write(penpal_text.strip() + "\n")

print("Saved js/penpal.js")
