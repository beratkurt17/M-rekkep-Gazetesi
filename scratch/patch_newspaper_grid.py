# -*- coding: utf-8 -*-
import sys

with open('app.js', 'r', encoding='utf-8') as f:
    text = f.read()

start_kw = 'window.openWriteModalForCategory = function(categoryKey)'
end_kw = '// Mobile Quick Action Modal Handlers (Smart iPhone Pop-up)'

p_start = text.find(start_kw)
p_end = text.find(end_kw)

if p_start == -1 or p_end == -1:
    print(f"Error: p_start={p_start}, p_end={p_end}")
    sys.exit(1)

new_code = '''window.openWriteModalForCategory = function(categoryKey) {
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
    }

    const editorOverlay = document.getElementById("editor-overlay");
    if (editorOverlay) {
        editorOverlay.classList.remove("hidden");
        editorOverlay.scrollTop = 0;
    }
    if (typeof lockBodyScroll === 'function') lockBodyScroll();

    const authorInput = document.getElementById("post-author");
    if (authorInput && currentUser) {
        authorInput.value = currentUser.username || (currentUser.email ? currentUser.email.split("@")[0] : "Anonim Yazar");
        authorInput.readOnly = true;
    }

    const catSelect = document.getElementById("post-category");
    if (catSelect && categoryKey) {
        catSelect.value = categoryKey;
    }
    if (typeof updateSlotFormSections === 'function') {
        updateSlotFormSections(categoryKey || (catSelect ? catSelect.value : "deneme"));
    }
};

// =========================================================================
// GÜNÜN SÖZÜ & GÜNÜN KELİMESİ OKUMA MODALLARI
// =========================================================================
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

// =========================================================================
// RENDER NEWSPAPER FRONT-PAGE GRID (HER KART OKUNABİLİR & TIKLANABİLİR)
// =========================================================================
function renderNewspaperGrid() {
    mainGrid.className = "newspaper-grid";
    mainGrid.style.display = "block";

    reconcileUserArticles();
    updateHeaderMeta();

    const allArts = getSortedArticles();

    // 1. Identify Main Lead Story (Ana Manşet)
    let leadArt = allArts.find(a => a.category === "manset" || a.corner_name === "MANŞET" || a.corner_name === "Haftanın Manşeti" || a.corner_name === "Kapak Dosyası")
               || allArts.find(a => a.category === "deneme" || a.category === "haber")
               || allArts[0]
               || null;

    const usedIds = new Set();
    if (leadArt) usedIds.add(leadArt.id);

    // Kategoriye veya alternatiflere göre eşleştir; yoksa sıradaki yazılardan doldur
    let essayArt1 = allArts.find(a => (a.category === "kose-yazilari" || a.category === "deneme") && !usedIds.has(a.id))
                 || allArts.find(a => !usedIds.has(a.id));
    if (essayArt1) usedIds.add(essayArt1.id);

    let essayArt2 = allArts.find(a => (a.category === "deneme" || a.category === "biyografi") && !usedIds.has(a.id))
                 || allArts.find(a => !usedIds.has(a.id));
    if (essayArt2) usedIds.add(essayArt2.id);

    let youthArt = allArts.find(a => (a.category === "genc-kalemler" || a.category === "oyku" || a.category === "deneme") && !usedIds.has(a.id))
                || allArts.find(a => !usedIds.has(a.id));
    if (youthArt) usedIds.add(youthArt.id);

    let storyArt = allArts.find(a => a.category === "oyku" && !usedIds.has(a.id))
                || allArts.find(a => !usedIds.has(a.id));
    if (storyArt) usedIds.add(storyArt.id);

    let bookArt = allArts.find(a => a.category === "kitap" && !usedIds.has(a.id))
               || allArts.find(a => !usedIds.has(a.id));
    if (bookArt) usedIds.add(bookArt.id);

    let poemArt = allArts.find(a => a.category === "siir" && !usedIds.has(a.id))
               || allArts.find(a => !usedIds.has(a.id));
    if (poemArt) usedIds.add(poemArt.id);

    let cultureMedeniyetArt = allArts.find(a => (a.category === "haber" || a.category === "biyografi" || a.category === "roportaj") && !usedIds.has(a.id))
                           || allArts.find(a => !usedIds.has(a.id));
    if (cultureMedeniyetArt) usedIds.add(cultureMedeniyetArt.id);

    // Fallback Eser Kayıtçı: Eğer veritabanında hiç yazı yoksa, tıklanan kartın kendi içeriğiyle açılmasını sağlar
    function ensureMock(id, title, subtitle, author, category, content) {
        if (!articles.some(a => a.id === id)) {
            articles.push({
                id: id,
                title: title,
                subtitle: subtitle,
                author: author,
                category: category,
                date: "AĞUSTOS 2026",
                claps: 12,
                readTime: "3 dk",
                comments: [],
                content: content
            });
        }
        return id;
    }

    const idEssay1 = essayArt1 ? essayArt1.id : ensureMock(
        'mock-kose-1',
        'Edebiyatta Samimiyet ve Üslup',
        'Kelimelerin ardındaki samimiyet, yazarın ruhunu okura açtığı en şeffaf aynadır.',
        'Yayın Kurulu',
        'kose-yazilari',
        '<p>Edebiyat, yalnızca süslü cümlelerin art arda sıralanması değil; kalbin en mahrem köşelerinden süzülen samimiyetin kağıda dökülmesidir. Bir yazarın üslubu, onun varoluş biçimidir. Kelimelerin ardındaki samimiyet, yazarın ruhunu okura açtığı en şeffaf aynadır.</p><p>Mürekkep Gazetesi olarak inanıyoruz ki samimi bir çığlık, en mutantan fakat sahte beyanlardan bin kat daha evladır.</p>'
    );

    const idEssay2 = essayArt2 ? essayArt2.id : ensureMock(
        'mock-deneme-1',
        'Sanatın Gayesi ve Anlam Arayışı',
        'Felsefe ile edebiyatın kesiştiği noktada varoluşsal sancıların sözcüklerle dindirilmesi.',
        'Mürekkep Tenkit',
        'deneme',
        '<p>Sanat, insanlığın anlam arayışında tutunduğu en kadim daldır. Felsefe ile edebiyatın kesiştiği kavşakta insan, kendini ve kainatı kelimelerin prizmasından seyre dalar. Modern çağın tekdüzeliğine karşı sanat, bize kaybettiğimiz derinliği fısıldar.</p>'
    );

    const idYouth = youthArt ? youthArt.id : ensureMock(
        'mock-youth-1',
        'Kuşların Kanadında Saklı Şehir',
        'Taş sokakların yankısında büyüyen düşler, genç bir yazarın satırlarında yeniden hayat buluyor.',
        'Genç Yazar',
        'genc-kalemler',
        '<p>Surların gölgesinde kanat çırpan güvercinler, bir şehrin bin yıllık hatırasını taşır. Dar sokaklardan yükselen çocuk kahkahaları, eski ahşap konakların pencerelerinde asılı kalan hayallerle buluşur. Genç kalemlerin kalbinde atan bu nabız, geleceğin edebiyatını müjdeliyor.</p>'
    );

    const idStory = storyArt ? storyArt.id : ensureMock(
        'mock-story-1',
        'Karanfil ve Yağmur Kokusu',
        'Eski bir konağın gıcırdayan merdivenlerinde durdu ihtiyar. Sararmış mektuba son kez baktı...',
        'Mürekkep Yazar',
        'oyku',
        '<p>Eski bir konağın gıcırdayan merdivenlerinde durdu ihtiyar. Sararmış mektuba son kez baktı. Sokakta başlayan nisan yağmuru, toprağın ve avludaki saksıda açan kırmızı karanfillerin kokusunu içeriye taşıyordu. Geçmişin bütün hatıraları bir anlığına o pencerenin camına konup uçtu.</p>'
    );

    const idBook = bookArt ? bookArt.id : ensureMock(
        'mock-book-1',
        'Kuyucaklı Yusuf Tahlili',
        'Anadolu insanının saf ve hırçın doğasını ustalıkla işleyen eserin edebi tahlili.',
        'Mürekkep Tenkit',
        'kitap',
        '<p>Sabahattin Ali’nin Kuyucaklı Yusuf romanı, Türk edebiyatında birey ile toplum çatışmasını en yalın ve sarsıcı biçimde ele alan başyapıtlardan biridir. Yusuf’un yalnızlığı, aslında modernleşme sancıları çeken bir coğrafyanın sessiz direnişidir.</p>'
    );

    const idPoem = poemArt ? poemArt.id : ensureMock(
        'mock-poem-1',
        'Kelimelerin Sükûtu',
        'Kelimeler yorulur, susar geceler / Yalnızlığın kıyısında açar bir çiçek.',
        'Mürekkep Şair',
        'siir',
        '<p>Kelimeler yorulur, susar geceler,<br>Yalnızlığın kıyısında açar bir çiçek.<br>Ne giden döner geri, ne kalan kalır,<br>Yalnızca bir şiir kalır yadigar.<br><br>Göklerin mavisi iner içime,<br>Bir damla mürekkep düşer sesime.</p>'
    );

    const idCulture = cultureMedeniyetArt ? cultureMedeniyetArt.id : ensureMock(
        'mock-culture-1',
        'Mazi ile İstikbal Arasında Türk Şiiri',
        'Kültürel hafızamızın kökleri, klasik metinlerimiz ile çağdaş düşüncenin sentezinde yeşeriyor.',
        'Mürekkep Kültür Servisi',
        'haber',
        '<p>Divan şiirinin estetik zirvesinden hecenin samimi nağmelerine, oradan günümüzün serbest ve özgün soluğuna uzanan Türk şiiri; medeniyetimizin en zengin aynasıdır. Dün ile bugün arasındaki kopmaz edebi bağları incelemek, yarının sesini kurmanın tek yoludur.</p>'
    );

    const isEditorUser = (currentUser && (currentUser.isEditor || currentUser.isAdmin)) || isEditorModeActive;

    // ─── A. SOL SÜTUN (KÖŞE YAZILARI, GÜNÜN SÖZÜ & GENÇ KALEMLER) ───
    const colLeftHTML = `
        <aside class="broadsheet-col-left">
            <div class="editorial-slot-card" data-id="${idEssay1}">
                <span class="slot-kicker">✒️ KÖŞE YAZISI ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('kose-yazilari');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${essayArt1 ? essayArt1.title : 'Edebiyatta Samimiyet ve Üslup'}</h3>
                <p class="slot-excerpt">${essayArt1 ? truncateText(essayArt1.subtitle || (essayArt1.content ? essayArt1.content.replace(/<[^>]*>/g, '') : ''), 125) : 'Kelimelerin ardındaki samimiyet, yazarın ruhunu okura açtığı en şeffaf aynadır.'}</p>
                <div class="slot-byline">
                    <span>✍️ ${essayArt1 ? essayArt1.author : 'Yayın Kurulu'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('kose-yazilari');" title="Köşe Yazısı Gönder">+ Yazı Gönder</span>` : '<span class="slot-action-link" title="Yazıyı Oku">OKU ➔</span>'}
                </div>
            </div>

            <div class="editorial-slot-card" data-id="${idEssay2}">
                <span class="slot-kicker">🖋️ DENEME & ELEŞTİRİ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('deneme');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${essayArt2 ? essayArt2.title : 'Sanatın Gayesi ve Anlam Arayışı'}</h3>
                <p class="slot-excerpt">${essayArt2 ? truncateText(essayArt2.subtitle || (essayArt2.content ? essayArt2.content.replace(/<[^>]*>/g, '') : ''), 125) : 'Felsefe ile edebiyatın kesiştiği noktada varoluşsal sancıların sözcüklerle dindirilmesi.'}</p>
                <div class="slot-byline">
                    <span>✍️ ${essayArt2 ? essayArt2.author : 'Mürekkep Tenkit'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('deneme');" title="Deneme Gönder">+ Yazı Gönder</span>` : '<span class="slot-action-link" title="Yazıyı Oku">OKU ➔</span>'}
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

            <!-- Genç Kalemler Slotu -->
            <div class="editorial-slot-card" data-id="${idYouth}">
                <span class="slot-kicker">🌱 GENÇ KALEMLER & ANLATI ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('genc-kalemler');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${youthArt ? youthArt.title : 'Kuşların Kanadında Saklı Şehir'}</h3>
                <p class="slot-excerpt">${youthArt ? truncateText(youthArt.subtitle || (youthArt.content ? youthArt.content.replace(/<[^>]*>/g, '') : ''), 120) : 'Taş sokakların yankısında büyüyen düşler, genç bir yazarın satırlarında yeniden hayat buluyor.'}</p>
                <div class="slot-byline">
                    <span>✍️ ${youthArt ? youthArt.author : 'Genç Yazar'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('genc-kalemler');" title="Yazı Gönder">+ Yazı Gönder</span>` : '<span class="slot-action-link" title="Yazıyı Oku">OKU ➔</span>'}
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
                        <span class="lead-readmore">✦ Yazının Tamamını Oku</span>
                    </div>
                </div>
            </article>
        `;
    } else {
        const fallbackLeadId = ensureMock(
            'mock-lead-1',
            'YAPAY ZEKA ÇAĞINDA İNSAN, EDEBİYAT VE ANLAM ARAYIŞI',
            'Zamanın yıpratıcı akışına karşı direnen tek sığınak kelimelerin ebedi tınısıdır.',
            'MÜREKKEP HEYETİ',
            'manset',
            '<p>Zamanın yıpratıcı ve aceleci akışına karşı direnen tek sığınak, kelimelerin ebedi tınısıdır. Sayfalar arasında kaybolan her dize insan ruhuna açılan bir kapıdır. Mürekkep Gazetesi’nin bu sayısında genç kalemlerin fikir tahlillerini okurlarımızla buluşturuyoruz.</p>'
        );
        mainLeadHTML = `
            <article class="lead-headline-box" data-id="${fallbackLeadId}">
                <span class="lead-kicker-tag">EDEBİYAT & DÜŞÜNCE • HAFTANIN MANŞETİ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('manset');">✎ Manşet Yaz</span>` : ''}</span>
                <h2 class="lead-main-title">YAPAY ZEKA ÇAĞINDA İNSAN, EDEBİYAT VE ANLAM ARAYIŞI</h2>
                <div class="lead-byline-bar">
                    <span>MÜREKKEP EDEBİ HEYETİ — İSTANBUL</span> • <span>AĞUSTOS 2026</span>
                </div>
                
                <div class="lead-no-img-divider" style="margin: 8px 0 14px;"></div>

                <div class="lead-columns-text">
                    <p class="drop-cap-text">Zamanın yıpratıcı ve aceleci akışına karşı direnen tek sığınak, kelimelerin ebedi tınısıdır. Sayfalar arasında kaybolan her dize insan ruhuna açılan bir kapıdır.</p>
                    <div>
                        <p>Mürekkep Gazetesi'nin bu sayısında genç kalemlerin fikir tahlillerini okurlarımızla buluşturuyoruz.</p>
                        <span class="lead-readmore">✦ Yazının Tamamını Oku</span>
                    </div>
                </div>
            </article>
        `;
    }

    const subleadHTML = `
        <div class="sublead-grid-row">
            <div class="editorial-slot-card" data-id="${idStory}">
                <span class="slot-kicker">📖 ÖYKÜ & ANLATI ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('oyku');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${storyArt ? storyArt.title : 'Karanfil ve Yağmur Kokusu'}</h3>
                <p class="slot-excerpt">${storyArt ? truncateText(storyArt.subtitle || (storyArt.content ? storyArt.content.replace(/<[^>]*>/g, '') : ''), 120) : 'Eski bir konağın gıcırdayan merdivenlerinde durdu ihtiyar. Sararmış mektuba son kez baktı...'}</p>
                <div class="slot-byline">
                    <span>Yazan: ${storyArt ? storyArt.author : 'Mürekkep Yazar'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('oyku');" title="Öykü Gönder">+ Öykü Gönder</span>` : '<span class="slot-action-link" title="Öyküyü Oku">OKU ➔</span>'}
                </div>
            </div>

            <div class="editorial-slot-card" data-id="${idBook}">
                <span class="slot-kicker">📚 KİTAPLIK & TENKİT ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('kitap');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${bookArt ? bookArt.title : 'Kuyucaklı Yusuf Tahlili'}</h3>
                <p class="slot-excerpt">${bookArt ? truncateText(bookArt.subtitle || (bookArt.content ? bookArt.content.replace(/<[^>]*>/g, '') : ''), 120) : 'Anadolu insanının saf ve hırçın doğasını ustalıkla işleyen eserin edebi tahlili.'}</p>
                <div class="slot-byline">
                    <span>İnceleyen: ${bookArt ? bookArt.author : 'Mürekkep Tenkit'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('kitap');" title="Kitap Yazısı Gönder">+ İnceleme Yaz</span>` : '<span class="slot-action-link" title="İncelemeyi Oku">OKU ➔</span>'}
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
            <div class="poem-slot-card" data-id="${idPoem}" style="cursor: pointer;">
                <span class="slot-kicker" style="justify-content: center;">📜 GÜNÜN ŞİİRİ ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('siir');">✎ Şiir Yaz</span>` : ''}</span>
                <strong class="poem-title">${poemArt ? poemArt.title : 'Kelimelerin Sükûtu'}</strong>
                <div class="poem-stanzas">
                    ${poemArt ? (poemArt.content ? poemArt.content.replace(/<[^>]*>/g, '\n').split('\n').filter(Boolean).slice(0, 5).join('<br>') : poemArt.subtitle) : 'Kelimeler yorulur, susar geceler,<br>Yalnızlığın kıyısında açar bir çiçek.<br>Ne giden döner geri, ne kalan kalır,<br>Yalnızca bir şiir kalır yadigar.'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 6px;">
                    <span class="poem-poet">${poemArt ? `ŞAİR: ${poemArt.author}` : 'Mürekkep Şair'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('siir');" title="Şiir Başvurusu Yap">+ Şiir Gönder</span>` : '<span class="slot-action-link" title="Şiiri Oku">ŞİİRİ OKU ➔</span>'}
                </div>
            </div>

            <!-- Kültür & Medeniyet Slotu -->
            <div class="editorial-slot-card" data-id="${idCulture}">
                <span class="slot-kicker">🏛️ KÜLTÜR & MEDENİYET ${isEditorUser ? `<span class="slot-write-hint" onclick="event.stopPropagation(); window.openWriteModalForCategory('haber');">✎ Yaz</span>` : ''}</span>
                <h3 class="slot-title">${cultureMedeniyetArt ? cultureMedeniyetArt.title : 'Mazi ile İstikbal Arasında Türk Şiiri'}</h3>
                <p class="slot-excerpt">${cultureMedeniyetArt ? truncateText(cultureMedeniyetArt.subtitle || (cultureMedeniyetArt.content ? cultureMedeniyetArt.content.replace(/<[^>]*>/g, '') : ''), 120) : '“Kültürel hafızamızın kökleri, klasik metinlerimiz ile çağdaş düşüncenin sentezinde yeşeriyor.”'}</p>
                <div class="slot-byline">
                    <span>${cultureMedeniyetArt ? `Hazırlayan: ${cultureMedeniyetArt.author}` : 'Mürekkep Kültür Servisi'}</span>
                    ${isEditorUser ? `<span class="slot-action-link" onclick="event.stopPropagation(); window.openWriteModalForCategory('haber');" title="Yazı Gönder">+ Yazı Gönder</span>` : '<span class="slot-action-link" title="Yazıyı Oku">OKU ➔</span>'}
                </div>
            </div>

            <!-- Edebi Lûgat / Günün Kelimesi: Okurlar için özel kelime sayfası -->
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

# Apply replacement cleanly
updated_text = text[:p_start] + new_code + "\n\n" + text[p_end:]

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(updated_text)

print("Updated app.js successfully!")
