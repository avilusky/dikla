let currentSlide = 2;
const totalSlides = 8;

const chartColors = {
    green: '#22c55e',
    blue: '#3b82f6',
    orange: '#f97316',
    red: '#ef4444',
    purple: '#8b5cf6',
    cyan: '#06b6d4'
};

let chartInstances = {};

document.addEventListener('DOMContentLoaded', function() {
    updateSlideIndicator();
    updateNavButtons();
    
    const logo = document.querySelector('.slide-logo');
    if (logo) {
        logo.style.opacity = '0';
    }
    
    setTimeout(() => {
        initChartsForSlide(2);
    }, 300);
    
// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        changeSlide(e.key === 'ArrowLeft' ? 1 : -1);
    }
});

// Mouse click navigation - לחיצה בכל מקום עוברת קדימה
document.addEventListener('click', function(e) {
    // בדיקה שלא לחצנו על כפתורי הניווט עצמם
    if (!e.target.closest('.nav-button')) {
        changeSlide(1); // קדימה
    }
});

// Scroll/Wheel navigation - גלילה כמו PowerPoint
let isScrolling = false;
document.addEventListener('wheel', function(e) {
    if (isScrolling) return;
    
    isScrolling = true;
    
    if (e.deltaY > 0) {
        // גלילה למטה - שקף הבא
        changeSlide(1);
    } else {
        // גלילה למעלה - שקף קודם
        changeSlide(-1);
    }
    
    // מניעת גלילה מהירה מדי
    setTimeout(() => {
        isScrolling = false;
    }, 800);
});
});

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const nextIndex = currentSlide + direction;
    
    if (nextIndex < 1 || nextIndex > totalSlides) return;
    
    slides[currentSlide - 1].classList.remove('active');
    slides[nextIndex - 1].classList.add('active');
    
    currentSlide = nextIndex;
    updateSlideIndicator();
    updateNavButtons();
    
    const logo = document.querySelector('.slide-logo');
    if (logo) {
        logo.style.opacity = currentSlide === 1 ? '0' : '0.7';
    }
    
    setTimeout(() => {
        initChartsForSlide(currentSlide);
    }, 100);
}

function updateSlideIndicator() {
    const indicator = document.getElementById('slideIndicator');
    if (indicator) {
        indicator.textContent = 'שקף ' + currentSlide + ' מתוך ' + totalSlides;
    }
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    
    if (prevBtn) prevBtn.disabled = currentSlide === 1;
    if (nextBtn) nextBtn.disabled = currentSlide === totalSlides;
}

function initChartsForSlide(slideNumber) {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js לא נטען!');
        return;
    }
    
    destroyChartsForSlide(slideNumber);
    
    Chart.defaults.font.family = 'system-ui';
    Chart.defaults.font.size = 15;
    Chart.defaults.color = '#64748b';
    Chart.defaults.animation.duration = 1500;
    Chart.defaults.animation.easing = 'easeOutQuart';
    
    switch(slideNumber) {
        case 2:
            createSectorsChart();
            break;
        case 3:
            createLifeCharts();
            break;
        case 4:
            createHealthCharts();
            break;
        case 5:
            createGeneralCharts();
            break;
        case 6:
            createStockIndicesChart();
            break;
        case 7:
            createCSMChart();
            break;
    }
}

function destroyChartsForSlide(slideNumber) {
    const slideKey = 'slide' + slideNumber;
    if (chartInstances[slideKey]) {
        Object.values(chartInstances[slideKey]).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        chartInstances[slideKey] = {};
    } else {
        chartInstances[slideKey] = {};
    }
}

