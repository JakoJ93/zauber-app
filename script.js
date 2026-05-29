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

// --- STATE 3 to CLEANUP: Swipe ---
let touchStartY = 0;
let touchStartX = 0;

state3.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
});

state3.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling
});

state3.addEventListener('touchend', (e) => {
    if (currentState !== 3) return;
    if (!state3.classList.contains('show-card')) return; // Ensure card is visible first

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    
    const diffY = touchStartY - touchEndY;
    const diffX = touchStartX - touchEndX;
    
    // Simple swipe detection (threshold 30px)
    if (Math.abs(diffY) > 30 || Math.abs(diffX) > 30) {
        cleanupAndRedirect();
    }
});

function cleanupAndRedirect() {
    // Redirect to real Google Image Search
    window.location.replace("https://www.google.com/search?q=Herz+8&tbm=isch");
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
