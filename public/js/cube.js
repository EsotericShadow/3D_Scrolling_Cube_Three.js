/**
 * Cube Module
 * Handles cube geometry, video texture, wireframe effects, and rotation logic
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { 
  cubeSize, 
  wireframeScale, 
  isLowPerfDevice,
  isMobile,
  faceLinks,
  lerpSpeed
} from './config.js';

let cube, wireframe, glowWireframe;
let videoTexture, video;
let isAnimating = false;
let targetQuaternion = new THREE.Quaternion();
let currentFrontFace = 4; // Start with front face

// Map from face normals to face indices
const faceNormals = [
  new THREE.Vector3(1, 0, 0),  // right (0)
  new THREE.Vector3(-1, 0, 0), // left (1)
  new THREE.Vector3(0, 1, 0),  // top (2)
  new THREE.Vector3(0, -1, 0), // bottom (3)
  new THREE.Vector3(0, 0, 1),  // front (4)
  new THREE.Vector3(0, 0, -1)  // back (5)
];

/**
 * Initialize the cube with video texture and wireframe
 * @param {THREE.Scene} scene - The Three.js scene
 * @returns {Promise} Promise that resolves when video is loaded
 */
function initCube(scene) {
  // --- VIDEO TEXTURE SETUP WITH PERFORMANCE OPTIMIZATIONS ---
  video = document.createElement('video');
  video.src = 'cube_texture.mp4';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  
  // Adaptive video quality
  if (isLowPerfDevice) {
    video.width = 512;
    video.height = 512;
  }
  
  // Promise-based video loading
  const videoLoadPromise = new Promise((resolve) => {
    video.addEventListener('canplaythrough', () => {
      resolve();
    });
    
    // Fallback if video takes too long
    setTimeout(resolve, 3000);
    
    video.load();
    video.play().catch(e => {
      console.warn('Auto-play prevented:', e);
      // Auto-play was prevented, but we'll continue without a play button
      // as it's not necessary per user request
    });
  });

  videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBAFormat;

  const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

  // Create cube with video texture
  const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMaterials = Array(6).fill(videoMaterial);
  cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
  scene.add(cube);

  // --- WIRE + GLOW WITH ADAPTIVE QUALITY ---
  createWireframe(scene);

  return videoLoadPromise;
}

/**
 * Create wireframe and glow effects
 * @param {THREE.Scene} scene - The Three.js scene
 */
function createWireframe(scene) {
  const neonColor = new THREE.Color('hsl(200, 100%, 60%)');
  const brightMat = new THREE.MeshBasicMaterial({ color: neonColor });

  const edgePositions = [
    [[-wireframeScale, -wireframeScale, -wireframeScale], [wireframeScale, -wireframeScale, -wireframeScale]],
    [[-wireframeScale,  wireframeScale, -wireframeScale], [wireframeScale,  wireframeScale, -wireframeScale]],
    [[-wireframeScale, -wireframeScale,  wireframeScale], [wireframeScale, -wireframeScale,  wireframeScale]],
    [[-wireframeScale,  wireframeScale,  wireframeScale], [wireframeScale,  wireframeScale,  wireframeScale]],
    [[-wireframeScale, -wireframeScale, -wireframeScale], [-wireframeScale,  wireframeScale, -wireframeScale]],
    [[ wireframeScale, -wireframeScale, -wireframeScale], [ wireframeScale,  wireframeScale, -wireframeScale]],
    [[-wireframeScale, -wireframeScale,  wireframeScale], [-wireframeScale,  wireframeScale,  wireframeScale]],
    [[ wireframeScale, -wireframeScale,  wireframeScale], [ wireframeScale,  wireframeScale,  wireframeScale]],
    [[-wireframeScale, -wireframeScale, -wireframeScale], [-wireframeScale, -wireframeScale,  wireframeScale]],
    [[ wireframeScale, -wireframeScale, -wireframeScale], [ wireframeScale, -wireframeScale,  wireframeScale]],
    [[-wireframeScale,  wireframeScale, -wireframeScale], [-wireframeScale,  wireframeScale,  wireframeScale]],
    [[ wireframeScale,  wireframeScale, -wireframeScale], [ wireframeScale,  wireframeScale,  wireframeScale]]
  ];

  // Adaptive wireframe quality
  const tubularSegments = isLowPerfDevice ? 1 : 1;
  const radiusSegments = isLowPerfDevice ? 4 : 8;
  
  wireframe = new THREE.Group();
  edgePositions.forEach(([start, end]) => {
    const path = new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end));
    const tubeGeometry = new THREE.TubeGeometry(path, tubularSegments, 0.02, radiusSegments, false);
    const mesh = new THREE.Mesh(tubeGeometry, brightMat);
    mesh.raycast = () => {};
    wireframe.add(mesh);
  });

  // Only add glow effect on higher performance devices
  if (!isLowPerfDevice) {
    const glowMat = new THREE.MeshBasicMaterial({ color: neonColor, transparent: true, opacity: 0.4 });
    glowWireframe = new THREE.Group();
    edgePositions.forEach(([start, end]) => {
      const path = new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end));
      const tubeGeometry = new THREE.TubeGeometry(path, tubularSegments, 0.03, radiusSegments, false);
      const mesh = new THREE.Mesh(tubeGeometry, glowMat);
      mesh.raycast = () => {};
      glowWireframe.add(mesh);
    });
    glowWireframe.scale.set(isMobile ? 1.15 : 1.1, isMobile ? 1.15 : 1.1, isMobile ? 1.15 : 1.1);
    scene.add(glowWireframe);
  }
  
  scene.add(wireframe);
}

