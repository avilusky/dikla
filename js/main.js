// ============================================
// VARIABLES & INITIALIZATION
// ============================================

let currentSlide = 0;
const totalSlides = 17; // 0-16 (הוספנו שקפים)

const chartColors = {
    green: '#34d399',
    blue: '#60a5fa',
    orange: '#fb923c',
    red: '#f87171',
    purple: '#a78bfa',
    cyan: '#22d3ee'
};

let chartInstances = {};
let isTransitioning = false;

// מעקב אחר המסלול: מאיפה הגענו
let navigationPath = {
    fromLife: false,
    fromHealth: false,
    fromGeneral: false
};

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const logo = document.querySelector('.slide-logo');
    if (logo) logo.style.opacity = '0';
    
    updateSlideIndicator();
    
    setTimeout(() => initChartsForSlide(1), 300);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            changeSlide(e.key === 'ArrowLeft' ? 1 : -1);
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-button') && !isTransitioning) {
            changeSlide(1);
        }
    });

    let isScrolling = false;
    document.addEventListener('wheel', function(e) {
        if (isScrolling || isTransitioning) return;
        isScrolling = true;
        changeSlide(e.deltaY > 0 ? 1 : -1);
        setTimeout(() => isScrolling = false, 800);
    });
});

// ============================================
// NAVIGATION LOGIC
// ============================================

function changeSlide(direction) {
    if (isTransitioning) return;
    const slides = document.querySelectorAll('.slide');
    const nextIndex = currentSlide + direction;
    
    if (nextIndex < 0 || nextIndex >= totalSlides) return;
    
    console.log(`🔍 Current: ${currentSlide}, Next: ${nextIndex}, Direction: ${direction}`);
    
    // לוגיקת ניווט מיוחדת
    
    // מגזרים (2) → חיים (3)
    if (currentSlide === 2 && nextIndex === 3 && !navigationPath.fromLife && !navigationPath.fromHealth && !navigationPath.fromGeneral) {
        console.log('🎯 Drill Down: מגזרים → חיים');
        performDrillDownToLife(slides, nextIndex);
        return;
    }
    
    // אחרי מפל משתתף דמ"ג קבועים (7) → חזרה למגזרים (2)
    if (currentSlide === 7 && nextIndex === 8) {
        console.log('🔙 חזרה מחיים למגזרים');
        navigationPath.fromLife = true;
        navigationPath.fromHealth = false;
        navigationPath.fromGeneral = false;
        regularTransition(slides, 2);
        return;
    }
    
    // מגזרים (2) אחרי חיים → בריאות (8)
    if (currentSlide === 2 && nextIndex === 3 && navigationPath.fromLife) {
        console.log('🎯 Drill Down: מגזרים → בריאות');
        navigationPath.fromLife = false;
        performDrillDownToHealth(slides, 8);
        return;
    }
    
// אחרי מפל מחלות קשות (13) → ממשיכים ליחס צמיחה (14)
// יחס צמיחה (14) → חזרה למגזרים (2)
if (currentSlide === 14 && nextIndex === 15) {
    console.log('🔙 חזרה מבריאות למגזרים דרך יחס צמיחה');
    navigationPath.fromHealth = true;
    navigationPath.fromLife = false;
    navigationPath.fromGeneral = false;
    regularTransition(slides, 2);
    return;
}
    
    // מגזרים (2) אחרי בריאות → כללי (15)
    if (currentSlide === 2 && nextIndex === 3 && navigationPath.fromHealth) {
        console.log('🎯 Drill Down: מגזרים → כללי');
        navigationPath.fromHealth = false;
        performDrillDownToGeneral(slides, 15);
        return;
    }
    
    // Drill downs בתוך מגזר חיים
    if (currentSlide === 3 && nextIndex === 4) {
        performDrillDownLifeToBreakdown(slides, nextIndex);
        return;
    }
    
    // Drill downs בתוך מגזר בריאות
    if (currentSlide === 8 && nextIndex === 9) {
        performDrillDownHealthToBreakdown(slides, nextIndex);
        return;
    }
    
    // Drill down בתוך מגזר כללי
    if (currentSlide === 15 && nextIndex === 16) {
        performDrillDownGeneralToBreakdown(slides, nextIndex);
        return;
    }
    
    // מעבר רגיל
    regularTransition(slides, nextIndex);
}

function regularTransition(slides, nextIndex) {
    slides[currentSlide].classList.remove('active');
    slides[nextIndex].classList.add('active');
    currentSlide = nextIndex;
    
    const logo = document.querySelector('.slide-logo');
    if (logo) logo.style.opacity = currentSlide === 0 ? '0' : '0.7';
    
    updateSlideIndicator();
    
    setTimeout(() => {
        initChartsForSlide(currentSlide);
        isTransitioning = false;
    }, 100);
}

function updateSlideIndicator() {
    const indicator = document.getElementById('slideIndicator');
    if (indicator) {
        indicator.textContent = `שקף ${currentSlide} מתוך ${totalSlides - 1}`;
    }
}

// ============================================
// DRILL DOWN ANIMATIONS
// ============================================

function performDrillDownToLife(slides, nextIndex) {
    isTransitioning = true;
    const chart = chartInstances.slide2?.stacked;
    if (!chart) { regularTransition(slides, nextIndex); return; }
    
    const canvas = document.getElementById('sectorsStackedChart');
    const currentSlideEl = slides[currentSlide];
    
    // שלב 1: האפר את IFRS4 והדגש את IFRS17 של חסכון ארוך טווח
    chart.data.datasets.forEach((dataset, index) => {
        if (index === 4) {
            // IFRS17 חסכון ארוך טווח - הדגש
            dataset.borderWidth = 3;
            dataset.borderColor = 'rgba(52, 211, 153, 0.8)';
            dataset.backgroundColor = 'rgba(52, 211, 153, 0.85)';
        } else {
            // כל השאר (IFRS4 + שאר IFRS17) - האפר
            dataset.backgroundColor = 'rgba(200, 200, 200, 0.2)';
        }
    });
    chart.update({ duration: 1200, easing: 'easeInOutQuad' });
    
    setTimeout(() => {
        // הדגשה רק של IFRS17 (dataset 4)
        const originalData = [...chart.data.datasets[4].data];
        chart.data.datasets[4].data = originalData.map(v => v ? v * 1.15 : v);
        chart.data.datasets[4].backgroundColor = 'rgba(52, 211, 153, 1)';
        chart.data.datasets[4].borderWidth = 4;
        chart.data.datasets[4].borderColor = '#ffffff';
        canvas.style.transition = 'all 1s ease-out';
        canvas.style.filter = 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.6))';
        chart.update({ duration: 1000, easing: 'easeOutQuad' });
        
        setTimeout(() => {
            // שלב 3: fade out
            currentSlideEl.style.transition = 'all 0.8s ease-out';
            currentSlideEl.style.opacity = '0';
            setTimeout(() => performSlideTransition(slides, canvas, currentSlideEl, nextIndex), 800);
        }, 1000);
    }, 1200);
}

