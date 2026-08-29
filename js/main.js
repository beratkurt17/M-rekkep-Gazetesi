// =============================================
// MAIN APPLICATION ROUTER & BOOTSTRAP
// =============================================

if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", () => {
        bootApp();
        initDynamicViewport();
        initWysiwygEditor();
    });
} else {
    bootApp();
    initDynamicViewport();
    initWysiwygEditor();
}

// Dynamic Viewport Manager: Responsive mobile reading across all views
function updateDynamicViewport(isOverlayOpen) {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) return;
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
}

// History Manager for Modals
function initDynamicViewport() {
    const overlays = document.querySelectorAll('.overlay');
    
    let isHandlingPopstate = false;

    const checkOverlays = () => {
        let anyVisible = false;
        let visibleOverlayId = null;

        overlays.forEach(overlay => {
            if (!overlay.classList.contains('hidden')) {
                anyVisible = true;
                visibleOverlayId = overlay.id;
            }
        });
        
        if (commentsDrawer && !commentsDrawer.classList.contains('hidden')) {
            anyVisible = true;
            visibleOverlayId = commentsDrawer.id;
        }

        // Apply dynamic viewport sizing
        updateDynamicViewport(anyVisible);

        // Push state if overlay or drawer is open
        if (anyVisible && visibleOverlayId) {
            if (visibleOverlayId === 'reading-overlay' && activeArticleId) {
                const newUrl = window.location.pathname + `?article=${activeArticleId}`;
                if (!isHandlingPopstate && window.location.search !== `?article=${activeArticleId}`) {
                    history.pushState({ activeOverlay: visibleOverlayId, articleId: activeArticleId }, '', newUrl);
                }
            } else {
                if (!isHandlingPopstate && window.location.hash !== '#' + visibleOverlayId) {
                    history.pushState({ activeOverlay: visibleOverlayId }, '', '#' + visibleOverlayId);
                }
            }
        } else if (isAppBooted && !anyVisible && !isHandlingPopstate && (window.location.hash || window.location.search)) {
            // Clean history when everything is closed
            history.pushState(null, '', window.location.pathname);
        }
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                checkOverlays();
            }
        });
    });

    overlays.forEach(overlay => {
        observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    });
    
    if (commentsDrawer) {
        observer.observe(commentsDrawer, { attributes: true, attributeFilter: ['class'] });
    }

    // Listen for mobile/browser back button
    window.addEventListener('popstate', (event) => {
        isHandlingPopstate = true;
        
        // Parse parameters
        const urlParams = new URLSearchParams(window.location.search);
        const queryArticleId = urlParams.get('article');

        // Check if query parameter for article is now empty, but we have an active article
        if (!queryArticleId && activeArticleId) {
            closeArticle();
        } else if (queryArticleId && activeArticleId !== queryArticleId) {
            openArticle(queryArticleId);
        }

        // Hide open drawer first
        if (commentsDrawer && !commentsDrawer.classList.contains('hidden')) {
            closeCommentsDrawer();
        }
        
        // Hide open overlays
        overlays.forEach(overlay => {
            if (!overlay.classList.contains('hidden')) {
                // If it is reading-overlay and we actually want to open an article, don't close it
                if (overlay.id === 'reading-overlay' && queryArticleId) {
                    return;
                }
                // Find and click the close button to trigger all default cleanups
                const closeBtn = overlay.querySelector('.btn-close-overlay, #close-share, .share-close-btn');
                if (closeBtn) {
                    closeBtn.click();
                } else {
                    overlay.classList.add('hidden');
                    unlockBodyScroll();
                }
            }
        });

        isHandlingPopstate = false;
        checkOverlays();
    });

    checkOverlays();
    // Scaling is handled natively by the browser via viewport meta tag width=1300
}

// Reading Settings Controller
document.addEventListener("DOMContentLoaded", () => {
    const rsToggle = document.getElementById("reading-settings-toggle");
    const rsDropdown = document.getElementById("reading-settings-dropdown");
    const articleContainer = document.querySelector(".medium-article-container");

    if (rsToggle && rsDropdown && articleContainer) {
        rsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            rsDropdown.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!rsDropdown.classList.contains("hidden") && !rsDropdown.contains(e.target) && e.target !== rsToggle) {
                rsDropdown.classList.add("hidden");
            }
        });

        // Font Family selection
        const fontBtns = document.querySelectorAll(".font-family-options .rs-opt-btn");
        fontBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                fontBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const font = btn.getAttribute("data-font");
                articleContainer.classList.remove("article-font-serif", "article-font-sans", "article-font-classic");
                articleContainer.classList.add("article-font-" + font);
                localStorage.setItem("murekkep_reader_font", font);
            });
        });

        // Font Size selection
        const sizeBtns = document.querySelectorAll(".font-size-options .rs-opt-btn");
        sizeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                sizeBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const size = btn.getAttribute("data-size");
                articleContainer.classList.remove("article-size-small", "article-size-medium", "article-size-large");
                articleContainer.classList.add("article-size-" + size);
                localStorage.setItem("murekkep_reader_size", size);
            });
        });

        // Load saved reader preferences
        const savedFont = localStorage.getItem("murekkep_reader_font") || "serif";
        const savedSize = localStorage.getItem("murekkep_reader_size") || "medium";

        const activeFontBtn = document.querySelector(`.font-family-options .rs-opt-btn[data-font="${savedFont}"]`);
        if (activeFontBtn) activeFontBtn.click();

        const activeSizeBtn = document.querySelector(`.font-size-options .rs-opt-btn[data-size="${savedSize}"]`);
        if (activeSizeBtn) activeSizeBtn.click();
    }

    // Instagram Visitor Bar Controller
    const igVisitorBar = document.getElementById("instagram-visitor-bar");
    const closeIgbBtn = document.getElementById("close-ivb-btn");

    if (igVisitorBar) {
        const isDismissed = sessionStorage.getItem("murekkep_ig_bar_dismissed");
        if (isDismissed) {
            igVisitorBar.classList.add("hidden");
        } else {
            igVisitorBar.classList.remove("hidden");
        }

        if (closeIgbBtn) {
            closeIgbBtn.addEventListener("click", () => {
                igVisitorBar.classList.add("hidden");
                sessionStorage.setItem("murekkep_ig_bar_dismissed", "true");
            });
        }
    }
});
