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
  
  const brightMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('hsl(200, 100%, 60%)') });
  const wireframe = new THREE.Group();
  edgePositions.forEach(([start, end]) => {
    const path = new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end));
    const tubeGeometry = new THREE.TubeGeometry(path, 1, 0.02, 8, false);
    wireframe.add(new THREE.Mesh(tubeGeometry, brightMat));
  });
  
  const glowMat = new THREE.MeshBasicMaterial({ 
    color: new THREE.Color('hsl(200, 100%, 60%)'),
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

  // --- Text Setup ---
  const leftText = document.getElementById('left-text');
  const rightText = document.getElementById('right-text');
  const leftMessages = [
    'Designs that defy convention.',
    'Minimalist. Modular. Mind‑blowing.',
    'Web experiences with a pulse.',
    'A new dimension of interactivity.',
    'Explore the edge of digital design.',
    'Your brand in real time.',
    'Precision meets emotion.',
    "Design that's alive.",
    'Technically beautiful.',
    'Inspired by the future.'
  ];
  const rightMessages = [
    'Enter a hyper‑immersive world.',
    'Innovation meets aesthetics.',
    '3D is just the beginning.',
    'Crafted for high‑speed minds.',
    'From code to consciousness.',
    'Made for visionaries.',
    'Where tech meets art.',
    'Interactive identity design.',
    'Design beyond the screen.',
    'Step into another layer.'
  ];
  
  function createTextBlock(msg) {
    const wrapper = document.createElement('div');
    wrapper.className = 'text-inner';
    wrapper.innerHTML = `<div class="text-block"><p>${msg}</p></div>`;
    return wrapper;
  }
  
  let textBlocks = [];
  let blockHeight = 0;
  const blocksCount = leftMessages.length;
  let contentHeight = 0;
  let centerOffset = 0;
  const fadeRange = 150;
  const translateMax = 20;
  
  // --- Rotation State Variables ---
  // verticalIndex tracks vertical face flips (in 90° increments)
  // When verticalIndex is even, horizontal swipes rotate around Y.
  // When odd, they rotate around Z.
  let verticalIndex = 0;
  let horizontalIndexY = 0;
  let horizontalIndexZ = 0;
  
  // Current rotations (in degrees)
  let currentRotX = 0, currentRotY = 0, currentRotZ = 0;
  // Target rotations (in degrees)
  let targetRotX = 0, targetRotY = 0, targetRotZ = 0;
  
  let textIndex = 0;
  let isAnimating = false;
  const lerpSpeed = 0.1;  // lower value for smooth linear transitions
  const swipeThreshold = 75;
  let accumulatedDeltaX = 0;
  let accumulatedDeltaY = 0;
  let lockedAxis = null;
  const touchMult = 2;
  
  // Convert degrees to radians
  const toRad = deg => deg * Math.PI / 180;
  
  // --- INITIALIZE TEXT & METRICS ---
  function setup() {
    leftMessages.forEach(m => leftText.appendChild(createTextBlock(m)));
    rightMessages.forEach(m => rightText.appendChild(createTextBlock(m)));
    textBlocks = Array.from(document.querySelectorAll('.text-block'));
    const first = textBlocks[0];
    const rect = first.getBoundingClientRect();
    const style = window.getComputedStyle(first);
    const mb = parseFloat(style.marginBottom);
    blockHeight = rect.height + mb;
    contentHeight = blockHeight * blocksCount;
    centerOffset = (window.innerHeight / 2) - (rect.height / 2);
    requestAnimationFrame(updateScene);
  }
  
  // --- RENDER & FADE LOOP ---
  function updateScene() {
    // Lerp current rotations toward target rotations.
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
  
    // Apply rotations to the cube
    glowWireframe.rotation.set(toRad(currentRotX), toRad(currentRotY), toRad(currentRotZ));
    wireframe.rotation.set(toRad(currentRotX), toRad(currentRotY), toRad(currentRotZ));
  
    // Update hue based on vertical text index.
    const hue = (textIndex * 36) % 360;
    const h = ((hue + 360) % 360) / 360;
    brightMat.color.setHSL(h, 1, 0.6);
    glowMat.color.setHSL(h, 1, 0.6);
  
    // Update text scroll
    const r = (textIndex * blockHeight) % contentHeight;
    const offset = centerOffset - r;
    leftText.style.transform = `translateY(${offset}px)`;
    rightText.style.transform = `translateY(${offset}px)`;
  
    // Update text fade effect.
    const midY = window.innerHeight / 2;
    textBlocks.forEach(block => {
      const bRect = block.getBoundingClientRect();
      const bCenter = bRect.top + bRect.height / 2;
      const dist = Math.abs(bCenter - midY);
      const t = Math.min(dist / fadeRange, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
      const opacity = 1 - eased;
      block.style.opacity = opacity;
      block.style.transform = `translateY(${translateMax * (1 - opacity)}px)`;
    });
  
    renderer.render(scene, camera);
    requestAnimationFrame(updateScene);
  }
  
  // --- FACE CHANGE (Swipe Handler) ---
  // For vertical swipes: adjust verticalIndex and update targetRotX.
  // For horizontal swipes, decide based on verticalIndex:
  //   - if verticalIndex even: update targetRotY
  //   - if verticalIndex odd: update targetRotZ
  function changeFace(direction) {
    if (isAnimating) return;
  
    if (direction === 'up') {
      verticalIndex++;
      targetRotX = -90 * verticalIndex;
      textIndex = (textIndex + 1) % blocksCount;
    } else if (direction === 'down') {
      verticalIndex--;
      targetRotX = -90 * verticalIndex;
      textIndex = (textIndex - 1 + blocksCount) % blocksCount;
    } else if (direction === 'left') {
      if (verticalIndex % 2 === 0) { 
        // Cube is upright or inverted: left/right rotation about Y
        horizontalIndexY--;
        targetRotY = 90 * horizontalIndexY;
      } else {
        // Cube rotated 90° or 270° vertically: rotate about Z for a true left/right flip
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
  
    if (!lockedAxis) {
      lockedAxis = Math.abs(deltaX) >= Math.abs(deltaY) ? 'x' : 'y';
    }
    if (lockedAxis === 'x') {
      accumulatedDeltaX += deltaX * touchMult;
      accumulatedDeltaY = 0;
    } else {
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
  
    if (textBlocks.length > 0) {
      const first = textBlocks[0];
      const rect = first.getBoundingClientRect();
      const style = window.getComputedStyle(first);
      const mb = parseFloat(style.marginBottom);
      blockHeight = rect.height + mb;
      contentHeight = blockHeight * blocksCount;
      centerOffset = (window.innerHeight / 2) - (rect.height / 2);
    }
  });
  
  // --- BOOTSTRAP APP ---
  setup();
});
