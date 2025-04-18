/**
 * Main Module
 * Coordinates all modules and initialization
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { 
  isMobile, 
  lerpSpeed
} from './config.js';
import { initScene, renderScene, getCamera } from './scene.js';
import { initCube, updateCube, getCurrentFrontFace } from './cube.js';
import { initInputHandlers } from './input-handler.js';
import { initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Initialize scene
  const { 
    scene, 
    camera, 
    renderer, 
    loadingIndicator, 
    touchFeedback, 
    cubeContainer 
  } = initScene();
  
  // Initialize UI
  const { 
    updateContent, 
    highlightArrowIndicator, 
    showTutorial, 
    closeTutorial, 
    setupInactivityTimer, 
    resetInactivityTimer, 
    createTrailParticle, 
    swipeTrail 
  } = initUI();
  
  // Initialize cube with video texture
  const videoLoadPromise = initCube(scene);
  
  // Initialize input handlers
  initInputHandlers({
    cubeContainer,
    camera,
    touchFeedback,
    highlightArrowIndicator,
    resetInactivityTimer,
    createTrailParticle,
    swipeTrail
  });
  
  // Enhanced animation loop with performance optimizations
  function updateScene() {
    // Update cube animation
    updateCube(updateContent);
    
    // Render the scene
    renderScene();
    
    // Continue animation loop
    requestAnimationFrame(updateScene);
  }
  
  // Initialize content and start animation loop once video is loaded
  videoLoadPromise.then(() => {
    // Hide loading indicator
    loadingIndicator.classList.remove('active');
    setTimeout(() => {
      loadingIndicator.remove();
    }, 300);
    
    // Update content
    updateContent(getCurrentFrontFace());
    
    // Start animation loop
    requestAnimationFrame(updateScene);
    
    // Show tutorial after a short delay
    setTimeout(() => {
      showTutorial();
    }, 1000);
  });
});
