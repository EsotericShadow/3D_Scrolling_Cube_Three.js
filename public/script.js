// script.js
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
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(cubeContainer.clientWidth, cubeContainer.clientHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  cubeContainer.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(0, 1, 1);
  scene.add(dirLight);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.2
    })
  );
  scene.add(cube);
  camera.position.z = 2;

  // — TEXT CONTAINERS & MESSAGES —
  const leftText  = document.getElementById('left-text');
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

  // — STATE & CONFIG —
  let blockHeight     = 0;               // height + margin of one line
  const blocksCount   = leftMessages.length;
  let contentHeight   = 0;               // total scrollable height
  let rotationFactor  = 0;               // cube‑rotation per px
  let virtualScroll   = 0;               // cumulative scroll
  let textBlocks      = [];              // cached .text-block nodes
  const fadeRange     = 150;             // px from center → opacity 0
  const translateMax  = 20;              // px shift when fully faded
  const touchMult     = 2;               // touch sensitivity
  let centerOffset    = 0;               // initial translateY to center first block

  // ease‑in/out quad
  const easeInOutQuad = x =>
    x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;

  // — INITIALIZE TEXT + METRICS —
  function setup() {
    // populate both columns
    leftMessages.forEach(m => leftText.appendChild(createTextBlock(m)));
    rightMessages.forEach(m => rightText.appendChild(createTextBlock(m)));
    textBlocks = Array.from(document.querySelectorAll('.text-block'));

    // measure after next paint
    requestAnimationFrame(() => {
      const first = textBlocks[0];
      const rect  = first.getBoundingClientRect();
      const style = window.getComputedStyle(first);
      const mb    = parseFloat(style.marginBottom);

      blockHeight    = rect.height + mb;
      contentHeight  = blockHeight * blocksCount;
      rotationFactor = Math.PI / blockHeight;
      // centerOffset so that first block is centered on load
      centerOffset   = (window.innerHeight / 2) - (rect.height / 2);

      updateScene();
    });
  }

  // — RENDER & FADE LOOP —
  function updateScene() {
    // rotate cube
    cube.rotation.y = -virtualScroll * rotationFactor;

    // compute wrapped scroll remainder
    const r = ((virtualScroll % contentHeight) + contentHeight) % contentHeight;
    // translate so that block 0 starts at center, then scroll up as r increases
    const offset = centerOffset - r;

    leftText.style.transform  = `translateY(${offset}px)`;
    rightText.style.transform = `translateY(${offset}px)`;

    // per‑line fade & translate
    const midY = window.innerHeight / 2;
    textBlocks.forEach(block => {
      const bRect       = block.getBoundingClientRect();
      const bCenter     = bRect.top + bRect.height / 2;
      const dist        = Math.abs(bCenter - midY);
      const t           = Math.min(dist / fadeRange, 1);
      const eased       = easeInOutQuad(t);
      const opacity     = 1 - eased;

      block.style.opacity   = opacity;
      block.style.transform = `translateY(${translateMax * (1 - opacity)}px)`;
    });

    renderer.render(scene, camera);
  }

  // — INPUT HANDLERS —
  function onWheel(e) {
    e.preventDefault();
    virtualScroll += e.deltaY;
    updateScene();
  }

  function onTouchStart(e) {
    lastY = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    const y = e.touches[0].clientY;
    virtualScroll += (lastY - y) * touchMult;
    lastY = y;
    updateScene();
  }

  if (!isMobile) {
    window.addEventListener('wheel', onWheel, { passive: false });
  } else {
    let lastY = 0;
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
  }

  // — HANDLE RESIZE —
  window.addEventListener('resize', () => {
    // update three.js viewport
    const w = cubeContainer.clientWidth;
    const h = cubeContainer.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // re‑measure block height & centerOffset
    const first = textBlocks[0];
    const rect  = first.getBoundingClientRect();
    const style = window.getComputedStyle(first);
    const mb    = parseFloat(style.marginBottom);

    blockHeight    = rect.height + mb;
    contentHeight  = blockHeight * blocksCount;
    rotationFactor = Math.PI / blockHeight;
    centerOffset   = (window.innerHeight / 2) - (rect.height / 2);

    updateScene();
  });

  // — BOOTSTRAP —
  setup();
});
