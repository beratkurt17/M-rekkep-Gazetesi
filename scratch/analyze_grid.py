import re

with open("scratch/inspected_html.txt", encoding="utf-8") as f:
    content = f.read()

ids = re.findall(r'data-id="(art_[a-z0-9]+)"', content)
print(f"Article IDs in rendered grid: {len(ids)}")
print("Counts per ID:")
from collections import Counter
for art_id, count in Counter(ids).items():
    print(f"  {art_id}: {count}x")

# Total category slots in layout
print("\nChecking layout config for duplicate slots...")
kitap_slots = content.count('Kitap İncelemesi')
oyku_slots = content.count('feed-item') 
print(f"'Kitap İncelemesi' slot headers: {kitap_slots}")
