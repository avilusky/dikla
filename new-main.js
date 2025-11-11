let currentSlide = 1;
const totalSlides = 4;

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
    
    // אם מנסים ללכת קדימה מהשקף האחרון - עבור ל-index.html
    if (nextIndex > totalSlides) {
        window.location.href = 'finance.html';
        return;
    }
    
    if (nextIndex < 1) return;
    
    slides[currentSlide - 1].classList.remove('active');
    slides[nextIndex - 1].classList.add('active');
    
    currentSlide = nextIndex;
    updateSlideIndicator();
    updateNavButtons();
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