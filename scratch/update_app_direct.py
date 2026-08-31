import os

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update openWriteModalForCategory in app.js and add openDailyQuoteDetail & openDailyWordDetail
old_block_1 = """// RENDER NEWSPAPER FRONT-PAGE GRID (EDITORIAL BROADSIDE LAYOUT)
// Helper: Open write modal pre-selected for a specific category
window.openWriteModalForCategory = function(categoryKey) {
    if (!currentUser) {
        if (typeof openAuthModal === 'function') openAuthModal();
        if (typeof showToast === 'function') showToast("Yazı göndermek için lütfen giriş yapın.");
        return;
    }"""

new_block_1 = """// RENDER NEWSPAPER FRONT-PAGE GRID (EDITORIAL BROADSIDE LAYOUT)
// Helper: Open write modal pre-selected for a specific category (Only for Editors)
window.openWriteModalForCategory = function(categoryKey) {
    const isEditor = (currentUser && (currentUser.isEditor || currentUser.isAdmin)) || isEditorModeActive;
    if (!isEditor) {
        const writeBtn = document.getElementById("write-toggle");
        if (writeBtn) writeBtn.click();
        return;
    }
    if (!currentUser) {
        if (typeof openAuthModal === 'function') openAuthModal();
        if (typeof showToast === 'function') showToast("Düzenleme yapmak için lütfen giriş yapın.");
        return;
    }"""

