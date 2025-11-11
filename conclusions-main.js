

// Mouse click navigation
document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-button')) {
        goNext();
    }
});

// Scroll/Wheel navigation
let isScrolling = false;
document.addEventListener('wheel', function(e) {
    if (isScrolling) return;
    
    isScrolling = true;
    
    if (e.deltaY > 0) {
        goNext();
    } else {
        goBack();
    }
    
    setTimeout(() => {
        isScrolling = false;
    }, 800);
});