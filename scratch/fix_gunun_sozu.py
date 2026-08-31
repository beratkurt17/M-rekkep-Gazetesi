# -*- coding: utf-8 -*-

with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# The orphaned fragment to remove/replace (lines 3371-3377)
# We need to replace it with the new gunun-sozu-card design.

old_fragment = """
                <span class="slot-kicker">\U0001f4dc GÜNÜN SÖZÜ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('gunun-sozu');" title="Sözü Değiştir">✎ Değiştir</span>` : ''}</span>
                <p class="slot-quote-text">\u201c${editorNoteData.quote || 'Bir dizesi eksik kalmış bir şiir gibi gezinir insan; ta ki hakikatin kelimesini bulana kadar.'}\u201d</p>
                <div class="slot-byline">
                    <span>— ${editorNoteData.desc || 'Ahmet Hamdi Tanpınar'}</span>
                    <span class="slot-action-link" onclick="event.stopPropagation(); window.openDailyQuoteDetail();" title="Sözün Detayını Oku">EDEBİ HAFIZA ➔</span>
                </div>
            </div>
"""

new_fragment = """
            <!-- Günün Sözü Kartı: Yeniden Tasarlandı -->
            <div class="gunun-sozu-card" onclick="window.openDailyQuoteDetail()">
                <span class="gunun-sozu-eyebrow">GÜNÜN EDEBİ SÖZÜ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('gunun-sozu');" title="Sözü Değiştir">✎ Değiştir</span>` : ''}</span>
                <div class="gunun-sozu-inner">
                    <div class="gunun-sozu-mark">"</div>
                    <div class="gunun-sozu-body">
                        <p class="gunun-sozu-text">${editorNoteData.quote || 'Bir dizesi eksik kalmış bir şiir gibi gezinir insan; ta ki hakikatin kelimesini bulana kadar.'}</p>
                        <div class="gunun-sozu-rule"></div>
                        <div class="gunun-sozu-attribution">
                            <span class="gunun-sozu-author">— ${editorNoteData.desc || 'Ahmet Hamdi Tanpınar'}</span>
                            <span class="gunun-sozu-hint">Tefekkür ➔</span>
                        </div>
                    </div>
                </div>
            </div>
"""

if old_fragment in code:
    code = code.replace(old_fragment, new_fragment, 1)
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print("SUCCESS: Replaced Günün Sözü card!")
else:
    print("NOT FOUND - checking what's actually there:")
    idx = code.find('slot-quote-text')
    if idx != -1:
        print(repr(code[idx-200:idx+300]))
