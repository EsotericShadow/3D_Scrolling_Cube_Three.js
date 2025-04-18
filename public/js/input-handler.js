/**
 * Input Handler Module
 * Handles touch, mouse, wheel, and keyboard event handling
 */

import { 
  isMobile, 
  minSwipeDistance, 
  gestureTimeout,
  faceLinks
} from './config.js';
import { isAnimatingCube, getCube, changeFace } from './cube.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

// Gesture tracking
let currentGestureId = null;
let gestureProcessed = false;
let gestureDirection = null;
let gestureStartTime = 0;

// Touch handling variables
let touchStartX = 0;
let touchStartY = 0;

/**
 * Initialize input handlers
 * @param {Object} params - Parameters for initialization
 * @param {HTMLElement} params.cubeContainer - The cube container element
 * @param {THREE.Camera} params.camera - The camera
 * @param {HTMLElement} params.touchFeedback - The touch feedback element
 * @param {Function} params.highlightArrowIndicator - Function to highlight arrow indicator
 * @param {Function} params.resetInactivityTimer - Function to reset inactivity timer
 * @param {Function} params.createTrailParticle - Function to create trail particle
 * @param {HTMLElement} params.swipeTrail - The swipe trail element
 */
function initInputHandlers({
  cubeContainer,
  camera,
  touchFeedback,
  highlightArrowIndicator,
  resetInactivityTimer,
  createTrailParticle,
  swipeTrail
}) {
  // Wheel event handling
  function onWheel(e) {
    e.preventDefault();
    
    if (isAnimatingCube()) return;
    
    // Generate a unique ID for this wheel event sequence
    const now = Date.now();
    const gestureId = `wheel_${now}`;
    
    // If this is a new gesture or the previous one timed out
    if (currentGestureId !== gestureId && (!currentGestureId || now - gestureStartTime > gestureTimeout)) {
      currentGestureId = gestureId;
      gestureStartTime = now;
      gestureProcessed = false;
      
      // Determine direction from this single event
      const deltaX = e.deltaX || 0;
      const deltaY = e.deltaY || 0;
      
      // Only process if the movement is significant
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        if (Math.abs(deltaY) >= Math.abs(deltaX)) {
          gestureDirection = deltaY > 0 ? 'up' : 'down';
        } else {
          gestureDirection = deltaX > 0 ? 'right' : 'left';
        }
        
        // Process the gesture immediately
        if (!gestureProcessed) {
          changeFace(gestureDirection, camera, highlightArrowIndicator, resetInactivityTimer);
          gestureProcessed = true;
          
          // Clear the gesture after processing
          setTimeout(() => {
            if (currentGestureId === gestureId) {
              currentGestureId = null;
            }
          }, gestureTimeout);
        }
      }
    }
  }
  
  // Touch start
  function onTouchStart(e) {
    e.preventDefault();
    
    if (isAnimatingCube()) return;
    
    // Record start position
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    
    // Generate a unique ID for this touch sequence
    const gestureId = `touch_${Date.now()}`;
    currentGestureId = gestureId;
    gestureStartTime = Date.now();
    gestureProcessed = false;
    gestureDirection = null;
    
    // Show touch feedback
    touchFeedback.style.left = `${touchStartX}px`;
    touchFeedback.style.top = `${touchStartY}px`;
    touchFeedback.classList.add('active');
    
    // Create swipe trail start point
    if (createTrailParticle) {
      createTrailParticle(touchStartX, touchStartY);
    }
    
    // Remove after animation completes
    setTimeout(() => {
      touchFeedback.classList.remove('active');
    }, 500);
  }
  
  // Touch move
  function onTouchMove(e) {
    e.preventDefault();
    
    if (isAnimatingCube() || gestureProcessed) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    // Create trail particle for visual feedback
    if (createTrailParticle) {
      createTrailParticle(currentX, currentY);
    }
    
    // Calculate distance moved
    const deltaX = touchStartX - currentX;
    const deltaY = touchStartY - currentY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Only process if we've moved enough distance
    if (distance >= minSwipeDistance) {
      // Determine primary direction
      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        gestureDirection = deltaY > 0 ? 'up' : 'down';
      } else {
        gestureDirection = deltaX > 0 ? 'right' : 'left';
      }
      
      // Process the gesture
      if (!gestureProcessed && gestureDirection) {
        changeFace(gestureDirection, camera, highlightArrowIndicator, resetInactivityTimer);
        gestureProcessed = true;
      }
    }
  }
  
  // Touch end
  function onTouchEnd(e) {
    e.preventDefault();
    
    // Clear the current gesture after a delay
    setTimeout(() => {
      currentGestureId = null;
      gestureProcessed = false;
      gestureDirection = null;
    }, 50);
  }

  // Set up click handler for cube faces
  function setupClickHandler() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Use both click and touch events for better cross-device support
    const clickHandler = (event) => {
      if (isAnimatingCube()) return;
      
      // Prevent default only for touch events to avoid double-firing
      if (event.type === 'touchend') {
        event.preventDefault();
      }
      
      const rect = cubeContainer.getBoundingClientRect();
      
      // Get correct coordinates for both mouse and touch
      const clientX = event.clientX || (event.changedTouches && event.changedTouches[0].clientX);
      const clientY = event.clientY || (event.changedTouches && event.changedTouches[0].clientY);
      
      if (!clientX || !clientY) return;
      
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(getCube());
      
      if (intersects.length > 0) {
        const faceIndex = Math.floor(intersects[0].faceIndex / 2);
        
        // Add visual feedback for click
        touchFeedback.style.left = `${clientX}px`;
        touchFeedback.style.top = `${clientY}px`;
        touchFeedback.classList.add('active');
        
        // Remove after animation completes
        setTimeout(() => {
          touchFeedback.classList.remove('active');
        }, 500);
        
        // Add haptic feedback
        if (navigator.vibrate && isMobile) {
          navigator.vibrate(30);
        }
        
        window.open(faceLinks[faceIndex], '_blank');
      }
    };
    
    cubeContainer.addEventListener('click', clickHandler);
    if (isMobile) {
      // Use touchend for mobile to avoid delay
      cubeContainer.addEventListener('touchend', clickHandler);
    }
  }

  // Set up event listeners based on device type
  if (!isMobile) {
    window.addEventListener('wheel', onWheel, { passive: false });
    
    // Add keyboard navigation for desktop
    window.addEventListener('keydown', (e) => {
      if (isAnimatingCube()) return;
      
      // Generate a unique ID for this key event
      const gestureId = `key_${Date.now()}`;
      
      // Only process if this is a new gesture
      if (currentGestureId !== gestureId) {
        currentGestureId = gestureId;
        gestureProcessed = false;
        
        let direction = null;
        switch(e.key) {
          case 'ArrowUp':
            direction = 'up';
            break;
          case 'ArrowDown':
            direction = 'down';
            break;
          case 'ArrowLeft':
            direction = 'left';
            break;
          case 'ArrowRight':
            direction = 'right';
            break;
        }
        
        if (direction && !gestureProcessed) {
          changeFace(direction, camera, highlightArrowIndicator, resetInactivityTimer);
          gestureProcessed = true;
          
          // Clear the gesture after processing
          setTimeout(() => {
            currentGestureId = null;
          }, 300);
        }
      }
    });
  } else {
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
  }
  
  // Set up click handler
  setupClickHandler();
}

export {
  initInputHandlers
};
