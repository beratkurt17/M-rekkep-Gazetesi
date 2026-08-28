import os

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\style.backup.css', 'r', encoding='utf-8') as f:
    text = f.read()
    lines = text.split('\n')

print(f"Total lines in style.backup.css: {len(lines)}")

def get_block(start_l, end_l):
    return '\n'.join(lines[start_l-1:end_l])

# Let's inspect landmarks:
# 1. Variables & Root: lines 1 to 70
# 2. Utility & Header & Newspaper: lines 71 to 2632
# 3. Reader & Overlays base: lines 2633 to 3176 + 5511 to 5620 + 5783 to 5902
# 4. Editor & Studio: lines 3177 to 3374 + 3667 to 3964 + 5903 to 6150 (WYSIWYG)
# 5. Modals & Profiles & Share: lines 3375 to 3666 + 3965 to 5239 + 6151 to 7000
# 6. Penpal: lines 7001 to 8348
# 7. Responsive: lines 5240 to 5782 + touch overrides

# Let's create modular CSS files:
os.makedirs(r'c:\Users\WOOLF\Desktop\web_newspaper\css', exist_ok=True)

# Module 1: variables.css
variables_css = "/* =============================================\n   VARIABLES & THEME SYSTEM\n   ============================================= */\n\n" + get_block(1, 70)

# Module 2: newspaper.css
newspaper_css = "/* =============================================\n   NEWSPAPER BROADSHEET & MASTHEAD\n   ============================================= */\n\n" + get_block(71, 2632)

# Module 3: reader.css
reader_css = """/* =============================================
   ARTICLE READER & MEDIUM TYPOGRAPHY
   ============================================= */

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 100vw;
    height: 100%;
    height: 100dvh;
    min-height: 100%;
    background-color: var(--bg-primary);
    z-index: 1000;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    display: flex;
    flex-direction: column;
    align-items: center; /* Center all contents horizontally */
    box-sizing: border-box;
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.3s ease, transform 0.3s ease, background-color var(--transition-speed);
}

.overlay.hidden,
.hidden,
[hidden] {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
}

#reading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
}

.medium-article-container {
    max-width: 740px;
    width: 100%;
    margin: 80px auto 40px;
    padding: 0 20px 140px;
    box-sizing: border-box;
    align-self: center;
}
""" + get_block(2739, 3176) + "\n\n" + get_block(5511, 5560) + "\n\n" + get_block(5783, 5902)

# Module 4: editor.css
editor_css = """/* =============================================
   WRITER STUDIO & EDITORIAL INBOX
   ============================================= */

#editor-overlay {
    display: block;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 60px 24px 140px !important;
    box-sizing: border-box !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
}

#editor-overlay.hidden {
    display: none !important;
}

.editor-studio-container {
    max-width: 820px;
    width: 100%;
    margin: 0 auto !important;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    padding: 36px 40px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
}
""" + get_block(3177, 3374) + "\n\n" + get_block(3667, 3964)

# Module 5: modals.css
modals_css = """/* =============================================
   MODALS, PROFILES & SOCIAL SHARING
   ============================================= */

.overlay-modal {
    background: rgba(15, 15, 15, 0.75) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    display: flex !important;
    align-items: flex-start !important;
    justify-content: center !important;
    overflow-y: auto !important;
    padding: 60px 20px 80px !important;
    box-sizing: border-box !important;
    -webkit-overflow-scrolling: touch;
}

.overlay-modal-card,
.auth-card,
.share-modal-container,
.author-modal-container,
.legal-modal-container {
    width: 90%;
    max-width: 560px;
    padding: 36px 30px;
    border-radius: 16px;
    margin: 0 auto !important;
    align-self: center !important;
    box-sizing: border-box;
}
""" + get_block(2670, 2738) + "\n\n" + get_block(3375, 3666) + "\n\n" + get_block(3965, 5239)

# Module 6: penpal.css
penpal_css = "/* =============================================\n   MÜREKKEP POSTASI / PENPAL SYSTEM\n   ============================================= */\n\n" + get_block(7001, 8348)

