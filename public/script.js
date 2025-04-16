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
    const tubeGeometry = new THREE.TubeGeometry(path, 1, 0.02, 8, false); // radius: 0.02 for core
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
    const tubeGeometry = new THREE.TubeGeometry(path, 1, 0.03, 8, false); // radius: 0.03 for glow
    glowWireframe.add(new THREE.Mesh(tubeGeometry, glowMat));
  });

  glowWireframe.scale.set(1.1, 1.1, 1.1);
  scene.add(glowWireframe);
  scene.add(wireframe);

  // — TEXT SETUP (unchanged) —
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
  let blockHeight     = 0;
  const blocksCount   = leftMessages.length;
  let contentHeight   = 0;
  let rotationFactor  = 0;
  let virtualScroll   = 0;
  let textBlocks      = [];
  const fadeRange     = 150;
  const translateMax  = 20;
  const touchMult     = 2;
  let centerOffset    = 0;

  const easeInOutQuad = x =>
    x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;

  // — INITIALIZE TEXT + METRICS —
  function setup() {
    leftMessages.forEach(m => leftText.appendChild(createTextBlock(m)));
    rightMessages.forEach(m => rightText.appendChild(createTextBlock(m)));
    textBlocks = Array.from(document.querySelectorAll('.text-block'));

    requestAnimationFrame(() => {
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
  }

  // — RENDER & FADE LOOP —
  function updateScene() {
    // rotate both wireframes
    glowWireframe.rotation.y = -virtualScroll * rotationFactor;
    wireframe.rotation.y     = -virtualScroll * rotationFactor;

    // hue shift
    const hue = (virtualScroll * 0.1) % 360;
    const h = (hue + 360) % 360 / 360;
    brightMat.color.setHSL(h, 1, 0.6);
    glowMat.color.setHSL(h, 1, 0.6);

    // text scroll
    const r = ((virtualScroll % contentHeight) + contentHeight) % contentHeight;
    const offset = centerOffset - r;
    leftText.style.transform  = `translateY(${offset}px)`;
    rightText.style.transform = `translateY(${offset}px)`;

    // text fade
    const midY = window.innerHeight / 2;
    textBlocks.forEach(block => {
      const bRect   = block.getBoundingClientRect();
      const bCenter = bRect.top + bRect.height / 2;
      const dist    = Math.abs(bCenter - midY);
      const t       = Math.min(dist / fadeRange, 1);
      const eased   = easeInOutQuad(t);
      const opacity = 1 - eased;
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
    const w = cubeContainer.clientWidth;
    const h = cubeContainer.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

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