function createSectorsChart() {
    const ctx = document.getElementById('sectorsChart');
    if (!ctx) return;
    
    console.log('Creating sectors chart...');
    
    chartInstances.slide2.sectors = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: presentationData.sectors.labels,
            datasets: [{
                label: 'חיים',
                data: presentationData.sectors.life,
                backgroundColor: chartColors.green,
                borderRadius: 8,
                borderSkipped: false
            }, {
                label: 'חיסכון ארוך טווח',
                data: presentationData.sectors.longterm,
                backgroundColor: chartColors.blue,
                borderRadius: 8,
                borderSkipped: false
            }, {
                label: 'ביטוח בריאות',
                data: presentationData.sectors.health,
                backgroundColor: chartColors.orange,
                borderRadius: 8,
                borderSkipped: false
            }, {
                label: 'ביטוח כללי',
                data: presentationData.sectors.general,
                backgroundColor: chartColors.red,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true,
                    labels: { 
                        font: { size: 16 },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    rtl: true,
                    bodyFont: { size: 15 },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₪' + context.parsed.y.toFixed(1) + 'M';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        callback: value => '₪' + value + 'M',
                        font: { size: 14 }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    ticks: {
                        font: { size: 15 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
    
    // גרף סה"כ שוק
    createTotalMarketChart();
}

function createTotalMarketChart() {
    const ctx = document.getElementById('totalMarketChart');
    if (!ctx) return;
    
    console.log('Creating total market chart...');
    
    // חישוב סה"כ
    const totals = presentationData.sectors.labels.map((label, index) => {
        return presentationData.sectors.life[index] + 
               presentationData.sectors.longterm[index] + 
               presentationData.sectors.health[index] + 
               presentationData.sectors.general[index];
    });
    
    // צבעים תכלת עדינים עם וריאציה קלה
    const glassColors = [
        'rgba(186, 230, 253, 0.35)',  // תכלת בהיר
        'rgba(165, 216, 245, 0.38)',  // תכלת קצת יותר כהה
        'rgba(147, 197, 237, 0.35)',  // תכלת בינוני
        'rgba(125, 211, 252, 0.38)'   // תכלת עוד קצת שונה
    ];
    
    const borderColors = [
        'rgba(125, 211, 252, 0.5)',
        'rgba(103, 194, 245, 0.55)',
        'rgba(91, 180, 230, 0.5)',
        'rgba(56, 189, 248, 0.55)'
    ];
    
    chartInstances.slide2.total = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: presentationData.sectors.labels,
            datasets: [{
                label: 'סה"כ שוק',
                data: totals,
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    
                    if (!chartArea) {
                        return glassColors[context.dataIndex % glassColors.length];
                    }
                    
                    // יצירת גרדיאנט אנכי
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    const baseColor = glassColors[context.dataIndex % glassColors.length];
                    
                    gradient.addColorStop(0, baseColor.replace('0.35', '0.2').replace('0.38', '0.22'));
                    gradient.addColorStop(0.5, baseColor);
                    gradient.addColorStop(1, baseColor.replace('0.35', '0.45').replace('0.38', '0.48'));
                    
                    return gradient;
                },
                borderColor: function(context) {
                    return borderColors[context.dataIndex % borderColors.length];
                },
                borderWidth: 1.5,
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.4,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    rtl: true,
                    bodyFont: { size: 14, weight: '600' },
                    backgroundColor: 'rgba(240, 249, 255, 0.98)',
                    titleColor: '#0c4a6e',
                    bodyColor: '#0369a1',
                    borderColor: 'rgba(125, 211, 252, 0.4)',
                    borderWidth: 1.5,
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        title: function() {
                            return '';
                        },
                        label: function(context) {
                            return 'סה"כ: ₪' + context.parsed.y.toFixed(1) + 'M';
                        }
                    }
                }
            },
scales: {
    y: {
        beginAtZero: true,
        ticks: { 
            callback: value => '₪' + value,
            font: { size: 14, weight: '400' },
            color: '#0891b2',
            padding: 8,
            stepSize: 2000  // ← הוסף את השורה הזו
        },
                    grid: { 
                        color: 'rgba(165, 216, 245, 0.12)',
                        lineWidth: 1
                    },
                    border: {
                        display: false,
                        dash: [3, 3]
                    }
                },
                x: {
                    ticks: {
                        font: { size: 14, weight: '400' },
                        color: '#0e7490',
                        padding: 6
                    },
                    grid: { display: false },
                    border: {
                        display: false
                    }
                }
            }
        },
        plugins: [{
            id: 'glassEffect',
            beforeDatasetsDraw(chart) {
                const { ctx } = chart;
                ctx.save();
                ctx.shadowColor = 'rgba(125, 211, 252, 0.3)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 2;
            },
            afterDatasetsDraw(chart) {
                chart.ctx.restore();
            }
        }]
    });
}