# Special reading functions
daily_details_block = """
// Günün Sözü Özel Okuma Görünümü (Okur Tıkladığında Açar)
window.openDailyQuoteDetail = function() {
    const quote = editorNoteData.quote || 'Bir dizesi eksik kalmış bir şiir gibi gezinir insan; ta ki hakikatin kelimesini bulana kadar.';
    const author = editorNoteData.desc || 'Ahmet Hamdi Tanpınar';

    const mockArticle = {
        id: 'gunun-sozu-card',
        title: 'Haftanın Edebi Sözü',
        subtitle: `${author} • Edebi Hafıza ve Tefekkür`,
        author: author,
        category: 'edebi-hafiza',
        date: 'AĞUSTOS 2026',
        claps: 48,
        readTime: '1 dk',
        comments: [],
        content: `
            <div class="special-reading-block quote-reading" style="padding: 30px 20px; text-align: center; max-width: 680px; margin: 0 auto;">
                <div style="font-family: var(--font-header); font-size: 3.5rem; color: var(--accent-color); line-height: 1; opacity: 0.4; margin-bottom: -10px;">“</div>
                <blockquote style="font-family: var(--font-body); font-size: 1.45rem; font-style: italic; line-height: 1.7; color: var(--text-primary); margin: 0 0 24px; padding: 0 10px;">
                    ${quote}
                </blockquote>
                <div style="width: 50px; height: 2px; background: var(--accent-color); margin: 0 auto 16px; opacity: 0.6;"></div>
                <div style="font-family: var(--font-header); font-size: 1.15rem; font-weight: 800; color: var(--text-primary); letter-spacing: 0.5px;">
                    — ${author}
                </div>
                <p style="font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">
                    Mürekkep Gazetesi • Edebi Hafıza Arşivi
                </p>
                <div style="margin-top: 36px; padding: 18px 22px; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border-light); font-size: 0.95rem; line-height: 1.6; text-align: left;">
                    <strong style="color: var(--accent-color); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Edebi Şerh & Not</strong>
                    Bu veciz ifade, edebiyatın insanın içsel yolculuğundaki arayışına ayna tutar. Kelimelerin eksik kaldığı yerde duygunun tamamlanışı, edebi derinliğin en saf halidir.
                </div>
            </div>
        `
    };

    const existingIdx = articles.findIndex(a => a.id === mockArticle.id);
    if (existingIdx >= 0) articles[existingIdx] = mockArticle;
    else articles.push(mockArticle);
    openArticle(mockArticle.id);
};

// Edebi Lûgat / Günün Kelimesi Özel Okuma Görünümü
window.openDailyWordDetail = function() {
    const word = dailyWordData.word || 'Tahassür';
    const origin = dailyWordData.origin || '[Arapça • İsim]';
    const meaning = dailyWordData.meaning || 'Kavuşulması istenen şeye veya geçmişe duyulan derin özlem, hasret ve hüzünlü iç çekiş.';
    const example = dailyWordData.example || '“Gözlerinde eski günlerin tahassürü, dilinde yarım kalmış bir türkü vardı.”';

    const mockArticle = {
        id: 'gunun-kelimesi-card',
        title: `Lûgat-ı Mürekkep: ${word}`,
        subtitle: `${origin} • Unutulmaya Yüz Tutmuş Zengin Kelimeler`,
        author: 'Lûgat Heyeti',
        category: 'edebi-lugat',
        date: 'AĞUSTOS 2026',
        claps: 64,
        readTime: '2 dk',
        comments: [],
        content: `
            <div class="special-reading-block word-reading" style="padding: 24px 10px; max-width: 680px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid var(--border-color);">
                    <span style="font-family: var(--font-ui); font-size: 0.76rem; font-weight: 800; color: var(--accent-color); letter-spacing: 2px; text-transform: uppercase;">HAFTANIN EDEBİ KELİMESİ</span>
                    <h2 style="font-family: var(--font-header); font-size: 2.8rem; font-weight: 900; color: var(--accent-color); margin: 10px 0 6px; letter-spacing: 1px;">${word}</h2>
                    <span style="font-family: var(--font-ui); font-size: 0.9rem; font-weight: 700; color: var(--text-secondary);">${origin}</span>
                </div>

                <div style="background: var(--bg-secondary); padding: 22px 24px; border-radius: 14px; border-left: 4px solid var(--accent-color); margin-bottom: 24px;">
                    <div style="font-family: var(--font-ui); font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Kelimelik Anlamı</div>
                    <p style="font-family: var(--font-body); font-size: 1.25rem; font-weight: 600; line-height: 1.6; color: var(--text-primary); margin: 0;">
                        ${meaning}
                    </p>
                </div>

                <div style="padding: 20px 24px; border: 1px dashed var(--border-color); border-radius: 14px; margin-bottom: 24px;">
                    <div style="font-family: var(--font-ui); font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Edebiyattan Örnek Cümle</div>
                    <p style="font-family: var(--font-body); font-size: 1.12rem; font-style: italic; line-height: 1.7; color: var(--text-primary); margin: 0;">
                        ${example}
                    </p>
                </div>

                <div style="font-family: var(--font-body); font-size: 1.05rem; line-height: 1.8; color: var(--text-secondary); padding: 10px 0;">
                    <p>Türkçemizin derin edebi hazinesinde her kelime, bin yıllık bir hissiyatın ve incelikli bir dünya tasavvurunun temsilcisidir. Mürekkep Gazetesi olarak dilimizin solmaya yüz tutmuş zarif kelimelerini her hafta yeniden hafızalara nakşediyoruz.</p>
                </div>
            </div>
        `
    };

    const existingIdx = articles.findIndex(a => a.id === mockArticle.id);
    if (existingIdx >= 0) articles[existingIdx] = mockArticle;
    else articles.push(mockArticle);
    openArticle(mockArticle.id);
};
"""

if old_block_1 in content:
    content = content.replace(old_block_1, new_block_1 + "\n\n" + daily_details_block)
    print("Updated openWriteModalForCategory and added quote/word readers!")
else:
    print("Could not find old_block_1!")

