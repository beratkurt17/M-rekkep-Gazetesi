
// =========================================================================
// HELPER: ENSURE OR REGISTER FALLBACK ARTICLE FOR BROADSHEET SLOTS
// =========================================================================
window.openDefaultSlotArticle = function(slotKey, fallbackData) {
    if (!fallbackData) return;
    const existing = articles.find(a => a.id === fallbackData.id);
    if (!existing) {
        articles.push(fallbackData);
    }
    openArticle(fallbackData.id);
};
