import re

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.backup.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect where duplicate or appended code exists:
# In app.backup.js, there is:
# 1. Base App code (from line 1 to 9670)
# 2. Penpal Module v5.0 (from 9671 to 10716)
# 3. Old Duplicate Penpal Module (from 10717 to 11731)

print(f"Total length: {len(text)}")

# Check duplicate penpal
pos1 = text.find("MÜREKKEPLİ MEKTUP MODULE v5.0")
pos2 = text.find("MÜREKKEPLİ MEKTUP MODULE v5.0", pos1 + 100)
print(f"Pos 1: {pos1}, Pos 2: {pos2}")

# Let's check how many IIFEs are there
iifes = [m.start() for m in re.finditer(r'\(function\s+MürekkepliMektupModule', text)]
print(f"Penpal IIFE positions: {iifes}")