# 2. Update renderNewspaperGrid in app.js
start_marker = "    // ─── A. SOL SÜTUN (KÖŞE YAZILARI, GÜNÜN SÖZÜ & GENÇ KALEMLER) ───"
end_marker = "    // Assembly Complete Broadsheet Layout"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_grid_html = """    // Check if current user is editor
    const isEditorUser = (currentUser && (currentUser.isEditor || currentUser.isAdmin)) || isEditorModeActive;

    // ─── A. SOL SÜTUN (KÖŞE YAZILARI, GÜNÜN SÖZÜ & GENÇ KALEMLER) ───
    const colLeftHTML = `
        <aside class="broadsheet-col-left">
            <div class="editorial-slot-card" ${essayArt1 ? `data-id="${essayArt1.id}"` : (isEditorUser ? `onclick="window.openWriteModalForCategory('kose-yazilari')"` : '')}>
                <span class="slot-kicker">✒️ KÖŞE YAZISI ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('kose-yazilari');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${essayArt1 ? essayArt1.title : 'Edebiyatta Samimiyet ve Üslup'}</h3>
                <p class="slot-excerpt">${essayArt1 ? truncateText(essayArt1.subtitle || (essayArt1.content ? essayArt1.content.replace(/<[^>]*>/g, '') : ''), 125) : 'Kelimelerin ardındaki samimiyet, yazarın ruhunu okura açtığı en şeffaf aynadır.'}</p>
                <div class="slot-byline">
                    <span>✍️ ${essayArt1 ? essayArt1.author : 'Yayın Kurulu'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('kose-yazilari');" title="Köşe Yazısı Gönder">+ Yazı Gönder</span>` : ''}
                </div>
            </div>

            <div class="editorial-slot-card" ${essayArt2 ? `data-id="${essayArt2.id}"` : (isEditorUser ? `onclick="window.openWriteModalForCategory('deneme')"` : '')}>
                <span class="slot-kicker">🖋️ DENEME & ELEŞTİRİ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('deneme');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${essayArt2 ? essayArt2.title : 'Sanatın Gayesi ve Anlam Arayışı'}</h3>
                <p class="slot-excerpt">${essayArt2 ? truncateText(essayArt2.subtitle || (essayArt2.content ? essayArt2.content.replace(/<[^>]*>/g, '') : ''), 125) : 'Felsefe ile edebiyatın kesiştiği noktada varoluşsal sancıların sözcüklerle dindirilmesi.'}</p>
                <div class="slot-byline">
                    <span>✍️ ${essayArt2 ? essayArt2.author : 'Mürekkep Tenkit'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('deneme');" title="Deneme Gönder">+ Yazı Gönder</span>` : ''}
                </div>
            </div>

            <!-- Günün Sözü Kartı: Okurlar için özel tefekkür okuma modalı, Editörler için değiştirme imkânı -->
            <div class="editorial-slot-card" style="background: var(--bg-secondary); border-top: 4px solid var(--accent-color); cursor: pointer;" onclick="window.openDailyQuoteDetail()">
                <span class="slot-kicker">📜 GÜNÜN SÖZÜ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('gunun-sozu');" title="Sözü Değiştir">✎ Değiştir</span>` : ''}</span>
                <p class="slot-quote-text">“${editorNoteData.quote || 'Bir dizesi eksik kalmış bir şiir gibi gezinir insan; ta ki hakikatin kelimesini bulana kadar.'}”</p>
                <div class="slot-byline">
                    <span>— ${editorNoteData.desc || 'Ahmet Hamdi Tanpınar'}</span>
                    <span class="slot-action-link" onclick="event.stopPropagation(); window.openDailyQuoteDetail();" title="Sözün Detayını Oku">EDEBİ HAFIZA ➔</span>
                </div>
            </div>

            <!-- Günün Sözünün Altındaki Ek Slot: Genç Kalemler & Anlatı -->
            <div class="editorial-slot-card" ${youthArt ? `data-id="${youthArt.id}"` : (isEditorUser ? `onclick="window.openWriteModalForCategory('genc-kalemler')"` : '')}>
                <span class="slot-kicker">📖 GENÇ KALEMLER & ANLATI ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('genc-kalemler');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${youthArt ? youthArt.title : 'Kuşların Kanadında Saklı Şehir'}</h3>
                <p class="slot-excerpt">${youthArt ? truncateText(youthArt.subtitle || (youthArt.content ? youthArt.content.replace(/<[^>]*>/g, '') : ''), 120) : 'Taş sokakların yankısında büyüyen düşler, genç bir yazarın satırlarında yeniden hayat buluyor.'}</p>
                <div class="slot-byline">
                    <span>✍️ ${youthArt ? youthArt.author : 'Genç Yazar'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('genc-kalemler');" title="Yazı Gönder">+ Yazı Gönder</span>` : ''}
                </div>
            </div>
        </aside>
    `;

    // ─── B. ORTA SÜTUN (TEK VE GÜÇLÜ ANA MANŞET + ALT İKİLİ IZGARA) ───
    let mainLeadHTML = "";
    if (leadArt) {
        const leadHasImg = leadArt.image && leadArt.image !== "undefined" && leadArt.image !== "assets/typewriter_birds.webp";
        const leadImg = leadHasImg ? leadArt.image : null;
        const leadKicker = leadArt.corner_name || "EDEBİYAT & DÜŞÜNCE • HAFTANIN MANŞETİ";
        const leadSubdeck = leadArt.subtitle || "İnsanlığın derin sancısı ve edebiyatın ruhu; hakikati kelimelere dökebilme cesaretinde yatar.";
        const leadTextRaw = leadArt.content ? leadArt.content.replace(/<[^>]*>/g, ' ') : leadSubdeck;
        const textCol1 = truncateText(leadTextRaw, 220);
        const textCol2 = truncateText(leadTextRaw.slice(220) || leadSubdeck, 200);
        const leadImgHTML = leadHasImg
            ? `<div class="lead-image-frame"><img src="${leadImg}" alt="${leadArt.title}" onerror="this.style.display='none';this.parentElement.style.display='none';"></div><span class="lead-image-caption">Fotoğraf: Mürekkep Arşivi • Kelimelerin ve edebiyatın ebedi tınısı çağları aşıyor.</span>`
            : ``;

        mainLeadHTML = `
            <article class="lead-headline-box" data-id="${leadArt.id}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span class="lead-kicker-tag">${leadKicker} ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('manset');" style="margin-left: 6px;">✎ Manşet Yaz</span>` : ''}</span>
                </div>
                <h2 class="lead-main-title">${leadArt.title}</h2>
                <div class="lead-byline-bar">
                    <span>YAZAR: ${leadArt.author.toUpperCase()} — İSTANBUL</span> • <span>${leadArt.date || 'AĞUSTOS 2026'}</span>
                </div>
                
                ${leadImgHTML}

                <div class="lead-columns-text">
                    <p class="drop-cap-text">${textCol1}</p>
                    <div>
                        <p>${textCol2}</p>
                        <span class="lead-readmore">► Yazının Tamamını Oku</span>
                    </div>
                </div>
            </article>
        `;
    } else {
        mainLeadHTML = `
            <article class="lead-headline-box" ${isEditorUser ? `onclick="window.openWriteModalForCategory('manset')"` : ''}>
                <span class="lead-kicker-tag">EDEBİYAT & DÜŞÜNCE • HAFTANIN MANŞETİ</span>
                <h2 class="lead-main-title">YAPAY ZEKA ÇAĞINDA İNSAN, EDEBİYAT VE ANLAM ARAYIŞI</h2>
                <div class="lead-byline-bar">
                    <span>MÜREKKEP EDEBİ HEYETİ — İSTANBUL</span> • <span>AĞUSTOS 2026</span>
                </div>
                
                <div class="lead-no-img-divider" style="margin: 8px 0 14px;"></div>

                <div class="lead-columns-text">
                    <p class="drop-cap-text">Zamanın yıpratıcı ve aceleci akışına karşı direnen tek sığınak, kelimelerin ebedi tınısıdır. Sayfalar arasında kaybolan her dize insan ruhuna açılan bir kapıdır.</p>
                    <div>
                        <p>Mürekkep Gazetesi'nin bu sayısında genç kalemlerin fikir tahlillerini okurlarımızla buluşturuyoruz.</p>
                        ${isEditorUser ? `<span class="lead-readmore">+ Manşet Yazısı Yayınla</span>` : ''}
                    </div>
                </div>
            </article>
        `;
    }

    const subleadHTML = `
        <div class="sublead-grid-row">
            <div class="editorial-slot-card" ${storyArt ? `data-id="${storyArt.id}"` : (isEditorUser ? `onclick="window.openWriteModalForCategory('oyku')"` : '')}>
                <span class="slot-kicker">📖 ÖYKÜ & ANLATI ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('oyku');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${storyArt ? storyArt.title : 'Karanfil ve Yağmur Kokusu'}</h3>
                <p class="slot-excerpt">${storyArt ? truncateText(storyArt.subtitle || (storyArt.content ? storyArt.content.replace(/<[^>]*>/g, '') : ''), 120) : 'Eski bir konağın gıcırdayan merdivenlerinde durdu ihtiyar. Sararmış mektuba son kez baktı...'}</p>
                <div class="slot-byline">
                    <span>Yazan: ${storyArt ? storyArt.author : 'Mürekkep Yazar'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('oyku');" title="Öykü Gönder">+ Öykü Gönder</span>` : ''}
                </div>
            </div>

            <div class="editorial-slot-card" ${bookArt ? `data-id="${bookArt.id}"` : (isEditorUser ? `onclick="window.openWriteModalForCategory('kitap')"` : '')}>
                <span class="slot-kicker">📚 KİTAPLIK & TENKİT ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('kitap');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${bookArt ? bookArt.title : 'Kuyucaklı Yusuf Tahlili'}</h3>
                <p class="slot-excerpt">${bookArt ? truncateText(bookArt.subtitle || (bookArt.content ? bookArt.content.replace(/<[^>]*>/g, '') : ''), 120) : 'Anadolu insanının saf ve hırçın doğasını ustalıkla işleyen eserin edebi tahlili.'}</p>
                <div class="slot-byline">
                    <span>İnceleyen: ${bookArt ? bookArt.author : 'Mürekkep Tenkit'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('kitap');" title="Kitap Yazısı Gönder">+ İnceleme Yaz</span>` : ''}
                </div>
            </div>
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
            <div class="poem-slot-card" ${poemArt ? `data-id="${poemArt.id}"` : (isEditorUser ? `onclick="window.openWriteModalForCategory('siir')"` : '')}>
                <span class="slot-kicker" style="justify-content: center;">📜 GÜNÜN ŞİİRİ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('siir');">✎ Şiir Yaz</span>` : ''}</span>
                <strong class="poem-title">${poemArt ? poemArt.title : 'Kelimelerin Sükûtu'}</strong>
                <div class="poem-stanzas">
                    ${poemArt ? (poemArt.content ? poemArt.content.replace(/<[^>]*>/g, '\\n').split('\\n').filter(Boolean).slice(0, 5).join('<br>') : poemArt.subtitle) : 'Kelimeler yorulur, susar geceler,<br>Yalnızlığın kıyısında açar bir çiçek.<br>Ne giden döner geri, ne kalan kalır,<br>Yalnızca bir şiir kalır yadigar.'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 6px;">
                    <span class="poem-poet">${poemArt ? `ŞAİR: ${poemArt.author}` : 'Mürekkep Şair'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('siir');" title="Şiir Başvurusu Yap">+ Şiir Gönder</span>` : ''}
                </div>
            </div>

            <!-- Kültür & Medeniyet Slotu -->
            <div class="editorial-slot-card" ${cultureMedeniyetArt ? `data-id="${cultureMedeniyetArt.id}"` : (isEditorUser ? `onclick="window.openWriteModalForCategory('haber')"` : '')}>
                <span class="slot-kicker">🏛️ KÜLTÜR & MEDENİYET ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('haber');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${cultureMedeniyetArt ? cultureMedeniyetArt.title : 'Mazi ile İstikbal Arasında Türk Şiiri'}</h3>
                <p class="slot-excerpt">${cultureMedeniyetArt ? truncateText(cultureMedeniyetArt.subtitle || (cultureMedeniyetArt.content ? cultureMedeniyetArt.content.replace(/<[^>]*>/g, '') : ''), 120) : '“Kültürel hafızamızın kökleri, klasik metinlerimiz ile çağdaş düşüncenin sentezinde yeşeriyor.”'}</p>
                <div class="slot-byline">
                    <span>${cultureMedeniyetArt ? `Hazırlayan: ${cultureMedeniyetArt.author}` : 'Mürekkep Kültür Servisi'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('haber');" title="Yazı Gönder">+ Yazı Gönder</span>` : ''}
                </div>
            </div>

            <!-- Edebi Lûgat / Günün Kelimesi: Okurlar için özel kelime sayfası, Editörler için güncelleme imkânı -->
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
"""
    content = content[:start_idx] + new_grid_html + "\n" + content[end_idx:]
    print("Updated renderNewspaperGrid in app.js successfully!")
else:
    print("Could not find grid markers in app.js!")

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved updated app.js!")