# Module 7: responsive.css
responsive_css = """/* =============================================
   RESPONSIVE & MOBILE TOUCH SCALING
   ============================================= */

@media screen and (max-width: 768px) {
    .newspaper-header {
        display: flex !important;
        flex-direction: column !important;
        gap: 15px !important;
        align-items: center !important;
    }
    .medium-article-container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 64px auto 20px !important;
        padding: 0 18px 140px !important;
        box-sizing: border-box !important;
        align-self: center !important;
    }
    #editor-overlay {
        padding: 54px 12px 120px !important;
    }
    .editor-studio-container {
        padding: 20px 14px !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
    }
    .image-selector-grid {
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 8px !important;
    }
}

/* Touch device (1300px broadsheet mobile scale): Make reading view full width & readable */
@media (pointer: coarse) {
    #reading-overlay {
        width: 100% !important;
        max-width: 100vw !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        padding-bottom: 120px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
    }

    .medium-article-container {
        width: 94% !important;
        max-width: 1220px !important;
        margin: 90px auto 140px !important;
        padding: 0 20px 160px !important;
        align-self: center !important;
    }

    .article-detail-title {
        font-size: 3.6rem !important;
        line-height: 1.18 !important;
        margin-bottom: 20px !important;
        letter-spacing: -0.5px !important;
    }

    .article-detail-subtitle {
        font-size: 2.1rem !important;
        line-height: 1.45 !important;
        margin-bottom: 28px !important;
    }

    .article-meta-badge {
        font-size: 1.4rem !important;
        letter-spacing: 3px !important;
        margin-bottom: 16px !important;
    }

    .author-profile-box {
        padding: 22px 0 !important;
        gap: 20px !important;
        margin-bottom: 28px !important;
    }

    .author-name {
        font-size: 1.7rem !important;
    }

    .author-avatar-img,
    #article-detail-avatar-container .user-avatar,
    #article-detail-avatar-container img {
        width: 60px !important;
        height: 60px !important;
        font-size: 1.7rem !important;
    }

    .btn-follow {
        font-size: 1.5rem !important;
    }

    .article-publish-row {
        font-size: 1.35rem !important;
    }

    .article-social-interactions {
        padding: 16px 0 !important;
        margin-bottom: 36px !important;
    }

    .interaction-btn {
        font-size: 1.4rem !important;
        padding: 12px 24px !important;
        gap: 12px !important;
        border-radius: 30px !important;
    }

    .interaction-btn svg {
        width: 26px !important;
        height: 26px !important;
    }

    .article-featured-image-box {
        margin-bottom: 40px !important;
        padding: 8px !important;
    }

    .article-featured-image {
        max-height: 650px !important;
    }

    .article-body-content {
        font-size: 2.05rem !important;
        line-height: 1.85 !important;
        margin-bottom: 60px !important;
    }

    .article-body-content p {
        margin-bottom: 34px !important;
    }

    .article-body-content p:first-of-type::first-letter {
        font-size: 6rem !important;
        line-height: 0.8 !important;
        margin-right: 12px !important;
    }

    .btn-close-overlay {
        top: 24px !important;
        left: 24px !important;
        padding: 16px 32px !important;
        font-size: 1.45rem !important;
        border-radius: 40px !important;
        gap: 12px !important;
        z-index: 1010 !important;
    }

    .btn-close-overlay svg {
        width: 24px !important;
        height: 24px !important;
    }

    .reading-controls-wrapper {
        top: 24px !important;
        right: 24px !important;
        z-index: 1010 !important;
    }

    .btn-reading-settings {
        padding: 16px 32px !important;
        font-size: 1.45rem !important;
        border-radius: 40px !important;
        gap: 12px !important;
    }

    .btn-reading-settings svg {
        width: 24px !important;
        height: 24px !important;
    }

    .comments-trigger-bar {
        padding: 24px !important;
        margin-top: 40px !important;
        border-radius: 12px !important;
    }

    .ctb-left {
        font-size: 1.6rem !important;
        gap: 14px !important;
    }

    .ctb-left svg {
        width: 26px !important;
        height: 26px !important;
    }

    .ctb-right {
        font-size: 1.45rem !important;
    }

    .ctb-right svg {
        width: 22px !important;
        height: 22px !important;
    }

    .comments-drawer {
        justify-content: center;
        align-items: flex-end;
    }
    
    .comments-drawer-panel {
        width: 100% !important;
        height: 75vh !important;
        border-left: none !important;
        border-top: 4px solid var(--border-color) !important;
        border-radius: 24px 24px 0 0 !important;
        transform: translateY(0) !important;
        overflow: hidden !important;
    }
    
    .comments-drawer-body {
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
    }
}
"""

css_modules = {
    "variables.css": variables_css,
    "newspaper.css": newspaper_css,
    "reader.css": reader_css,
    "editor.css": editor_css,
    "modals.css": modals_css,
    "penpal.css": penpal_css,
    "responsive.css": responsive_css
}

for name, code in css_modules.items():
    path = os.path.join(r'c:\Users\WOOLF\Desktop\web_newspaper\css', name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Created css/{name}: {len(code.splitlines())} lines")

# Master style.css with clean @imports and compiled fallback
master_style = """/* =============================================
   MÜREKKEP GAZETESİ - MODULAR STYLESHEET SYSTEM v3.2.0
   ============================================= */

@import url('css/variables.css?v=3.2.0');
@import url('css/newspaper.css?v=3.2.0');
@import url('css/reader.css?v=3.2.0');
@import url('css/editor.css?v=3.2.0');
@import url('css/modals.css?v=3.2.0');
@import url('css/penpal.css?v=3.2.0');
@import url('css/responsive.css?v=3.2.0');
"""

with open(r'c:\Users\WOOLF\Desktop\web_newspaper\style.css', 'w', encoding='utf-8') as f:
    f.write(master_style)

print("Saved modular master style.css successfully!")
