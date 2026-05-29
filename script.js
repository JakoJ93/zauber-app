// Timings configuration
const CONFIG = {
    lockscreenTransitionMs: 300,
    glitchDurationMs: 300,
    doubleTapThresholdMs: 400
};

// DOM Elements
const triggerState2 = document.getElementById('trigger-state2');
const state1 = document.getElementById('state1-google');
const state2 = document.getElementById('state2-lockscreen');
const state3 = document.getElementById('state3-production');
const foldedCardContainer = document.getElementById('folded-card-container');

// State tracking
let currentState = 1;
let lastTapTime = 0;

// --- FULLSCREEN TRIGGER ---
let fullscreenRequested = false;
document.addEventListener('touchstart', (e) => {
    if (!fullscreenRequested) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => console.log("Fullscreen API error:", err));
        } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
            document.documentElement.webkitRequestFullscreen().catch(err => console.log("Fullscreen API error:", err));
        }
        fullscreenRequested = true;
    }
}, { passive: true });

// --- STATE 1 to STATE 2: Double Tap ---
triggerState2.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent zoom/scroll
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength > 0 && tapLength < CONFIG.doubleTapThresholdMs) {
        // Double tap detected
        transitionToState2();
    }
    lastTapTime = currentTime;
});

function transitionToState2() {
    if (currentState !== 1) return;
    currentState = 2;

    // Show black screen
    state2.classList.remove('hidden');
    state2.classList.add('active');
    
    // Hide state 1 after transition
    setTimeout(() => {
        state1.classList.remove('active');
        state1.classList.add('hidden');
    }, CONFIG.lockscreenTransitionMs);
}

// --- STATE 2 to STATE 3: Single Tap ---
state2.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (currentState === 2) {
        transitionToState3();
    }
});

function transitionToState3() {
    currentState = 3;
    
    // Hide pure black screen, activate state 3
    state2.classList.remove('active');
    state2.classList.add('hidden');
    
    state3.classList.remove('hidden');
    state3.classList.add('active');
    
    // Trigger Glitch Animation
    state3.classList.add('glitch-active');
    
    setTimeout(() => {
        state3.classList.remove('glitch-active');
        // Show folded card
        state3.classList.add('show-card');
    }, CONFIG.glitchDurationMs);
}

// --- STATE 3 to CLEANUP: Drag & Drop ---
let isDragging = false;
let startX, startY, initialTranslateX, initialTranslateY;
const card = document.getElementById('folded-card');

card.addEventListener('touchstart', (e) => {
    if (currentState !== 3 || !state3.classList.contains('show-card')) return;
    
    isDragging = true;
    card.classList.add('dragging');
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    
    // Parse current transform or default to 0
    const transformStr = card.style.transform;
    initialTranslateX = 0;
    initialTranslateY = 0;
    
    if (transformStr && transformStr.includes('translate')) {
        const match = transformStr.match(/translate\(([^px]+)px,\s*([^px]+)px\)/);
        if (match) {
            initialTranslateX = parseFloat(match[1]);
            initialTranslateY = parseFloat(match[2]);
        }
    }
});

card.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling while dragging
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX;
    const diffY = currentY - startY;
    
    // Add a slight scale effect while dragging for tactile feedback
    card.style.transform = `translate(${initialTranslateX + diffX}px, ${initialTranslateY + diffY}px) rotate(-5deg) scale(1.05)`;
});

card.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('dragging');
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const threshold = 10; // pixels from edge to consider "pulled out"
    
    if (endX < threshold || endX > screenWidth - threshold || endY < threshold || endY > screenHeight - threshold) {
        // Pulled out of the phone
        card.style.opacity = '0';
        setTimeout(cleanupAndRedirect, 300);
    } else {
        // Snap back to center
        card.style.transform = `translate(0px, 0px) rotate(-5deg) scale(1)`;
    }
});

function cleanupAndRedirect() {
    // Redirect to real Google Image Search
    window.location.replace("https://www.google.com/search?q=Spielkarte&tbm=isch");
}

// Register Service Worker for PWA / offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