function createLifeCharts() {
    const ctx1 = document.getElementById('lifeInsuranceChart');
    if (ctx1) {
        chartInstances.slide3.insurance = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: presentationData.life.labels,
                datasets: [{
                    data: presentationData.life.insurance_profit,
                    backgroundColor: [chartColors.green, chartColors.blue, chartColors.orange, chartColors.cyan, chartColors.purple],
                    borderRadius: 7,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                plugins: { 
                    legend: { display: false },
                    tooltip: { 
                        rtl: true,
                        bodyFont: { size: 15 }
                    }
                },
                scales: { 
                    x: { 
                        beginAtZero: true,
                        ticks: {
                            font: { size: 14 }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    y: {
                        ticks: {
                            font: { size: 14 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    const ctx2 = document.getElementById('lifeInvestmentChart');
    if (ctx2) {
        chartInstances.slide3.investment = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: presentationData.life.labels,
                datasets: [{
                    data: presentationData.life.investment_profit,
                    backgroundColor: presentationData.life.investment_profit.map(v => v >= 0 ? chartColors.green : chartColors.red),
                    borderRadius: 7,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                plugins: { 
                    legend: { display: false },
                    tooltip: { 
                        rtl: true,
                        bodyFont: { size: 15 }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: { size: 14 }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    y: {
                        ticks: {
                            font: { size: 14 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

function createHealthCharts() {
    const ctx1 = document.getElementById('healthInsuranceChart');
    if (ctx1) {
        chartInstances.slide4.insurance = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: presentationData.health.labels,
                datasets: [{
                    data: presentationData.health.insurance_profit,
                    backgroundColor: chartColors.orange,
                    borderRadius: 7,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                plugins: { 
                    legend: { display: false },
                    tooltip: { 
                        rtl: true,
                        bodyFont: { size: 15 }
                    }
                },
                scales: { 
                    x: { 
                        beginAtZero: true,
                        ticks: {
                            font: { size: 14 }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    y: {
                        ticks: {
                            font: { size: 14 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    const ctx2 = document.getElementById('healthInvestmentChart');
    if (ctx2) {
        chartInstances.slide4.investment = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: presentationData.health.labels,
                datasets: [{
                    data: presentationData.health.investment_profit,
                    backgroundColor: presentationData.health.investment_profit.map(v => v >= 0 ? chartColors.green : chartColors.red),
                    borderRadius: 7,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                plugins: { 
                    legend: { display: false },
                    tooltip: { 
                        rtl: true,
                        bodyFont: { size: 15 }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: { size: 14 }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    y: {
                        ticks: {
                            font: { size: 14 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

function createGeneralCharts() {
    const ctx1 = document.getElementById('generalInsuranceChart');
    if (ctx1) {
        chartInstances.slide5.insurance = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: presentationData.general.labels,
                datasets: [{
                    data: presentationData.general.insurance_profit,
                    backgroundColor: [chartColors.green, chartColors.blue, chartColors.orange, chartColors.red, chartColors.purple, chartColors.cyan],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                plugins: { 
                    legend: { display: false },
                    tooltip: { 
                        rtl: true,
                        bodyFont: { size: 15 }
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            font: { size: 14 }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        ticks: {
                            font: { size: 15 }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    const ctx2 = document.getElementById('generalTotalChart');
    if (ctx2) {
        chartInstances.slide5.total = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: presentationData.general.labels,
                datasets: [{
                    data: presentationData.general.total_profit,
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.75)',
                        'rgba(59, 130, 246, 0.75)',
                        'rgba(249, 115, 22, 0.75)',
                        'rgba(239, 68, 68, 0.75)',
                        'rgba(139, 92, 246, 0.75)',
                        'rgba(6, 182, 212, 0.75)'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverBorderWidth: 3,
                    spacing: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'right',
                        rtl: true,
                        labels: {
                            padding: 12,
                            font: { size: 13, weight: '500' },
                            boxWidth: 12,
                            boxHeight: 12,
                            borderRadius: 3,
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            generateLabels: function(chart) {
                                const data = chart.data;
                                const total = data.datasets[0].data.reduce((a,b) => a+b, 0);
                                return data.labels.map((label, i) => ({
                                    text: label + '  ' + Math.round(data.datasets[0].data[i]/total*100) + '%',
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                }));
                            }
                        }
                    },
                    tooltip: { 
                        rtl: true,
                        bodyFont: { size: 15 },
                        padding: 10,
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        borderColor: 'rgba(148, 163, 184, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 6,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ₪' + context.parsed.toFixed(1) + 'K (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
}

function createStockIndicesChart() {
    const ctx = document.getElementById('stockIndicesChart');
    if (!ctx) return;
    
    let animationProgress = 0;
    let animationCompleted = false;
    
    chartInstances.slide6.stocks = new Chart(ctx, {
        type: 'line',
        data: {
            labels: presentationData.stockIndices.labels,
            datasets: [{
                label: 'TA-35',
                data: presentationData.stockIndices.ta35,
                borderColor: '#3b82f6',
                backgroundColor: '#3b82f6',
                tension: 0.3,
                borderWidth: 4,
                fill: false,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2.5,
                pointHoverBackgroundColor: '#3b82f6',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }, {
                label: 'TA-Banks5',
                data: presentationData.stockIndices.banks,
                borderColor: '#22c55e',
                backgroundColor: '#22c55e',
                tension: 0.3,
                borderWidth: 4,
                fill: false,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#22c55e',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2.5,
                pointHoverBackgroundColor: '#22c55e',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }, {
                label: 'TA-Insurance',
                data: presentationData.stockIndices.insurance,
                borderColor: '#f97316',
                backgroundColor: '#f97316',
                tension: 0.3,
                borderWidth: 5.5,
                fill: false,
                pointRadius: 8,
                pointHoverRadius: 10,
                pointBackgroundColor: '#f97316',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointHoverBackgroundColor: '#f97316',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            animation: {
                duration: 2500,
                easing: 'easeInOutQuart',
                onProgress: function(animation) {
                    if (!animationCompleted) {
                        animationProgress = animation.currentStep / animation.numSteps;
                    }
                },
                onComplete: function() {
                    animationCompleted = true;
                    animationProgress = 1;
                }
            },
            plugins: {
                legend: { 
                    position: 'bottom', 
                    rtl: true,
                    labels: { 
                        font: { size: 16 },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: { 
                    rtl: true,
                    bodyFont: { size: 15 },
                    padding: 12,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: false,
                    ticks: {
                        font: { size: 14 },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: { 
                        color: 'rgba(0, 0, 0, 0.06)',
                        lineWidth: 1
                    },
                    border: {
                        display: false
                    }
                },
                x: {
                    ticks: {
                        font: { size: 15 }
                    },
                    grid: { 
                        display: false
                    },
                    border: {
                        display: false
                    }
                }
            }
        },
        plugins: [{
            id: 'revealAnimation',
            beforeDatasetsDraw(chart) {
                const { ctx, chartArea: { left, top, width, height } } = chart;
                
                if (!animationCompleted && animationProgress < 1) {
                    ctx.save();
                    const clipWidth = left + (width * animationProgress);
                    ctx.beginPath();
                    ctx.rect(left, top, clipWidth - left, height);
                    ctx.clip();
                }
            },
            afterDatasetsDraw(chart) {
                if (!animationCompleted && animationProgress < 1) {
                    chart.ctx.restore();
                }
            }
        }]
    });
}

function createCSMChart() {
    const ctx = document.getElementById('csmChart');
    if (!ctx) return;
    
    chartInstances.slide7.csm = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: presentationData.csm.labels,
            datasets: [{
                label: 'Q4 2024',
                data: presentationData.csm.q4_2024,
                backgroundColor: chartColors.green,
                borderRadius: 7,
                borderSkipped: false
            }, {
                label: 'Q1 2025',
                data: presentationData.csm.q1_2025,
                backgroundColor: chartColors.blue,
                borderRadius: 7,
                borderSkipped: false
            }, {
                label: 'Q2 2025',
                data: presentationData.csm.q2_2025,
                backgroundColor: chartColors.orange,
                borderRadius: 7,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { 
                    position: 'bottom', 
                    rtl: true,
                    labels: { 
                        font: { size: 16 },
                        padding: 15
                    }
                },
                tooltip: { 
                    rtl: true,
                    bodyFont: { size: 15 }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        font: { size: 14 }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    ticks: {
                        font: { size: 15 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}