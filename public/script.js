import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Enhanced device detection with feature detection
  const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
  const isTablet = !isMobile && window.matchMedia('(max-width: 1024px)').matches;
  const isLandscape = window.matchMedia('(orientation: landscape)').matches;
  const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Performance optimization - detect device capabilities
  const isLowPerfDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
                          navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  
  // Adaptive sizing based on device
  const cubeSize = isMobile ? 1.5 : 1;
  const wireframeScale = isMobile ? cubeSize / 2 : 0.5;
  
  // Adaptive animation speeds
  const lerpSpeed = hasReducedMotion ? 0.2 : (isLowPerfDevice ? 0.15 : 0.1);
  const animationDuration = hasReducedMotion ? 150 : 300;

  // Scene setup with performance optimizations
  const scene = new THREE.Scene();
  const cubeContainer = document.getElementById('cube-container');
  
  // Add loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator active';
  cubeContainer.appendChild(loadingIndicator);
  
  // Add touch feedback element
  const touchFeedback = document.createElement('div');
  touchFeedback.className = 'touch-feedback';
  document.body.appendChild(touchFeedback);

  // Camera setup with adaptive FOV
  const fov = isMobile ? 80 : (isTablet ? 75 : 70);
  const camera = new THREE.PerspectiveCamera(fov, cubeContainer.clientWidth / cubeContainer.clientHeight, 0.1, 1000);
  camera.position.z = isMobile ? 2.5 : (isTablet ? 2.2 : 2);

  // Renderer with adaptive quality
  const renderer = new THREE.WebGLRenderer({ 
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

  // --- VIDEO TEXTURE SETUP WITH PERFORMANCE OPTIMIZATIONS ---
  const video = document.createElement('video');
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
      // Add play button for browsers that block autoplay
      const playButton = document.createElement('button');
      playButton.textContent = 'Play';
      playButton.className = 'play-button';
      playButton.addEventListener('click', () => {
        video.play();
        playButton.remove();
      });
      cubeContainer.appendChild(playButton);
    });
  });

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

  // --- WIRE + GLOW WITH ADAPTIVE QUALITY ---
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
  
  const wireframe = new THREE.Group();
  edgePositions.forEach(([start, end]) => {
    const path = new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end));
    const tubeGeometry = new THREE.TubeGeometry(path, tubularSegments, 0.02, radiusSegments, false);
    const mesh = new THREE.Mesh(tubeGeometry, brightMat);
    mesh.raycast = () => {};
    wireframe.add(mesh);
  });

  // Only add glow effect on higher performance devices
  let glowWireframe;
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

  // --- CONTENT FOR EACH FACE ---
  const faceContents = [
    { header: "Home", description: "Welcome to Evergreen Web Solutions.", cta: "https://evergreenwebsolutions.ca" },
    { header: "Services", description: "Explore our range of services.", cta: "https://evergreenwebsolutions.ca/Services" },
    { header: "Web Design", description: "Learn about our web design offerings.", cta: "https://evergreenwebsolutions.ca/web-design" },
    { header: "App Development", description: "Discover our app development services.", cta: "https://evergreenwebsolutions.ca/App-Development" },
    { header: "AI Automation", description: "Explore AI automation solutions.", cta: "https://evergreenwebsolutions.ca/AI-Automation" },
    { header: "Business Digitization", description: "Digitize your business with us.", cta: "https://evergreenwebsolutions.ca/Business-Digitization" }
  ];

  // Map from face normals to face indices
  const faceNormals = [
    new THREE.Vector3(1, 0, 0),  // right (0)
    new THREE.Vector3(-1, 0, 0), // left (1)
    new THREE.Vector3(0, 1, 0),  // top (2)
    new THREE.Vector3(0, -1, 0), // bottom (3)
    new THREE.Vector3(0, 0, 1),  // front (4)
    new THREE.Vector3(0, 0, -1)  // back (5)
  ];

  let currentFrontFace = 4; // Start with front face
  let isAnimating = false;
  let targetQuaternion = new THREE.Quaternion();

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

  // Enhanced content update with smoother transitions
  function updateContent(index) {
    const header = document.getElementById('header');
    const description = document.getElementById('description');
    const cta = document.getElementById('cta');

    // Remove active classes with staggered timing
    header.classList.remove('active');
    setTimeout(() => description.classList.remove('active'), 50);
    setTimeout(() => cta.classList.remove('active'), 100);

    // Update content after fade out
    setTimeout(() => {
      header.textContent = faceContents[index].header;
      description.textContent = faceContents[index].description;
      cta.href = faceContents[index].cta;
      cta.textContent = "Learn More";

      // Add active classes with staggered timing
      header.classList.add('active');
      setTimeout(() => description.classList.add('active'), 50);
      setTimeout(() => cta.classList.add('active'), 100);
    }, animationDuration); // Adaptive timing based on device capabilities
  }

  // IMPROVED ROTATION SYSTEM USING CAMERA-ALIGNED AXES
  function getRotationAxis(direction) {
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

  // Improved changeFace function with controlled rotation
  function changeFace(direction) {
    if (isAnimating) return;
    
    // Get the rotation axis based on camera-aligned axes
    const rotationAxis = getRotationAxis(direction);
    
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
    highlightArrowIndicator(direction);
    
    // Reset inactivity timer since user interacted
    resetInactivityTimer();
  }

  // Enhanced animation loop with performance optimizations
  function updateScene() {
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
          updateContent(newFrontFace);
        }
      }
    }
    
    // Adaptive rendering based on device performance
    renderer.render(scene, camera);
    requestAnimationFrame(updateScene);
  }

  // COMPLETELY REDESIGNED INPUT HANDLING
  // This approach uses gesture IDs to ensure one rotation per distinct gesture
  
  // Gesture tracking
  let currentGestureId = null;
  let gestureProcessed = false;
  let gestureDirection = null;
  let gestureStartTime = 0;
  
  // Thresholds
  const minSwipeDistance = isMobile ? 30 : 50;
  const gestureTimeout = 500; // ms
  
  // Wheel event handling - completely redesigned
  function onWheel(e) {
    e.preventDefault();
    
    if (isAnimating) return;
    
    // Generate a unique ID for this wheel event sequence
    const now = Date.now();
    const gestureId = `wheel_${now}`;
    
    // If this is a new gesture or the previous one timed out
    if (currentGestureId !== gestureId && (!currentGestureId || now - gestureStartTime > gestureTimeout)) {
      currentGestureId = gestureId;
      gestureStartTime = now;
      gestureProcessed = false;
      
      // Determine direction from this single event
      const deltaX = e.deltaX || 0;
      const deltaY = e.deltaY || 0;
      
      // Only process if the movement is significant
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        if (Math.abs(deltaY) >= Math.abs(deltaX)) {
          gestureDirection = deltaY > 0 ? 'up' : 'down';
        } else {
          gestureDirection = deltaX > 0 ? 'right' : 'left';
        }
        
        // Process the gesture immediately
        if (!gestureProcessed) {
          changeFace(gestureDirection);
          gestureProcessed = true;
          
          // Clear the gesture after processing
          setTimeout(() => {
            if (currentGestureId === gestureId) {
              currentGestureId = null;
            }
          }, gestureTimeout);
        }
      }
    }
  }
  
  // Touch handling variables
  let touchStartX = 0;
  let touchStartY = 0;
  
  // Touch start - completely redesigned
  function onTouchStart(e) {
    e.preventDefault();
    
    if (isAnimating) return;
    
    // Record start position
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    
    // Generate a unique ID for this touch sequence
    const gestureId = `touch_${Date.now()}`;
    currentGestureId = gestureId;
    gestureStartTime = Date.now();
    gestureProcessed = false;
    gestureDirection = null;
    
    // Show touch feedback
    touchFeedback.style.left = `${touchStartX}px`;
    touchFeedback.style.top = `${touchStartY}px`;
    touchFeedback.classList.add('active');
    
    // Create swipe trail start point
    createTrailParticle(touchStartX, touchStartY);
    
    // Remove after animation completes
    setTimeout(() => {
      touchFeedback.classList.remove('active');
    }, 500);
  }
  
  // Touch move - completely redesigned
  function onTouchMove(e) {
    e.preventDefault();
    
    if (isAnimating || gestureProcessed) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    // Create trail particle for visual feedback
    createTrailParticle(currentX, currentY);
    
    // Calculate distance moved
    const deltaX = touchStartX - currentX;
    const deltaY = touchStartY - currentY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Only process if we've moved enough distance
    if (distance >= minSwipeDistance) {
      // Determine primary direction
      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        gestureDirection = deltaY > 0 ? 'up' : 'down';
      } else {
        gestureDirection = deltaX > 0 ? 'right' : 'left';
      }
      
      // Process the gesture
      if (!gestureProcessed && gestureDirection) {
        changeFace(gestureDirection);
        gestureProcessed = true;
      }
    }
  }
  
  // Touch end - completely redesigned
  function onTouchEnd(e) {
    e.preventDefault();
    
    // Clear the current gesture after a delay
    setTimeout(() => {
      currentGestureId = null;
      gestureProcessed = false;
      gestureDirection = null;
    }, 50);
  }

  // Set up event listeners based on device type with passive option for better performance
  if (!isMobile) {
    window.addEventListener('wheel', onWheel, { passive: false });
    
    // Add keyboard navigation for desktop
    window.addEventListener('keydown', (e) => {
      if (isAnimating) return;
      
      // Generate a unique ID for this key event
      const gestureId = `key_${Date.now()}`;
      
      // Only process if this is a new gesture
      if (currentGestureId !== gestureId) {
        currentGestureId = gestureId;
        gestureProcessed = false;
        
        let direction = null;
        switch(e.key) {
          case 'ArrowUp':
            direction = 'up';
            break;
          case 'ArrowDown':
            direction = 'down';
            break;
          case 'ArrowLeft':
            direction = 'left';
            break;
          case 'ArrowRight':
            direction = 'right';
            break;
        }
        
        if (direction && !gestureProcessed) {
          changeFace(direction);
          gestureProcessed = true;
          
          // Clear the gesture after processing
          setTimeout(() => {
            currentGestureId = null;
          }, 300);
        }
      }
    });
  } else {
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
  }

  // Enhanced click handler with better mobile support
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // Use both click and touch events for better cross-device support
  const clickHandler = (event) => {
    if (isAnimating) return;
    
    // Prevent default only for touch events to avoid double-firing
    if (event.type === 'touchend') {
      event.preventDefault();
    }
    
    const rect = cubeContainer.getBoundingClientRect();
    
    // Get correct coordinates for both mouse and touch
    const clientX = event.clientX || (event.changedTouches && event.changedTouches[0].clientX);
    const clientY = event.clientY || (event.changedTouches && event.changedTouches[0].clientY);
    
    if (!clientX || !clientY) return;
    
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cube);
    
    if (intersects.length > 0) {
      const faceIndex = Math.floor(intersects[0].faceIndex / 2);
      
      // Add visual feedback for click
      touchFeedback.style.left = `${clientX}px`;
      touchFeedback.style.top = `${clientY}px`;
      touchFeedback.classList.add('active');
      
      // Remove after animation completes
      setTimeout(() => {
        touchFeedback.classList.remove('active');
      }, 500);
      
      // Add haptic feedback
      if (navigator.vibrate && isMobile) {
        navigator.vibrate(30);
      }
      
      window.open(faceLinks[faceIndex], '_blank');
    }
  };
  
  cubeContainer.addEventListener('click', clickHandler);
  if (isMobile) {
    // Use touchend for mobile to avoid delay
    cubeContainer.addEventListener('touchend', clickHandler);
  }

  // Enhanced resize handler with debouncing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    // Clear previous timeout
    clearTimeout(resizeTimeout);
    
    // Set new timeout to debounce resize events
    resizeTimeout = setTimeout(() => {
      // Update device detection
      const wasLandscape = isLandscape;
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

  // ---- UX ENHANCEMENT FUNCTIONS ----
  
  // Get UI elements
  const directionalIndicators = document.querySelector('.directional-indicators');
  const arrowIndicators = document.querySelectorAll('.arrow-indicator');
  const swipeHintOverlay = document.querySelector('.swipe-hint-overlay');
  const swipeHintButton = document.querySelector('.swipe-hint-button');
  const inactivityHint = document.querySelector('.inactivity-hint');
  const swipeTrail = document.querySelector('.swipe-trail');
  
  // Tutorial animation elements
  const swipeHintCube = document.querySelector('.swipe-hint-cube');
  const swipeHintArrow = document.querySelector('.swipe-hint-arrow');
  
  // Initialize tutorial
  let tutorialShown = false;
  let tutorialStep = 0;
  const tutorialDirections = ['up', 'right', 'down', 'left'];
  let tutorialInterval;
  
  // Show tutorial overlay
  function showTutorial() {
    if (tutorialShown) return;
    
    swipeHintOverlay.classList.add('visible');
    tutorialShown = true;
    
    // Start tutorial animation sequence
    tutorialStep = 0;
    startTutorialAnimation();
    
    // Hide directional indicators while tutorial is showing
    directionalIndicators.classList.add('hidden');
  }
  
  // Start tutorial animation sequence
  function startTutorialAnimation() {
    // Clear any existing interval
    if (tutorialInterval) clearInterval(tutorialInterval);
    
    // Reset cube position
    swipeHintCube.style.transform = 'translate(-50%, -50%)';
    
    // Start animation sequence
    tutorialInterval = setInterval(() => {
      const direction = tutorialDirections[tutorialStep % tutorialDirections.length];
      animateTutorialDirection(direction);
      tutorialStep++;
      
      // Loop through all directions twice then stop
      if (tutorialStep >= tutorialDirections.length * 2) {
        clearInterval(tutorialInterval);
      }
    }, 2000);
  }
  
  // Animate tutorial in specified direction
  function animateTutorialDirection(direction) {
    // Position arrow based on direction
    swipeHintArrow.style.top = '50%';
    swipeHintArrow.style.left = '50%';
    swipeHintArrow.style.transform = 'translate(-50%, -50%)';
    
    // Set arrow direction and position
    switch(direction) {
      case 'up':
        swipeHintArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>';
        swipeHintArrow.style.top = '30%';
        break;
      case 'right':
        swipeHintArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>';
        swipeHintArrow.style.left = '70%';
        break;
      case 'down':
        swipeHintArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>';
        swipeHintArrow.style.top = '70%';
        break;
      case 'left':
        swipeHintArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path></svg>';
        swipeHintArrow.style.left = '30%';
        break;
    }
    
    // Show arrow
    swipeHintArrow.classList.add('visible');
    
    // Animate cube after a short delay
    setTimeout(() => {
      // Move cube based on direction
      switch(direction) {
        case 'up':
          swipeHintCube.style.transform = 'translate(-50%, -80%)';
          break;
        case 'right':
          swipeHintCube.style.transform = 'translate(-20%, -50%)';
          break;
        case 'down':
          swipeHintCube.style.transform = 'translate(-50%, -20%)';
          break;
        case 'left':
          swipeHintCube.style.transform = 'translate(-80%, -50%)';
          break;
      }
      
      // Hide arrow after animation starts
      setTimeout(() => {
        swipeHintArrow.classList.remove('visible');
      }, 500);
      
      // Reset cube position after animation completes
      setTimeout(() => {
        swipeHintCube.style.transform = 'translate(-50%, -50%)';
      }, 1500);
    }, 500);
  }
  
  // Close tutorial
  function closeTutorial() {
    swipeHintOverlay.classList.remove('visible');
    
    // Clear tutorial animation interval
    if (tutorialInterval) {
      clearInterval(tutorialInterval);
      tutorialInterval = null;
    }
    
    // Show directional indicators after tutorial closes
    directionalIndicators.classList.remove('hidden');
    
    // Start pulsing arrows to guide user
    startPulsingArrows();
    
    // Set up inactivity timer
    setupInactivityTimer();
  }
  
  // Highlight arrow indicator based on swipe direction
  function highlightArrowIndicator(direction) {
    // Remove pulse class from all arrows
    arrowIndicators.forEach(arrow => {
      arrow.classList.remove('pulse');
    });
    
    // Add highlight to the corresponding arrow
    let arrowClass;
    switch(direction) {
      case 'up':
        arrowClass = 'top';
        break;
      case 'down':
        arrowClass = 'bottom';
        break;
      case 'left':
        arrowClass = 'left';
        break;
      case 'right':
        arrowClass = 'right';
        break;
    }
    
    const arrow = document.querySelector(`.arrow-indicator.${arrowClass}`);
    if (arrow) {
      // Add temporary highlight effect
      arrow.style.backgroundColor = 'rgba(0, 170, 255, 0.6)';
      arrow.style.transform = arrowClass === 'top' || arrowClass === 'bottom' ? 
        'translateX(-50%) scale(1.2)' : 'translateY(-50%) scale(1.2)';
      
      // Reset after animation
      setTimeout(() => {
        arrow.style.backgroundColor = '';
        arrow.style.transform = arrowClass === 'top' || arrowClass === 'bottom' ? 
          'translateX(-50%)' : 'translateY(-50%)';
      }, 300);
    }
  }
  
  // Start pulsing arrows to guide user
  function startPulsingArrows() {
    // Pulse each arrow in sequence
    const directions = ['top', 'right', 'bottom', 'left'];
    let currentIndex = 0;
    
    function pulseNextArrow() {
      // Remove pulse from all arrows
      arrowIndicators.forEach(arrow => {
        arrow.classList.remove('pulse');
      });
      
      // Add pulse to current arrow
      const currentDirection = directions[currentIndex];
      const arrow = document.querySelector(`.arrow-indicator.${currentDirection}`);
      if (arrow) {
        arrow.classList.add('pulse');
      }
      
      // Move to next arrow
      currentIndex = (currentIndex + 1) % directions.length;
    }
    
    // Start with first arrow
    pulseNextArrow();
    
    // Pulse next arrow every 2 seconds
    const pulseInterval = setInterval(pulseNextArrow, 2000);
    
    // Stop pulsing after user interacts
    function stopPulsing() {
      clearInterval(pulseInterval);
      arrowIndicators.forEach(arrow => {
        arrow.classList.remove('pulse');
      });
      
      // Remove event listeners
      window.removeEventListener('wheel', stopPulsing);
      window.removeEventListener('touchstart', stopPulsing);
      window.removeEventListener('keydown', stopPulsing);
    }
    
    // Stop pulsing when user interacts
    window.addEventListener('wheel', stopPulsing, { once: true });
    window.addEventListener('touchstart', stopPulsing, { once: true });
    window.addEventListener('keydown', stopPulsing, { once: true });
  }
  
  // Create trail particle for visual feedback
  function createTrailParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'trail-particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    swipeTrail.appendChild(particle);
    
    // Fade out and remove after animation
    setTimeout(() => {
      particle.classList.add('fade');
      setTimeout(() => {
        particle.remove();
      }, 500);
    }, 100);
  }
  
  // Inactivity timer to show hints if user is inactive
  let inactivityTimer;
  
  function setupInactivityTimer() {
    // Clear any existing timer
    if (inactivityTimer) clearTimeout(inactivityTimer);
    
    // Set new timer
    inactivityTimer = setTimeout(() => {
      showInactivityHint();
    }, 5000); // Show hint after 5 seconds of inactivity
  }
  
  function resetInactivityTimer() {
    // Hide inactivity hint if showing
    inactivityHint.classList.remove('visible');
    
    // Reset timer
    setupInactivityTimer();
  }
  
  function showInactivityHint() {
    // Only show if user hasn't interacted yet
    if (!tutorialShown) {
      showTutorial();
    } else {
      inactivityHint.classList.add('visible');
      
      // Hide after a few seconds
      setTimeout(() => {
        inactivityHint.classList.remove('visible');
      }, 3000);
    }
  }
  
  // Set up tutorial button
  swipeHintButton.addEventListener('click', closeTutorial);
  
  // Initialize content and start animation loop once video is loaded
  videoLoadPromise.then(() => {
    // Hide loading indicator
    loadingIndicator.classList.remove('active');
    setTimeout(() => {
      loadingIndicator.remove();
    }, 300);
    
    // Update content
    updateContent(currentFrontFace);
    
    // Start animation loop
    requestAnimationFrame(updateScene);
    
    // Show tutorial after a short delay
    setTimeout(() => {
      showTutorial();
    }, 1000);
  });
});
