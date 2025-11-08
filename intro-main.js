let currentSlide = 1;
const totalSlides = 6;

document.addEventListener('DOMContentLoaded', function() {
    // Check if we need to navigate to a specific slide from URL
    const hash = window.location.hash;
    
    if (hash) {
        const slideNumber = parseInt(hash.replace('#slide', ''));
        if (slideNumber && slideNumber >= 1 && slideNumber <= totalSlides) {
            currentSlide = slideNumber;
            // Update which slide is active
            const slides = document.querySelectorAll('.slide');
            slides.forEach(slide => slide.classList.remove('active'));
            slides[currentSlide - 1].classList.add('active');
        }
    }
    
    updateSlideIndicator();
    updateNavButtons();
    updateLogoVisibility();
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            changeSlide(e.key === 'ArrowLeft' ? 1 : -1);
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
    
    if (nextIndex < 1 || nextIndex > totalSlides) return;
    
    slides[currentSlide - 1].classList.remove('active');
    slides[nextIndex - 1].classList.add('active');
    
    currentSlide = nextIndex;
    updateSlideIndicator();
    updateNavButtons();
    updateLogoVisibility();
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

function updateLogoVisibility() {
    const logo = document.querySelector('.slide-logo');
    if (logo) {
        logo.style.opacity = currentSlide === 1 ? '0' : '0.8';
    }
}