function performDrillDownToHealth(slides, nextIndex) {
    isTransitioning = true;
    const chart = chartInstances.slide2?.stacked;
    if (!chart) { regularTransition(slides, nextIndex); return; }
    
    const canvas = document.getElementById('sectorsStackedChart');
    const currentSlideEl = slides[currentSlide];
    
    // שלב 1: האפר את כל המגזרים חוץ מבריאות (dataset 5)
    chart.data.datasets.forEach((dataset, index) => {
        if (index === 5) {
            // IFRS17 בריאות - הדגש
            dataset.borderWidth = 3;
            dataset.borderColor = 'rgba(96, 165, 250, 0.8)';
            dataset.backgroundColor = 'rgba(96, 165, 250, 0.85)';
        } else {
            // כל השאר - האפר
            dataset.backgroundColor = 'rgba(200, 200, 200, 0.2)';
        }
    });
    chart.update({ duration: 1200, easing: 'easeInOutQuad' });
    
    setTimeout(() => {
        const originalData = [...chart.data.datasets[5].data];
        chart.data.datasets[5].data = originalData.map(v => v ? v * 1.15 : v);
        chart.data.datasets[5].backgroundColor = 'rgba(96, 165, 250, 1)';
        chart.data.datasets[5].borderWidth = 4;
        chart.data.datasets[5].borderColor = '#ffffff';
        canvas.style.transition = 'all 1s ease-out';
        canvas.style.filter = 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.6))';
        chart.update({ duration: 1000, easing: 'easeOutQuad' });
        
        setTimeout(() => {
            currentSlideEl.style.transition = 'all 0.8s ease-out';
            currentSlideEl.style.opacity = '0';
            setTimeout(() => performSlideTransition(slides, canvas, currentSlideEl, nextIndex), 800);
        }, 1000);
    }, 1200);
}

function performDrillDownToGeneral(slides, nextIndex) {
    isTransitioning = true;
    const chart = chartInstances.slide2?.stacked;
    if (!chart) { regularTransition(slides, nextIndex); return; }
    
    const canvas = document.getElementById('sectorsStackedChart');
    const currentSlideEl = slides[currentSlide];
    
    // שלב 1: האפר את כל המגזרים חוץ מכללי (dataset 6)
    chart.data.datasets.forEach((dataset, index) => {
        if (index === 6) {
            // IFRS17 כללי - הדגש
            dataset.borderWidth = 3;
            dataset.borderColor = 'rgba(251, 146, 60, 0.8)';
            dataset.backgroundColor = 'rgba(251, 146, 60, 0.85)';
        } else {
            // כל השאר - האפר
            dataset.backgroundColor = 'rgba(200, 200, 200, 0.2)';
        }
    });
    chart.update({ duration: 1200, easing: 'easeInOutQuad' });
    
    setTimeout(() => {
        const originalData = [...chart.data.datasets[6].data];
        chart.data.datasets[6].data = originalData.map(v => v ? v * 1.15 : v);
        chart.data.datasets[6].backgroundColor = 'rgba(251, 146, 60, 1)';
        chart.data.datasets[6].borderWidth = 4;
        chart.data.datasets[6].borderColor = '#ffffff';
        canvas.style.transition = 'all 1s ease-out';
        canvas.style.filter = 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.6))';
        chart.update({ duration: 1000, easing: 'easeOutQuad' });
        
        setTimeout(() => {
            currentSlideEl.style.transition = 'all 0.8s ease-out';
            currentSlideEl.style.opacity = '0';
            setTimeout(() => performSlideTransition(slides, canvas, currentSlideEl, nextIndex), 800);
        }, 1000);
    }, 1200);
}

function performDrillDownLifeToBreakdown(slides, nextIndex) {
    isTransitioning = true;
    const chart = chartInstances.slide3?.life;
    if (!chart) { regularTransition(slides, nextIndex); return; }
    const canvas = document.getElementById('lifeInsuranceChart');
    applyProfessionalDrillDown(chart, canvas, slides[currentSlide], slides, nextIndex, 0, chartColors.blue);
}

function performDrillDownHealthToBreakdown(slides, nextIndex) {
    isTransitioning = true;
    const chart = chartInstances.slide8?.health;
    if (!chart) { regularTransition(slides, nextIndex); return; }
    const canvas = document.getElementById('healthInsuranceChart');
    applyProfessionalDrillDown(chart, canvas, slides[currentSlide], slides, nextIndex, 0, chartColors.blue);
}

function performDrillDownGeneralToBreakdown(slides, nextIndex) {
    isTransitioning = true;
    const chart = chartInstances.slide15?.general;
    if (!chart) { regularTransition(slides, nextIndex); return; }
    const canvas = document.getElementById('generalInsuranceChart');
    applyProfessionalDrillDown(chart, canvas, slides[currentSlide], slides, nextIndex, 0, chartColors.green);
}

function applyProfessionalDrillDown(chart, canvas, currentSlideEl, slides, nextIndex, datasetIndex, color) {
    const colorRgba = hexToRgba(color, 1);
    const colorRgbaLight = hexToRgba(color, 0.85);
    
    chart.data.datasets.forEach((dataset, index) => {
        if (index !== datasetIndex) {
            dataset.backgroundColor = 'rgba(200, 200, 200, 0.2)';
        } else {
            dataset.borderWidth = 3;
            dataset.borderColor = hexToRgba(color, 0.8);
            dataset.backgroundColor = colorRgbaLight;
        }
    });
    chart.update({ duration: 1200, easing: 'easeInOutQuad' });
    
    setTimeout(() => {
        const originalData = [...chart.data.datasets[datasetIndex].data];
        chart.data.datasets[datasetIndex].data = originalData.map(v => v * 1.15);
        chart.data.datasets[datasetIndex].backgroundColor = colorRgba;
        chart.data.datasets[datasetIndex].borderWidth = 4;
        chart.data.datasets[datasetIndex].borderColor = '#ffffff';
        canvas.style.transition = 'all 1s ease-out';
        canvas.style.filter = `drop-shadow(0 0 20px ${hexToRgba(color, 0.6)})`;
        chart.update({ duration: 1000, easing: 'easeOutQuad' });
        
        setTimeout(() => {
            currentSlideEl.style.transition = 'all 0.8s ease-out';
            currentSlideEl.style.opacity = '0';
            setTimeout(() => performSlideTransition(slides, canvas, currentSlideEl, nextIndex), 800);
        }, 1000);
    }, 1200);
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function performSlideTransition(slides, canvas, currentSlideEl, nextIndex) {
    canvas.style.filter = '';
    canvas.style.transition = '';
    currentSlideEl.classList.remove('active');
    currentSlideEl.style.opacity = '';
    
    const newSlide = slides[nextIndex];
    newSlide.classList.add('active');
    newSlide.style.opacity = '0';
    newSlide.style.transition = 'none';
    currentSlide = nextIndex;
    
    const logo = document.querySelector('.slide-logo');
    if (logo) logo.style.opacity = '0.7';
    
    updateSlideIndicator();
    
    setTimeout(() => {
        newSlide.style.transition = 'all 0.8s ease-out';
        newSlide.style.opacity = '1';
        setTimeout(() => {
            initChartsForSlide(currentSlide);
            newSlide.style.transition = '';
            isTransitioning = false;
        }, 800);
    }, 50);
}

// ============================================
// CHART INITIALIZATION
// ============================================

function initChartsForSlide(slideNumber) {
    if (typeof Chart === 'undefined') { console.error('Chart.js לא נטען!'); return; }
    if (typeof presentationData === 'undefined') { console.error('presentationData לא קיים!'); return; }
    
    destroyChartsForSlide(slideNumber);
    
    Chart.defaults.font.family = 'system-ui';
    Chart.defaults.font.size = 15;
    Chart.defaults.color = '#64748b';
    Chart.defaults.animation.duration = 1500;
    Chart.defaults.animation.easing = 'easeOutQuart';
    Chart.defaults.layout = { padding: { top: 40, bottom: 10, left: 10, right: 10 } };
    
    console.log('📊 Initializing charts for slide:', slideNumber);
    
    switch(slideNumber) {
        case 1: createStockIndicesChart(); break;
        case 2: createSectorsStackedChart(); break;
        case 3: createLifeInsuranceChart(); break;
        case 4: createLifeBreakdownChart(); break;
        case 5: createLifeCsmPieCharts(); break;
        case 6: createLifeCsmWaterfallRiskChart(); break;
        case 7: createLifeCsmWaterfallParticipatingChart(); break;
        case 8: createHealthInsuranceChart(); break;
        case 9: createHealthBreakdownChart(); break;
        case 10: createHealthCsmPieCharts(); break;
        case 11: createHealthCsmByPortfolioChart(); break;
        case 12: createHealthCsmWaterfallMedicalChart(); break;
        case 13: createHealthCsmWaterfallCriticalChart(); break;
        case 14: createGrowthRatiosChart(); break;
        case 15: createGeneralInsuranceChart(); break;
        case 16: createGeneralBreakdownChart(); break;
    }
}

function destroyChartsForSlide(slideNumber) {
    const slideKey = 'slide' + slideNumber;
    if (chartInstances[slideKey]) {
        Object.values(chartInstances[slideKey]).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') chart.destroy();
        });
        delete chartInstances[slideKey];
    }
}

