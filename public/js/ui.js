/**
 * UI Module
 * Handles content updates, tutorials, and visual feedback
 */

import { 
  animationDuration,
  faceContents,
  isMobile
} from './config.js';

// UI elements
let header, description, cta;
let directionalIndicators, arrowIndicators;
let swipeHintOverlay, swipeHintButton, inactivityHint;
let swipeTrail, swipeHintCube, swipeHintArrow;

// Tutorial state
let tutorialShown = false;
let tutorialStep = 0;
const tutorialDirections = ['up', 'right', 'down', 'left'];
let tutorialInterval;

// Inactivity timer
let inactivityTimer;

/**
 * Initialize UI elements
 * @returns {Object} Object containing UI elements and functions
 */
function initUI() {
  // Get UI elements
  header = document.getElementById('header');
  description = document.getElementById('description');
  cta = document.getElementById('cta');
  directionalIndicators = document.querySelector('.directional-indicators');
  arrowIndicators = document.querySelectorAll('.arrow-indicator');
  swipeHintOverlay = document.querySelector('.swipe-hint-overlay');
  swipeHintButton = document.querySelector('.swipe-hint-button');
  inactivityHint = document.querySelector('.inactivity-hint');
  swipeTrail = document.querySelector('.swipe-trail');
  swipeHintCube = document.querySelector('.swipe-hint-cube');
  swipeHintArrow = document.querySelector('.swipe-hint-arrow');
  
  // Set up tutorial button
  swipeHintButton.addEventListener('click', () => {
    closeTutorial();
  });
  
  // Also add touchend event for mobile
  swipeHintButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    closeTutorial();
  });
  
  return {
    updateContent,
    highlightArrowIndicator,
    showTutorial,
    closeTutorial,
    setupInactivityTimer,
    resetInactivityTimer,
    createTrailParticle,
    swipeTrail
  };
}

/**
 * Update content based on face index
 * @param {number} index - Face index
 */
function updateContent(index) {
  // Remove active classes with staggered timing
  header.classList.remove('active');
  setTimeout(() => description.classList.remove('active'), 50);
  setTimeout(() => cta.classList.remove('active'), 100);

  // Update content after fade out
  setTimeout(() => {
    header.textContent = faceContents[index].header;
    description.textContent = faceContents[index].description;
    cta.href = faceContents[index].cta;
    cta.textContent = "Learn More";

    // Add active classes with staggered timing
    header.classList.add('active');
    setTimeout(() => description.classList.add('active'), 50);
    setTimeout(() => cta.classList.add('active'), 100);
  }, animationDuration); // Adaptive timing based on device capabilities
}

/**
 * Highlight arrow indicator based on swipe direction
 * @param {string} direction - Direction ('up', 'down', 'left', 'right')
 */
function highlightArrowIndicator(direction) {
  // Remove pulse class from all arrows
  arrowIndicators.forEach(arrow => {
    arrow.classList.remove('pulse');
  });
  
  // Add highlight to the corresponding arrow
  let arrowClass;
  switch(direction) {
    case 'up':
      arrowClass = 'top';
      break;
    case 'down':
      arrowClass = 'bottom';
      break;
    case 'left':
      arrowClass = 'right';
      break;
    case 'right':
      arrowClass = 'left';
      break;
  }
  
  const arrow = document.querySelector(`.arrow-indicator.${arrowClass}`);
  if (arrow) {
    // Add temporary highlight effect
    arrow.style.backgroundColor = 'rgba(0, 170, 255, 0.6)';
    arrow.style.transform = arrowClass === 'top' || arrowClass === 'bottom' ? 
      'translateX(-50%) scale(1.2)' : 'translateY(-50%) scale(1.2)';
    
    // Reset after animation
    setTimeout(() => {
      arrow.style.backgroundColor = '';
      arrow.style.transform = arrowClass === 'top' || arrowClass === 'bottom' ? 
        'translateX(-50%)' : 'translateY(-50%)';
    }, 300);
  }
}

/**
 * Show tutorial overlay
 */
function showTutorial() {
  if (tutorialShown) return;
  
  swipeHintOverlay.classList.add('visible');
  tutorialShown = true;
  
  // Start tutorial animation sequence
  tutorialStep = 0;
  startTutorialAnimation();
  
  // Hide directional indicators while tutorial is showing
  directionalIndicators.classList.add('hidden');
}

/**
 * Start tutorial animation sequence
 */
function startTutorialAnimation() {
  // Clear any existing interval
  if (tutorialInterval) clearInterval(tutorialInterval);
  
  // Reset cube position
  swipeHintCube.style.transform = 'translate(-50%, -50%)';
  
  // Start animation sequence
  tutorialInterval = setInterval(() => {
    const direction = tutorialDirections[tutorialStep % tutorialDirections.length];
    animateTutorialDirection(direction);
    tutorialStep++;
    
    // Loop through all directions twice then stop
    if (tutorialStep >= tutorialDirections.length * 2) {
      clearInterval(tutorialInterval);
    }
  }, 1500);
}

/**
 * Animate tutorial in specified direction
 * @param {string} direction - Direction ('up', 'down', 'left', 'right')
 */
