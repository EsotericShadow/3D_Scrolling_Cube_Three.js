import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
  const cubeSize = isMobile ? 1.5 : 1;
  const wireframeScale = isMobile ? cubeSize / 2 : 0.5;

  const scene = new THREE.Scene();
  const cubeContainer = document.getElementById('cube-container');
  const camera = new THREE.PerspectiveCamera(75, cubeContainer.clientWidth / cubeContainer.clientHeight, 0.1, 1000);
  camera.position.z = isMobile ? 2.5 : 2;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(cubeContainer.clientWidth, cubeContainer.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  cubeContainer.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // --- VIDEO TEXTURE SETUP ---
  const video = document.createElement('video');
  video.src = 'cube_texture.mp4';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.play();

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBAFormat;

  const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

  const faceLinks = [
    "https://evergreenwebsolutions.ca",
    "https://evergreenwebsolutions.ca/Services",
    "https://evergreenwebsolutions.ca/web-design",
    "https://evergreenwebsolutions.ca/App-Development",
    "https://evergreenwebsolutions.ca/AI-Automation",
    "https://evergreenwebsolutions.ca/Business-Digitization"
  ];

  const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMaterials = Array(6).fill(videoMaterial);
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
  scene.add(cube);

  // --- WIRE + GLOW ---
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

  const wireframe = new THREE.Group();
  edgePositions.forEach(([start, end]) => {
    const path = new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end));
    const tubeGeometry = new THREE.TubeGeometry(path, 1, 0.02, 8, false);
    const mesh = new THREE.Mesh(tubeGeometry, brightMat);
    mesh.raycast = () => {};
    wireframe.add(mesh);
  });

  const glowMat = new THREE.MeshBasicMaterial({ color: neonColor, transparent: true, opacity: 0.4 });
  const glowWireframe = new THREE.Group();
  edgePositions.forEach(([start, end]) => {
    const path = new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end));
    const tubeGeometry = new THREE.TubeGeometry(path, 1, 0.03, 8, false);
    const mesh = new THREE.Mesh(tubeGeometry, glowMat);
    mesh.raycast = () => {};
    glowWireframe.add(mesh);
  });
  glowWireframe.scale.set(isMobile ? 1.15 : 1.1, isMobile ? 1.15 : 1.1, isMobile ? 1.15 : 1.1);
  scene.add(wireframe);
  scene.add(glowWireframe);

  // --- CONTENT FOR EACH FACE ---
  const faceContents = [
    { header: "Home", description: "Welcome to Evergreen Web Solutions.", cta: "https://evergreenwebsolutions.ca" },
    { header: "Services", description: "Explore our range of services.", cta: "https://evergreenwebsolutions.ca/Services" },
    { header: "Web Design", description: "Learn about our web design offerings.", cta: "https://evergreenwebsolutions.ca/web-design" },
    { header: "App Development", description: "Discover our app development services.", cta: "https://evergreenwebsolutions.ca/App-Development" },
    { header: "AI Automation", description: "Explore AI automation solutions.", cta: "https://evergreenwebsolutions.ca/AI-Automation" },
    { header: "Business Digitization", description: "Digitize your business with us.", cta: "https://evergreenwebsolutions.ca/Business-Digitization" }
  ];

  const faceNormals = [
    new THREE.Vector3(1, 0, 0),  // right
    new THREE.Vector3(-1, 0, 0), // left
    new THREE.Vector3(0, 1, 0),  // top
    new THREE.Vector3(0, -1, 0), // bottom
    new THREE.Vector3(0, 0, 1),  // front
    new THREE.Vector3(0, 0, -1)  // back
  ];

  let currentFrontFace = 0;

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

  function updateContent(index) {
    const header = document.getElementById('header');
    const description = document.getElementById('description');
    const cta = document.getElementById('cta');

    header.classList.remove('active');
    description.classList.remove('active');
    cta.classList.remove('active');

    setTimeout(() => {
      header.textContent = faceContents[index].header;
      description.textContent = faceContents[index].description;
      cta.href = faceContents[index].cta;
      cta.textContent = "Learn More";

      header.classList.add('active');
      description.classList.add('active');
      cta.classList.add('active');
    }, 150); // Delay to sync with fade-out
  }

  // --- ROTATION STATE ---
  let verticalIndex = 0;
  let horizontalIndexY = 0;
  let horizontalIndexZ = 0;

  let currentRotX = 0, currentRotY = 0, currentRotZ = 0;
  let targetRotX = 0, targetRotY = 0, targetRotZ = 0;
  let isAnimating = false;

  const toRad = deg => deg * Math.PI / 180;
  const lerpSpeed = 0.1;
  const swipeThreshold = 75;
  const touchMult = 2;
  const deadZone = 10;

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
    } else {
      const newFrontFace = getFrontFace();
      if (newFrontFace !== currentFrontFace) {
        currentFrontFace = newFrontFace;
        updateContent(newFrontFace);
      }
    }

    cube.rotation.set(toRad(currentRotX), toRad(currentRotY), toRad(currentRotZ));
    wireframe.rotation.set(toRad(currentRotX), toRad(currentRotY), toRad(currentRotZ));
    glowWireframe.rotation.set(toRad(currentRotX), toRad(currentRotY), toRad(currentRotZ));

    renderer.render(scene, camera);
    requestAnimationFrame(updateScene);
  }

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
        horizontalIndexY++;
        targetRotY = 90 * horizontalIndexY;
      } else {
        horizontalIndexZ--;
        targetRotZ = 90 * horizontalIndexZ;
      }
    } else if (direction === 'right') {
      if (verticalIndex % 2 === 0) {
        horizontalIndexY--;
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

  let accumulatedDeltaX = 0;
  let accumulatedDeltaY = 0;
  let lockedAxis = null;

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

  // --- CLICK HANDLER FOR CUBE ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  cubeContainer.addEventListener('click', event => {
    const rect = cubeContainer.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cube);
    
    console.log('Click detected', { mouseX: mouse.x, mouseY: mouse.y, intersects: intersects.length });
    
    if (intersects.length > 0) {
      const faceIndex = Math.floor(intersects[0].faceIndex / 2);
      console.log('Face clicked:', faceIndex, 'Link:', faceLinks[faceIndex]);
      window.open(faceLinks[faceIndex], '_blank');
    } else {
      console.log('No intersection with cube');
    }
  });

  window.addEventListener('resize', () => {
    const w = cubeContainer.clientWidth;
    const h = cubeContainer.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });

  // Initialize content
  updateContent(currentFrontFace);
  requestAnimationFrame(updateScene);
});