// ============================================
// CHART CREATION FUNCTIONS
// ============================================

function createStockIndicesChart() {
    const ctx = document.getElementById('stockIndicesChart');
    if (!ctx) return;
    
    chartInstances.slide1 = chartInstances.slide1 || {};
    chartInstances.slide1.stocks = new Chart(ctx, {
        type: 'line',
        data: {
            labels: presentationData.stockIndices.labels,
            datasets: [{
                label: 'ת"א 35',
                data: presentationData.stockIndices.ta35,
                borderColor: chartColors.blue,
                backgroundColor: chartColors.blue,
                tension: 0.3,
                borderWidth: 4,
                fill: false,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: chartColors.blue,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2.5
            }, {
                label: 'ת"א בנקים',
                data: presentationData.stockIndices.banks,
                borderColor: chartColors.green,
                backgroundColor: chartColors.green,
                tension: 0.3,
                borderWidth: 4,
                fill: false,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: chartColors.green,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2.5
            }, {
                label: 'ת"א ביטוח',
                data: presentationData.stockIndices.insurance,
                borderColor: chartColors.orange,
                backgroundColor: chartColors.orange,
                tension: 0.3,
                borderWidth: 5.5,
                fill: false,
                pointRadius: 8,
                pointHoverRadius: 10,
                pointBackgroundColor: chartColors.orange,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            animation: {
                duration: 2000,
                easing: 'easeInOutCubic',
                onProgress: function(animation) {
                    const chartInstance = animation.chart;
                    const progress = animation.currentStep / animation.numSteps;
                    
                    chartInstance.data.datasets.forEach((dataset) => {
                        dataset.data.forEach((value, index) => {
                            const meta = chartInstance.getDatasetMeta(chartInstance.data.datasets.indexOf(dataset));
                            if (meta.data[index]) {
                                const totalPoints = dataset.data.length;
                                const pointProgress = (index / totalPoints);
                                
                                if (progress < pointProgress) {
                                    meta.data[index].hidden = true;
                                } else {
                                    meta.data[index].hidden = false;
                                }
                            }
                        });
                    });
                }
            },
            plugins: {
                legend: { position: 'top', rtl: true, labels: { font: { size: 17 }, padding: 15, usePointStyle: true, pointStyle: 'circle' } },
                tooltip: { rtl: true, bodyFont: { size: 15 }, padding: 12, backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    callbacks: { label: function(context) { return context.dataset.label + ': ' + context.parsed.y.toLocaleString(); } }
                }
            },
            scales: {
                y: { 
                    beginAtZero: false, 
                    ticks: { 
                        font: { size: 14 }, 
                        callback: function(value) { return value.toLocaleString(); },
                        padding: 5
                    }, 
                    grid: { color: 'rgba(0, 0, 0, 0.06)' },
                    border: { display: false }
                },
                x: {
                    ticks: { font: { size: 16 }, padding: 10 },
                    afterFit: function(scale) { scale.paddingBottom = 80; scale.paddingRight = 60; },
                    grid: { 
                        display: true, 
                        drawOnChartArea: true,
                        color: function(context) { 
                            return context.index > 0 && context.index % 4 === 0 ? 'rgba(96, 165, 250, 0.25)' : 'rgba(0, 0, 0, 0.05)'; 
                        },
                        lineWidth: function(context) { 
                            return context.index > 0 && context.index % 4 === 0 ? 2 : 1; 
                        }
                    }
                }
            }
        },
        plugins: [{
    id: 'yearLabels',
    afterDraw(chart) {
        const { ctx, scales: { x }, chartArea } = chart;
        ctx.save();
        
        const years = ['2020', '2021', '2022', '2023', '2024', '2025'];
        const labelsPerYear = 4; // 4 רבעונים לכל שנה
        
        ctx.font = 'bold 16px system-ui';
        ctx.fillStyle = '#3b82f6';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        years.forEach((year, yearIndex) => {
            // Q3 הוא האינדקס השלישי (0,1,2,3 -> Q3 = אינדקס 2)
            const q3Index = (yearIndex * labelsPerYear) + 2;
            
            if (q3Index < chart.data.labels.length) {
                const centerX = x.getPixelForValue(q3Index);
                const yPosition = chartArea.bottom + 45;
                
                // רקע לשנה
                const textWidth = ctx.measureText(year).width;
                const padding = 12;
                
                ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
                ctx.beginPath();
                ctx.roundRect(centerX - textWidth / 2 - padding, yPosition - 3, textWidth + padding * 2, 26, 6);
                ctx.fill();
                
                // טקסט השנה
                ctx.fillStyle = '#3b82f6';
                ctx.fillText(year, centerX, yPosition);
            }
        });
        
        ctx.restore();
    }
}]

    });
}

function createSectorsStackedChart() {
    const ctx = document.getElementById('sectorsStackedChart');
    if (!ctx) return;
    
    chartInstances.slide2 = chartInstances.slide2 || {};
    chartInstances.slide2.stacked = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: presentationData.sectors.labels,
            datasets: [
                // IFRS4 datasets
                {
                    label: 'חסכון ארוך טווח',
                    data: presentationData.sectors.longterm_ifrs4,
                    backgroundColor: '#a7f3d0',
                    stack: 'ifrs4',
                    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
                }, {
                    label: 'ביטוח בריאות',
                    data: presentationData.sectors.health_ifrs4,
                    backgroundColor: '#bfdbfe',
                    stack: 'ifrs4',
                    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
                }, {
                    label: 'ביטוח כללי',
                    data: presentationData.sectors.general_ifrs4,
                    backgroundColor: '#fed7aa',
                    stack: 'ifrs4',
                    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
                }, {
                    label: 'אחר',
                    data: presentationData.sectors.other_ifrs4,
                    backgroundColor: '#ddd6fe',
                    stack: 'ifrs4',
                    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
                },
                // IFRS17 datasets
                {
                    label: 'חסכון ארוך טווח',
                    data: presentationData.sectors.longterm_ifrs17,
                    backgroundColor: chartColors.green,
                    stack: 'ifrs17',
                    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
                }, {
                    label: 'ביטוח בריאות',
                    data: presentationData.sectors.health_ifrs17,
                    backgroundColor: chartColors.blue,
                    stack: 'ifrs17',
                    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
                }, {
                    label: 'ביטוח כללי',
                    data: presentationData.sectors.general_ifrs17,
                    backgroundColor: chartColors.orange,
                    stack: 'ifrs17',
                    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
                }, {
                    label: 'אחר',
                    data: presentationData.sectors.other_ifrs17,
                    backgroundColor: chartColors.purple,
                    stack: 'ifrs17',
                    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'bottom', 
                    rtl: true, 
                    labels: { 
                        font: { size: 16 }, 
                        padding: 25, 
                        usePointStyle: true,
                        filter: function(legendItem, chartData) {
                            // הצג רק את ה-IFRS17 datasets (4 האחרונים)
                            return legendItem.datasetIndex >= 4;
                        }
                    } 
                },
                tooltip: { rtl: true, callbacks: { label: function(context) { return context.dataset.label + ': ₪' + context.parsed.y.toFixed(0) + 'M'; } } }
            },
            scales: {
                x: { 
                    stacked: true, 
                    ticks: { font: { size: 16 } }, 
                    grid: { display: false } 
                },
                y: { 
                    stacked: true, 
                    beginAtZero: true, 
                    ticks: { callback: value => '₪' + value + 'M', font: { size: 14 } }, 
                    grid: { color: 'rgba(0, 0, 0, 0.05)' } 
                }
            },
            barPercentage: 0.7, categoryPercentage: 1.0
        },
        plugins: [{
            id: 'topTotalLabels',
            afterDatasetsDraw(chart) {
                const { ctx, scales: { x, y }, chartArea } = chart;
                ctx.save();
                ctx.font = 'bold 14px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                
                const totals = presentationData.sectors.labels.map((label, index) => {
                    const ifrs17 = presentationData.sectors.longterm_ifrs17[index] + 
                                   presentationData.sectors.health_ifrs17[index] + 
                                   presentationData.sectors.general_ifrs17[index] + 
                                   presentationData.sectors.other_ifrs17[index];
                    return ifrs17;
                });
                
                const yPosition = chartArea.top - 5;
                totals.forEach((total, index) => {
                    const xPos = x.getPixelForValue(index) + (x.width / (presentationData.sectors.labels.length * 2)) * 0.5;
                    const text = '₪' + total.toFixed(0) + 'M';
                    const textWidth = ctx.measureText(text).width;
                    const padding = 8;
                    
                    ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 22, textWidth + padding * 2, 26, 6);
                    ctx.fill();
                    
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 22, textWidth + padding * 2, 26, 6);
                    ctx.stroke();
                    
                    ctx.fillStyle = total < 0 ? '#dc2626' : '#475569';
                    ctx.fillText(text, xPos, yPosition);
                });
                ctx.restore();
            }
        }]
    });
}

