import re
import os

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Clean Penpal Module
penpal_marker = '// ===========================================================\n// MÜREKKEPLİ MEKTUP MODULE v5.0'
p_start = text.find(penpal_marker)
if p_start == -1:
    p_start = text.find('MÜREKKEPLİ MEKTUP MODULE v5.0')

core_code = text[:p_start]
penpal_code = text[p_start:]

# Remove duplicate penpal if any
second_p = penpal_code.find('// ===========================================================', 500)
if second_p != -1:
    penpal_clean = penpal_code[:second_p].strip()
else:
    penpal_clean = penpal_code.strip()

print(f"Core length: {len(core_code)}, Penpal length: {len(penpal_clean)}")

os.makedirs(r'c:\Users\WOOLF\Desktop\web_newspaper\js', exist_ok=True)

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\js\penpal.js', 'w', encoding='utf-8') as f:
    f.write("// =============================================\n")
    f.write("// MÜREKKEP POSTASI / PENPAL MODULE v5.0\n")
    f.write("// =============================================\n\n")
    f.write(penpal_clean + "\n")

print("Wrote js/penpal.js")
