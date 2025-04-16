import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Device Detection ---
  const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);

  // --- THREE.JS SETUP ---
  const scene = new THREE.Scene();
  const cubeContainer = document.getElementById('cube-container');
  const camera = new THREE.PerspectiveCamera(
    75,
    cubeContainer.clientWidth / cubeContainer.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 2;
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(cubeContainer.clientWidth, cubeContainer.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  cubeContainer.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // --- Cube Wireframe Setup ---
  const edgePositions = [
    [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5]],
    [[-0.5,  0.5, -0.5], [0.5,  0.5, -0.5]],
    [[-0.5, -0.5,  0.5], [0.5, -0.5,  0.5]],
    [[-0.5,  0.5,  0.5], [0.5,  0.5,  0.5]],
    [[-0.5, -0.5, -0.5], [-0.5,  0.5, -0.5]],
    [[ 0.5, -0.5, -0.5], [ 0.5,  0.5, -0.5]],
    [[-0.5, -0.5,  0.5], [-0.5,  0.5,  0.5]],
    [[ 0.5, -0.5,  0.5], [ 0.5,  0.5,  0.5]],
    [[-0.5, -0.5, -0.5], [-0.5, -0.5,  0.5]],
    [[ 0.5, -0.5, -0.5], [ 0.5, -0.5,  0.5]],
    [[-0.5,  0.5, -0.5], [-0.5,  0.5,  0.5]],
    [[ 0.5,  0.5, -0.5], [ 0.5,  0.5,  0.5]]
  ];
  
  // Basic neon color setup
  const neonColor = new THREE.Color('hsl(200, 100%, 60%)');
  const brightMat = new THREE.MeshBasicMaterial({ color: neonColor });
  
  const wireframe = new THREE.Group();
  edgePositions.forEach(([start, end]) => {
    const path = new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end));
    const tubeGeometry = new THREE.TubeGeometry(path, 1, 0.02, 8, false);
    wireframe.add(new THREE.Mesh(tubeGeometry, brightMat));
  });
  
  const glowMat = new THREE.MeshBasicMaterial({ 
    color: neonColor,
    transparent: true,
    opacity: 0.4 
  });
  const glowWireframe = new THREE.Group();
  edgePositions.forEach(([start, end]) => {
    const path = new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end));
    const tubeGeometry = new THREE.TubeGeometry(path, 1, 0.03, 8, false);
    glowWireframe.add(new THREE.Mesh(tubeGeometry, glowMat));
  });
  glowWireframe.scale.set(1.1, 1.1, 1.1);
  
  scene.add(glowWireframe);
  scene.add(wireframe);

  // --- Rotation State Variables ---
  let verticalIndex = 0;
  let horizontalIndexY = 0;
  let horizontalIndexZ = 0;
  
  // Current rotations (in degrees)
  let currentRotX = 0, currentRotY = 0, currentRotZ = 0;
  // Target rotations (in degrees)
  let targetRotX = 0, targetRotY = 0, targetRotZ = 0;
  
  let isAnimating = false;
  const lerpSpeed = 0.1;  
  const swipeThreshold = 75;
  let accumulatedDeltaX = 0;
  let accumulatedDeltaY = 0;
  let lockedAxis = null;
  const touchMult = 2;
  const deadZone = 10; // Minimal movement before locking axis
  
  // Convert degrees to radians
  const toRad = deg => deg * Math.PI / 180;
  
  // --- RENDER LOOP ---
  function updateScene() {
    let animating = false;
    if (Math.abs(currentRotX - targetRotX) > 0.1) {
      currentRotX += (targetRotX - currentRotX) * lerpSpeed;
      animating = true;
    } else {
      currentRotX = targetRotX;
    }
    if (Math.abs(currentRotY - targetRotY) > 0.1) {
      currentRotY += (targetRotY - currentRotY) * lerpSpeed;
      animating = true;
    } else {
      currentRotY = targetRotY;
    }
    if (Math.abs(currentRotZ - targetRotZ) > 0.1) {
      currentRotZ += (targetRotZ - currentRotZ) * lerpSpeed;
      animating = true;
    } else {
      currentRotZ = targetRotZ;
    }
    isAnimating = animating;
    if (isAnimating) {
      accumulatedDeltaX = 0;
      accumulatedDeltaY = 0;
    }
  
    // Apply rotations
    glowWireframe.rotation.set(toRad(currentRotX), toRad(currentRotY), toRad(currentRotZ));
    wireframe.rotation.set(toRad(currentRotX), toRad(currentRotY), toRad(currentRotZ));
  
    renderer.render(scene, camera);
    requestAnimationFrame(updateScene);
  }
  
  // --- FACE CHANGE (Swipe Handler) ---
  // Vertical swipes rotate about the X-axis.
  // Horizontal swipes use Y rotation if the cube is upright (even verticalIndex)
  // or Z rotation when rotated vertically (odd verticalIndex).
  function changeFace(direction) {
    if (isAnimating) return;
  
    if (direction === 'up') {
      verticalIndex++;
      targetRotX = -90 * verticalIndex;
    } else if (direction === 'down') {
      verticalIndex--;
      targetRotX = -90 * verticalIndex;
    } else if (direction === 'left') {
      if (verticalIndex % 2 === 0) { 
        horizontalIndexY--;
        targetRotY = 90 * horizontalIndexY;
      } else {
        horizontalIndexZ--;
        targetRotZ = 90 * horizontalIndexZ;
      }
    } else if (direction === 'right') {
      if (verticalIndex % 2 === 0) {
        horizontalIndexY++;
        targetRotY = 90 * horizontalIndexY;
      } else {
        horizontalIndexZ++;
        targetRotZ = 90 * horizontalIndexZ;
      }
    }
    accumulatedDeltaX = 0;
    accumulatedDeltaY = 0;
    lockedAxis = null;
    isAnimating = true;
  }
  
  // --- INPUT HANDLERS ---
  function onWheel(e) {
    if (isAnimating) return;
    e.preventDefault();
    const deltaX = e.deltaX || 0;
    const deltaY = e.deltaY || 0;
  
    if (e.shiftKey) {
      accumulatedDeltaX += deltaX;
      accumulatedDeltaY = 0;
    } else {
      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        accumulatedDeltaY += deltaY;
        accumulatedDeltaX = 0;
      } else {
        accumulatedDeltaX += deltaX;
        accumulatedDeltaY = 0;
      }
    }
  
    if (Math.abs(accumulatedDeltaX) > swipeThreshold) {
      changeFace(accumulatedDeltaX > 0 ? 'right' : 'left');
    } else if (Math.abs(accumulatedDeltaY) > swipeThreshold) {
      changeFace(accumulatedDeltaY > 0 ? 'up' : 'down');
    }
  }
  
  let lastX = 0, lastY = 0;
  function onTouchStart(e) {
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    lockedAxis = null;
    accumulatedDeltaX = 0;
    accumulatedDeltaY = 0;
  }
  
  function onTouchMove(e) {
    if (isAnimating) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = lastX - currentX;
    const deltaY = lastY - currentY;
  
    // Only decide on an axis after a minimal "dead zone" has passed.
    if (!lockedAxis && (Math.abs(deltaX) > deadZone || Math.abs(deltaY) > deadZone)) {
      lockedAxis = Math.abs(deltaX) >= Math.abs(deltaY) ? 'x' : 'y';
    }
  
    if (lockedAxis === 'x') {
      accumulatedDeltaX += deltaX * touchMult;
      accumulatedDeltaY = 0;
    } else if (lockedAxis === 'y') {
      accumulatedDeltaY += deltaY * touchMult;
      accumulatedDeltaX = 0;
    }
  
    if (Math.abs(accumulatedDeltaX) > swipeThreshold) {
      changeFace(accumulatedDeltaX > 0 ? 'right' : 'left');
    } else if (Math.abs(accumulatedDeltaY) > swipeThreshold) {
      changeFace(accumulatedDeltaY > 0 ? 'up' : 'down');
    }
  
    lastX = currentX;
    lastY = currentY;
  }
  
  function onTouchEnd() {
    lockedAxis = null;
    accumulatedDeltaX = 0;
    accumulatedDeltaY = 0;
  }
  
  if (!isMobile) {
    window.addEventListener('wheel', onWheel, { passive: false });
  } else {
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
  }
  
  // --- RESIZE HANDLER ---
  window.addEventListener('resize', () => {
    const w = cubeContainer.clientWidth;
    const h = cubeContainer.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  
  // --- START ANIMATION ---
  requestAnimationFrame(updateScene);
});
