/**
 * Scene Module
 * Handles Three.js scene setup, camera, renderer, and lighting
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { 
  isMobile, 
  isLowPerfDevice, 
  fov, 
  cameraDistance 
} from './config.js';

// Scene setup
let scene, camera, renderer;
let cubeContainer;

/**
 * Initialize the Three.js scene, camera, renderer, and lighting
 * @returns {Object} Object containing scene, camera, and renderer
 */
function initScene() {
  cubeContainer = document.getElementById('cube-container');
  
  // Add loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator active';
  cubeContainer.appendChild(loadingIndicator);
  
  // Add touch feedback element
  const touchFeedback = document.createElement('div');
  touchFeedback.className = 'touch-feedback';
  document.body.appendChild(touchFeedback);

  // Scene setup with performance optimizations
  scene = new THREE.Scene();
  
  // Camera setup with adaptive FOV
  camera = new THREE.PerspectiveCamera(fov, cubeContainer.clientWidth / cubeContainer.clientHeight, 0.1, 1000);
  camera.position.z = cameraDistance;

  // Renderer with adaptive quality
  renderer = new THREE.WebGLRenderer({ 
    antialias: !isLowPerfDevice, 
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(cubeContainer.clientWidth, cubeContainer.clientHeight);
  renderer.setPixelRatio(isLowPerfDevice ? 1 : Math.min(window.devicePixelRatio, 2));
  cubeContainer.appendChild(renderer.domElement);
  
  // Adaptive lighting
  const ambientIntensity = isLowPerfDevice ? 1.2 : 1;
  scene.add(new THREE.AmbientLight(0xffffff, ambientIntensity));
  
  // Set up resize handler
  setupResizeHandler();
  
  return {
    scene,
    camera,
    renderer,
    loadingIndicator,
    touchFeedback,
    cubeContainer
  };
}

/**
 * Set up window resize handler with debouncing
 */
function setupResizeHandler() {
  let resizeTimeout;
  window.addEventListener('resize', () => {
    // Clear previous timeout
    clearTimeout(resizeTimeout);
    
    // Set new timeout to debounce resize events
    resizeTimeout = setTimeout(() => {
      // Update device detection
      const wasLandscape = window.matchMedia('(orientation: landscape)').matches;
      const newIsLandscape = window.matchMedia('(orientation: landscape)').matches;
      
      // Only do full update if orientation changed
      if (wasLandscape !== newIsLandscape) {
        location.reload(); // Full reload on orientation change for best layout
      } else {
        // Simple resize for same orientation
        const w = cubeContainer.clientWidth;
        const h = cubeContainer.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    }, 250);
  });
}

/**
 * Render the scene
 */
function renderScene() {
  renderer.render(scene, camera);
}

/**
 * Get the camera object
 * @returns {THREE.PerspectiveCamera} The camera
 */
function getCamera() {
  return camera;
}

/**
 * Get the scene object
 * @returns {THREE.Scene} The scene
 */
function getScene() {
  return scene;
}

/**
 * Get the renderer object
 * @returns {THREE.WebGLRenderer} The renderer
 */
function getRenderer() {
  return renderer;
}

export {
  initScene,
  renderScene,
  getCamera,
  getScene,
  getRenderer
};