/**
 * Get the current front face of the cube
 * @returns {number} Index of the front face
 */
function getFrontFace() {
  const viewDir = new THREE.Vector3(0, 0, -1);
  let maxDot = -1;
  let frontFaceIndex = 0;
  
  faceNormals.forEach((normal, index) => {
    const transformedNormal = normal.clone().applyQuaternion(cube.quaternion);
    const dot = transformedNormal.dot(viewDir);
    if (dot > maxDot) {
      maxDot = dot;
      frontFaceIndex = index;
    }
  });
  
  return frontFaceIndex;
}

/**
 * Get rotation axis based on direction
 * @param {string} direction - Direction of rotation ('up', 'down', 'left', 'right')
 * @param {THREE.Camera} camera - The camera
 * @returns {THREE.Vector3} Rotation axis
 */
function getRotationAxis(direction, camera) {
  // Define fixed camera-relative axes
  // These axes are always aligned with the camera view, not the cube's orientation
  const cameraUp = new THREE.Vector3(0, 1, 0);
  const cameraRight = new THREE.Vector3(1, 0, 0);
  
  // Determine which axis to rotate around based on swipe direction
  let axis;
  switch(direction) {
    case 'up': 
      axis = cameraRight.clone().negate(); // Inverted to match expected behavior
      break;
    case 'down': 
      axis = cameraRight.clone(); // Inverted to match expected behavior
      break;
    case 'left': 
      axis = cameraUp.clone(); 
      break;
    case 'right': 
      axis = cameraUp.clone().negate(); 
      break;
    default: 
      axis = cameraUp.clone();
  }
  
  // Transform the camera-relative axis to world space
  return axis.applyQuaternion(camera.quaternion).normalize();
}

/**
 * Change the face of the cube
 * @param {string} direction - Direction of rotation ('up', 'down', 'left', 'right')
 * @param {THREE.Camera} camera - The camera
 * @param {Function} highlightArrowIndicator - Function to highlight arrow indicator
 * @param {Function} resetInactivityTimer - Function to reset inactivity timer
 * @returns {boolean} Whether the face change was initiated
 */
function changeFace(direction, camera, highlightArrowIndicator, resetInactivityTimer) {
  if (isAnimating) return false;
  
  // Get the rotation axis based on camera-aligned axes
  const rotationAxis = getRotationAxis(direction, camera);
  
  // Create a quaternion for a 90-degree rotation around this axis
  const rotationQuaternion = new THREE.Quaternion();
  rotationQuaternion.setFromAxisAngle(rotationAxis, Math.PI/2);
  
  // Set the target quaternion by multiplying the current quaternion with the rotation
  targetQuaternion = cube.quaternion.clone();
  targetQuaternion.premultiply(rotationQuaternion);
  
  // Set animation flag
  isAnimating = true;
  
  // Add haptic feedback on supported devices
  if (navigator.vibrate && isMobile) {
    navigator.vibrate(20);
  }
  
  // Highlight the corresponding arrow indicator
  if (highlightArrowIndicator) {
    highlightArrowIndicator(direction);
  }
  
  // Reset inactivity timer since user interacted
  if (resetInactivityTimer) {
    resetInactivityTimer();
  }
  
  return true;
}

/**
 * Update the cube animation
 * @param {Function} updateContent - Function to update content based on face
 * @returns {boolean} Whether the cube is still animating
 */
function updateCube(updateContent) {
  if (isAnimating) {
    // Smoothly interpolate to the target quaternion with adaptive speed
    cube.quaternion.slerp(targetQuaternion, lerpSpeed);
    wireframe.quaternion.copy(cube.quaternion);
    if (!isLowPerfDevice && glowWireframe) {
      glowWireframe.quaternion.copy(cube.quaternion);
    }
    
    // Check if we're close enough to the target
    if (cube.quaternion.dot(targetQuaternion) > 0.99999) {
      cube.quaternion.copy(targetQuaternion);
      wireframe.quaternion.copy(targetQuaternion);
      if (!isLowPerfDevice && glowWireframe) {
        glowWireframe.quaternion.copy(targetQuaternion);
      }
      isAnimating = false;
      
      // Update content based on the new front face
      const newFrontFace = getFrontFace();
      if (newFrontFace !== currentFrontFace) {
        currentFrontFace = newFrontFace;
        if (updateContent) {
          updateContent(newFrontFace);
        }
      }
    }
  }
  
  return isAnimating;
}

/**
 * Get the cube object
 * @returns {THREE.Mesh} The cube
 */
function getCube() {
  return cube;
}

/**
 * Check if the cube is currently animating
 * @returns {boolean} Whether the cube is animating
 */
function isAnimatingCube() {
  return isAnimating;
}

/**
 * Get the current front face index
 * @returns {number} Index of the current front face
 */
function getCurrentFrontFace() {
  return currentFrontFace;
}

/**
 * Get the video element
 * @returns {HTMLVideoElement} The video element
 */
function getVideo() {
  return video;
}

export {
  initCube,
  getFrontFace,
  changeFace,
  updateCube,
  getCube,
  isAnimatingCube,
  getCurrentFrontFace,
  getVideo
};
