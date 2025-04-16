import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // — Detect touch / mobile —
  const isMobile = window.matchMedia('(max-width: 768px)').matches
    || 'ontouchstart' in window;

  // — THREE.JS SETUP —
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

  // — HOLLOW NEON CUBE —
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // Define the 12 edges of the cube (start and end points)
  const edgePositions = [
    [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5]], // Bottom edges
    [[-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]],
    [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5]],
    [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]],
    [[-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5]], // Vertical edges
    [[0.5, -0.5, -0.5], [0.5, 0.5, -0.5]],
    [[-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5]],
    [[0.5, -0.5, 0.5], [0.5, 0.5, 0.5]],
    [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5]], // Front-back edges
    [[0.5, -0.5, -0.5], [0.5, -0.5, 0.5]],
    [[-0.5, 0.5, -0.5], [-0.5, 0.5, 0.5]],
    [[0.5, 0.5, -0.5], [0.5, 0.5, 0.5]]
  ];

  // Bright core wireframe (using tubes)
  const brightMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('hsl(200, 100%, 60%)')
  });
  const wireframe = new THREE.Group();

  edgePositions.forEach(([start, end]) => {
    const path = new THREE.LineCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    );
    const tubeGeometry = new THREE.TubeGeometry(path, 1, 0.02, 8, false);
    wireframe.add(new THREE.Mesh(tubeGeometry, brightMat));
  });

  // Faint, slightly scaled wireframe for glow (thicker tubes)
  const glowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('hsl(200, 100%, 60%)'),
    transparent: true,
    opacity: 0.4
  });
  const glowWireframe = new THREE.Group();

  edgePositions.forEach(([start, end]) => {
    const path = new THREE.LineCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    );
    const tubeGeometry = new THREE.TubeGeometry(path, 1, 0.03, 8, false);
    glowWireframe.add(new THREE.Mesh(tubeGeometry, glowMat));
  });

  glowWireframe.scale.set(1.1, 1.1, 1.1);
  scene.add(glowWireframe);
  scene.add(wireframe);

  // — TEXT SETUP —
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

  // Initialize textBlocks globally
  let textBlocks = [];

  // — STATE & CONFIG —
  let blockHeight = 0;
  const blocksCount = leftMessages.length;
  let contentHeight = 0;
  let centerOffset = 0;
  const fadeRange = 150;
  const translateMax = 20;
  const touchMult = 2;

  // Cube face state
  let currentFace = 'A'; // Start with Face A
  let targetRotX = 0; // Target rotation X (radians)
  let targetRotY = 0; // Target rotation Y (radians)
  let currentRotX = 0; // Current rotation X (radians)
  let currentRotY = 0; // Current rotation Y (radians)
  let textIndex = 0; // Current text block index
  let isAnimating = false; // Lock inputs during animation
  const swipeThreshold = 75; // Pixels to trigger face change
  let accumulatedDeltaX = 0; // Accumulated horizontal swipe
  let accumulatedDeltaY = 0; // Accumulated vertical swipe
  let lockedAxis = null; // Lock to 'x' or 'y' per touch gesture
  const lerpSpeed = 0.3; // Animation speed

  const easeInOutQuad = x =>
    x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;

  // Face transition map
  const faceTransitions = {
    'A': { up: 'Bottom', down: 'Top', left: 'D', right: 'B' },
    'Bottom': { up: 'C', down: 'A', left: 'D', right: 'B' },
    'Top': { up: 'A', down: 'C', left: 'D', right: 'B' },
    'B': { up: 'Bottom', down: 'Top', left: 'A', right: 'C' },
    'C': { up: 'Bottom', down: 'Top', left: 'B', right: 'D' },
    'D': { up: 'Bottom', down: 'Top', left: 'C', right: 'A' }
  };

  // Face rotation map (in degrees, converted to radians)
  const faceRotations = {
    'A': { x: 0, y: 0 },
    'B': { x: 0, y: 90 },
    'C': { x: 0, y: 180 },
    'D': { x: 0, y: -90 },
    'Top': { x: 90, y: 0 },
    'Bottom': { x: -90, y: 0 }
  };

  // Convert degrees to radians
  const toRadians = deg => deg * Math.PI / 180;

  // — INITIALIZE TEXT + METRICS —
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

  // — RENDER & FADE LOOP —
  function updateScene() {
    // Lerp rotations to target
    if (Math.abs(currentRotX - targetRotX) > 0.001 || Math.abs(currentRotY - targetRotY) > 0.001) {
      currentRotX += (targetRotX - currentRotX) * lerpSpeed;
      currentRotY += (targetRotY - currentRotY) * lerpSpeed;
      isAnimating = true;
      // Reset deltas during animation
      accumulatedDeltaX = 0;
      accumulatedDeltaY = 0;
    } else {
      currentRotX = targetRotX;
      currentRotY = targetRotY;
      isAnimating = false;
    }

    // Apply rotations
    glowWireframe.rotation.x = currentRotX;
    wireframe.rotation.x = currentRotX;
    glowWireframe.rotation.y = currentRotY;
    wireframe.rotation.y = currentRotY;

    // Hue shift based on face index
    const hue = (textIndex * 36) % 360;
    const h = (hue + 360) % 360 / 360;
    brightMat.color.setHSL(h, 1, 0.6);
    glowMat.color.setHSL(h, 1, 0.6);

    // Text scroll (tied to vertical face changes)
    const r = (textIndex * blockHeight) % contentHeight;
    const offset = centerOffset - r;
    leftText.style.transform = `translateY(${offset}px)`;
    rightText.style.transform = `translateY(${offset}px)`;

    // Text fade
    const midY = window.innerHeight / 2;
    textBlocks.forEach((block, index) => {
      const bRect = block.getBoundingClientRect();
      const bCenter = bRect.top + bRect.height / 2;
      const dist = Math.abs(bCenter - midY);
      const t = Math.min(dist / fadeRange, 1);
      const eased = easeInOutQuad(t);
      const opacity = 1 - eased;
      block.style.opacity = opacity;
      block.style.transform = `translateY(${translateMax * (1 - opacity)}px)`;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(updateScene);
  }

  // — CHANGE FACE —
  function changeFace(direction) {
    if (isAnimating) return;
    const newFace = faceTransitions[currentFace][direction];
    if (!newFace) return;

    // Update face and rotations
    currentFace = newFace;
    targetRotX = toRadians(faceRotations[newFace].x);
    targetRotY = toRadians(faceRotations[newFace].y);

    // Update text index for vertical changes
    if (direction === 'up' || direction === 'down') {
      textIndex = (textIndex + (direction === 'up' ? 1 : -1) + blocksCount) % blocksCount;
    }

    // Reset accumulators and lock
    accumulatedDeltaX = 0;
    accumulatedDeltaY = 0;
    isAnimating = true;
  }

  // — INPUT HANDLERS —
  function onWheel(e) {
    if (isAnimating) return;
    e.preventDefault();
    const deltaX = e.deltaX || 0;
    const deltaY = e.deltaY || 0;
    const threshold = 3; // Lowered for responsiveness
    const dominanceFactor = 2; // Stricter axis selection

    // Strict axis locking: choose one axis and reset the other
    if (Math.abs(deltaX) > Math.abs(deltaY) * dominanceFactor && Math.abs(deltaX) > threshold) {
      accumulatedDeltaX += deltaX * (e.shiftKey ? 2 : 1);
      accumulatedDeltaY = 0; // Reset non-dominant axis
    } else if (Math.abs(deltaY) > threshold) {
      accumulatedDeltaY += deltaY;
      accumulatedDeltaX = 0; // Reset non-dominant axis
    }

    // Check thresholds
    if (Math.abs(accumulatedDeltaX) > swipeThreshold) {
      changeFace(accumulatedDeltaX > 0 ? 'right' : 'left');
    } else if (Math.abs(accumulatedDeltaY) > swipeThreshold) {
      changeFace(accumulatedDeltaY > 0 ? 'up' : 'down');
    }
  }

  function onTouchStart(e) {
    lastY = e.touches[0].clientY;
    lastX = e.touches[0].clientX;
    lockedAxis = null;
    accumulatedDeltaX = 0;
    accumulatedDeltaY = 0;
  }

  function onTouchMove(e) {
    if (isAnimating) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    const x = e.touches[0].clientX;
    const deltaY = (lastY - y) * touchMult;
    const deltaX = (lastX - x) * touchMult;
    const threshold = 3; // Lowered for responsiveness
    const dominanceFactor = 2;

    // Lock to dominant axis at start of gesture
    if (!lockedAxis) {
      if (Math.abs(deltaX) > Math.abs(deltaY) * dominanceFactor && Math.abs(deltaX) > threshold) {
        lockedAxis = 'x';
      } else if (Math.abs(deltaY) > threshold) {
        lockedAxis = 'y';
      }
    }

    // Accumulate only for locked axis
    if (lockedAxis === 'x') {
      accumulatedDeltaX += deltaX;
      accumulatedDeltaY = 0; // Reset non-dominant axis
    } else if (lockedAxis === 'y') {
      accumulatedDeltaY += deltaY;
      accumulatedDeltaX = 0; // Reset non-dominant axis
    }

    // Check thresholds
    if (Math.abs(accumulatedDeltaX) > swipeThreshold) {
      changeFace(accumulatedDeltaX > 0 ? 'right' : 'left');
    } else if (Math.abs(accumulatedDeltaY) > swipeThreshold) {
      changeFace(accumulatedDeltaY > 0 ? 'up' : 'down');
    }

    lastY = y;
    lastX = x;
  }

  function onTouchEnd(e) {
    lockedAxis = null;
    accumulatedDeltaX = 0;
    accumulatedDeltaY = 0;
  }

  if (!isMobile) {
    window.addEventListener('wheel', onWheel, { passive: false });
  } else {
    let lastY = 0;
    let lastX = 0;
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
  }

  // — HANDLE RESIZE —
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

  // — BOOTSTRAP —
  setup();
});