function createLifeInsuranceChart() {
    const ctx = document.getElementById('lifeInsuranceChart');
    if (!ctx) return;
    
    chartInstances.slide3 = chartInstances.slide3 || {};
    chartInstances.slide3.life = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: presentationData.lifeInsurance.labels,
            datasets: [{
                label: 'רווח משירותי ביטוח',
                data: presentationData.lifeInsurance.insurance,
                backgroundColor: chartColors.blue,
                borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
                borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
            }, {
                label: 'רווח מהשקעות',
                data: presentationData.lifeInsurance.investment,
                backgroundColor: chartColors.orange,
                borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', rtl: true, labels: { font: { size: 17 }, padding: 50, usePointStyle: true } },
                tooltip: { rtl: true, callbacks: { label: function(context) { return context.dataset.label + ': ₪' + context.parsed.y.toFixed(1) + 'K'; } } }
            },
            scales: {
                x: { stacked: true, ticks: { font: { size: 16 } }, grid: { display: false } },
                y: {
                    stacked: true,
                    min: -200,
                    ticks: { callback: value => '₪' + value + 'K', font: { size: 14 } },
                    grid: {
                        color: function(context) {
                            if (context.tick && context.tick.value === 0) return 'rgba(30, 41, 59, 0.4)';
                            return 'rgba(0, 0, 0, 0.05)';
                        },
                        lineWidth: function(context) {
                            if (context.tick && context.tick.value === 0) return 3;
                            return 1;
                        }
                    },
                    border: { display: true, color: 'rgba(30, 41, 59, 0.4)', width: 3 }
                }
            }
        },
        plugins: [{
            id: 'topTotalLabels',
            afterDatasetsDraw(chart) {
                const { ctx, scales: { x, y }, chartArea } = chart;
                ctx.save();
                ctx.font = 'bold 14px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                const yPosition = chartArea.top - 5;
                
                presentationData.lifeInsurance.totals.forEach((total, index) => {
                    const xPos = x.getPixelForValue(index);
                    const text = '₪' + total.toFixed(0) + 'K';
                    const textWidth = ctx.measureText(text).width;
                    const padding = 7;
                    
                    ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 20, textWidth + padding * 2, 24, 5);
                    ctx.fill();
                    
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 20, textWidth + padding * 2, 24, 5);
                    ctx.stroke();
                    
                    ctx.fillStyle = total < 0 ? '#dc2626' : '#475569';
                    ctx.fillText(text, xPos, yPosition);
                });
                ctx.restore();
            }
        }]
    });
}

function createLifeBreakdownChart() {
    const ctx = document.getElementById('lifeBreakdownChart');
    if (!ctx) return;
    
    chartInstances.slide4 = chartInstances.slide4 || {};
    chartInstances.slide4.breakdown = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: presentationData.lifeInsuranceBreakdown.labels,
datasets: [{
    label: 'פריסת CSM', 
    data: presentationData.lifeInsuranceBreakdown.csm, 
    backgroundColor: chartColors.blue,
    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
    borderSkipped: false, 
    borderWidth: 2, 
    borderColor: 'rgba(255, 255, 255, 0.8)'
}, {
    label: 'שינוי ב-RA', 
    data: presentationData.lifeInsuranceBreakdown.ra, 
    backgroundColor: chartColors.green,
    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
    borderSkipped: false, 
    borderWidth: 2, 
    borderColor: 'rgba(255, 255, 255, 0.8)'
}, {
    label: 'התאמות לעניין - תביעות והוצאות', 
    data: presentationData.lifeInsuranceBreakdown.claimsAdj, 
    backgroundColor: chartColors.orange,
    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
    borderSkipped: false, 
    borderWidth: 2, 
    borderColor: 'rgba(255, 255, 255, 0.8)'
}, {
    label: 'התאמות לעניין - פרמיות', 
    data: presentationData.lifeInsuranceBreakdown.premiumAdj, 
    backgroundColor: chartColors.purple,
    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
    borderSkipped: false, 
    borderWidth: 2, 
    borderColor: 'rgba(255, 255, 255, 0.8)'
}, {
    label: 'הפסדים', 
    data: presentationData.lifeInsuranceBreakdown.losses, 
    backgroundColor: chartColors.red,
    borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
    borderSkipped: false, 
    borderWidth: 2, 
    borderColor: 'rgba(255, 255, 255, 0.8)'
}]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', rtl: true, labels: { font: { size: 17 }, padding: 10, usePointStyle: true } },
                tooltip: { rtl: true, callbacks: { label: function(context) { return context.dataset.label + ': ₪' + context.parsed.y.toFixed(1) + 'K'; } } }
            },
            scales: {
                x: { stacked: true, ticks: { font: { size: 16 } }, grid: { display: false } },
                y: { stacked: true, ticks: { callback: value => '₪' + value + 'K', font: { size: 14 } }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
            }
        },
        plugins: [{
            id: 'topTotalLabels',
            afterDatasetsDraw(chart) {
                const { ctx, scales: { x, y }, chartArea } = chart;
                ctx.save();
                ctx.font = 'bold 14px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                const yPosition = chartArea.top - 5;
                
                presentationData.lifeInsuranceBreakdown.totals.forEach((total, index) => {
                    const xPos = x.getPixelForValue(index);
                    const text = '₪' + total.toFixed(0) + 'K';
                    const textWidth = ctx.measureText(text).width;
                    const padding = 6;
                    
                    ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 18, textWidth + padding * 2, 22, 5);
                    ctx.fill();
                    
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 18, textWidth + padding * 2, 22, 5);
                    ctx.stroke();
                    
                    ctx.fillStyle = total < 0 ? '#dc2626' : '#475569';
                    ctx.fillText(text, xPos, yPosition);
                });
                ctx.restore();
            }
        }]
    });
}

