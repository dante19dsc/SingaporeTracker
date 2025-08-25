document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // API Configuration
    // ===================================================================
    const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/6891a251f7e7a370d1f41a77';
    const JSONBIN_API_KEY = '$2a$10$sOSZ5D6cVDPPwJUTty/w0uvrbNINyCukvfWIeW2bv4BhXiQe8jwym';
    
    // --- GLOBAL STATE ---
    let promotions = [];
    let currentDate = new Date('2025-08-01T00:00:00Z');
    let charts = {};

    // --- CONFIGURATION DATA ---
    const competitors = ['Courts', 'Harvey Norman', 'Gain City'];
    const competitorConfig = { 
        'Courts': { colorClass: 'courts', bgColor: '#f9fafb', chartColor: '#374151' }, 
        'Harvey Norman': { colorClass: 'harvey-norman', bgColor: '#f9fafb', chartColor: '#6b7280' }, 
        'Gain City': { colorClass: 'gain-city', bgColor: '#f9fafb', chartColor: '#9ca3af' } 
    };
    const promoCategories = [ 'Promo Bank & Payment', 'Promo HP & Gadget', 'Promo Laptop & PC', 'Promo TV & Audio', 'Promo Home Appliances', 'Promo Back to School', 'Promo 17 Agustus', 'Other Promotions' ];
    
    // NEW Monochrome color palette for charts
    const categoryColors = {
        'Promo Bank & Payment': '#111827',
        'Promo HP & Gadget': '#1f2937',
        'Promo Laptop & PC': '#374151',
        'Promo TV & Audio': '#4b5563',
        'Promo Home Appliances': '#6b7280',
        'Promo Back to School': '#9ca3af',
        'Promo 17 Agustus': '#d1d5db',
        'Other Promotions': '#e5e7eb'
    };

    // NEW Monochrome SVG icons
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
                if (competitorName.includes('courts')) p.competitor = 'Courts';
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
    const createTimeline = () => {
        const wrapper = document.getElementById('timeline-wrapper');
        if (!wrapper) return;
        wrapper.innerHTML = '';
        const monthName = currentDate.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
        const year = currentDate.getUTCFullYear();
        document.getElementById('timeline-title').textContent = `${monthName} ${year} - Detailed Promotions by Competitor`;
        const daysInMonth = new Date(Date.UTC(year, currentDate.getUTCMonth() + 1, 0)).getUTCDate();
        
        const headerRow = document.createElement('div');
        headerRow.className = 'timeline-full-row timeline-header-row';
        const headerLabel = document.createElement('div');
        headerLabel.className = 'timeline-sticky-label';
        headerLabel.textContent = `${monthName.toUpperCase()} ${year}`;
        headerRow.appendChild(headerLabel);
        const headerCells = document.createElement('div');
        headerCells.className = 'timeline-cells-container';
        
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            let specialClass = 'timeline-header-day';
            const dateInLoop = new Date(Date.UTC(year, currentDate.getUTCMonth(), day));
            if (dateInLoop.getUTCDay() === 0 || dateInLoop.getUTCDay() === 6) specialClass += ' weekend';
            if (day === today.getDate() && currentDate.getMonth() === today.getMonth() && year === today.getFullYear()) specialClass += ' today';
            dayCell.className = specialClass;
            dayCell.textContent = day;
            headerCells.appendChild(dayCell);
        }
        headerRow.appendChild(headerCells);
        wrapper.appendChild(headerRow);

        const groupedPromos = {};
        promotions.forEach(p => {
            if (!groupedPromos[p.competitor]) groupedPromos[p.competitor] = {};
            if (!groupedPromos[p.competitor][p.category]) groupedPromos[p.competitor][p.category] = [];
            groupedPromos[p.competitor][p.category].push(p);
        });

        competitors.forEach(compName => {
            const config = competitorConfig[compName];
             if (!config) { 
                console.warn(`No config found for competitor: ${compName}`);
                return;
            }
            const competitorHeaderRow = document.createElement('div');
            competitorHeaderRow.className = 'timeline-full-row timeline-competitor-header';
            const competitorLabel = document.createElement('div');
            competitorLabel.className = 'timeline-sticky-label';
            competitorLabel.textContent = compName;
            competitorHeaderRow.appendChild(competitorLabel);
            const competitorCells = document.createElement('div');
            competitorCells.className = 'timeline-cells-container';
            competitorCells.style.backgroundColor = config.bgColor;
            competitorHeaderRow.appendChild(competitorCells);
            wrapper.appendChild(competitorHeaderRow);

            const competitorPromos = groupedPromos[compName] || {};
            promoCategories.forEach(catName => {
                const promosForCategory = competitorPromos[catName] || [];
                promosForCategory.forEach((promo, index) => {
                     const span = calculatePromotionSpan(promo.startDate, promo.endDate);
                     if (span.duration > 0) {
                         const promoRow = document.createElement('div');
                         promoRow.className = 'timeline-full-row';
                         const categoryLabel = document.createElement('div');
                         categoryLabel.className = 'timeline-sticky-label';
                         categoryLabel.textContent = index === 0 ? catName : '';
                         promoRow.appendChild(categoryLabel);
                         const promoCells = document.createElement('div');
                         promoCells.className = 'timeline-cells-container';
                         const bar = document.createElement('div');
                         bar.className = `timeline-bar ${config.colorClass}`;
                         const startPercent = ((span.startDay - 1) / daysInMonth) * 100;
                         const widthPercent = (span.duration / daysInMonth) * 100;
                         bar.style.left = `${startPercent}%`;
                         bar.style.width = `${widthPercent}%`;
                         bar.textContent = promo.title;
                         bar.dataset.promoId = promo.tempId;
                         bar.onclick = () => showPromoDetailsModal(promo.tempId);
                         promoCells.appendChild(bar);
                         promoRow.appendChild(promoCells);
                         wrapper.appendChild(promoRow);
                     }
                });
            });
        });
    };

    const generateCustomLegend = (chart, containerId) => {
        const legendContainer = document.getElementById(containerId);
        if (!legendContainer) return;
        legendContainer.innerHTML = '';
        legendContainer.className = 'flex flex-wrap justify-center gap-x-4 gap-y-2';
        
        const labels = chart.data.labels;
        const colors = chart.data.datasets[0].backgroundColor;
        const data = chart.data.datasets[0].data;

        labels.forEach((label, index) => {
            if (data[index] > 0) {
                const item = document.createElement('div');
                item.className = 'flex items-center text-xs text-gray-600';
                const colorBox = document.createElement('span');
                colorBox.className = 'w-3 h-3 rounded-sm mr-2 flex-shrink-0';
                colorBox.style.backgroundColor = colors[index];
                const text = document.createElement('span');
                text.textContent = label;
                item.appendChild(colorBox);
                item.appendChild(text);
                legendContainer.appendChild(item);
            }
        });
    };

    const renderDashboard = (activePromos) => {
        Object.values(charts).forEach(chart => chart.destroy());
        charts = {};
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = '#6b7280';
        
        // Bar Chart with new monochrome colors
        const barCtx = document.getElementById('bar-chart').getContext('2d');
        charts.bar = new Chart(barCtx, { 
            type: 'bar', 
            data: {
                labels: competitors,
                datasets: [{
                    label: '# of Active Promotions',
                    data: competitors.map(c => activePromos.filter(p => p.competitor === c).length),
                    backgroundColor: [
                        competitorConfig['Courts'].chartColor,
                        competitorConfig['Harvey Norman'].chartColor,
                        competitorConfig['Gain City'].chartColor
                    ],
                    borderRadius: 4,
                }]
            },
            options: { 
                indexAxis: 'y',
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 4,
                        displayColors: false,
                    }
                },
                scales: {
                    x: { 
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#6b7280' }
                    },
                    y: { 
                        grid: { display: false },
                        ticks: { color: '#6b7280' }
                    }
                }
            } 
        });

        // Doughnut Charts
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
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1a1a1a',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 12 },
                            cornerRadius: 4,
                            displayColors: true,
                        }
                    } 
                } 
            });
            generateCustomLegend(charts[`pie_${slug}`], `legend-${slug}`);
        });
    };

    const renderPromotionCards = (activePromos) => {
        const container = document.getElementById('promo-cards-container');
        if (!container) return;
        container.innerHTML = '';
        competitors.forEach(compName => {
            const compPromotions = activePromos.filter(p => p.competitor === compName);
            if (compPromotions.length === 0) return;
            
            const config = competitorConfig[compName];
            const card = document.createElement('div');
            card.className = `paper-card promo-card`;
            
            const contentId = `promo-content-${compName.replace(/\s+/g, '')}`;
            card.innerHTML = `<div class="promo-card-header ${config.colorClass}">${compName} Promotions</div><div class="promo-card-content" id="${contentId}"></div>`;
            container.appendChild(card);
            
            const contentDiv = document.getElementById(contentId);
            compPromotions.sort((a,b) => new Date(a.startDate) - new Date(b.startDate)).forEach((promo, index) => {
                const promoItem = document.createElement('div');
                promoItem.className = 'promo-item';
                promoItem.style.animationDelay = `${index * 50}ms`;
                promoItem.innerHTML = `<a href="${promo.url || '#'}" target="_blank" rel="noopener noreferrer" title="Kunjungi halaman promosi"><div class="promo-item-icon-container">${promo.iconHTML}</div></a><div class="promo-item-details"><div class="promo-item-title">${promo.title}</div><div class="promo-item-category">${promo.category}</div><p class="promo-item-description">${promo.details || 'No details provided.'}</p><p class="promo-item-description text-xs text-gray-500 mt-2">${promo.startDate} - ${promo.endDate}</p></div><div class="promo-item-actions"><button class="edit-promo-btn" data-promo-id="${promo.tempId}" title="Edit Promotion"><i class="fa-solid fa-pencil"></i></button><button class="delete-promo-btn" data-promo-id="${promo.tempId}" title="Delete Promotion"><i class="fa-solid fa-trash-can"></i></button></div>`;
                contentDiv.appendChild(promoItem);
            });
        });
        document.querySelectorAll('.edit-promo-btn').forEach(button => button.addEventListener('click', (e) => showEditPromoModal(parseInt(e.currentTarget.dataset.promoId))));
        document.querySelectorAll('.delete-promo-btn').forEach(button => button.addEventListener('click', (e) => showDeleteConfirmModal(parseInt(e.currentTarget.dataset.promoId))));
    };

    const rerenderAll = () => {
        const monthStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
        const monthEnd = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59));
        const activePromosThisMonth = promotions.filter(p => {
            const promoStart = new Date(p.startDate + 'T00:00:00Z');
            const promoEnd = new Date(p.endDate + 'T00:00:00Z');
            return promoStart <= monthEnd && promoEnd >= monthStart;
        });
        
        createTimeline();
        renderPromotionCards(activePromosThisMonth);
        renderDashboard(activePromosThisMonth);
        updateLastUpdatedText();
    };

    // --- MODAL & NOTIFICATION FUNCTIONS ---
    const showPromoDetailsModal = (promoId) => { const promo = promotions.find(p => p.tempId === promoId); if (!promo) return; const modal = document.getElementById('promoModal'); document.getElementById('modal-content').textContent = `[${promo.category}] ${promo.title}\n\nDetails: ${promo.details}\nDuration: ${promo.startDate} to ${promo.endDate}`; const modalActions = document.getElementById('modal-actions'); modalActions.innerHTML = ''; const deleteButton = document.createElement('button'); deleteButton.className = 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'; deleteButton.textContent = 'Delete'; deleteButton.onclick = () => showDeleteConfirmModal(promo.tempId); const closeButton = document.createElement('button'); closeButton.className = 'px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500'; closeButton.textContent = 'Close'; closeButton.onclick = () => document.getElementById('promoModal').classList.add('hidden'); modalActions.appendChild(deleteButton); modalActions.appendChild(closeButton); modal.classList.remove('hidden'); };
    const showDeleteConfirmModal = (promoId) => { const confirmModal = document.getElementById('deleteConfirmModal'); document.getElementById('confirmDeleteBtn').dataset.promoId = promoId; confirmModal.classList.remove('hidden'); };
    const showEditPromoModal = (promoId) => { const promo = promotions.find(p => p.tempId === promoId); if (!promo) return; const modal = document.getElementById('editPromoModal'); document.getElementById('editPromoId').value = promo.tempId; document.getElementById('editCompetitor').value = promo.competitor; document.getElementById('editPromoType').value = promo.category; document.getElementById('editTitle').value = promo.title; document.getElementById('editPromoUrl').value = promo.url || ''; document.getElementById('editStartDate').value = promo.startDate; document.getElementById('editEndDate').value = promo.endDate; document.getElementById('editDetails').value = promo.details; modal.classList.remove('hidden'); };
    const populateDropdowns = () => { 
        const competitorSelects = [document.getElementById('competitor'), document.getElementById('editCompetitor')];
        competitorSelects.forEach(select => {
            if (!select) return;
            select.innerHTML = '<option value="">Select a Competitor</option>';
            competitors.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                select.appendChild(option);
            });
        });
        const promoTypeSelects = [document.getElementById('promoType'), document.getElementById('editPromoType')];
        promoTypeSelects.forEach(select => {
            if (!select) return;
            select.innerHTML = '<option value="">Select a Category</option>';
            promoCategories.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                select.appendChild(option);
            });
        });
    };
    const showNotification = (message, colorClass = 'bg-green-500') => { const notification = document.getElementById('notification'); const notificationText = document.getElementById('notification-text'); notificationText.textContent = message; notification.className = `text-white px-4 py-2 rounded-lg shadow-lg notification ${colorClass}`; notification.classList.add('show'); setTimeout(() => notification.classList.remove('show'), 3000); };
    const updateLastUpdatedText = () => { const lastUpdatedElement = document.getElementById('last-updated-text'); const now = new Date(); const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }; lastUpdatedElement.textContent = `Last updated: ${now.toLocaleDateString('en-US', options)}`; };
    
    // --- INITIALIZATION AND EVENT LISTENERS ---
    populateDropdowns();
    document.getElementById('openAddPromoModalBtn').addEventListener('click', () => { document.getElementById('addPromoModal').classList.remove('hidden'); });
    document.getElementById('addPromoForm').addEventListener('submit', handleAddPromoForm);
    document.getElementById('editPromoForm').addEventListener('submit', handleEditPromoForm);
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => { document.getElementById('deleteConfirmModal').classList.add('hidden'); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', (e) => { const promoId = parseInt(e.currentTarget.dataset.promoId); deletePromotion(promoId); });
    document.getElementById('prev-month-btn').addEventListener('click', () => { currentDate.setUTCMonth(currentDate.getUTCMonth() - 1, 1); rerenderAll(); });
    document.getElementById('next-month-btn').addEventListener('click', () => { currentDate.setUTCMonth(currentDate.getUTCMonth() + 1, 1); rerenderAll(); });

    // --- START THE APPLICATION ---
    loadPromotions();
});
