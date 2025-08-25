document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // API Configuration
    // ===================================================================
    const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/6891a251f7e7a370d1f41a77'; // Replace with your actual Bin ID
    const JSONBIN_API_KEY = '$2a$10$sOSZ5D6cVDPPwJUTty/w0uvrbNINyCukvfWIeW2bv4BhXiQe8jwym'; // Replace with your actual API key
    
    // --- GLOBAL STATE ---
    let promotions = [];
    let currentDate = new Date('2025-08-01T00:00:00Z');
    let charts = {};

    // --- CONFIGURATION DATA (UPDATED FOR BEST DENKI) ---
    const competitors = ['Best Denki', 'Courts', 'Harvey Norman', 'Gain City'];
    const competitorConfig = { 
        'Best Denki':    { colorClass: 'best-denki',    bgColor: '#f9fafb', chartColor: '#4b5563' },
        'Courts':        { colorClass: 'courts',        bgColor: '#f9fafb', chartColor: '#374151' }, 
        'Harvey Norman': { colorClass: 'harvey-norman', bgColor: '#f9fafb', chartColor: '#6b7280' }, 
        'Gain City':     { colorClass: 'gain-city',     bgColor: '#f9fafb', chartColor: '#9ca3af' } 
    };
    const promoCategories = [ 'Promo Bank & Payment', 'Promo HP & Gadget', 'Promo Laptop & PC', 'Promo TV & Audio', 'Promo Home Appliances', 'Promo Back to School', 'Promo 17 Agustus', 'Other Promotions' ];
    
    const categoryColors = {
        'Promo Bank & Payment': '#111827', 'Promo HP & Gadget': '#1f2937', 'Promo Laptop & PC': '#374151',
        'Promo TV & Audio': '#4b5563', 'Promo Home Appliances': '#6b7280', 'Promo Back to School': '#9ca3af',
        'Promo 17 Agustus': '#d1d5db', 'Other Promotions': '#e5e7eb'
    };

    const categoryIcons = { 'Promo Bank & Payment': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="25" width="80" height="50" rx="8" fill="#374151"/><rect x="10" y="60" width="80" height="5" fill="#9ca3af"/><rect x="22" y="35" width="15" height="12"rx="2" fill="#d1d5db"/></svg>`, 'Promo HP & Gadget': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="35" y="15" width="50" height="70" rx="8" fill="#9ca3af"/><rect x="15" y="25" width="40" height="60" rx="8" fill="#374151"/><rect x="20" y="32" width="30" height="46" rx="3" fill="#d1d5db"/></svg>`, 'Promo Laptop & PC': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g><path d="M 5 70 L 95 70 L 85 78 L 15 78 Z" fill="#374151"/><rect x="18" y="22" width="74" height="48" rx="5" fill="#9ca3af" transform="skewX(-10)"/><rect x="25" y="28" width="60" height="36" rx="2" fill="#374151" transform="skewX(-10)"/></g></svg>`, 'Promo TV & Audio': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="20" width="84" height="50" rx="4" fill="#374151"/><rect x="13" y="25" width="74" height="40" fill="#9ca3af"/><path d="M 45 70 L 55 70 L 65 80 L 35 80 Z" fill="#374151"/><rect x="20" y="85" width="60" height="5" rx="2.5" fill="#d1d5db"/></svg>`, 'Promo Home Appliances': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(50 35) scale(0.8)"><path d="M 0 -15 L 0 15 M -13 0 L 13 0 M -9 -9 L 9 9 M -9 9 L 9 -9" stroke="#374151" stroke-width="4" stroke-linecap="round"/></g><path d="M 25 60 C 25 50, 50 50, 50 75 S 75 90, 75 80 C 75 70, 60 70, 50 85 Z" fill="#9ca3af" transform="translate(-15 0)"/><g transform="translate(70 70) scale(0.6)"><circle cx="0" cy="0" r="12" fill="none" stroke="#d1d5db" stroke-width="4"/><path d="M 0 0 L 10 5" stroke="#d1d5db" stroke-width="4" stroke-linecap="round"/><path d="M 0 0 L -10 5" stroke="#d1d5db" stroke-width="4" stroke-linecap="round"/><path d="M 0 0 L 0 -12" stroke="#d1d5db" stroke-width="4" stroke-linecap="round"/></g></svg>`, 'Promo Back to School': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 15 80 Q 50 90 85 80 L 85 20 Q 50 10 15 20 Z" fill="#374151"/><path d="M 50 22 V 82" stroke="#9ca3af" stroke-width="4"/><circle cx="50" cy="50" r="12" fill="#d1d5db"/><path d="M 50 38 Q 55 35 52 30" stroke="#374151" stroke-width="3" fill="none"/></svg>`, 'Promo 17 Agustus': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="10" width="6" height="80" rx="3" fill="#374151"/><path d="M 21 25 C 40 15, 60 35, 80 25 V 45 C 60 55, 40 35, 21 45 Z" fill="#d1d5db"/><path d="M 21 45 C 40 35, 60 55, 80 45 V 65 C 60 75, 40 55, 21 65 Z" fill="#9ca3af"/></svg>`, 'Other Promotions': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="40" width="60" height="45" rx="5" fill="#374151"/><rect x="15" y="25" width="70" height="15" rx="5" fill="#9ca3af"/><rect x="45" y="25" width="10" height="60" fill="#d1d5db"/><path d="M 45 25 C 35 15, 25 15, 25 25" stroke="#d1d5db" stroke-width="8" fill="none"/><path d="M 55 25 C 65 15, 75 15, 75 25" stroke="#d1d5db" stroke-width="8" fill="none"/></svg>` };

    // --- DATA PROCESSING & UTILITY FUNCTIONS ---
    const getPromoCategory = (promo) => { const text = (promo.title + ' ' + (promo.details || '')).toLowerCase(); if (text.includes('bank') || text.includes('credit card') || text.includes('cicilan')) return 'Promo Bank & Payment'; if (text.includes('hp') || text.includes('galaxy') || text.includes('tecno') || text.includes('oppo')) return 'Promo HP & Gadget'; if (text.includes('laptop') || text.includes('back to school')) return 'Promo Laptop & PC'; if (text.includes('tv') || text.includes('audio')) return 'Promo TV & Audio'; if (text.includes('ac ') || text.includes('air conditioner')) return 'Promo Home Appliances'; if (text.includes('pahlawan') || text.includes('17 agustus')) return 'Promo 17 Agustus'; return 'Other Promotions'; };
    const getCategoryIcon = (category) => categoryIcons[category] || categoryIcons['Other Promotions'];
    const calculatePromotionSpan = (startDate, endDate) => {
        const d = (dateString) => new Date(dateString + 'T00:00:00Z');
        const start = d(startDate);
        const end = d(endDate);
        const monthStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
        const monthEnd = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59));
        let s = start < monthStart ? monthStart : start;
        let e = end > monthEnd ? monthEnd : end;
        if (s > e) return {startDay: -1, duration: 0};
        return { startDay: s.getUTCDate(), duration: e.getUTCDate() - s.getUTCDate() + 1 };
    };
    
    // --- API & DATA HANDLING ---
    async function loadPromotions() {
        try {
            const response = await fetch(`${JSONBIN_URL}/latest`, { headers: { 'X-Master-Key': JSONBIN_API_KEY } });
            if (!response.ok) { showNotification('❌ Error loading data from server.', 'bg-red-500'); return; }
            const data = await response.json();
            let loadedPromotions = data.record || [];
            loadedPromotions = loadedPromotions.map(p => {
                const competitorName = p.competitor.toLowerCase();
                if (competitorName.includes('best denki')) p.competitor = 'Best Denki';
                else if (competitorName.includes('courts')) p.competitor = 'Courts';
                else if (competitorName.includes('harvey norman')) p.competitor = 'Harvey Norman';
                else if (competitorName.includes('gain city')) p.competitor = 'Gain City';
                return p;
            });
            promotions = loadedPromotions.map((p, index) => {
                const category = p.category || getPromoCategory(p);
                return { ...p, tempId: index, category: category, iconHTML: getCategoryIcon(category) };
            });
            rerenderAll();
        } catch (error) { console.error("Failed to load promotions:", error); showNotification('❌ Network error. Could not load data.', 'bg-red-500'); }
    }

    async function saveData(updatedPromotions) {
        const dataToSave = updatedPromotions.map(({ tempId, iconHTML, ...rest }) => rest);
        try {
            const response = await fetch(JSONBIN_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
                body: JSON.stringify(dataToSave)
            });
            return response.ok;
        } catch (error) { console.error("Failed to save data:", error); showNotification('❌ Network error. Could not save data.', 'bg-red-500'); return false; }
    }

    // --- FORM HANDLERS ---
    const handleAddPromoForm = async (event) => {
        event.preventDefault();
        const form = event.target;
        const newPromo = { competitor: form.competitor.value, title: form.title.value, startDate: form.startDate.value, endDate: form.endDate.value, details: form.details.value, url: form.promoUrl.value, category: form.promoType.value };
        const updatedPromotions = [...promotions, newPromo];
        const success = await saveData(updatedPromotions);
        if (success) { showNotification('✅ New promotion added!', 'bg-green-500'); form.reset(); document.getElementById('addPromoModal').classList.add('hidden'); await loadPromotions(); } else { showNotification('❌ Failed to add promotion.', 'bg-red-500'); }
    };
    
    const handleEditPromoForm = async (event) => {
        event.preventDefault();
        const form = event.target;
        const promoId = parseInt(form.editPromoId.value);
        const updatedPromotions = promotions.map(p => p.tempId === promoId ? { tempId: p.tempId, competitor: document.getElementById('editCompetitor').value, title: document.getElementById('editTitle').value, url: document.getElementById('editPromoUrl').value, startDate: document.getElementById('editStartDate').value, endDate: document.getElementById('editEndDate').value, details: document.getElementById('editDetails').value, category: document.getElementById('editPromoType').value } : p);
        const success = await saveData(updatedPromotions);
        if (success) { showNotification('✏️ Promotion updated.', 'bg-green-500'); document.getElementById('editPromoModal').classList.add('hidden'); await loadPromotions(); } else { showNotification('❌ Failed to update.', 'bg-red-500'); }
    };

    const deletePromotion = async (promoId) => {
        const updatedPromotions = promotions.filter(p => p.tempId !== promoId);
        const success = await saveData(updatedPromotions);
        if (success) { showNotification('🗑️ Promotion deleted.', 'bg-blue-500'); document.getElementById('deleteConfirmModal').classList.add('hidden'); document.getElementById('promoModal').classList.add('hidden'); await loadPromotions(); } else { showNotification('❌ Failed to delete.', 'bg-red-500'); }
    };
    
    // --- UI RENDERING FUNCTIONS ---
    // (Rest of the rendering functions remain the same as they are dynamically driven by the config arrays)

    const createTimeline = () => { /* No changes needed here */ };
    const generateCustomLegend = (chart, containerId) => { /* No changes needed here */ };
    
    const renderDashboard = (activePromos) => {
        Object.values(charts).forEach(chart => chart.destroy());
        charts = {};
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = '#6b7280';
        
        const barCtx = document.getElementById('bar-chart').getContext('2d');
        charts.bar = new Chart(barCtx, { 
            type: 'bar', 
            data: {
                labels: competitors,
                datasets: [{
                    label: '# of Active Promotions',
                    data: competitors.map(c => activePromos.filter(p => p.competitor === c).length),
                    backgroundColor: competitors.map(c => competitorConfig[c].chartColor),
                    borderRadius: 4,
                }]
            },
            options: { /* Options are unchanged */ } 
        });

        competitors.forEach(c => {
            const slug = c.toLowerCase().replace(/\s+/g, '-');
            const pieCtx = document.getElementById(`pie-chart-${slug}`).getContext('2d');
            const competitorPromos = activePromos.filter(p => p.competitor === c);
            const categoryCounts = promoCategories.map(cat => competitorPromos.filter(p => p.category === cat).length);
            charts[`pie_${slug}`] = new Chart(pieCtx, { 
                type: 'doughnut', 
                data: {
                    labels: promoCategories,
                    datasets: [{ 
                        data: categoryCounts, 
                        backgroundColor: promoCategories.map(cat => categoryColors[cat]), 
                        borderColor: 'var(--color-surface)', 
                        borderWidth: 2 
                    }]
                },
                options: { /* Options are unchanged */ } 
            });
            generateCustomLegend(charts[`pie_${slug}`], `legend-${slug}`);
        });
    };

    const renderPromotionCards = (activePromos) => { /* No changes needed here */ };
    const rerenderAll = () => { /* No changes needed here */ };
    
    // All other functions (modals, notifications, etc.) are also unchanged.
    // ... (paste the rest of your original script.js functions here)
    // The key is that the rendering loops over the `competitors` array, so it's already dynamic.

    // PASTE THE REST OF THE FUNCTIONS FROM THE PREVIOUS script.js HERE
    // Example:
    const showPromoDetailsModal = (promoId) => { /* ... */ };
    const showDeleteConfirmModal = (promoId) => { /* ... */ };
    const showEditPromoModal = (promoId) => { /* ... */ };
    const populateDropdowns = () => { /* ... */ };
    const showNotification = (message, colorClass = 'bg-green-500') => { /* ... */ };
    const updateLastUpdatedText = () => { /* ... */ };
    
    // INITIALIZATION AND EVENT LISTENERS
    populateDropdowns();
    // ... (rest of event listeners)
    
    loadPromotions();
});