function createLifeCsmPieCharts() {
    // עוגה 1 - סה"כ ביטוח חיים
    const ctx1 = document.getElementById('lifeCsmTotalPie');
    if (ctx1) {
        chartInstances.slide5 = chartInstances.slide5 || {};
        chartInstances.slide5.total = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: presentationData.lifeCsmPies.total.labels,
                datasets: [{
                    data: presentationData.lifeCsmPies.total.values,
                    backgroundColor: [chartColors.blue, chartColors.green, chartColors.orange],
                    borderWidth: 4, borderColor: '#ffffff', hoverBorderWidth: 5
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '60%',
                plugins: {
                    legend: { position: 'bottom', rtl: true, labels: { font: { size: 17 }, padding: 20, usePointStyle: true, pointStyle: 'circle' } },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ₪' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'datalabelsOnSegments',
                afterDatasetsDraw(chart) {
                    const { ctx, data } = chart;
                    ctx.save();
                    
                    chart.getDatasetMeta(0).data.forEach((arc, index) => {
                        const value = data.datasets[0].data[index];
                        const midAngle = (arc.startAngle + arc.endAngle) / 2;
                        const radius = (arc.outerRadius + arc.innerRadius) / 2;
                        
                        const x = arc.x + Math.cos(midAngle) * radius;
                        const y = arc.y + Math.sin(midAngle) * radius;
                        
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 14px system-ui';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('₪' + value.toLocaleString(), x, y);
                    });
                    
                    ctx.restore();
                }
            }]
        });
    }
    
    // עוגה 2 - ריסק מוות (קטנה יותר)
    const ctx2 = document.getElementById('lifeCsmRiskPie');
    if (ctx2) {
        chartInstances.slide5 = chartInstances.slide5 || {};
        chartInstances.slide5.risk = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: presentationData.lifeCsmPies.risk.labels,
                datasets: [{
                    data: presentationData.lifeCsmPies.risk.values,
                    backgroundColor: [chartColors.blue, chartColors.green, chartColors.orange],
                    borderWidth: 4, borderColor: '#ffffff', hoverBorderWidth: 5
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '55%',
                plugins: {
                    legend: { position: 'bottom', rtl: true, labels: { font: { size: 15 }, padding: 15, usePointStyle: true, pointStyle: 'circle' } },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ₪' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'datalabelsOnSegments',
                afterDatasetsDraw(chart) {
                    const { ctx, data } = chart;
                    ctx.save();
                    
                    chart.getDatasetMeta(0).data.forEach((arc, index) => {
                        const value = data.datasets[0].data[index];
                        const midAngle = (arc.startAngle + arc.endAngle) / 2;
                        const radius = (arc.outerRadius + arc.innerRadius) / 2;
                        
                        const x = arc.x + Math.cos(midAngle) * radius;
                        const y = arc.y + Math.sin(midAngle) * radius;
                        
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 14px system-ui';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('₪' + value.toLocaleString(), x, y);
                    });
                    
                    ctx.restore();
                }
            }]
        });
    }
}

function createLifeCsmWaterfallRiskChart() {
    const ctx = document.getElementById('lifeCsmWaterfallRiskChart');
    if (!ctx) return;
    
    const data = presentationData.lifeCsmWaterfallRisk.values;
    const labels = presentationData.lifeCsmWaterfallRisk.labels;
    
    let runningTotal = 0;
    const chartData = [];
    const colors = [];
    
    data.forEach((value, index) => {
        // יתרות פתיחה וסגירה
        if (index === 0 || index === 7 || index === 14 || index === 21) {
            chartData.push([0, value]);
            colors.push(index === 0 ? chartColors.purple : chartColors.blue);
            runningTotal = value;
        } else {
            const start = runningTotal;
            const end = runningTotal + value;
            chartData.push([start, end]);
            colors.push(value >= 0 ? chartColors.green : chartColors.red);
            runningTotal = end;
        }
    });
    
    chartInstances.slide6 = chartInstances.slide6 || {};
    chartInstances.slide6.waterfall = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'CSM', data: chartData, backgroundColor: colors, borderColor: colors, borderWidth: 2, borderRadius: 6, borderSkipped: false }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: function(context) {
                            const value = data[context.dataIndex];
                            const isTotal = [0, 7, 14, 21].includes(context.dataIndex);
                            if (isTotal) {
                                return 'יתרה: ₪' + value.toLocaleString('he-IL') + 'K';
                            } else {
                                const sign = value >= 0 ? '+' : '';
                                return 'שינוי: ' + sign + '₪' + value.toLocaleString('he-IL') + 'K';
                            }
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { callback: value => '₪' + (value / 1000).toFixed(1) + 'M', font: { size: 13 } }, 
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawOnChartArea: true, drawTicks: false }
                },
                x: { 
                    ticks: { font: { size: 14 }, maxRotation: 45, minRotation: 45 }, 
                    grid: { display: false, drawOnChartArea: false, drawTicks: false } 
                }
            }
        }
    });
}

function createLifeCsmWaterfallParticipatingChart() {
    const ctx = document.getElementById('lifeCsmWaterfallParticipatingChart');
    if (!ctx) return;
    
    const data = presentationData.lifeCsmWaterfallParticipating.values;
    const labels = presentationData.lifeCsmWaterfallParticipating.labels;
    
    let runningTotal = 0;
    const chartData = [];
    const colors = [];
    
    data.forEach((value, index) => {
        // יתרות פתיחה וסגירה
        if (index === 0 || index === 7 || index === 14 || index === 21) {
            chartData.push([0, value]);
            colors.push(index === 0 ? chartColors.purple : chartColors.blue);
            runningTotal = value;
        } else {
            const start = runningTotal;
            const end = runningTotal + value;
            chartData.push([start, end]);
            colors.push(value >= 0 ? chartColors.green : chartColors.red);
            runningTotal = end;
        }
    });
    
    chartInstances.slide7 = chartInstances.slide7 || {};
    chartInstances.slide7.waterfall = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'CSM', data: chartData, backgroundColor: colors, borderColor: colors, borderWidth: 2, borderRadius: 6, borderSkipped: false }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: function(context) {
                            const value = data[context.dataIndex];
                            const isTotal = [0, 7, 14, 21].includes(context.dataIndex);
                            if (isTotal) {
                                return 'יתרה: ₪' + value.toLocaleString('he-IL') + 'K';
                            } else {
                                const sign = value >= 0 ? '+' : '';
                                return 'שינוי: ' + sign + '₪' + value.toLocaleString('he-IL') + 'K';
                            }
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { callback: value => '₪' + value + 'K', font: { size: 13 } }, 
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawOnChartArea: true, drawTicks: false }
                },
                x: { 
                    ticks: { font: { size: 14 }, maxRotation: 45, minRotation: 45 }, 
                    grid: { display: false, drawOnChartArea: false, drawTicks: false } 
                }
            }
        }
    });
}