function animateTutorialDirection(direction) {
  // Position arrow based on direction
  swipeHintArrow.style.top = '50%';
  swipeHintArrow.style.left = '50%';
  swipeHintArrow.style.transform = 'translate(-50%, -50%)';
  
  // Set arrow direction and position
  switch(direction) {
    case 'up':
      swipeHintArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>';
      swipeHintArrow.style.top = '30%';
      break;
    case 'right':
      swipeHintArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>';
      swipeHintArrow.style.left = '70%';
      break;
    case 'down':
      swipeHintArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>';
      swipeHintArrow.style.top = '70%';
      break;
    case 'left':
      swipeHintArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path></svg>';
      swipeHintArrow.style.left = '30%';
      break;
  }
  
  // Show arrow
  swipeHintArrow.classList.add('visible');
  
  // Animate cube after a short delay
  setTimeout(() => {
    // Move cube based on direction
    switch(direction) {
      case 'up':
        swipeHintCube.style.transform = 'translate(-50%, -80%)';
        break;
      case 'right':
        swipeHintCube.style.transform = 'translate(-20%, -50%)';
        break;
      case 'down':
        swipeHintCube.style.transform = 'translate(-50%, -20%)';
        break;
      case 'left':
        swipeHintCube.style.transform = 'translate(-80%, -50%)';
        break;
    }
    
    // Hide arrow after animation starts
    setTimeout(() => {
      swipeHintArrow.classList.remove('visible');
    }, 500);
    
    // Reset cube position after animation completes
    setTimeout(() => {
      swipeHintCube.style.transform = 'translate(-50%, -50%)';
    }, 1500);
  }, 500);
}

/**
 * Close tutorial
 */
function closeTutorial() {
  swipeHintOverlay.classList.remove('visible');
  
  // Clear tutorial animation interval
  if (tutorialInterval) {
    clearInterval(tutorialInterval);
    tutorialInterval = null;
  }
  
  // Show directional indicators after tutorial closes
  directionalIndicators.classList.remove('hidden');
  
  // Start pulsing arrows to guide user
  startPulsingArrows();
  
  // Set up inactivity timer
  setupInactivityTimer();
}

/**
 * Start pulsing arrows to guide user
 */
function startPulsingArrows() {
  // Pulse each arrow in sequence
  const directions = ['top', 'right', 'bottom', 'left'];
  let currentIndex = 0;
  
  function pulseNextArrow() {
    // Remove pulse from all arrows
    arrowIndicators.forEach(arrow => {
      arrow.classList.remove('pulse');
    });
    
    // Add pulse to current arrow
    const currentDirection = directions[currentIndex];
    const arrow = document.querySelector(`.arrow-indicator.${currentDirection}`);
    if (arrow) {
      arrow.classList.add('pulse');
    }
    
    // Move to next arrow
    currentIndex = (currentIndex + 1) % directions.length;
  }
  
  // Start with first arrow
  pulseNextArrow();
  
  // Pulse next arrow every 2 seconds
  const pulseInterval = setInterval(pulseNextArrow, 2000);
  
  // Stop pulsing after user interacts
  function stopPulsing() {
    clearInterval(pulseInterval);
    arrowIndicators.forEach(arrow => {
      arrow.classList.remove('pulse');
    });
    
    // Remove event listeners
    window.removeEventListener('wheel', stopPulsing);
    window.removeEventListener('touchstart', stopPulsing);
    window.removeEventListener('keydown', stopPulsing);
  }
  
  // Stop pulsing when user interacts
  window.addEventListener('wheel', stopPulsing, { once: true });
  window.addEventListener('touchstart', stopPulsing, { once: true });
  window.addEventListener('keydown', stopPulsing, { once: true });
}

/**
 * Create trail particle for visual feedback
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
function createTrailParticle(x, y) {
  const particle = document.createElement('div');
  particle.className = 'trail-particle';
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  swipeTrail.appendChild(particle);
  
  // Fade out and remove after animation
  setTimeout(() => {
    particle.classList.add('fade');
    setTimeout(() => {
      particle.remove();
    }, 500);
  }, 100);
}

/**
 * Set up inactivity timer
 */
function setupInactivityTimer() {
  // Clear any existing timer
  if (inactivityTimer) clearTimeout(inactivityTimer);
  
  // Set new timer
  inactivityTimer = setTimeout(() => {
    showInactivityHint();
  }, 5000); // Show hint after 5 seconds of inactivity
}

/**
 * Reset inactivity timer
 */
function resetInactivityTimer() {
  // Hide inactivity hint if showing
  inactivityHint.classList.remove('visible');
  
  // Reset timer
  setupInactivityTimer();
}

/**
 * Show inactivity hint
 */
function showInactivityHint() {
  // Only show if user hasn't interacted yet
  if (!tutorialShown) {
    showTutorial();
  } else {
    inactivityHint.classList.add('visible');
    
    // Hide after a few seconds
    setTimeout(() => {
      inactivityHint.classList.remove('visible');
    }, 3000);
  }
}

export {
  initUI
};
