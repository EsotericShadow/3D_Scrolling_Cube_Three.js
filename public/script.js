// script.js — using Pointer Events for mobile + desktop

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // — Detect coarse (touch) pointers —
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  // — THREE.JS SETUP (unchanged) —
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

  // … your neon cube setup …

  // — TEXT SETUP (unchanged) —
  // leftText, rightText, messages arrays, createTextBlock(), etc.

  // — STATE & CONFIG (unchanged) —
  let blockHeight = 0;
  const blocksCount = leftMessages.length;
  let contentHeight = 0;
  let rotationFactor = 0;
  let virtualScroll = 0;
  let textBlocks = [];
  const fadeRange = 150;
  const translateMax = 20;
  const touchMult = 2;
  let centerOffset = 0;
  const easeInOutQuad = x =>
    x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;

  function setup() {
    // … append text blocks …
    requestAnimationFrame(() => {
      // … measure blockHeight, contentHeight, rotationFactor, centerOffset …
      updateScene();
    });
  }

  function updateScene() {
    // … rotate cube, hue shift, scroll + fade text, render …
  }

  // — INPUT HANDLERS —  
  function onWheel(e) {
    e.preventDefault();
    virtualScroll += e.deltaY;
    updateScene();
  }

  let lastY = 0;
  function onPointerDown(e) {
    if (e.pointerType === 'touch') {
      lastY = e.clientY;
    }
  }

  function onPointerMove(e) {
    if (e.pointerType !== 'touch') return;
    e.preventDefault();
    const y = e.clientY;
    virtualScroll += (lastY - y) * touchMult;
    lastY = y;
    updateScene();
  }

  if (!isTouch) {
    window.addEventListener('wheel', onWheel, { passive: false });
  } else {
    // unify touch with pointer events
    window.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
  }

  // — RESIZE HANDLING (unchanged) —
  window.addEventListener('resize', () => {
    const w = cubeContainer.clientWidth;
    const h = cubeContainer.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // … recalc blockHeight, contentHeight, rotationFactor, centerOffset …
    updateScene();
  });

  // — BOOTSTRAP —
  setup();
});