function createHealthInsuranceChart() {
    const ctx = document.getElementById('healthInsuranceChart');
    if (!ctx) return;
    
    chartInstances.slide8 = chartInstances.slide8 || {};
    chartInstances.slide8.health = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: presentationData.healthInsurance.labels,
            datasets: [{
                label: 'רווח משירותי ביטוח', data: presentationData.healthInsurance.insurance, backgroundColor: chartColors.blue,
                borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
            }, {
                label: 'רווח מהשקעות', data: presentationData.healthInsurance.investment, backgroundColor: chartColors.orange,
                borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', rtl: true, labels: { font: { size: 17 }, padding: 50, usePointStyle: true } },
                tooltip: { rtl: true, callbacks: { label: function(context) { return context.dataset.label + ': ₪' + context.parsed.y.toFixed(1) + 'K'; } } }
            },
            scales: {
                x: { stacked: true, ticks: { font: { size: 16 } }, grid: { display: false } },
                y: {
                    stacked: true,
                    min: -250,
                    ticks: { callback: value => '₪' + value + 'K', font: { size: 14 } },
                    grid: {
                        color: function(context) {
                            if (context.tick && context.tick.value === 0) return 'rgba(30, 41, 59, 0.4)';
                            return 'rgba(0, 0, 0, 0.05)';
                        },
                        lineWidth: function(context) {
                            if (context.tick && context.tick.value === 0) return 3;
                            return 1;
                        }
                    },
                    border: { display: true, color: 'rgba(30, 41, 59, 0.4)', width: 3 }
                }
            }
        },
        plugins: [{
            id: 'topTotalLabels',
            afterDatasetsDraw(chart) {
                const { ctx, scales: { x, y }, chartArea } = chart;
                ctx.save();
                ctx.font = 'bold 14px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                const yPosition = chartArea.top - 5;
                
                presentationData.healthInsurance.totals.forEach((total, index) => {
                    const xPos = x.getPixelForValue(index);
                    const text = '₪' + total.toFixed(0) + 'K';
                    const textWidth = ctx.measureText(text).width;
                    const padding = 7;
                    
                    ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 20, textWidth + padding * 2, 24, 5);
                    ctx.fill();
                    
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 20, textWidth + padding * 2, 24, 5);
                    ctx.stroke();
                    
                    ctx.fillStyle = total < 0 ? '#dc2626' : '#475569';
                    ctx.fillText(text, xPos, yPosition);
                });
                ctx.restore();
            }
        }]
    });
}

function createHealthBreakdownChart() {
    const ctx = document.getElementById('healthBreakdownChart');
    if (!ctx) return;
    
    chartInstances.slide9 = chartInstances.slide9 || {};
    chartInstances.slide9.breakdown = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: presentationData.healthInsuranceBreakdown.labels,
          datasets: [
    { 
        label: 'פריסת CSM', 
        data: presentationData.healthInsuranceBreakdown.csm, 
        backgroundColor: chartColors.blue, 
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false, 
        borderWidth: 2, 
        borderColor: 'rgba(255, 255, 255, 0.8)' 
    },
    { 
        label: 'שינוי ב-RA', 
        data: presentationData.healthInsuranceBreakdown.ra, 
        backgroundColor: chartColors.green, 
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false, 
        borderWidth: 2, 
        borderColor: 'rgba(255, 255, 255, 0.8)' 
    },
    { 
        label: 'התאמות לעניין - תביעות והוצאות', 
        data: presentationData.healthInsuranceBreakdown.claimsAdj, 
        backgroundColor: chartColors.orange, 
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false, 
        borderWidth: 2, 
        borderColor: 'rgba(255, 255, 255, 0.8)' 
    },
    { 
        label: 'התאמות לעניין - פרמיות', 
        data: presentationData.healthInsuranceBreakdown.premiumAdj, 
        backgroundColor: chartColors.cyan, 
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false, 
        borderWidth: 2, 
        borderColor: 'rgba(255, 255, 255, 0.8)' 
    },
    { 
        label: 'ביטול הפסדים (הפסדים) בלן', 
        data: presentationData.healthInsuranceBreakdown.losses, 
        backgroundColor: chartColors.red, 
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false, 
        borderWidth: 2, 
        borderColor: 'rgba(255, 255, 255, 0.8)' 
    },
    { 
        label: 'רווח מתיקי PAA', 
        data: presentationData.healthInsuranceBreakdown.paa, 
        backgroundColor: chartColors.purple, 
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false, 
        borderWidth: 2, 
        borderColor: 'rgba(255, 255, 255, 0.8)' 
    }
]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', rtl: true, labels: { font: { size: 17 }, padding: 8, usePointStyle: true } },
                tooltip: { rtl: true, callbacks: { label: function(context) { return context.dataset.label + ': ₪' + context.parsed.y.toFixed(1) + 'K'; } } }
            },
            scales: {
                x: { stacked: true, ticks: { font: { size: 16 } }, grid: { display: false } },
                y: { stacked: true, ticks: { callback: value => '₪' + value + 'K', font: { size: 14 } }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
            }
        },
        plugins: [{
            id: 'topTotalLabels',
            afterDatasetsDraw(chart) {
                const { ctx, scales: { x, y }, chartArea } = chart;
                ctx.save();
                ctx.font = 'bold 14px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                const yPosition = chartArea.top - 5;
                
                presentationData.healthInsuranceBreakdown.totals.forEach((total, index) => {
                    const xPos = x.getPixelForValue(index);
                    const text = '₪' + total.toFixed(0) + 'K';
                    const textWidth = ctx.measureText(text).width;
                    const padding = 6;
                    
                    ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 18, textWidth + padding * 2, 22, 4);
                    ctx.fill();
                    
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 18, textWidth + padding * 2, 22, 4);
                    ctx.stroke();
                    
                    ctx.fillStyle = total < 0 ? '#dc2626' : '#475569';
                    ctx.fillText(text, xPos, yPosition);
                });
                ctx.restore();
            }
        }]
    });
}

