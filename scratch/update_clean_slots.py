# -*- coding: utf-8 -*-
import sys

with open('app.js', 'r', encoding='utf-8') as f:
    text = f.read()

start_kw = 'function renderNewspaperGrid() {'
end_kw = '// Mobile Quick Action Modal Handlers (Smart iPhone Pop-up)'

p_start = text.find(start_kw)
p_end = text.find(end_kw)

if p_start == -1 or p_end == -1:
    print(f"Error: p_start={p_start}, p_end={p_end}")
    sys.exit(1)

new_grid_code = '''function renderNewspaperGrid() {
    mainGrid.className = "newspaper-grid";
    mainGrid.style.display = "block";

    // Clean up any previously cached mock articles so user only sees real articles
    articles = articles.filter(a => !a.id.startsWith('mock-') && a.author !== 'Mürekkep Şair' && a.author !== 'Mürekkep Tenkit');

    reconcileUserArticles();
    updateHeaderMeta();

    const allArts = getSortedArticles();
    const usedIds = new Set();

    // 1. Identify Main Lead Story (Ana Manşet)
    let leadArt = allArts.find(a => a.category === "manset" || a.corner_name === "MANŞET" || a.corner_name === "Haftanın Manşeti" || a.corner_name === "Kapak Dosyası")
               || allArts.find(a => a.category === "deneme" || a.category === "haber")
               || null;

    if (leadArt) usedIds.add(leadArt.id);

    // Kategoriye göre gerçek yazıları eşleştir
    let essayArt1 = allArts.find(a => a.category === "kose-yazilari" && !usedIds.has(a.id))
                 || allArts.find(a => a.category === "deneme" && !usedIds.has(a.id));
    if (essayArt1) usedIds.add(essayArt1.id);

    let essayArt2 = allArts.find(a => (a.category === "deneme" || a.category === "biyografi") && !usedIds.has(a.id));
    if (essayArt2) usedIds.add(essayArt2.id);

    let youthArt = allArts.find(a => (a.category === "genc-kalemler" || a.category === "oyku") && !usedIds.has(a.id));
    if (youthArt) usedIds.add(youthArt.id);

    let storyArt = allArts.find(a => a.category === "oyku" && !usedIds.has(a.id));
    if (storyArt) usedIds.add(storyArt.id);

    let bookArt = allArts.find(a => a.category === "kitap" && !usedIds.has(a.id));
    if (bookArt) usedIds.add(bookArt.id);

    let poemArt = allArts.find(a => a.category === "siir" && !usedIds.has(a.id));
    if (poemArt) usedIds.add(poemArt.id);

    let cultureMedeniyetArt = allArts.find(a => (a.category === "haber" || a.category === "biyografi" || a.category === "roportaj") && !usedIds.has(a.id));
    if (cultureMedeniyetArt) usedIds.add(cultureMedeniyetArt.id);

    const isEditorUser = (currentUser && (currentUser.isEditor || currentUser.isAdmin)) || isEditorModeActive;

    // ─── A. SOL SÜTUN (KÖŞE YAZILARI, GÜNÜN SÖZÜ & GENÇ KALEMLER) ───
    const colLeftHTML = `
        <aside class="broadsheet-col-left">
            <!-- 1. Köşe Yazısı Slotu -->
            ${essayArt1 ? `
                <div class="editorial-slot-card" data-id="${essayArt1.id}">
                    <span class="slot-kicker">✒️ KÖŞE YAZISI ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('kose-yazilari');">✎ Yaz</span>` : ''}</span>
                    <h3 class="slot-title">${essayArt1.title}</h3>
                    <p class="slot-excerpt">${truncateText(essayArt1.subtitle || (essayArt1.content ? essayArt1.content.replace(/<[^>]*>/g, '') : ''), 125)}</p>
                    <div class="slot-byline">
                        <span>✍️ ${essayArt1.author}</span>
                        <span class="slot-action-link" title="Yazıyı Oku">OKU ➔</span>
                    </div>
                </div>
            ` : `
                <div class="editorial-slot-card empty-slot" onclick="window.openWriteModalForCategory('kose-yazilari')" style="cursor: pointer;">
                    <span class="slot-kicker">✒️ KÖŞE YAZISI <span class="slot-empty-badge">BOŞ KÖŞE</span></span>
                    <h3 class="slot-title empty-title">Yeni Köşe Yazısı Bekleniyor</h3>
                    <p class="slot-excerpt empty-desc">Bu köşe için henüz bir yazı yayınlanmadı. Edebi yazınızı eklemek için tıklayın.</p>
                    <div class="slot-byline">
                        <span style="color: var(--text-secondary); opacity: 0.7;">Yazı Yok</span>
                        <span class="slot-action-link" title="Yazı Ekle">+ YAZI YAZ ➔</span>
                    </div>
                </div>
            `}

            <!-- 2. Deneme & Eleştiri Slotu -->
            ${essayArt2 ? `
                <div class="editorial-slot-card" data-id="${essayArt2.id}">
                    <span class="slot-kicker">🖋️ DENEME & ELEŞTİRİ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('deneme');">✎ Yaz</span>` : ''}</span>
                    <h3 class="slot-title">${essayArt2.title}</h3>
                    <p class="slot-excerpt">${truncateText(essayArt2.subtitle || (essayArt2.content ? essayArt2.content.replace(/<[^>]*>/g, '') : ''), 125)}</p>
                    <div class="slot-byline">
                        <span>✍️ ${essayArt2.author}</span>
                        <span class="slot-action-link" title="Yazıyı Oku">OKU ➔</span>
                    </div>
                </div>
            ` : `
                <div class="editorial-slot-card empty-slot" onclick="window.openWriteModalForCategory('deneme')" style="cursor: pointer;">
                    <span class="slot-kicker">🖋️ DENEME & ELEŞTİRİ <span class="slot-empty-badge">BOŞ KÖŞE</span></span>
                    <h3 class="slot-title empty-title">Deneme Yazısı Bekleniyor</h3>
                    <p class="slot-excerpt empty-desc">Bu köşe için henüz bir deneme yayınlanmadı. Edebi denemenizi eklemek için tıklayın.</p>
                    <div class="slot-byline">
                        <span style="color: var(--text-secondary); opacity: 0.7;">Yazı Yok</span>
                        <span class="slot-action-link" title="Deneme Yaz">+ DENEME YAZ ➔</span>
                    </div>
                </div>
            `}

            <!-- 3. Günün Sözü Kartı: Her Zaman Aktif Edebi Tefekkür -->
            <div class="gunun-sozu-card" onclick="window.openDailyQuoteDetail()">
                <span class="gunun-sozu-eyebrow">GÜNÜN EDEBİ SÖZÜ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('gunun-sozu');" title="Sözü Değiştir">✎ Değiştir</span>` : ''}</span>
                <div class="gunun-sozu-inner">
                    <div class="gunun-sozu-mark">“</div>
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

            <!-- 4. Genç Kalemler Slotu -->
            ${youthArt ? `
                <div class="editorial-slot-card" data-id="${youthArt.id}">
                    <span class="slot-kicker">🌱 GENÇ KALEMLER & ANLATI ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('genc-kalemler');">✎ Yaz</span>` : ''}</span>
                    <h3 class="slot-title">${youthArt.title}</h3>
                    <p class="slot-excerpt">${truncateText(youthArt.subtitle || (youthArt.content ? youthArt.content.replace(/<[^>]*>/g, '') : ''), 120)}</p>
                    <div class="slot-byline">
                        <span>✍️ ${youthArt.author}</span>
                        <span class="slot-action-link" title="Yazıyı Oku">OKU ➔</span>
                    </div>
                </div>
            ` : `
                <div class="editorial-slot-card empty-slot" onclick="window.openWriteModalForCategory('genc-kalemler')" style="cursor: pointer;">
                    <span class="slot-kicker">🌱 GENÇ KALEMLER <span class="slot-empty-badge">BOŞ KÖŞE</span></span>
                    <h3 class="slot-title empty-title">Genç Kalemler Eseri Bekleniyor</h3>
                    <p class="slot-excerpt empty-desc">Genç yazarlarımızın anlatı ve edebi eserleri için ayrılan köşe. Eserinizi göndermek için tıklayın.</p>
                    <div class="slot-byline">
                        <span style="color: var(--text-secondary); opacity: 0.7;">Yazı Yok</span>
                        <span class="slot-action-link" title="Eser Gönder">+ ESER EKLE ➔</span>
                    </div>
                </div>
            `}
        </aside>
    `;

    // ─── B. ORTA SÜTUN (TEK VE GÜÇLÜ ANA MANŞET + ALT İKİLİ IZGARA) ───
    let mainLeadHTML = "";
    if (leadArt) {
        const leadKicker = leadArt.corner_name || "EDEBİYAT & DÜŞÜNCE • HAFTANIN MANŞETİ";
        const leadSubdeck = leadArt.subtitle || "İnsanlığın derin sancısı ve edebiyatın ruhu; hakikati kelimelere dökebilme cesaretinde yatar.";
        const leadTextRaw = leadArt.content ? leadArt.content.replace(/<[^>]*>/g, ' ') : leadSubdeck;
        const textCol1 = truncateText(leadTextRaw, 220);
        const textCol2 = truncateText(leadTextRaw.slice(220) || leadSubdeck, 200);

        mainLeadHTML = `
            <article class="lead-headline-box" data-id="${leadArt.id}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span class="lead-kicker-tag">${leadKicker} ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('manset');" style="margin-left: 6px;">✎ Manşet Yaz</span>` : ''}</span>
                </div>
                <h2 class="lead-main-title">${leadArt.title}</h2>
                <div class="lead-byline-bar">
                    <span>YAZAR: ${leadArt.author.toUpperCase()} — İSTANBUL</span> • <span>${leadArt.date || 'AĞUSTOS 2026'}</span>
                </div>
                
                <div class="lead-columns-text">
                    <p class="drop-cap-text">${textCol1}</p>
                    <div>
                        <p>${textCol2}</p>
                        <span class="lead-readmore">✦ Yazının Tamamını Oku</span>
                    </div>
                </div>
            </article>
        `;
    } else {
        mainLeadHTML = `
            <article class="lead-headline-box empty-lead" onclick="window.openWriteModalForCategory('manset')" style="cursor: pointer;">
                <span class="lead-kicker-tag">EDEBİYAT & DÜŞÜNCE • HAFTANIN MANŞETİ <span class="slot-empty-badge">BOŞ MANŞET</span></span>
                <h2 class="lead-main-title" style="color: var(--text-secondary); opacity: 0.85;">Haftanın Manşet Yazısı Bekleniyor</h2>
                <div class="lead-byline-bar">
                    <span>MÜREKKEP YAYIN KURULU</span> • <span>AĞUSTOS 2026</span>
                </div>
                
                <div class="lead-columns-text">
                    <p class="drop-cap-text">Bu haftanın ana manşet yazısı henüz yayına alınmadı. Mürekkep Gazetesi'nin bu sayısında kapak konusu olacak eserinizi hemen yazabilirsiniz.</p>
                    <div>
                        <p>Manşet yazısı eklemek ve gazeteyi zenginleştirmek için bu alana tıklayın.</p>
                        <span class="lead-readmore" style="color: var(--accent-color);">✦ Manşet Yazısı Ekle ➔</span>
                    </div>
                </div>
            </article>
        `;
    }

    const subleadHTML = `
        <div class="sublead-grid-row">
            <!-- 5. Öykü & Anlatı Slotu -->
            ${storyArt ? `
                <div class="editorial-slot-card" data-id="${storyArt.id}">
                    <span class="slot-kicker">📖 ÖYKÜ & ANLATI ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('oyku');">✎ Yaz</span>` : ''}</span>
                    <h3 class="slot-title">${storyArt.title}</h3>
                    <p class="slot-excerpt">${truncateText(storyArt.subtitle || (storyArt.content ? storyArt.content.replace(/<[^>]*>/g, '') : ''), 120)}</p>
                    <div class="slot-byline">
                        <span>Yazan: ${storyArt.author}</span>
                        <span class="slot-action-link" title="Öyküyü Oku">OKU ➔</span>
                    </div>
                </div>
            ` : `
                <div class="editorial-slot-card empty-slot" onclick="window.openWriteModalForCategory('oyku')" style="cursor: pointer;">
                    <span class="slot-kicker">📖 ÖYKÜ & ANLATI <span class="slot-empty-badge">BOŞ KÖŞE</span></span>
                    <h3 class="slot-title empty-title">Yeni Öykü Bekleniyor</h3>
                    <p class="slot-excerpt empty-desc">Bu köşe için henüz bir öykü yayınlanmadı. Öykünüzü eklemek için tıklayın.</p>
                    <div class="slot-byline">
                        <span style="color: var(--text-secondary); opacity: 0.7;">Öykü Yok</span>
                        <span class="slot-action-link" title="Öykü Yaz">+ ÖYKÜ YAZ ➔</span>
                    </div>
                </div>
            `}

            <!-- 6. Kitaplık & Tenkit Slotu -->
            ${bookArt ? `
                <div class="editorial-slot-card" data-id="${bookArt.id}">
                    <span class="slot-kicker">📚 KİTAPLIK & TENKİT ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('kitap');">✎ Yaz</span>` : ''}</span>
                    <h3 class="slot-title">${bookArt.title}</h3>
                    <p class="slot-excerpt">${truncateText(bookArt.subtitle || (bookArt.content ? bookArt.content.replace(/<[^>]*>/g, '') : ''), 120)}</p>
                    <div class="slot-byline">
                        <span>İnceleyen: ${bookArt.author}</span>
                        <span class="slot-action-link" title="İncelemeyi Oku">OKU ➔</span>
                    </div>
                </div>
            ` : `
                <div class="editorial-slot-card empty-slot" onclick="window.openWriteModalForCategory('kitap')" style="cursor: pointer;">
                    <span class="slot-kicker">📚 KİTAPLIK & TENKİT <span class="slot-empty-badge">BOŞ KÖŞE</span></span>
                    <h3 class="slot-title empty-title">Kitap İncelemesi Bekleniyor</h3>
                    <p class="slot-excerpt empty-desc">Edebi kitap tahlili ve eleştiri köşesi. İnceleme yazınızı eklemek için tıklayın.</p>
                    <div class="slot-byline">
                        <span style="color: var(--text-secondary); opacity: 0.7;">İnceleme Yok</span>
                        <span class="slot-action-link" title="İnceleme Yaz">+ İNCELEME YAZ ➔</span>
                    </div>
                </div>
            `}
        </div>
    `;

    const colCenterHTML = `
        <main class="broadsheet-col-center">
            ${mainLeadHTML}
            ${subleadHTML}
        </main>
    `;

    // ─── C. SAĞ SÜTUN (GÜNÜN ŞİİRİ, KÜLTÜR & MEDENİYET, LÛGAT) ───
    const colRightHTML = `
        <aside class="broadsheet-col-right">
            <!-- 7. Günün Şiiri Slotu -->
            ${poemArt ? `
                <div class="poem-slot-card" data-id="${poemArt.id}" style="cursor: pointer;">
                    <span class="slot-kicker" style="justify-content: center;">📜 GÜNÜN ŞİİRİ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('siir');">✎ Şiir Yaz</span>` : ''}</span>
                    <strong class="poem-title">${poemArt.title}</strong>
                    <div class="poem-stanzas">
                        ${poemArt.content ? poemArt.content.replace(/<[^>]*>/g, '<br>').slice(0, 180) : poemArt.subtitle}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 6px;">
                        <span class="poem-poet">ŞAİR: ${poemArt.author}</span>
                        <span class="slot-action-link" title="Şiiri Oku">ŞİİRİ OKU ➔</span>
                    </div>
                </div>
            ` : `
                <div class="poem-slot-card empty-slot" onclick="window.openWriteModalForCategory('siir')" style="cursor: pointer;">
                    <span class="slot-kicker" style="justify-content: center;">📜 GÜNÜN ŞİİRİ <span class="slot-empty-badge">BOŞ ŞİİR KÖŞESİ</span></span>
                    <strong class="poem-title empty-title" style="margin: 12px 0 6px;">Günün Şiiri Bekleniyor</strong>
                    <div class="poem-stanzas empty-desc" style="font-style: italic; opacity: 0.7;">
                        Bu köşe için henüz bir şiir seçilmedi.<br>
                        Şiirinizi eklemek ve gazetede yayınlamak için tıklayın.
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 6px;">
                        <span class="poem-poet" style="opacity: 0.6;">Şair Yok</span>
                        <span class="slot-action-link" title="Şiir Yaz">+ ŞİİR EKLE ➔</span>
                    </div>
                </div>
            `}

            <!-- 8. Kültür & Medeniyet Slotu -->
            ${cultureMedeniyetArt ? `
                <div class="editorial-slot-card" data-id="${cultureMedeniyetArt.id}">
                    <span class="slot-kicker">🏛️ KÜLTÜR & MEDENİYET ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('haber');">✎ Yaz</span>` : ''}</span>
                    <h3 class="slot-title">${cultureMedeniyetArt.title}</h3>
                    <p class="slot-excerpt">${truncateText(cultureMedeniyetArt.subtitle || (cultureMedeniyetArt.content ? cultureMedeniyetArt.content.replace(/<[^>]*>/g, '') : ''), 120)}</p>
                    <div class="slot-byline">
                        <span>Hazırlayan: ${cultureMedeniyetArt.author}</span>
                        <span class="slot-action-link" title="Yazıyı Oku">OKU ➔</span>
                    </div>
                </div>
            ` : `
                <div class="editorial-slot-card empty-slot" onclick="window.openWriteModalForCategory('haber')" style="cursor: pointer;">
                    <span class="slot-kicker">🏛️ KÜLTÜR & MEDENİYET <span class="slot-empty-badge">BOŞ KÖŞE</span></span>
                    <h3 class="slot-title empty-title">Kültür & Medeniyet Yazısı Bekleniyor</h3>
                    <p class="slot-excerpt empty-desc">Edebi hafıza, kültür ve medeniyet tahlilleri için ayrılan köşe. Yazınızı eklemek için tıklayın.</p>
                    <div class="slot-byline">
                        <span style="color: var(--text-secondary); opacity: 0.7;">Yazı Yok</span>
                        <span class="slot-action-link" title="Yazı Yaz">+ YAZI YAZ ➔</span>
                    </div>
                </div>
            `}

            <!-- 9. Edebi Lûgat / Günün Kelimesi: Her Zaman Aktif -->
            <div class="editorial-slot-card" style="background: var(--bg-secondary); border-top: 4px solid var(--accent-color); cursor: pointer;" onclick="window.openDailyWordDetail()">
                <span class="slot-kicker">📖 EDEBİ LÛGAT • GÜNÜN KELİMESİ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('lugat');" title="Kelimeyi Güncelle">✎ Değiştir</span>` : ''}</span>
                <div style="display: flex; align-items: baseline; justify-content: space-between; margin: 4px 0 2px;">
                    <h3 class="slot-title" style="font-size: 1.22rem; letter-spacing: 0.5px; color: var(--accent-color); margin: 0;">${dailyWordData.word || 'Tahassür'}</h3>
                    <span style="font-family: var(--font-ui); font-size: 0.68rem; font-weight: 700; color: var(--text-secondary);">${dailyWordData.origin || '[Arapça • İsim]'}</span>
                </div>
                <p class="slot-excerpt" style="-webkit-line-clamp: 2; margin-bottom: 4px; font-weight: 600; color: var(--text-primary);">
                    ${dailyWordData.meaning || 'Kavuşulması istenen şeye veya geçmişe duyulan derin özlem, hasret ve hüzünlü iç çekiş.'}
                </p>
                <p class="slot-excerpt" style="-webkit-line-clamp: 2; font-style: italic; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px;">
                    ${dailyWordData.example || '“Gözlerinde eski günlerin tahassürü, dilinde yarım kalmış bir türkü vardı.”'}
                </p>
                <div class="slot-byline">
                    <span>Lûgat-ı Mürekkep</span>
                    <span class="slot-action-link" onclick="event.stopPropagation(); window.openDailyWordDetail();" title="Kelimeyi İncele">KELİMEYİ İNCELE ➔</span>
                </div>
            </div>
        </aside>
    `;

    // Assembly Complete Broadsheet Layout
    mainGrid.innerHTML = `
        <div class="broadsheet-layout-container">
            ${colLeftHTML}
            ${colCenterHTML}
            ${colRightHTML}
        </div>
    `;

    // Attach click handlers to all actionable items - Directly opens article
    mainGrid.querySelectorAll("[data-id]").forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const articleId = item.getAttribute("data-id");
            if (articleId) openArticle(articleId);
        });
    });
}
'''

updated_text = text[:p_start] + new_grid_code + "\n\n" + text[p_end:]

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(updated_text)

print("Updated renderNewspaperGrid in app.js successfully!")
