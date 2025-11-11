let currentSlide = 0;
const totalSlides = 6;

document.addEventListener('DOMContentLoaded', function() {
    updateSlideIndicator();
    updateNavButtons();
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            changeSlide(1);
        } else if (e.key === 'ArrowRight') {
            changeSlide(-1);
        }
    });

    // Mouse click navigation
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-button')) {
            changeSlide(1);
        }
    });

    // Scroll/Wheel navigation
    let isScrolling = false;
    document.addEventListener('wheel', function(e) {
        if (isScrolling) return;
        
        isScrolling = true;
        
        if (e.deltaY > 0) {
            changeSlide(1);
        } else {
            changeSlide(-1);
        }
        
        setTimeout(() => {
            isScrolling = false;
        }, 800);
    });
});

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const nextIndex = currentSlide + direction;
    
    // אם מנסים ללכת קדימה מהשקף האחרון - עבור ל-finance.html
    if (nextIndex > totalSlides - 1) {
        window.location.href = 'finance.html';
        return;
    }
    
    if (nextIndex < 0) return;
    
    slides[currentSlide].classList.remove('active');
    slides[nextIndex].classList.add('active');
    
    currentSlide = nextIndex;
    updateSlideIndicator();
    updateNavButtons();
}

function updateSlideIndicator() {
    const indicator = document.getElementById('slideIndicator');
    if (indicator) {
        indicator.textContent = 'שקף ' + (currentSlide + 1) + ' מתוך ' + totalSlides;
    }
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
}