function createHealthCsmPieCharts() {
    // עוגה 1 - סה"כ ביטוח בריאות (גדולה)
    const ctx1 = document.getElementById('healthCsmTotalPie');
    if (ctx1) {
        chartInstances.slide10 = chartInstances.slide10 || {};
        chartInstances.slide10.total = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: presentationData.healthCsmPies.total.labels,
                datasets: [{
                    data: presentationData.healthCsmPies.total.values,
                    backgroundColor: [chartColors.blue, chartColors.green, chartColors.orange],
                    borderWidth: 4, borderColor: '#ffffff', hoverBorderWidth: 5
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '60%',
                plugins: {
                    legend: { position: 'bottom', rtl: true, labels: { font: { size: 17 }, padding: 20, usePointStyle: true, pointStyle: 'circle' } },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ₪' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'datalabelsOnSegments',
                afterDatasetsDraw(chart) {
                    const { ctx, data } = chart;
                    ctx.save();
                    
                    chart.getDatasetMeta(0).data.forEach((arc, index) => {
                        const value = data.datasets[0].data[index];
                        const midAngle = (arc.startAngle + arc.endAngle) / 2;
                        const radius = (arc.outerRadius + arc.innerRadius) / 2;
                        
                        const x = arc.x + Math.cos(midAngle) * radius;
                        const y = arc.y + Math.sin(midAngle) * radius;
                        
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 14px system-ui';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('₪' + value.toLocaleString(), x, y);
                    });
                    
                    ctx.restore();
                }
            }]
        });
    }
    
    // עוגה 2 - מחלות קשות (קטנה יותר)
    const ctx2 = document.getElementById('healthCsmCriticalPie');
    if (ctx2) {
        chartInstances.slide10 = chartInstances.slide10 || {};
        chartInstances.slide10.critical = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: presentationData.healthCsmPies.criticalIllness.labels,
                datasets: [{
                    data: presentationData.healthCsmPies.criticalIllness.values,
                    backgroundColor: [chartColors.blue, chartColors.green, chartColors.orange],
                    borderWidth: 4, borderColor: '#ffffff', hoverBorderWidth: 5
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '55%',
                plugins: {
                    legend: { position: 'bottom', rtl: true, labels: { font: { size: 15 }, padding: 15, usePointStyle: true, pointStyle: 'circle' } },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ₪' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'datalabelsOnSegments',
                afterDatasetsDraw(chart) {
                    const { ctx, data } = chart;
                    ctx.save();
                    
                    chart.getDatasetMeta(0).data.forEach((arc, index) => {
                        const value = data.datasets[0].data[index];
                        const midAngle = (arc.startAngle + arc.endAngle) / 2;
                        const radius = (arc.outerRadius + arc.innerRadius) / 2;
                        
                        const x = arc.x + Math.cos(midAngle) * radius;
                        const y = arc.y + Math.sin(midAngle) * radius;
                        
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 14px system-ui';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('₪' + value.toLocaleString(), x, y);
                    });
                    
                    ctx.restore();
                }
            }]
        });
    }
}

function createHealthCsmByPortfolioChart() {
    const ctx = document.getElementById('healthCsmByPortfolioChart');
    if (!ctx) return;
    
    chartInstances.slide11 = chartInstances.slide11 || {};
    chartInstances.slide11.portfolio = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: presentationData.healthCsmByPortfolio.labels,
            datasets: [{
                data: presentationData.healthCsmByPortfolio.values,
                backgroundColor: [chartColors.blue, chartColors.green, chartColors.orange, chartColors.purple, chartColors.cyan],
                borderWidth: 4, borderColor: '#ffffff', hoverBorderWidth: 5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '60%',
            plugins: {
                legend: { position: 'right', rtl: true, labels: { font: { size: 17 }, padding: 50, usePointStyle: true, pointStyle: 'circle' } },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ₪' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'datalabelsOnSegments',
            afterDatasetsDraw(chart) {
                const { ctx, data } = chart;
                ctx.save();
                
                chart.getDatasetMeta(0).data.forEach((arc, index) => {
                    const value = data.datasets[0].data[index];
                    const midAngle = (arc.startAngle + arc.endAngle) / 2;
                    const radius = (arc.outerRadius + arc.innerRadius) / 2;
                    
                    const x = arc.x + Math.cos(midAngle) * radius;
                    const y = arc.y + Math.sin(midAngle) * radius;
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 13px system-ui';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Format large numbers
                    const formattedValue = value >= 1000000 ? 
                        '₪' + (value / 1000000).toFixed(1) + 'M' : 
                        '₪' + (value / 1000).toFixed(0) + 'K';
                    
                    ctx.fillText(formattedValue, x, y);
                });
                
                ctx.restore();
            }
        }]
    });
}

function createHealthCsmWaterfallMedicalChart() {
    const ctx = document.getElementById('healthCsmWaterfallMedicalChart');
    if (!ctx) return;
    
    const data = presentationData.healthCsmWaterfallMedical.values;
    const labels = presentationData.healthCsmWaterfallMedical.labels;
    
    let runningTotal = 0;
    const chartData = [];
    const colors = [];
    
    data.forEach((value, index) => {
        if (index === 0 || index === 7 || index === 14 || index === 21) {
            chartData.push([0, value]);
            colors.push(index === 0 ? chartColors.purple : chartColors.blue);
            runningTotal = value;
        } else {
            const start = runningTotal;
            const end = runningTotal + value;
            chartData.push([start, end]);
            colors.push(value >= 0 ? chartColors.green : chartColors.red);
            runningTotal = end;
        }
    });
    
    chartInstances.slide12 = chartInstances.slide12 || {};
    chartInstances.slide12.waterfall = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'CSM', data: chartData, backgroundColor: colors, borderColor: colors, borderWidth: 2, borderRadius: 6, borderSkipped: false }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: function(context) {
                            const value = data[context.dataIndex];
                            const isTotal = [0, 7, 14, 21].includes(context.dataIndex);
                            if (isTotal) {
                                return 'יתרה: ₪' + value.toLocaleString('he-IL') + 'K';
                            } else {
                                const sign = value >= 0 ? '+' : '';
                                return 'שינוי: ' + sign + '₪' + value.toLocaleString('he-IL') + 'K';
                            }
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { callback: value => '₪' + (value / 1000).toFixed(0) + 'M', font: { size: 13 } }, 
                    grid: { color: 'rgba(0, 0, 0, 0.05)' } 
                },
                x: { ticks: { font: { size: 14 }, maxRotation: 45, minRotation: 45 }, grid: { display: false } }
            }
        }
    });
}

function createHealthCsmWaterfallCriticalChart() {
    const ctx = document.getElementById('healthCsmWaterfallCriticalChart');
    if (!ctx) return;
    
    const data = presentationData.healthCsmWaterfallCritical.values;
    const labels = presentationData.healthCsmWaterfallCritical.labels;
    
    let runningTotal = 0;
    const chartData = [];
    const colors = [];
    
    data.forEach((value, index) => {
        if (index === 0 || index === 7 || index === 14 || index === 21) {
            chartData.push([0, value]);
            colors.push(index === 0 ? chartColors.purple : chartColors.blue);
            runningTotal = value;
        } else {
            const start = runningTotal;
            const end = runningTotal + value;
            chartData.push([start, end]);
            colors.push(value >= 0 ? chartColors.green : chartColors.red);
            runningTotal = end;
        }
    });
    
    chartInstances.slide13 = chartInstances.slide13 || {};
    chartInstances.slide13.waterfall = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'CSM', data: chartData, backgroundColor: colors, borderColor: colors, borderWidth: 2, borderRadius: 6, borderSkipped: false }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: function(context) {
                            const value = data[context.dataIndex];
                            const isTotal = [0, 7, 14, 21].includes(context.dataIndex);
                            if (isTotal) {
                                return 'יתרה: ₪' + value.toLocaleString('he-IL') + 'K';
                            } else {
                                const sign = value >= 0 ? '+' : '';
                                return 'שינוי: ' + sign + '₪' + value.toLocaleString('he-IL') + 'K';
                            }
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { callback: value => '₪' + (value / 1000).toFixed(1) + 'M', font: { size: 13 } }, 
                    grid: { color: 'rgba(0, 0, 0, 0.05)' } 
                },
                x: { ticks: { font: { size: 14 }, maxRotation: 45, minRotation: 45 }, grid: { display: false } }
            }
        }
    });
}

function createGrowthRatiosChart() {
    const ctx = document.getElementById('growthRatiosChart');
    if (!ctx) return;
    
    chartInstances.slide14 = chartInstances.slide14 || {};
    chartInstances.slide14.growth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: presentationData.growthRatios.labels,
            datasets: [{
                label: 'ריסק מוות',
                data: presentationData.growthRatios.riskDeath,
                borderColor: chartColors.red,
                backgroundColor: chartColors.red,
                tension: 0.3,
                borderWidth: 4,
                fill: false,
                pointRadius: 7,
                pointHoverRadius: 9,
                pointBackgroundColor: chartColors.red,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3
            }, {
                label: 'מחלות קשות',
                data: presentationData.growthRatios.diseasesSevere,
                borderColor: chartColors.blue,
                backgroundColor: chartColors.blue,
                tension: 0.3,
                borderWidth: 4,
                fill: false,
                pointRadius: 7,
                pointHoverRadius: 9,
                pointBackgroundColor: chartColors.blue,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3
            }, {
                label: 'הוצאות רפואיות',
                data: presentationData.growthRatios.medicalExpenses,
                borderColor: chartColors.green,
                backgroundColor: chartColors.green,
                tension: 0.3,
                borderWidth: 4,
                fill: false,
                pointRadius: 7,
                pointHoverRadius: 9,
                pointBackgroundColor: chartColors.green,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', rtl: true, labels: { font: { size: 17 }, padding: 20, usePointStyle: true, pointStyle: 'circle' } },
                tooltip: { 
                    rtl: true, 
                    bodyFont: { size: 15 }, 
                    padding: 12, 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    callbacks: { label: function(context) { return context.dataset.label + ': ' + context.parsed.y + '%'; } }
                }
            },
            scales: {
                y: { 
                    beginAtZero: false,
                    min: 60,
                    max: 150,
                    ticks: { 
                        font: { size: 14 }, 
                        callback: function(value) { return value + '%'; },
                        padding: 5
                    }, 
                    grid: { color: 'rgba(0, 0, 0, 0.06)' },
                    border: { display: false }
                },
                x: {
                    ticks: { font: { size: 16 }, padding: 10 },
                    grid: { display: true, color: 'rgba(0, 0, 0, 0.05)' }
                }
            }
        }
    });
}

function createGeneralInsuranceChart() {
    const ctx = document.getElementById('generalInsuranceChart');
    if (!ctx) return;
    
    chartInstances.slide15 = chartInstances.slide15 || {};
    chartInstances.slide15.general = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: presentationData.generalInsurance.labels,
            datasets: [{
                label: 'רווח משירותי ביטוח', data: presentationData.generalInsurance.insurance, backgroundColor: chartColors.green,
                borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
            }, {
                label: 'רווח מהשקעות ומימון', data: presentationData.generalInsurance.investment, backgroundColor: chartColors.cyan,
                borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 }, borderSkipped: false, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', rtl: true, labels: { font: { size: 17 }, padding: 50, usePointStyle: true } },
                tooltip: { rtl: true, callbacks: { label: function(context) { return context.dataset.label + ': ₪' + context.parsed.y.toFixed(1) + 'K'; } } }
            },
            scales: {
                x: { stacked: true, ticks: { font: { size: 16 } }, grid: { display: false } },
                y: { 
                    stacked: true, 
                    min: -1000,
                    ticks: { callback: value => '₪' + value + 'K', font: { size: 14 } }, 
                    grid: {
                        color: function(context) {
                            if (context.tick && context.tick.value === 0) return 'rgba(30, 41, 59, 0.4)';
                            return 'rgba(0, 0, 0, 0.05)';
                        },
                        lineWidth: function(context) {
                            if (context.tick && context.tick.value === 0) return 3;
                            return 1;
                        }
                    },
                    border: { display: true, color: 'rgba(30, 41, 59, 0.4)', width: 3 }
                }
            }
        },
        plugins: [{
            id: 'topTotalLabels',
            afterDatasetsDraw(chart) {
                const { ctx, scales: { x, y }, chartArea } = chart;
                ctx.save();
                ctx.font = 'bold 14px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                const yPosition = chartArea.top - 5;
                
                presentationData.generalInsurance.totals.forEach((total, index) => {
                    const xPos = x.getPixelForValue(index);
                    const text = '₪' + total.toFixed(0) + 'K';
                    const textWidth = ctx.measureText(text).width;
                    const padding = 7;
                    
                    ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 20, textWidth + padding * 2, 24, 5);
                    ctx.fill();
                    
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 20, textWidth + padding * 2, 24, 5);
                    ctx.stroke();
                    
                    ctx.fillStyle = total < 0 ? '#dc2626' : '#475569';
                    ctx.fillText(text, xPos, yPosition);
                });
                ctx.restore();
            }
        }]
    });
}

function createGeneralBreakdownChart() {
    const ctx = document.getElementById('generalBreakdownChart');
    if (!ctx) return;
    
    chartInstances.slide16 = chartInstances.slide16 || {};
    chartInstances.slide16.breakdown = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: presentationData.generalInsuranceBreakdown.labels,
            datasets: [
    { 
        label: 'הכנסות', 
        data: presentationData.generalInsuranceBreakdown.income, 
        backgroundColor: chartColors.green, 
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false, 
        borderWidth: 2, 
        borderColor: 'rgba(255, 255, 255, 0.8)' 
    },
    { 
        label: 'תביעות והוצאות שחרורן', 
        data: presentationData.generalInsuranceBreakdown.claimsExpenses, 
        backgroundColor: chartColors.red, 
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false, 
        borderWidth: 2, 
        borderColor: 'rgba(255, 255, 255, 0.8)' 
    },
    { 
        label: 'הפחתת הוצאות (הפסדים) בלן רכישה חזים מכבידים', 
        data: presentationData.generalInsuranceBreakdown.acReduction, 
        backgroundColor: chartColors.orange, 
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false, 
        borderWidth: 2, 
        borderColor: 'rgba(255, 255, 255, 0.8)' 
    },
    { 
        label: 'ביטול הפסדים (הפסדים) בלן', 
        data: presentationData.generalInsuranceBreakdown.losses, 
        backgroundColor: chartColors.purple, 
        borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false, 
        borderWidth: 2, 
        borderColor: 'rgba(255, 255, 255, 0.8)' 
    }
]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', rtl: true, labels: { font: { size: 17 }, padding: 12, usePointStyle: true } },
                tooltip: { rtl: true, callbacks: { label: function(context) { return context.dataset.label + ': ₪' + context.parsed.y.toFixed(1) + 'K'; } } }
            },
            scales: {
                x: { stacked: true, ticks: { font: { size: 16 } }, grid: { display: false } },
                y: { stacked: true, ticks: { callback: value => '₪' + value + 'K', font: { size: 14 } }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
            }
        },
        plugins: [{
            id: 'topTotalLabels',
            afterDatasetsDraw(chart) {
                const { ctx, scales: { x, y }, chartArea } = chart;
                ctx.save();
                ctx.font = 'bold 14px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                const yPosition = chartArea.top - 5;
                
                presentationData.generalInsuranceBreakdown.totals.forEach((total, index) => {
                    const xPos = x.getPixelForValue(index);
                    const text = '₪' + total.toFixed(0) + 'K';
                    const textWidth = ctx.measureText(text).width;
                    const padding = 7;
                    
                    ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 20, textWidth + padding * 2, 24, 5);
                    ctx.fill();
                    
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(xPos - textWidth / 2 - padding, yPosition - 20, textWidth + padding * 2, 24, 5);
                    ctx.stroke();
                    
                    ctx.fillStyle = total < 0 ? '#dc2626' : '#475569';
                    ctx.fillText(text, xPos, yPosition);
                });
                ctx.restore();
            }
        }]
    });
}